import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'event-photo-finder',
  encryptionKey: 'epf-secure-storage-key-2024',
});

export const StorageKeys = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  ONBOARDING_SEEN: 'onboarding_seen',
  THEME: 'theme_preference',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
} as const;

export const TokenStorage = {
  setTokens(accessToken: string, refreshToken: string): void {
    storage.set(StorageKeys.ACCESS_TOKEN, accessToken);
    storage.set(StorageKeys.REFRESH_TOKEN, refreshToken);
  },

  getAccessToken(): string | undefined {
    return storage.getString(StorageKeys.ACCESS_TOKEN);
  },

  getRefreshToken(): string | undefined {
    return storage.getString(StorageKeys.REFRESH_TOKEN);
  },

  clearTokens(): void {
    storage.delete(StorageKeys.ACCESS_TOKEN);
    storage.delete(StorageKeys.REFRESH_TOKEN);
  },

  setUser(user: unknown): void {
    storage.set(StorageKeys.USER, JSON.stringify(user));
  },

  getUser<T>(): T | null {
    const data = storage.getString(StorageKeys.USER);
    return data ? (JSON.parse(data) as T) : null;
  },

  clearAll(): void {
    storage.clearAll();
  },
};
