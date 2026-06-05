import { create } from 'zustand';

interface UIState {
  activeEventSearch: string | null;
  photoSearchLoading: boolean;
  toastMessage: { message: string; type: 'success' | 'error' | 'info' } | null;

  setActiveEventSearch: (eventId: string | null) => void;
  setPhotoSearchLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeEventSearch: null,
  photoSearchLoading: false,
  toastMessage: null,

  setActiveEventSearch: (eventId) => set({ activeEventSearch: eventId }),
  setPhotoSearchLoading: (loading) => set({ photoSearchLoading: loading }),
  showToast: (message, type = 'info') => set({ toastMessage: { message, type } }),
  clearToast: () => set({ toastMessage: null }),
}));
