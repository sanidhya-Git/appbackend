import { apiClient } from './client';
import { ApiResponse, Event, Photo, PaginationMeta } from '../types';

export interface EventMember {
  id: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string; email: string };
}

export const eventsApi = {
  async listEvents(page = 1, limit = 20): Promise<{ data: Event[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get('/events', { params: { page, limit } });
    return { data: data.data, meta: data.meta };
  },

  async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    const { data } = await apiClient.get(`/events/${eventId}`);
    return data;
  },

  async createEvent(payload: {
    name: string;
    description?: string;
    location?: string;
    eventDate: string;
  }): Promise<ApiResponse<Event>> {
    const { data } = await apiClient.post('/events', payload);
    return data;
  },

  async joinEvent(inviteCode: string): Promise<ApiResponse<Event>> {
    const { data } = await apiClient.post('/events/join', { inviteCode: inviteCode.toUpperCase() });
    return data;
  },

  async getEventPhotos(eventId: string, page = 1, limit = 30): Promise<{ data: Photo[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get(`/events/${eventId}/photos`, { params: { page, limit } });
    return { data: data.data, meta: data.meta };
  },

  async uploadPhoto(eventId: string, imageBase64: string): Promise<ApiResponse<Photo>> {
    const { data } = await apiClient.post(`/events/${eventId}/photos`, { imageBase64 });
    return data;
  },

  async getEventMembers(eventId: string): Promise<ApiResponse<EventMember[]>> {
    const { data } = await apiClient.get(`/events/${eventId}/members`);
    return data;
  },

  async searchMyPhotos(eventId: string): Promise<ApiResponse<{ photos: Photo[]; total: number }>> {
    const { data } = await apiClient.get(`/events/${eventId}/search`);
    return data;
  },
};
