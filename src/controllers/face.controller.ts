import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { faceService } from '../services/face.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';

export const registerFaceSchema = z.object({
  imageBase64: z.string().min(100),
});

export class FaceController {
  async registerFace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { imageBase64 } = req.body;
      await faceService.registerFace(req.user!.id, imageBase64);
      sendSuccess(res, null, 'Face registered successfully');
    } catch (err) {
      next(err);
    }
  }

  async verifyFaceQuality(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { imageBase64 } = req.body;
      const faceData = await faceService.extractEmbeddingFromBase64(imageBase64);
      sendSuccess(res, {
        detected: true,
        quality: faceData.quality,
        bbox: faceData.bbox,
        isAcceptable: faceData.quality >= 0.6,
      }, 'Face quality checked');
    } catch (err) {
      next(err);
    }
  }
}

export const faceController = new FaceController();
