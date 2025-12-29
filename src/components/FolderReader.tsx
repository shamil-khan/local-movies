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
import { type MovieFile } from '@/types/MovieFile';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { movieService } from '@/services/MovieService';
import { logger } from '@/core/logger';
import type { MovieDetail } from '@/types/MovieDetail';
import { MovieCard } from '@/components/MovieCard';

export const FolderReader = () => {
  const [files, setFiles] = useState<XFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [movieFiles, setMovieFiles] = useState<MovieFile[]>([]);
  const [movieDetails, setMovieDetails] = useState<MovieDetail[]>([]);

  useEffect(() => {
    logger.info(`Files state updated: ${files.length}`);
    if (files.length === 0) return;

    const movieFiles: MovieFile[] = toMovieFiles(files.map((f) => f.name));

    const loadMovies = async () => {
      try {
        setLoading(true);
        // Map over the IDs to create an array of promises
        const promises = movieFiles.map((movie) =>
          movieService.getMovieByTitle(movie.title),
        );
        const results = await Promise.all(promises);
        const movieDetails = results.map((response) => response.data);

        setMovieDetails(movieDetails);
      } catch (error) {
        setError('Error loading movies');
        logger.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    };

    setMovieFiles(movieFiles);
    loadMovies();
  }, [files]);

  const handleUpload = (files: XFile[]) => setFiles(files);

  return (
    <Card className='w-full h-full'>
      <CardHeader>
        <CardTitle>Select Movies Folder</CardTitle>
        <CardDescription>
          Select the movies folder from your local machine to upload and process
          its contents.
        </CardDescription>
        <CardAction>
          <XFileInput text='Movies' onUpload={handleUpload} multiple />
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
