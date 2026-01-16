import { useEffect, useRef } from 'react';
import {
  type MovieUploadInfo,
  type MovieUploadContext,
} from '@/models/MovieModel';
import { movieDbService } from '@/services/MovieDbService';
import { omdbApiService } from '@/services/OmdbApiService';
import { utilityApiService } from '@/services/UtilityApiService';
import { logger } from '@/core/logger';
import { toMovieDetail } from '@/utils/MovieFileHelper';

type WorkflowStep = (context: MovieUploadContext) => Promise<void>;

export const useUploadProcessor = (
  movieUplaoadContext: MovieUploadContext,
  onComplete?: (movies: MovieUploadInfo[]) => void,
) => {
  const hasRunRef = useRef(false);
  const onCompleteRef = useRef<
    ((movies: MovieUploadInfo[]) => void) | undefined
  >(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (hasRunRef.current) return;
    if (!movieUplaoadContext || movieUplaoadContext.movies.length === 0) {
      logger.info(
        `There are no movies to be uploaded. count: ${movieUplaoadContext.movies.length}`,
      );
      return;
    }
    hasRunRef.current = true;

    const stepFindNewFiles: WorkflowStep = async (working) => {
      if (working.movies.length === 0) {
        logger.info(`No files to process`);
        return;
      }
      logger.info(`Searching for files in DB`, working.movies.length);

      const newMovies: MovieUploadInfo[] = [];
      for (const movie of working.movies) {
        const exists = await movieDbService.fileExists(movie.file.fileName);
        if (exists) {
          newMovies.push(movie);
        }
      }

      working.movies = newMovies;
      logger.success(`Found all unsaved files in DB`, working.movies);
    };

    const stepSaveNewFiles: WorkflowStep = async (working) => {
      if (working.movies.length === 0) {
        logger.info(`No files to save`);
        return;
      }
      logger.info(`Saving files in DB`, working.movies);
      await Promise.allSettled(
        working.movies.map((m) => movieDbService.addFile(m.file)),
      );
      logger.success(`Saved all files in DB`, working.movies);
    };

    const stepLoadDetails: WorkflowStep = async (working) => {
      if (working.movies.length === 0) {
        logger.info(`No files to load details`);
        return;
      }

      logger.info(`Loading details from API`, working.movies);
      const responses = await Promise.allSettled(
        working.movies.map((m) =>
          omdbApiService.getMovieByTitle(m.file.title, m.file.year),
        ),
      );
      responses.forEach((r, index) => {
        const movie = working.movies[index];
        if (!movie) return;

        if (r.status === 'fulfilled') {
          const detail = r.value;
          if (detail.Response === 'True') {
            movie.file.imdbID = detail.imdbID;
            movie.detail = toMovieDetail(detail);
          } else {
            movie.error = {
              message: 'Movie response is not true.',
              detail: detail,
            };
          }
        } else {
          const reason = r.reason as Error | unknown as Error;
          movie.error = {
            message: reason?.message ?? 'Failed to load details',
          };
        }
      });

      if (responses.some((r) => r.status === 'rejected')) {
        logger.warn('Some movie details failed to load');
      }
      logger.success(`Loaded all details from API`, working.movies);
    };

    const stepSaveDetails: WorkflowStep = async (working) => {
      if (working.movies.length === 0) return;

      const ok = working.movies.filter((m) => m.detail);
      if (ok.length === 0) {
        logger.info(`No movie details is available to save in DB`);
        return;
      }

      logger.info(`Saving details in DB`, ok);
      await Promise.all(
        ok.map((m) =>
          movieDbService.updateMovieFileImdbID(m.file.imdbID!, m.file.fileName),
        ),
      );
      await Promise.all(ok.map((m) => movieDbService.addDetail(m.detail!)));
      logger.success(`Saved all details in DB`, ok);
    };

    const stepLoadPosters: WorkflowStep = async (working) => {
      if (working.movies.length === 0) return;
      const withPoster = working.movies.filter(
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
          movie.poster = {
            imdbID: movie.detail?.imdbID ?? '',
            title: movie.detail?.title ?? '',
            url: movie.detail?.poster ?? '',
            mime: 'image/jpeg',
            blob: response.value,
          };
        }
      });

      if (responses.some((r) => r.status === 'rejected')) {
        logger.warn('Some posters failed to load');
      }
      logger.success(
        `Loaded posters from API`,
        working.movies.map((m) => m.poster),
      );
    };

    const stepSavePosters: WorkflowStep = async (working) => {
      if (working.movies.length === 0) return;

      const withPoster = working.movies.filter((m) => !!m.poster);
      logger.info(`Saving posters in DB`, withPoster.length);
      await Promise.all(
        withPoster.map((m) => movieDbService.addPoster(m.poster!)),
      );
      logger.info(`Saved all posters in DB`, withPoster);
    };

    const stepLinkCategories: WorkflowStep = async (working) => {
      if (!working.categoryIds || working.categoryIds.length === 0) return;

      if (working.movies.length === 0) return;

      logger.info(`Linking categories to movies`, {
        categoryIds: working.categoryIds,
        movieCount: working.movies.length,
      });

      for (const movie of working.movies) {
        await movieDbService.linkMovieToCategories(
          movie.detail?.imdbID ?? '',
          working.categoryIds!,
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
      stepLinkCategories,
    ];

    const run = async () => {
      for (const step of workflow) {
        try {
          await step(movieUplaoadContext!);
        } catch (err) {
          logger.error('Loader workflow step failed', err);
        }
      }

      logger.success('The movie loading workflow completed');
    };

    if (hasRunRef.current) return;
    hasRunRef.current = true;
    run();
  }, [movieUplaoadContext.movies]);

  return { movies: movieUplaoadContext.movies };
};
