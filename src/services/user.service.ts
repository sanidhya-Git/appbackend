import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { CacheService, CACHE_TTL } from '../config/redis';
import { cloudinary } from '../config/cloudinary';
import { parsePagination, paginationMeta } from '../utils/response';

export class UserService {
  async getProfile(userId: string) {
    const cacheKey = `user:${userId}`;
    const cached = await CacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        provider: true,
        isVerified: true,
        isFaceRegistered: true,
        createdAt: true,
        _count: {
          select: {
            photoMatches: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    await CacheService.set(cacheKey, user, CACHE_TTL.MEDIUM);
    return user;
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isFaceRegistered: true,
      },
    });

    await CacheService.del(`user:${userId}`);
    return user;
  }

  async updateAvatar(userId: string, imageBase64: string) {
    const response = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      {
        folder: 'avatars',
        public_id: `avatar_${userId}`,
        overwrite: true,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      }
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: response.secure_url },
      select: { id: true, avatarUrl: true },
    });

    await CacheService.del(`user:${userId}`);
    return user;
  }

  async getMyPhotos(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const eventId = query.eventId as string | undefined;

    const where = {
      userId,
      ...(eventId ? { eventId } : {}),
    };

    const [matches, total] = await Promise.all([
      prisma.photoMatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          photo: true,
          event: {
            select: { id: true, name: true, eventDate: true },
          },
        },
      }),
      prisma.photoMatch.count({ where }),
    ]);

    return {
      photos: matches.map((m) => ({
        ...m.photo,
        similarity: m.similarity,
        isViewed: m.isViewed,
        event: m.event,
        matchId: m.id,
      })),
      meta: paginationMeta(total, page, limit),
    };
  }

  async toggleFavorite(userId: string, photoId: string) {
    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) throw new AppError('Photo not found', 404);

    const existing = await prisma.favoritePhoto.findUnique({
      where: { userId_photoId: { userId, photoId } },
    });

    if (existing) {
      await prisma.favoritePhoto.delete({
        where: { userId_photoId: { userId, photoId } },
      });
      return { favorited: false };
    } else {
      await prisma.favoritePhoto.create({
        data: { userId, photoId },
      });
      return { favorited: true };
    }
  }

  async getFavorites(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);

    const [favorites, total] = await Promise.all([
      prisma.favoritePhoto.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { photo: true },
      }),
      prisma.favoritePhoto.count({ where: { userId } }),
    ]);

    return {
      photos: favorites.map((f) => f.photo),
      meta: paginationMeta(total, page, limit),
    };
  }

  async getNotifications(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      meta: paginationMeta(total, page, limit),
    };
  }

  async markNotificationsRead(userId: string, notificationIds?: string[]) {
    await prisma.notification.updateMany({
      where: {
        userId,
        ...(notificationIds ? { id: { in: notificationIds } } : {}),
      },
      data: { isRead: true },
    });
    await CacheService.del(`user:${userId}`);
  }

  async getDashboard(userId: string) {
    const [user, recentEvents, totalPhotos, unreadNotifications] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            isFaceRegistered: true,
          },
        }),
        prisma.event.findMany({
          orderBy: { eventDate: 'desc' },
          take: 5,
          include: { _count: { select: { photos: true } } },
        }),
        prisma.photoMatch.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

    return {
      user,
      recentEvents,
      totalPhotos,
      unreadNotifications,
    };
  }
}

export const userService = new UserService();
