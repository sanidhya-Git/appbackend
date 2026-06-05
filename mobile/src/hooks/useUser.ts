import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { faceApi } from '../api/face.api';
import { useAuthStore } from '../store/slices/authStore';
import { queryKeys } from './useQueryKeys';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => userApi.getDashboard(),
    select: (res) => res.data,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: () => userApi.getProfile(),
    select: (res) => res.data,
  });
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { firstName?: string; lastName?: string }) =>
      userApi.updateProfile(payload),
    onSuccess: (res) => {
      if (res.data) {
        updateUser(res.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      }
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (imageBase64: string) => userApi.updateAvatar(imageBase64),
    onSuccess: (res) => {
      if (res.data) {
        updateUser({ avatarUrl: res.data.avatarUrl });
        queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      }
    },
  });
}

export function useMyPhotos(page = 1, eventId?: string) {
  return useQuery({
    queryKey: queryKeys.photos.my(page, eventId),
    queryFn: () => userApi.getMyPhotos(page, 20, eventId),
    select: (res) => res,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => userApi.toggleFavorite(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', 'favorites'] });
    },
  });
}

export function useFavorites(page = 1) {
  return useQuery({
    queryKey: queryKeys.photos.favorites(page),
    queryFn: () => userApi.getFavorites(page),
    select: (res) => res,
  });
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: queryKeys.notifications.all(page),
    queryFn: () => userApi.getNotifications(page),
    select: (res) => res,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds?: string[]) =>
      userApi.markNotificationsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useRegisterFace() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageBase64: string) => faceApi.registerFace(imageBase64),
    onSuccess: () => {
      updateUser({ isFaceRegistered: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
    },
  });
}

export function useVerifyFaceQuality() {
  return useMutation({
    mutationFn: (imageBase64: string) => faceApi.verifyFaceQuality(imageBase64),
  });
}
