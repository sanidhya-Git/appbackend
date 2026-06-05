import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
});

export const updateAvatarSchema = z.object({
  imageBase64: z.string().min(100),
});

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      sendSuccess(res, user, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (err) {
      next(err);
    }
  }

  async updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { imageBase64 } = req.body;
      const user = await userService.updateAvatar(req.user!.id, imageBase64);
      sendSuccess(res, user, 'Avatar updated');
    } catch (err) {
      next(err);
    }
  }

  async getMyPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.getMyPhotos(
        req.user!.id,
        req.query as Record<string, unknown>
      );
      sendSuccess(res, result.photos, 'Photos retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.toggleFavorite(
        req.user!.id,
        req.params.photoId
      );
      sendSuccess(res, result, result.favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      next(err);
    }
  }

  async getFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.getFavorites(
        req.user!.id,
        req.query as Record<string, unknown>
      );
      sendSuccess(res, result.photos, 'Favorites retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.getNotifications(
        req.user!.id,
        req.query as Record<string, unknown>
      );
      sendSuccess(res, result, 'Notifications retrieved');
    } catch (err) {
      next(err);
    }
  }

  async markNotificationsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { notificationIds } = req.body;
      await userService.markNotificationsRead(req.user!.id, notificationIds);
      sendSuccess(res, null, 'Notifications marked as read');
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getDashboard(req.user!.id);
      sendSuccess(res, data, 'Dashboard data retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
