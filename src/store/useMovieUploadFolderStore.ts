import type { MovieUploadContext, MovieUploadInfo } from '@/models/MovieModel';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface MovieUploadFolderState {
  context: MovieUploadContext;
  setMovies: (movies: MovieUploadInfo[]) => void;
  setCategoryIds: (ids: number[]) => void;
  removeFileName: (fileName: string) => void;
  resetState: () => void;
}

export const useMovieUploadFolderStore = create<MovieUploadFolderState>()(
  immer((set) => ({
    context: {
      movies: [] as MovieUploadInfo[],
      categoryIds: [] as number[],
    },

    setMovies: (movies: MovieUploadInfo[]) =>
      set((state) => {
        state.context.movies = movies;
      }),

    setCategoryIds: (ids: number[]) =>
      set((state) => {
        state.context.categoryIds = ids;
      }),

    removeFileName: (fileName: string) =>
      set((state) => {
        state.context.movies = state.context.movies.filter(
          (m) => m.file.fileName !== fileName,
        );
      }),
    resetState: () =>
      set((state) => {
        state.context.movies = [];
        state.context.categoryIds = [];
      }),
  })),
);
