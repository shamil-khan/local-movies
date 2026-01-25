import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, AlertCircle } from 'lucide-react';
import { ImdbLink } from '@/components/ImdbLink';
import { type MovieInfo } from '@/models/MovieModel';
import { tmdbApiService, type MovieTrailer } from '@/services/TmdbApiService';
import logger from '@/core/logger';

interface TrailerDialogProps {
  movie: MovieInfo;
  open: boolean;
  onClose: () => void;
}

export const TrailerDialog = ({ movie, open, onClose }: TrailerDialogProps) => {
  const [trailer, setTrailer] = useState<MovieTrailer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || trailer || loading) {
      return;
    }

    const loadTrailer = async () => {
      setLoading(true);
      setError(null);

      try {
        logger.info(`Fetching trailer for IMDb ID: ${movie.imdbID}`);
        const trailerData = await tmdbApiService.getTrailerByImdbId(
          movie.imdbID,
        );

        if (trailerData) {
          setTrailer(trailerData);
          logger.success(`Trailer found: ${trailerData.name}`);
        } else {
          setError('No trailer available for this movie');
          logger.warn(`No trailer found for: ${movie.title}`);
        }
      } catch (err) {
        setError('Failed to load trailer');
        logger.error('Error fetching trailer:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadTrailer();
  }, [open, trailer, loading, movie.imdbID, movie.title]);

  const handleOpenChange = () => {
    setTrailer(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* No Trigger - Controlled by state */}
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>
            {movie.title} ({movie.detail.year})
          </DialogTitle>
          <DialogDescription>
            {trailer
              ? trailer.name
              : 'Loading official trailer from YouTube...'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          {loading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
              <span className='ml-3 text-sm text-muted-foreground'>
                Fetching trailer...
              </span>
            </div>
          )}

          {error && !loading && (
            <div className='flex flex-col items-center justify-center py-12 gap-4'>
              <AlertCircle className='w-12 h-12 text-destructive' />
              <p className='text-sm text-muted-foreground'>{error}</p>
              <p className='text-xs text-muted-foreground'>
                IMDb ID: {movie.imdbID}
              </p>
            </div>
          )}

          {trailer && !loading && (
            <div className='flex flex-col gap-4'>
              <div className='relative w-full' style={{ paddingTop: '56.25%' }}>
                <iframe
                  className='absolute top-0 left-0 w-full h-full rounded-lg'
                  src={`https://www.youtube.com/embed/${trailer.youtubeKey}`}
                  title={trailer.name}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
              </div>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>IMDb ID: {movie.imdbID}</span>
                <ImdbLink imdbID={movie.imdbID} title={movie.title} size='lg' />
                {trailer.official && (
                  <span className='text-green-600 font-semibold'>
                    Official Trailer
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
