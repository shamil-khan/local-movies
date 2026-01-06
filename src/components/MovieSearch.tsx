import { useState } from 'react';
import { movieDbService } from '@/services/MovieDbService';
import { movieApiService } from '@/services/MovieApiService';
import { type MovieDetail } from '@/models/MovieModel';
import { XMovieCard } from '@/components/XMovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { logger } from '@/core/logger';

interface MovieSearchProps {
  onMovieAdded: () => void;
}

export const MovieSearch = ({ onMovieAdded }: MovieSearchProps) => {
  const [title, setTitle] = useState('');
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSearch = async () => {
    logger.info(`Searching for movie: ${title}`);
    try {
      setLoading(true);
      setError(null);
      setMovie(null);

      logger.info('Checking local database...');
      let movieDetail: MovieDetail | null =
        (await movieDbService.findByTitle(title)) || null;

      if (movieDetail) {
        logger.success('Movie found in local database.');
      } else {
        logger.warn('Movie not found in local database. Fetching from API...');
        const movieFromApi = await movieApiService.getMovieByTitle(title);

        if (movieFromApi.data && movieFromApi.data.Response === 'True') {
          logger.success('Movie found in API.');
          const poster = await movieApiService.getPoster(movieFromApi.data);
          logger.info('Downloading poster...');
          await movieDbService.addMovie(movieFromApi.data, poster);
          logger.success('Movie and poster added to local database.');
          movieDetail = movieFromApi.data;
          onMovieAdded();
        } else {
          logger.error('Movie not found in API.');
          movieDetail = null;
        }
      }

      setMovie(movieDetail);
    } catch (err) {
      logger.error('An error occurred during the search:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
      logger.info('Search complete.');
    }
  };

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full max-w-sm items-center space-x-2'>
        <Input
          type='text'
          placeholder='Movie Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      <div>
        {loading && (
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='animate-spin h-12 w-12' />
          </div>
        )}
        {error && <div className='text-red-500'>Error: {error.message}</div>}
        {movie && <XMovieCard movieDetail={movie} />}
        {!loading && !movie && <div>No movie found.</div>}
      </div>
    </div>
  );
};
