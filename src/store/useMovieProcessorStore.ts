import logger from '@/core/logger';
import type {
  MovieDetail,
  MoviePoster,
  MovieUploadInfo,
} from '@/models/MovieModel';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface MovieProcessorStoreState {
  categoryIds: number[];
  movies: MovieUploadInfo[];
  setCategoryIds: (ids: number[]) => void;
  getMovies: () => MovieUploadInfo[];
  setMovies: (movies: MovieUploadInfo[]) => void;
  setDetail(movie: MovieUploadInfo, detail: MovieDetail): void;
  setPoster(movie: MovieUploadInfo, poster: MoviePoster): void;
  setError(
    movie: MovieUploadInfo,
    error: { message: string; detail?: object },
  ): void;
  removeFileName: (fileName: string) => void;
  resetState: () => void;
}

export const useMovieProcessorStore = create<MovieProcessorStoreState>()(
  immer((set, get) => ({
    categoryIds: [] as number[],
    movies: [] as MovieUploadInfo[],

    setCategoryIds: (ids: number[]) =>
      set((state) => {
        state.categoryIds = ids;
      }),

    getMovies: () => get().movies,

    setMovies: (movies: MovieUploadInfo[]) =>
      set((state) => {
        state.movies = movies;
      }),

    setDetail: (movie: MovieUploadInfo, detail: MovieDetail) =>
      set((state) => {
        const index = state.movies.findIndex(
          (m) => m.file.fileName === movie.file.fileName,
        );
        if (index !== -1) {
          state.movies[index].detail = detail;
          const mo = state.movies[index];
          logger.success(
            `Movie detail set for file ${movie.file.fileName}`,
            mo,
            movie,
          );
        } else {
          logger.warn(`Movie File not found for file ${movie.file.fileName}`);
        }
      }),

    setPoster: (movie: MovieUploadInfo, poster: MoviePoster) =>
      set((state) => {
        const index = state.movies.findIndex(
          (m) => m.file.fileName === movie.file.fileName,
        );
        if (index !== -1) {
          state.movies[index].poster = poster;
        }
      }),

    setError: (
      movie: MovieUploadInfo,
      error: { message: string; detail?: object },
    ) =>
      set((state) => {
        const index = state.movies.findIndex(
          (m) => m.file.fileName === movie.file.fileName,
        );
        if (index !== -1) {
          state.movies[index].error = error;
        }
      }),

    removeFileName: (fileName: string) =>
      set((state) => {
        state.movies = state.movies.filter((m) => m.file.fileName !== fileName);
      }),
    resetState: () =>
      set((state) => {
        state.movies = [];
        state.categoryIds = [];
      }),
  })),
);
