import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens } from '../../types';
import { TokenStorage } from '../../services/storage';
import { storage } from '../../services/storage';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, tokens: AuthTokens) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const mmkvStorage = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, tokens) => {
        TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        TokenStorage.setUser(user);
        set({ user, tokens, isAuthenticated: true });
      },

      updateUser: (updatedUser) => {
        const current = get().user;
        if (!current) return;
        const merged = { ...current, ...updatedUser };
        TokenStorage.setUser(merged);
        set({ user: merged });
      },

      logout: () => {
        TokenStorage.clearAll();
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
