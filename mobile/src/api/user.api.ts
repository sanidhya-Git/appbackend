import { apiClient } from './client';
import { ApiResponse, DashboardData, Notification, Photo, PaginationMeta, User } from '../types';

export const userApi = {
  async getProfile(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get('/users/profile');
    return data;
  },

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<Partial<User>>> {
    const { data } = await apiClient.patch('/users/profile', payload);
    return data;
  },

  async updateAvatar(imageBase64: string): Promise<ApiResponse<{ avatarUrl: string }>> {
    const { data } = await apiClient.post('/users/avatar', { imageBase64 });
    return data;
  },

  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const { data } = await apiClient.get('/users/dashboard');
    return data;
  },

  async getMyPhotos(page = 1, limit = 20, eventId?: string): Promise<{
    data: Photo[];
    meta: PaginationMeta;
  }> {
    const { data } = await apiClient.get('/users/my-photos', {
      params: { page, limit, ...(eventId ? { eventId } : {}) },
    });
    return { data: data.data, meta: data.meta };
  },

  async toggleFavorite(photoId: string): Promise<ApiResponse<{ favorited: boolean }>> {
    const { data } = await apiClient.post(`/users/photos/${photoId}/favorite`);
    return data;
  },

  async getFavorites(page = 1, limit = 20): Promise<{
    data: Photo[];
    meta: PaginationMeta;
  }> {
    const { data } = await apiClient.get('/users/favorites', {
      params: { page, limit },
    });
    return { data: data.data, meta: data.meta };
  },

  async getNotifications(page = 1, limit = 20): Promise<{
    notifications: Notification[];
    unreadCount: number;
    meta: PaginationMeta;
  }> {
    const { data } = await apiClient.get('/users/notifications', {
      params: { page, limit },
    });
    return data.data;
  },

  async markNotificationsRead(notificationIds?: string[]): Promise<void> {
    await apiClient.post('/users/notifications/read', { notificationIds });
  },
};
