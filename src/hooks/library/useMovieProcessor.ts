import { useEffect, useCallback } from 'react';

import { useMovieProcessWorkflow } from '@/hooks/library/useMovieProcessWorkflow';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { type MovieUploadInfo } from '@/models/MovieModel';
import logger from '@/core/logger';
import { useMovieProcessorStore } from '@/store/useMovieProcessorStore';

export const useMovieProcessor = () => {
  const { movies, setMovies, removeFileName, resetState } =
    useMovieProcessorStore();
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

  return {
    movies: movies,
    load: loadFiles,
    process: runWorkflow,
    removeByFileName: removeFileName,
    clear: resetState,
  };
};
