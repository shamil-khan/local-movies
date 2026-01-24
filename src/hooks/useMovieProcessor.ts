import { useCallback } from 'react';

import { useMovieProcessWorkflow } from '@/hooks/useMovieProcessWorkflow';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { type MovieUploadInfo } from '@/models/MovieModel';
import logger from '@/core/logger';
import { useMovieProcessorStore } from '@/store/useMovieProcessorStore';
import { useMovieLibraryStore } from '@/store/useMovieLibraryStore';

export const useMovieProcessor = () => {
  const {
    movies,
    setMovies,
    removeFileName: storeRemoveFileName,
    resetState,
  } = useMovieProcessorStore();
  const { runWorkflow } = useMovieProcessWorkflow();

  const loadFiles = useCallback(
    async (fileNames: string[]) => {
      logger.info(`useMovieProcessor processing ${fileNames.length} files`);

      const movies: MovieUploadInfo[] =
        fileNames.length > 0
          ? toMovieFiles(fileNames).map((f) => ({
              file: f,
            }))
          : [];
      setMovies(movies);
    },
    [setMovies],
  );

  const removeMovie = useCallback(
    async (fileName: string) => {
      const movie = movies.find((m) => m.file.fileName === fileName);
      if (movie && movie.detail?.imdbID) {
        // If processed, remove from library/DB
        const isComplete = useMovieProcessorStore.getState().isComplete;
        if (isComplete) {
          await useMovieLibraryStore
            .getState()
            .removeMovie(movie.detail.imdbID);
        }
      }
      storeRemoveFileName(fileName);
    },
    [movies, storeRemoveFileName],
  );

  return {
    movies: movies,
    load: loadFiles,
    process: runWorkflow,
    removeByFileName: removeMovie,
    clear: resetState,
    categoryIds: useMovieProcessorStore((state) => state.categoryIds),
    setCategoryIds: useMovieProcessorStore((state) => state.setCategoryIds),
    isProcessing: useMovieProcessorStore((state) => state.isProcessing),
    isComplete: useMovieProcessorStore((state) => state.isComplete),
  };
};
