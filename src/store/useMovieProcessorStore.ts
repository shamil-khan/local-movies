import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
import type { MovieFile, MovieDetail } from '@/models/MovieModel';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { pluralName } from '@/utils/Helper';
import logger from '@/core/logger';

export interface MovieUploadInfo {
  file: MovieFile;
  isProcessed: boolean;
  inDb?: boolean;
  detail?: MovieDetail;
  poster?: Blob;
  error?: {
    message: string;
    detail?: unknown;
  };
}

export interface MovieProcessorStoreState {
  movies: MovieUploadInfo[];
  isProcessing: boolean;
  isCompleted: boolean;
  setIsProcessing: (value: boolean) => void;
  setIsCompleted: (value: boolean) => void;
  loadFiles: (fileNames: string[]) => void;
  findMovieIndex: (file: MovieFile) => number;
  inDb(file: MovieFile, value: boolean): void;
  setDetail(file: MovieFile, detail: MovieDetail): void;
  setPoster(file: MovieFile, poster: Blob): void;
  hasError(file: MovieFile, error: { message: string; detail?: object }): void;
  remove: (file: MovieFile) => void;
  reset: () => void;
}

export const useMovieProcessorStore = create<MovieProcessorStoreState>()(
  immer((set, get) => ({
    movies: [] as MovieUploadInfo[],
    isProcessing: false,
    isCompleted: false,

    setIsProcessing: (value: boolean) =>
      set((state) => {
        state.isProcessing = value;
      }),

    setIsCompleted: (value: boolean) =>
      set((state) => {
        state.isCompleted = value;
      }),

    loadFiles: (fileNames: string[]) => {
      const movies = toMovieFiles(fileNames).map(
        (f): MovieUploadInfo => ({
          file: f,
          isProcessed: false,
        }),
      );

      logger.info(
        `Movie Processor Store has been loaded with ${movies.length} ${pluralName(movies, 'file')}.`,
      );
      set((state) => {
        state.movies = movies;
        state.isCompleted = false;
        state.isProcessing = false;
      });
    },

    findMovieIndex: (file: MovieFile): number =>
      get().movies.findIndex(
        (m) => m.file.title === file.title && m.file.year === file.year,
      ),

    inDb: (file: MovieFile, value: boolean) =>
      set((state) => {
        const index = state.findMovieIndex(file);
        if (index !== -1) {
          state.movies[index].inDb = value;
          state.movies[index].isProcessed = true;
        }
      }),

    setDetail: (file: MovieFile, detail: MovieDetail) =>
      set((state) => {
        const index = state.findMovieIndex(file);
        if (index !== -1) {
          state.movies[index].detail = detail;
        }
      }),

    setPoster: (file: MovieFile, poster: Blob) =>
      set((state) => {
        const index = state.findMovieIndex(file);
        if (index !== -1) {
          state.movies[index].poster = poster;
        }
      }),

    hasError: (file: MovieFile, error: { message: string; detail?: object }) =>
      set((state) => {
        const index = state.findMovieIndex(file);
        if (index !== -1) {
          state.movies[index].error = error;
        }
      }),

    remove: (file: MovieFile) =>
      set((state) => {
        state.movies = state.movies.filter(
          (m) => !(m.file.title === file.title && m.file.year === file.year),
        );
        const message = `Title [${file.title} (${file.year})] for File '${file.fileName}' has been removed from processing`;
        logger.info(message);
        toast.warning(message);
      }),

    reset: () =>
      set((state) => {
        state.movies = [];
        state.isProcessing = false;
        state.isCompleted = false;
      }),
  })),
);
