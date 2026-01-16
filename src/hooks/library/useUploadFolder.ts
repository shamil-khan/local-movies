import { useEffect, useCallback } from 'react';
import { useMovieUploadFolderStore } from '@/store/useMovieUploadFolderStore';
import { useUploadProcessor } from '@/hooks/library/useUploadProcessor';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { type MovieUploadInfo } from '@/models/MovieModel';
import logger from '@/core/logger';

interface useUploadFolderProps {
  fileNames: string[];
  categoryIds: number[];
  onMoviesUpdated: (movies: MovieUploadInfo[]) => void;
}

export const useUploadFolder = ({
  fileNames,
  categoryIds,
  onMoviesUpdated,
}: useUploadFolderProps) => {
  const movieUploadStore = useMovieUploadFolderStore();

  useUploadProcessor(movieUploadStore.context, (movies) => {
    onMoviesUpdated(movies);
  });

  // Effect to set movies when fileNames changes
  useEffect(() => {
    logger.info(`useMovieUploadFolder setting movies`);

    const movies: MovieUploadInfo[] =
      fileNames.length > 0
        ? toMovieFiles(fileNames).map((f) => ({
            file: f,
          }))
        : [];
    movieUploadStore.setMovies(movies);
    handleProcessMovies();
  }, [fileNames]);

  // Effect to set categoryIds when categoryIds changes
  useEffect(() => {
    movieUploadStore.setCategoryIds(categoryIds);
  }, [categoryIds]);

  const handleProcessMovies = useCallback(
    (categoryIds?: number[]) => {
      movieUploadStore.setCategoryIds(categoryIds ?? []);
    },
    [movieUploadStore],
  );

  const handleRemoveFileName = useCallback(
    (fileName: string) => {
      movieUploadStore.removeFileName(fileName);
    },
    [movieUploadStore],
  );

  const resetState = useCallback(() => {
    movieUploadStore.setMovies([]);
  }, [movieUploadStore]);

  return {
    movies: movieUploadStore.context.movies,
    handleProcessMovies,
    handleRemoveFileName,
    resetState,
  };
};
