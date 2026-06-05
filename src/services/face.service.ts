import axios from 'axios';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { FaceEmbeddingData, FaceMatchResult } from '../types';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { CacheService, CACHE_TTL } from '../config/redis';

const faceApiClient = axios.create({
  baseURL: env.FACE_SERVICE_URL,
  timeout: 30000,
});

export class FaceService {
  async extractEmbeddingFromBase64(
    imageBase64: string
  ): Promise<FaceEmbeddingData> {
    try {
      const response = await faceApiClient.post<FaceEmbeddingData>(
        '/extract-embedding',
        { image: imageBase64 }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new AppError(error.response.data?.message || 'No face detected', 400);
        }
      }
      throw new AppError('Face processing service unavailable', 503);
    }
  }

  async extractEmbeddingFromUrl(imageUrl: string): Promise<FaceEmbeddingData[]> {
    try {
      const response = await faceApiClient.post<FaceEmbeddingData[]>(
        '/extract-embeddings-url',
        { url: imageUrl }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          return [];
        }
      }
      logger.error('Face extraction from URL failed:', error);
      return [];
    }
  }

  async registerFace(userId: string, imageBase64: string): Promise<void> {
    const faceData = await this.extractEmbeddingFromBase64(imageBase64);

    if (faceData.quality < 0.6) {
      throw new AppError(
        'Face quality too low. Please ensure good lighting and face the camera directly.',
        400
      );
    }

    await prisma.faceEmbedding.upsert({
      where: { userId },
      create: {
        userId,
        embedding: faceData.embedding,
        quality: faceData.quality,
      },
      update: {
        embedding: faceData.embedding,
        quality: faceData.quality,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isFaceRegistered: true },
    });

    await CacheService.del(`user:${userId}`);
  }

  async findMatchingPhotos(
    userId: string,
    eventId: string
  ): Promise<FaceMatchResult[]> {
    const userEmbedding = await prisma.faceEmbedding.findUnique({
      where: { userId },
    });

    if (!userEmbedding) {
      throw new AppError('Face not registered. Please register your face first.', 400);
    }

    const faceRegions = await prisma.faceRegion.findMany({
      where: {
        photo: {
          eventId,
          isProcessed: true,
        },
      },
      include: {
        photo: true,
      },
    });

    if (faceRegions.length === 0) return [];

    const matches: FaceMatchResult[] = [];
    const threshold = env.FACE_SIMILARITY_THRESHOLD;

    for (const region of faceRegions) {
      const similarity = this.cosineSimilarity(
        userEmbedding.embedding,
        region.embedding
      );

      if (similarity >= threshold) {
        matches.push({
          photoId: region.photoId,
          similarity,
          faceRegionId: region.id,
        });
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);

    const uniqueByPhoto = new Map<string, FaceMatchResult>();
    for (const match of matches) {
      if (!uniqueByPhoto.has(match.photoId) ||
          uniqueByPhoto.get(match.photoId)!.similarity < match.similarity) {
        uniqueByPhoto.set(match.photoId, match);
      }
    }

    return Array.from(uniqueByPhoto.values());
  }

  async processEventPhotos(eventId: string): Promise<void> {
    const unprocessedPhotos = await prisma.photo.findMany({
      where: { eventId, isProcessed: false },
    });

    logger.info(`Processing ${unprocessedPhotos.length} photos for event ${eventId}`);

    for (const photo of unprocessedPhotos) {
      try {
        const faceDataList = await this.extractEmbeddingFromUrl(photo.url);

        if (faceDataList.length > 0) {
          await prisma.faceRegion.createMany({
            data: faceDataList.map((fd) => ({
              photoId: photo.id,
              embedding: fd.embedding,
              bbox: fd.bbox,
              confidence: fd.quality,
            })),
            skipDuplicates: true,
          });
        }

        await prisma.photo.update({
          where: { id: photo.id },
          data: {
            isProcessed: true,
            faceCount: faceDataList.length,
          },
        });
      } catch (error) {
        logger.error(`Failed to process photo ${photo.id}:`, error);
        await prisma.photo.update({
          where: { id: photo.id },
          data: { isProcessed: true, faceCount: 0 },
        });
      }
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { isProcessed: true },
    });
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

export const faceService = new FaceService();
