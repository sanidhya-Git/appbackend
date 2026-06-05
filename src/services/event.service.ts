import { prisma } from '../config/database';
import { cloudinary, getPhotosInFolder } from '../config/cloudinary';
import { AppError } from '../middleware/error.middleware';
import { CacheService, CACHE_TTL } from '../config/redis';
import { faceService } from './face.service';
import { parsePagination, paginationMeta } from '../utils/response';
import { logger } from '../utils/logger';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export class EventService {
  // ── Admin: create event from Cloudinary folder ──────────────────────────
  async createEventFromFolder(data: {
    name: string;
    description?: string;
    cloudinaryFolder: string;
    location?: string;
    eventDate: Date;
    coverImageUrl?: string;
  }) {
    const existing = await prisma.event.findUnique({
      where: { cloudinaryFolder: data.cloudinaryFolder },
    });
    if (existing) throw new AppError('Event with this folder already exists', 409);

    const inviteCode = generateInviteCode();
    const event = await prisma.event.create({
      data: { ...data, inviteCode, isPrivate: false },
    });
    await this.syncEventPhotos(event.id);
    return event;
  }

  // ── User: create a new private event ────────────────────────────────────
  async createUserEvent(
    userId: string,
    data: {
      name: string;
      description?: string;
      location?: string;
      eventDate: Date;
    }
  ) {
    let inviteCode: string;
    let unique = false;
    do {
      inviteCode = generateInviteCode();
      const exists = await prisma.event.findUnique({ where: { inviteCode } });
      unique = !exists;
    } while (!unique);

    const folder = `events/user_${userId}_${Date.now()}`;

    const event = await prisma.event.create({
      data: {
        ...data,
        cloudinaryFolder: folder,
        inviteCode,
        isPrivate: true,
        createdBy: userId,
      },
    });

    // Creator becomes OWNER member
    await prisma.eventMember.create({
      data: { eventId: event.id, userId, role: 'OWNER' },
    });

    await CacheService.delPattern('events:*');
    return event;
  }

  // ── Join event by invite code ────────────────────────────────────────────
  async joinEvent(userId: string, inviteCode: string) {
    const event = await prisma.event.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });
    if (!event) throw new AppError('Invalid invite code', 404);

    const existing = await prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
    });
    if (existing) throw new AppError('Already a member of this event', 409);

    await prisma.eventMember.create({
      data: { eventId: event.id, userId, role: 'MEMBER' },
    });

    await CacheService.delPattern('events:*');
    return event;
  }

  // ── Upload a photo to an event ───────────────────────────────────────────
  async uploadPhoto(userId: string, eventId: string, imageBase64: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    // Check membership for private events
    if (event.isPrivate) {
      const member = await prisma.eventMember.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!member) throw new AppError('Not a member of this event', 403);
    }

    const upload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      {
        folder: event.cloudinaryFolder,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }
    );

    const thumbnailUrl = cloudinary.url(upload.public_id, {
      transformation: [
        { width: 600, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      ],
      version: upload.version,
    });

    const photo = await prisma.photo.create({
      data: {
        eventId,
        cloudinaryId: upload.public_id,
        url: upload.secure_url,
        thumbnailUrl,
        width: upload.width,
        height: upload.height,
      },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { totalPhotos: { increment: 1 }, isProcessed: false },
    });

    await CacheService.delPattern(`events:${eventId}`);

    // Background face processing for this single photo
    faceService.processEventPhotos(eventId).catch((err) =>
      logger.error(`Background face processing failed for event ${eventId}:`, err)
    );

    return photo;
  }

  // ── List events (only accessible ones) ──────────────────────────────────
  async listEvents(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const cacheKey = `events:list:${userId}:${page}:${limit}`;
    const cached = await CacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const where = {
      OR: [
        { isPrivate: false },
        { members: { some: { userId } } },
      ],
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: 'desc' },
        include: { _count: { select: { photos: true } } },
      }),
      prisma.event.count({ where }),
    ]);

    const result = { events, meta: paginationMeta(total, page, limit) };
    await CacheService.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }

  // ── Get single event (with membership check) ─────────────────────────────
  async getEventById(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { photos: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
      },
    });
    if (!event) throw new AppError('Event not found', 404);

    if (event.isPrivate) {
      const member = event.members.find((m) => m.userId === userId);
      if (!member) throw new AppError('Access denied — join this event with an invite code', 403);
    }

    return {
      ...event,
      userRole: event.members.find((m) => m.userId === userId)?.role ?? null,
    };
  }

  // ── Get event photos (membership check) ───────────────────────────────────
  async getEventPhotos(userId: string, eventId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    if (event.isPrivate) {
      const member = await prisma.eventMember.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!member) throw new AppError('Access denied', 403);
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where: { eventId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, eventId: true, cloudinaryId: true, url: true, thumbnailUrl: true, width: true, height: true, faceCount: true },
      }),
      prisma.photo.count({ where: { eventId } }),
    ]);

    return { photos, meta: paginationMeta(total, page, limit) };
  }

  // ── Get event members ──────────────────────────────────────────────────────
  async getEventMembers(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    if (event.isPrivate) {
      const member = await prisma.eventMember.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!member) throw new AppError('Access denied', 403);
    }

    return prisma.eventMember.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  // ── Face search (membership check) ───────────────────────────────────────
  async searchPhotos(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    if (event.isPrivate) {
      const member = await prisma.eventMember.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!member) throw new AppError('Access denied', 403);
    }

    if (!event.isProcessed) {
      throw new AppError('Event photos are still being processed. Please try again shortly.', 202);
    }

    const existingMatches = await prisma.photoMatch.findMany({
      where: { userId, eventId },
      include: { photo: true },
      orderBy: { similarity: 'desc' },
    });

    if (existingMatches.length > 0) {
      return {
        photos: existingMatches.map((m) => ({ ...m.photo, similarity: m.similarity })),
        total: existingMatches.length,
      };
    }

    const matchResults = await faceService.findMatchingPhotos(userId, eventId);

    if (matchResults.length > 0) {
      await prisma.photoMatch.createMany({
        data: matchResults.map((m) => ({ userId, photoId: m.photoId, eventId, similarity: m.similarity })),
        skipDuplicates: true,
      });
      await this.createPhotosFoundNotification(userId, eventId, matchResults.length);
    }

    const photos = await prisma.photo.findMany({
      where: { id: { in: matchResults.map((m) => m.photoId) } },
    });
    const photoMap = new Map(photos.map((p) => [p.id, p]));

    return {
      photos: matchResults.map((m) => ({ ...(photoMap.get(m.photoId) ?? {}), similarity: m.similarity })),
      total: matchResults.length,
    };
  }

  async syncEventPhotos(eventId: string): Promise<{ synced: number }> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    const cloudinaryPhotos = await getPhotosInFolder(event.cloudinaryFolder);
    const existingPhotos = await prisma.photo.findMany({ where: { eventId }, select: { cloudinaryId: true } });
    const existingIds = new Set(existingPhotos.map((p) => p.cloudinaryId));
    const newPhotos = cloudinaryPhotos.filter((p) => !existingIds.has(p.cloudinaryId));

    if (newPhotos.length > 0) {
      await prisma.photo.createMany({
        data: newPhotos.map((p) => ({
          eventId,
          cloudinaryId: p.cloudinaryId,
          url: p.url,
          thumbnailUrl: p.thumbnailUrl,
          width: p.width,
          height: p.height,
        })),
        skipDuplicates: true,
      });
      await prisma.event.update({
        where: { id: eventId },
        data: { totalPhotos: { increment: newPhotos.length }, isProcessed: false },
      });
    }

    faceService.processEventPhotos(eventId).catch((err) =>
      logger.error(`Background face processing failed for event ${eventId}:`, err)
    );
    await CacheService.delPattern('events:*');
    return { synced: newPhotos.length };
  }

  private async createPhotosFoundNotification(userId: string, eventId: string, count: number) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { name: true } });
    await prisma.notification.create({
      data: {
        userId,
        title: 'Photos Found!',
        body: `We found ${count} photo${count > 1 ? 's' : ''} of you in "${event?.name}"`,
        type: 'PHOTOS_FOUND',
        data: { eventId, count },
      },
    });
  }
}

export const eventService = new EventService();
