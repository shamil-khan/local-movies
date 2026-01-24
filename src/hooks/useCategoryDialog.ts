import { create } from 'zustand';
import { type MovieInfo } from '@/models/MovieModel';

interface CategoryDialogState {
  isOpen: boolean;
  selectedMovie: MovieInfo | null;
  open: (movie?: MovieInfo) => void;
  close: () => void;
}

export const useCategoryDialog = create<CategoryDialogState>((set) => ({
  isOpen: false,
  selectedMovie: null,
  open: (movie) => set({ isOpen: true, selectedMovie: movie || null }),
  close: () => set({ isOpen: false, selectedMovie: null }),
}));
