export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  dashboard: () => ['dashboard'] as const,
  events: {
    all: () => ['events'] as const,
    list: (page: number) => ['events', 'list', page] as const,
    detail: (id: string) => ['events', id] as const,
    search: (eventId: string) => ['events', eventId, 'search'] as const,
    photos: (eventId: string) => ['events', eventId, 'photos'] as const,
  },
  photos: {
    my: (page: number, eventId?: string) =>
      ['photos', 'my', page, eventId] as const,
    favorites: (page: number) => ['photos', 'favorites', page] as const,
  },
  notifications: {
    all: (page: number) => ['notifications', page] as const,
  },
  profile: () => ['profile'] as const,
} as const;
