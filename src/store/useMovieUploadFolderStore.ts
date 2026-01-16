import type { MovieUploadContext, MovieUploadInfo } from '@/models/MovieModel';
import { create } from 'zustand';

interface MovieUploadFolderState {
  context: MovieUploadContext;
  setMovies: (movies: MovieUploadInfo[]) => void;
  setCategoryIds: (ids: number[]) => void;
  removeFileName: (fileName: string) => void;
}

export const useMovieUploadFolderStore = create<MovieUploadFolderState>(
  (set) => ({
    context: {
      movies: [] as MovieUploadInfo[],
      categoryIds: [] as number[],
    },

    // Updates the whole movies array inside the context
    setMovies: (movies) =>
      set((state) => ({
        context: { ...state.context, movies },
      })),

    // Updates categoryIds inside the context
    setCategoryIds: (categoryIds) =>
      set((state) => ({
        context: { ...state.context, categoryIds },
      })),

    // Updates a single movie inside the context object
    removeFileName: (fileName: string) =>
      set((state) => ({
        context: {
          ...state.context,
          movies: state.context.movies.filter(
            (m) => m.file.fileName !== fileName,
          ),
        },
      })),
  }),
);
