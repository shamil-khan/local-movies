import { useEffect, useCallback } from 'react';
import { useMovieUploadFolderStore } from '@/store/useMovieUploadFolderStore';
import { useUploadProcessor } from '@/hooks/library/useUploadProcessor';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { type MovieUploadInfo } from '@/models/MovieModel';
import logger from '@/core/logger';

interface useUploadFolderProps {
  fileNames: string[];
}

export const useUploadFolder = ({ fileNames }: useUploadFolderProps) => {
  const { context, setMovies } = useMovieUploadFolderStore();

  // Effect to set movies when fileNames changes
  useEffect(() => {
    logger.info(`useUploadFolder processing ${fileNames.length} files`);

    const movies: MovieUploadInfo[] =
      fileNames.length > 0
        ? toMovieFiles(fileNames).map((f) => ({
            file: f,
          }))
        : [];
    setMovies(movies);
  }, [fileNames, setMovies]);

  return {
    movies: context.movies,
  };
};
