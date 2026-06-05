import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../api/events.api';
import { queryKeys } from './useQueryKeys';

export function useEvents() {
  return useInfiniteQuery({
    queryKey: queryKeys.events.all(),
    queryFn: ({ pageParam = 1 }) => eventsApi.listEvents(pageParam as number),
    getNextPageParam: (last) => {
      const { page, totalPages } = last.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventsApi.getEvent(eventId),
    enabled: !!eventId,
    select: (res) => res.data,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; location?: string; eventDate: string }) =>
      eventsApi.createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
    },
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => eventsApi.joinEvent(inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
    },
  });
}

export function useUploadPhoto(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageBase64: string) => eventsApi.uploadPhoto(eventId, imageBase64),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.photos(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    },
  });
}

export function useEventMembers(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'members'],
    queryFn: () => eventsApi.getEventMembers(eventId),
    enabled: !!eventId,
    select: (res) => res.data,
  });
}

export function useSearchMyPhotos(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => eventsApi.searchMyPhotos(eventId),
    onSuccess: (res) => {
      queryClient.setQueryData(queryKeys.events.search(eventId), res.data?.photos ?? []);
    },
  });
}

export function useEventPhotos(eventId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.events.photos(eventId),
    queryFn: ({ pageParam = 1 }) => eventsApi.getEventPhotos(eventId, pageParam as number, 30),
    getNextPageParam: (last) => {
      const { page, totalPages } = last.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!eventId,
  });
}

export function useEventSearchResult(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.search(eventId),
    queryFn: () => null,
    enabled: false,
  });
}
