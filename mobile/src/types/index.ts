export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  provider: 'EMAIL' | 'GOOGLE' | 'APPLE';
  isVerified: boolean;
  isFaceRegistered: boolean;
  createdAt: string;
  _count?: {
    photoMatches: number;
    notifications: number;
  };
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  cloudinaryFolder: string;
  location?: string;
  eventDate: string;
  totalPhotos: number;
  isProcessed: boolean;
  createdAt: string;
  _count?: { photos: number };
}

export interface Photo {
  id: string;
  eventId: string;
  cloudinaryId: string;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  faceCount: number;
  similarity?: number;
  isViewed?: boolean;
  event?: {
    id: string;
    name: string;
    eventDate: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'PHOTOS_FOUND' | 'EVENT_ADDED' | 'SYSTEM';
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
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

export interface DashboardData {
  user: Partial<User>;
  recentEvents: Event[];
  totalPhotos: number;
  unreadNotifications: number;
}

export interface FaceQualityResult {
  detected: boolean;
  quality: number;
  bbox: { x: number; y: number; width: number; height: number };
  isAcceptable: boolean;
}
