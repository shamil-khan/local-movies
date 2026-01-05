import { useEffect, useState } from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { XFileInput, type XFile } from '@/components/mine/xfileinput';
import {
  type MovieFile,
  type MovieDetail,
  type MoviePoster,
} from '@/models/MovieModel';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { movieApiService } from '@/services/MovieApiService';
import { logger } from '@/core/logger';
import { MovieCard } from '@/components/MovieCard';
import { movieDbService } from '@/services/MovieDbService';

export const FolderReader = () => {
  const [xFiles, setXFiles] = useState<XFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetail[]>([]);

  useEffect(() => {
    logger.error(error, loading); //todo: have to remove:  @typescript-eslint/no-unused-vars
    logger.info(`Files state updated: ${xFiles.length}`);
    if (xFiles.length === 0) return;

    const working = {
      files: toMovieFiles(xFiles.map((f) => f.name)) as MovieFile[],
      posters: [] as MoviePoster[],
      details: [] as MovieDetail[],
    };

    const checkFiles = async () => {
      if (working.files.length === 0) {
        logger.warn('There is no file to be exists in DB');
        return;
      }

      logger.info(`Searching for files in DB`, working.files);
      const promises = working.files.map((file) =>
        movieDbService.fileExists(file.filename),
      );

      const result = await Promise.all(promises);
      const notFound = result.filter((r) => !r[1]).map((r) => r[0]);
      const workable = working.files.filter((f) =>
        notFound.find((ff) => ff === f.filename),
      );
      working.files = workable;
      logger.success(`Found all unsaved files in DB`, working.files);
    };

    const saveFiles = async () => {
      if (working.files.length === 0) {
        logger.warn('There is no file to be save in DB');
        return;
      }

      logger.info(`Saving files in DB`, working.files);
      const promises = working.files.map((file) =>
        movieDbService.addFile(file),
      );
      await Promise.all(promises);
      logger.success(`Saved all files in DB`, working.files);
    };

    const loadDetails = async () => {
      if (working.files.length === 0) {
        logger.warn('There is no file to load from API');
        return;
      }

      logger.info(`Loading details from API`, working.files);
      const promises = working.files.map((file) =>
        movieApiService.getMovieByTitle(file.title),
      );

      const results = await Promise.all(promises);
      working.details = results.map((response) => response.data);
      logger.success(`Loaded all details from API`, working.details);
    };

    const saveDetails = async () => {
      if (working.details.length === 0) {
        logger.warn('There is no detail to save in DB');
        return;
      }

      logger.info(`Saving details in DB`, working.details);
      const truly = working.details.filter(
        (detail) => detail.Response === 'True',
      );

      if (truly.length === 0) {
        logger.warn(
          'There is no detail to save in DB because all details response are false',
          working.details,
        );
        working.details = [];
        return;
      }

      working.details = truly;
      const promises = working.details.map((detail) =>
        movieDbService.addDetail(detail),
      );

      await Promise.all(promises);
      logger.success(`Saved all details in DB`, working.details);
    };

    const loadPosters = async () => {
      if (working.details.length === 0) {
        logger.warn('There is no detail for which poster to be load from API');
        return;
      }

      logger.info(`Loading posters from API`, working.details);
      const truly = working.details.filter(
        (detail) => detail.Response === 'True' && detail.Poster !== 'N/A',
      );

      if (truly.length === 0) {
        logger.warn(
          'There is no success detail for which  poster be loaded',
          working.details,
        );
        working.posters = [];
        return;
      }

      const promises = truly.map((detail) => movieApiService.getPoster(detail));

      const results = await Promise.all(promises);
      working.posters = results;
      logger.success(`Loaded all posters from API`, working.posters);
    };

    const savePosters = async () => {
      if (working.posters.length === 0) {
        logger.info('There is no poster to be save in DB.');
        return;
      }

      logger.info(`Saving posters in DB`, working.posters);
      const promises = working.posters.map((poster) =>
        movieDbService.addPoster(poster),
      );
      await Promise.all(promises);
      logger.info(`Saved all posters in DB`, working.posters);
    };

    const workflow = [
      checkFiles,
      saveFiles,
      loadDetails,
      saveDetails,
      loadPosters,
      savePosters,
    ];

    const processWorkflow = async () => {
      setLoading(true);
      try {
        for (const task of workflow) {
          await task();
        }
      } catch (error) {
        setError('Error appear in processing of loading files');
        logger.error('Loader workflow', error);
      } finally {
        setMovieDetails(working.details);
        setLoading(false);
        logger.success('The movie loading workflow completed');
      }
    };

    processWorkflow();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xFiles]);

  const handleUpload = (files: XFile[]) => setXFiles(files);

  return (
    <Card className='w-full h-full'>
      <CardHeader>
        <CardTitle>Select Movies Folder</CardTitle>
        <CardDescription>
          Select the movies folder from your local machine to upload and process
          its contents.
        </CardDescription>
        <CardAction>
          <XFileInput text='Movies' onUpload={handleUpload} folder />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {movieDetails.map((movie) => (
            <MovieCard key={movie.imdbID} movieDetail={movie} />
          ))}
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
