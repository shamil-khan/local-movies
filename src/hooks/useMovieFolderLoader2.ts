import { useEffect, useState, useRef } from 'react';
import { type XFile } from '@/components/mine/xfileinput';
import {
  type MovieFile,
  type MovieDetail,
  type MoviePoster,
} from '@/models/MovieModel';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { omdbApiService } from '@/services/OmdbApiService';
import { logger } from '@/core/logger';
import { movieDbService } from '@/services/MovieDbService';

type MovieInfo = {
  file: MovieFile;
  detail?: MovieDetail;
  poster?: MoviePoster;
  response?: {
    detail?: MovieDetail;
    error?: string;
  };
};

type MovieWorkFlowContext = {
  movies: MovieInfo[];
};

type WorkflowStep = (context: MovieWorkFlowContext) => Promise<void>;

export const useMovieFolderLoader2 = (
  files: XFile[],
  onComplete?: (
    details: MovieDetail[],
    files: MovieFile[],
    meta: Record<string, { detail?: MovieDetail; error?: string }>,
  ) => void,
  categoryIds?: number[],
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetail[]>([]);

  const onCompleteRef = useRef<
    | ((
        details: MovieDetail[],
        files: MovieFile[],
        meta: Record<string, { detail?: MovieDetail; error?: string }>,
      ) => void)
    | undefined
  >(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;

    logger.info(`Files state updated: ${files.length}`);

    const parsedFiles = toMovieFiles(files.map((f) => f.name)) as MovieFile[];

    if (parsedFiles.length === 0) return;

    const context: MovieWorkFlowContext = {
      movies: parsedFiles.map((f: MovieFile): MovieInfo => {
        return {
          file: f,
        };
      }),
    };

    const stepFindNewFiles: WorkflowStep = async (working) => {
      logger.info(`Searching for files in DB`, working.movies.length);
      const results = await Promise.all(
        working.movies.map((m) => movieDbService.fileExists(m.file.filename)),
      );

      const newFilenames = results.filter((r) => !r[1]).map((r) => r[0]);

      working.movies = working.movies.filter((m) =>
        newFilenames.includes(m.file.filename),
      );

      logger.success(`Found all unsaved files in DB`, working.movies);
    };

    const stepSaveNewFiles: WorkflowStep = async (working) => {
      if (working.movies.length === 0) return;
      logger.info(`Saving files in DB`, working.movies);
      await Promise.all(
        working.movies.map((m) => movieDbService.addFile(m.file)),
      );
      logger.success(`Saved all files in DB`, working.movies);
    };

    const stepLoadDetails: WorkflowStep = async (working) => {
      if (working.movies.length === 0) return;
      logger.info(`Loading details from API`, working.movies);
      const responses = await Promise.allSettled(
        working.movies.map((m) => omdbApiService.getMovieByTitle(m.file.title)),
      );
      responses.forEach((r, index) => {
        const movie = working.movies[index];
        if (!movie) return;

        if (r.status === 'fulfilled') {
          const detail = r.value.data;
          if (detail.Response === 'True') {
            movie.file.imdbID = detail.imdbID;
            movie.detail = detail;
            movie.response = { detail: detail };
          } else {
            movie.response = { detail: detail, error: 'Movie not found' };
          }
        } else {
          const reason = r.reason as Error | unknown as Error;
          movie.response = {
            error: reason?.message ?? 'Failed to load details',
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

      const ok = working.movies.filter((m) => m.detail?.Response === 'True');
      if (ok.length === 0) {
        logger.info(`No movie details is available to save in DB`);
        return;
      }

      logger.info(`Saving details in DB`, ok);
      await Promise.all(ok.map((m) => movieDbService.addDetail(m.detail!)));
      logger.success(`Saved all details in DB`, ok);
    };

    const stepLoadPosters: WorkflowStep = async (working) => {
      if (working.movies.length === 0) return;
      const withPoster = working.movies
        .filter(
          (m) => m.detail?.Response === 'True' && m.detail?.Poster !== 'N/A',
        )
        .map((m) => {
          return {
            imdbID: m.detail?.imdbID ?? '',
            Title: m.detail?.Title ?? '',
            Poster: m.detail?.Poster ?? '',
          };
        });
      if (withPoster.length === 0) {
        logger.info(`No movie poster is available to load from API`);
        return;
      }
      logger.info(`Loading posters from API`, withPoster);
      const responses = await Promise.allSettled(
        withPoster.map((wp) => omdbApiService.getPoster(wp)),
      );

      responses.forEach((r) => {
        if (r.status === 'fulfilled') {
          const movie = working.movies.find(
            (m) => m.detail?.imdbID === r.value.imdbID,
          );
          if (movie) movie.poster = r.value;
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

      const posters = working.movies.filter((m) => !!m.poster);
      logger.info(`Saving posters in DB`, posters);
      await Promise.all(posters.map((p) => movieDbService.addPoster(p)));
      logger.info(`Saved all posters in DB`, posters);
    };

    const stepLinkCategories: WorkflowStep = async (working) => {
      if (!categoryIds || categoryIds.length === 0) return;

      const allDetails = [
        ...working.details,
        ...working.existingDetails,
      ].filter((d) => d.Response === 'True');

      if (allDetails.length === 0) return;

      logger.info(`Linking categories to movies`, {
        categoryIds,
        movieCount: allDetails.length,
      });

      for (const detail of allDetails) {
        if (cancelled) return;
        await movieDbService.linkMovieToCategories(detail.imdbID, categoryIds);
      }

      logger.success(`Linked categories to all movies`);
    };

    const steps: WorkflowStep[] = [
      stepFindNewFiles,
      stepSaveNewFiles,
      stepLoadDetails,
      stepSaveDetails,
      stepLoadPosters,
      stepSavePosters,
      stepLinkCategories,
    ];

    const run = async () => {
      setLoading(true);
      setError(null);
      let hadError = false;

      for (const step of steps) {
        if (cancelled) break;
        try {
          await step(context);
        } catch (err) {
          if (!cancelled) {
            hadError = true;
            logger.error('Loader workflow step failed', err);
          }
        }
      }

      if (!cancelled) {
        const allDetails = [...ctx.details, ...ctx.existingDetails];
        const processedFiles = [...ctx.newFiles];
        setMovieDetails(allDetails);
        setLoading(false);
        if (hadError) {
          setError('Some files could not be processed');
        } else {
          setError(null);
        }
        if (onCompleteRef.current && processedFiles.length > 0) {
          onCompleteRef.current(allDetails, processedFiles, ctx.responseMeta);
        }
        logger.success('The movie loading workflow completed');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [files, categoryIds]);

  return { loading, error, movieDetails };
};
