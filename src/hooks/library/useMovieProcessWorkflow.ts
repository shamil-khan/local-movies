import { type MovieUploadInfo } from '@/models/MovieModel';
import { movieDbService } from '@/services/MovieDbService';
import { omdbApiService } from '@/services/OmdbApiService';
import { utilityApiService } from '@/services/UtilityApiService';
import { toMovieDetail } from '@/utils/MovieFileHelper';
import { logger } from '@/core/logger';
import {
  useMovieProcessorStore,
  type MovieProcessorStoreState,
} from '@/store/useMovieProcessorStore';
import { useCallback } from 'react';

type WorkflowStep = (store: MovieProcessorStoreState) => Promise<void>;

const stepFindNewFiles: WorkflowStep = async (store) => {
  if (store.movies.length === 0) {
    logger.info(`No files to process`);
    return;
  }
  logger.info(`Searching for files in DB`, store.movies.length);

  const newMovies: MovieUploadInfo[] = [];
  for (const movie of store.movies) {
    const exists = await movieDbService.fileExists(movie.file.fileName);
    if (exists) {
      newMovies.push(movie);
    }
  }

  // store.movies = newMovies;
  logger.success(`Found all unsaved files in DB`, store.movies);
};

const stepSaveNewFiles: WorkflowStep = async (store) => {
  if (store.movies.length === 0) {
    logger.info(`No files to save`);
    return;
  }
  logger.info(`Saving files in DB`, store.movies);
  await Promise.allSettled(
    store.movies.map((m) => movieDbService.addFile(m.file)),
  );
  logger.success(`Saved all files in DB`, store.movies);
};

const stepLoadDetails: WorkflowStep = async (store) => {
  if (store.movies.length === 0) {
    logger.info(`No files to load details`);
    return;
  }

  logger.info(`Loading details from API`, store.movies);
  const responses = await Promise.allSettled(
    store.movies.map((m) =>
      omdbApiService.getMovieByTitle(m.file.title, m.file.year),
    ),
  );
  responses.forEach((r, index) => {
    const movie = store.movies[index];
    if (!movie) return;

    if (r.status === 'fulfilled') {
      const detail = r.value;
      if (detail.Response === 'True') {
        store.setDetail(movie, toMovieDetail(detail));
      } else {
        store.setError(movie, {
          message: 'Movie response is not true.',
          detail: detail,
        });
      }
    } else {
      const reason = r.reason as Error | unknown as Error;
      store.setError(movie, {
        message: reason?.message ?? 'Failed to load details',
      });
    }
  });

  if (responses.some((r) => r.status === 'rejected')) {
    logger.warn('Some movie details failed to load');
  }
  logger.success(`Loaded all details from API`, store.movies);
};

const stepSaveDetails: WorkflowStep = async (store) => {
  const movies = store.getMovies();
  if (movies.length === 0) return;

  const ok = movies.filter((m) => m.detail);
  if (ok.length === 0) {
    logger.info(`No movie details is available to save in DB`, movies);
    return;
  }

  logger.info(`Saving details in DB`, ok);
  await Promise.all(
    ok.map((m) =>
      movieDbService.updateMovieFileImdbID(
        m.file.fileName,
        m.detail?.imdbID ?? '',
      ),
    ),
  );

  await Promise.all(ok.map((m) => movieDbService.addDetail(m.detail!)));
  logger.success(`Saved all details in DB`, ok);
};

const stepLoadPosters: WorkflowStep = async (store) => {
  const movies = store.getMovies();
  if (movies.length === 0) return;
  const withPoster = movies.filter(
    (m) => m.detail && m.detail?.poster !== 'N/A',
  );

  if (withPoster.length === 0) {
    logger.info(`No movie poster is available to load from API`);
    return;
  }
  logger.info(`Loading posters from API`, withPoster);
  const responses = await Promise.allSettled(
    withPoster.map((wp) =>
      utilityApiService.getPosterImage(wp.detail?.poster ?? ''),
    ),
  );

  responses.forEach((response, index) => {
    if (response.status === 'fulfilled') {
      const movie = withPoster[index];
      store.setPoster(movie, {
        imdbID: movie.detail?.imdbID ?? '',
        title: movie.detail?.title ?? '',
        url: movie.detail?.poster ?? '',
        mime: 'image/jpeg',
        blob: response.value,
      });
    }
  });

  if (responses.some((r) => r.status === 'rejected')) {
    logger.warn('Some posters failed to load');
  }
  logger.success(`Loaded posters from API`);
};

const stepSavePosters: WorkflowStep = async (store) => {
  const movies = store.getMovies();
  if (movies.length === 0) return;

  const withPoster = movies.filter((m) => !!m.poster);
  logger.info(`Saving posters in DB`, withPoster.length);
  await Promise.all(withPoster.map((m) => movieDbService.addPoster(m.poster!)));
  logger.info(`Saved all posters in DB`, withPoster);
};

const stepSaveMovieToCategories: WorkflowStep = async (store) => {
  const movies = store.getMovies();
  if (!store.categoryIds || store.categoryIds.length === 0) return;

  if (movies.length === 0) return;

  logger.info(`Linking categories to movies`, {
    categoryIds: store.categoryIds,
    movieCount: movies.length,
  });

  for (const movie of movies) {
    await movieDbService.addMovieToCategories(
      movie.detail?.imdbID ?? '',
      store.categoryIds!,
    );
  }

  logger.success(`Linked categories to all movies`);
};

const workflow: WorkflowStep[] = [
  stepFindNewFiles,
  stepSaveNewFiles,
  stepLoadDetails,
  stepSaveDetails,
  stepLoadPosters,
  stepSavePosters,
  stepSaveMovieToCategories,
];

export const useMovieProcessWorkflow = () => {
  const store = useMovieProcessorStore();

  const runWorkflow = useCallback(async () => {
    logger.info('Starting the movie loading workflow');
    for (const step of workflow) {
      try {
        await step(store);
      } catch (err) {
        logger.error('Loader workflow step failed', err);
      }
    }

    logger.success('The movie loading workflow completed');
  }, [store]);

  return { runWorkflow };
};
