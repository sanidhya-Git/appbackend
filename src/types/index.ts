import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface FaceEmbeddingData {
  embedding: number[];
  quality: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FaceMatchResult {
  photoId: string;
  similarity: number;
  faceRegionId: string;
}

export interface CloudinaryWebhookPayload {
  notification_type: string;
  timestamp: string;
  request_id: string;
  asset_id: string;
  public_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  url: string;
  secure_url: string;
  folder: string;
}
