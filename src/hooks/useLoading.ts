import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useLoading = create<LoadingState>((set) => ({
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
})); 