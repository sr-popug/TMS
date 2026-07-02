import { create } from 'zustand';

interface UiState {
  isLoading: boolean;
  title: string;
  showLoading: (title?: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<UiState>(set => ({
  isLoading: false,
  title: 'Загрузка...',
  showLoading: title => set({ isLoading: true, title: title || 'Загрузка...' }),
  hideLoading: () => set({ isLoading: false, title: 'Загрузка...' }),
}));
