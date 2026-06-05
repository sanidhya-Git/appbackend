import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { eventService } from '../services/event.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Use YYYY-MM-DD or ISO format'),
});

export const joinEventSchema = z.object({
  inviteCode: z.string().length(8).toUpperCase(),
});

export const uploadPhotoSchema = z.object({
  imageBase64: z.string().min(100),
});

export class EventController {
  async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.createUserEvent(req.user!.id, {
        ...req.body,
        eventDate: new Date(req.body.eventDate),
      });
      sendSuccess(res, event, 'Event created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async joinEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.joinEvent(req.user!.id, req.body.inviteCode);
      sendSuccess(res, event, 'Joined event successfully');
    } catch (err) {
      next(err);
    }
  }

  async listEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await eventService.listEvents(req.user!.id, req.query as Record<string, unknown>);
      sendSuccess(res, result.events, 'Events retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.getEventById(req.user!.id, req.params.id);
      sendSuccess(res, event, 'Event retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getEventPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await eventService.getEventPhotos(
        req.user!.id,
        req.params.id,
        req.query as Record<string, unknown>
      );
      sendSuccess(res, result.photos, 'Photos retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getEventMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const members = await eventService.getEventMembers(req.user!.id, req.params.id);
      sendSuccess(res, members, 'Members retrieved');
    } catch (err) {
      next(err);
    }
  }

  async uploadPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const photo = await eventService.uploadPhoto(
        req.user!.id,
        req.params.id,
        req.body.imageBase64
      );
      sendSuccess(res, photo, 'Photo uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async syncPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await eventService.syncEventPhotos(req.params.id);
      sendSuccess(res, result, `Synced ${result.synced} new photos`);
    } catch (err) {
      next(err);
    }
  }

  async searchMyPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await eventService.searchPhotos(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Photo search complete');
    } catch (err) {
      next(err);
    }
  }
}

export const eventController = new EventController();
