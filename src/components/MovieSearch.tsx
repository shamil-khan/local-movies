import { useState } from 'react';
import { movieDbService } from '@/services/MovieDbService';
import { movieApiService } from '@/services/MovieApiService';
import { type MovieDetail } from '@/models/MovieModel';
import { XMovieCard } from '@/components/XMovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { logger } from '@/core/logger';
import { toast } from 'sonner';
import { type XFile } from '@/components/mine/xfileinput';
import { CompactFolderUpload } from '@/components/CompactFolderUpload';

interface MovieSearchProps {
  onMovieAdded: () => void;
  onFolderUpload?: (files: XFile[]) => void;
  onLoad?: () => void;
  selectedFiles?: XFile[];
  folderLoading?: boolean;
  folderError?: string | null;
}

export const MovieSearch = ({
  onMovieAdded,
  onFolderUpload,
  onLoad,
  selectedFiles = [],
  folderLoading = false,
  folderError,
}: MovieSearchProps) => {
  const [title, setTitle] = useState('');
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    logger.info(`Searching for movie: ${title}`);
    try {
      setLoading(true);
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
          toast.info('No movie found.');
          movieDetail = null;
        }
      }

      setMovie(movieDetail);
    } catch (err) {
      logger.error('An error occurred during the search:', err);
      toast.error(
        'An error occurred during the search: ' + (err as Error).message,
      );
    } finally {
      setLoading(false);
      logger.info('Search complete.');
    }
  };

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full items-center'>
        {onFolderUpload && (
          <CompactFolderUpload
            onUpload={onFolderUpload}
            onLoad={onLoad}
            selectedFiles={selectedFiles}
            loading={folderLoading}
            error={folderError}
          />
        )}
        <Input
          type='text'
          placeholder='Movie Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='flex-1 rounded-none border-l-0 border-r-0'
        />
        <Button onClick={handleSearch} className='rounded-l-none'>
          Search
        </Button>
      </div>
      <div>
        {loading && (
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='animate-spin h-12 w-12' />
          </div>
        )}
        {movie && <XMovieCard movieDetail={movie} />}
      </div>
    </div>
  );
};
