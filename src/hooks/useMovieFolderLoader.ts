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

type LoaderWorkingSet = {
  newFiles: MovieFile[];
  allFiles: MovieFile[];
  posters: MoviePoster[];
  details: MovieDetail[];
  existingDetails: MovieDetail[];
  responseMeta: Record<
    string,
    {
      detail?: MovieDetail;
      error?: string;
    }
  >;
};

type WorkflowStep = (ctx: LoaderWorkingSet) => Promise<void>;

export const useMovieFolderLoader = (
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

    const ctx: LoaderWorkingSet = {
      newFiles: [...parsedFiles],
      allFiles: [...parsedFiles],
      posters: [],
      details: [],
      existingDetails: [],
      responseMeta: {},
    };

    const stepFindNewFiles: WorkflowStep = async (working) => {
      logger.info(`Searching for files in DB`, working.newFiles);
      const results = await Promise.all(
        working.newFiles.map((file) =>
          movieDbService.fileExists(file.filename),
        ),
      );

      const foundFilenames = results.filter((r) => r[1]).map((r) => r[0]);
      const newFilenames = results.filter((r) => !r[1]).map((r) => r[0]);

      const existingFiles = working.newFiles.filter((f) =>
        foundFilenames.includes(f.filename),
      );

      const existingDetails = await Promise.all(
        existingFiles.map((file) => movieDbService.findByTitle(file.title)),
      );

      working.existingDetails = existingDetails.filter(
        (d): d is MovieDetail => !!d,
      );

      existingFiles.forEach((file, index) => {
        const detail = existingDetails[index];
        if (detail) {
          working.responseMeta[file.filename] = { detail };
        }
      });

      working.newFiles = working.newFiles.filter((f) =>
        newFilenames.includes(f.filename),
      );

      logger.success(`Found all unsaved files in DB`, working.newFiles);
    };

    const stepSaveNewFiles: WorkflowStep = async (working) => {
      if (working.newFiles.length === 0) return;
      logger.info(`Saving files in DB`, working.newFiles);
      await Promise.all(
        working.newFiles.map((file) => movieDbService.addFile(file)),
      );
      logger.success(`Saved all files in DB`, working.newFiles);
    };

    const stepLoadDetails: WorkflowStep = async (working) => {
      if (working.newFiles.length === 0) return;
      logger.info(`Loading details from API`, working.newFiles);
      const responses = await Promise.allSettled(
        working.newFiles.map((file) =>
          omdbApiService.getMovieByTitle(file.title),
        ),
      );
      responses.forEach((r, index) => {
        const file = working.newFiles[index];
        if (!file) return;

        if (r.status === 'fulfilled') {
          const detail = r.value.data;
          working.responseMeta[file.filename] = {
            detail,
            error:
              detail.Response === 'True'
                ? undefined
                : detail.Error || 'Movie not found',
          };
        } else {
          const reason = r.reason as Error | unknown as Error;
          working.responseMeta[file.filename] = {
            error: reason?.message ?? 'Failed to load details',
          };
        }
      });

      const fulfilled = responses.filter(
        (
          r,
        ): r is PromiseFulfilledResult<
          Awaited<ReturnType<typeof omdbApiService.getMovieByTitle>>
        > => r.status === 'fulfilled',
      );
      working.details = fulfilled.map((r) => r.value.data);
      if (responses.some((r) => r.status === 'rejected')) {
        logger.warn('Some movie details failed to load');
      }
      logger.success(`Loaded all details from API`, working.details);
    };

    const stepSaveDetails: WorkflowStep = async (working) => {
      if (working.details.length === 0) return;

      const ok = working.details.filter((detail) => detail.Response === 'True');
      if (ok.length === 0) {
        working.details = [];
        return;
      }

      working.details = ok;
      logger.info(`Saving details in DB`, working.details);
      await Promise.all(
        working.details.map((detail) => movieDbService.addDetail(detail)),
      );
      logger.success(`Saved all details in DB`, working.details);
    };

    const stepLoadPosters: WorkflowStep = async (working) => {
      if (working.details.length === 0) return;
      const withPoster = working.details.filter(
        (detail) => detail.Response === 'True' && detail.Poster !== 'N/A',
      );
      if (withPoster.length === 0) {
        working.posters = [];
        return;
      }
      logger.info(`Loading posters from API`, withPoster);
      const responses = await Promise.allSettled(
        withPoster.map((d) => omdbApiService.getPoster(d)),
      );
      const fulfilled = responses.filter(
        (
          r,
        ): r is PromiseFulfilledResult<
          Awaited<ReturnType<typeof omdbApiService.getPoster>>
        > => r.status === 'fulfilled',
      );
      working.posters = fulfilled.map((r) => r.value);
      if (responses.some((r) => r.status === 'rejected')) {
        logger.warn('Some posters failed to load');
      }
      logger.success(`Loaded all posters from API`, working.posters);
    };

    const stepSavePosters: WorkflowStep = async (working) => {
      if (working.posters.length === 0) return;
      logger.info(`Saving posters in DB`, working.posters);
      await Promise.all(
        working.posters.map((poster) => movieDbService.addPoster(poster)),
      );
      logger.info(`Saved all posters in DB`, working.posters);
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
          await step(ctx);
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
