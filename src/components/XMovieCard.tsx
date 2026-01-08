import { type MovieDetail } from '@/models/MovieModel';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, parse } from 'numerable';
import { en } from 'numerable/locale';
import { Star, Award, Play, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tmdbApiService, type MovieTrailer } from '@/services/TmdbApiService';
import logger from '@/core/logger';

const toCompact = (value: string) =>
  format(parse(value), '0.00 a', { locale: en }).replace(/\.00$/, '');

const formatRuntime = (runtime: string) => {
  const match = runtime.match(/(\d+) min/);
  if (match) {
    const min = parseInt(match[1]);
    const hours = Math.floor(min / 60);
    const mins = min % 60;
    return `${hours}h ${mins}m`;
  }
  return runtime;
};

export const XMovieCard = ({ movieDetail }: { movieDetail: MovieDetail }) => {
  const [open, setOpen] = useState(false);
  const [trailer, setTrailer] = useState<MovieTrailer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trailer when dialog opens
  useEffect(() => {
    if (open && !trailer && !loading) {
      fetchTrailer();
    }
  }, [open]);

  const fetchTrailer = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info(`Fetching trailer for IMDb ID: ${movieDetail.imdbID}`);
      const trailerData = await tmdbApiService.getTrailerByImdbId(
        movieDetail.imdbID,
      );

      if (trailerData) {
        setTrailer(trailerData);
        logger.success(`Trailer found: ${trailerData.name}`);
      } else {
        setError('No trailer available for this movie');
        logger.warn(`No trailer found for: ${movieDetail.Title}`);
      }
    } catch (err) {
      setError('Failed to load trailer');
      logger.error('Error fetching trailer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset state when dialog closes
    if (!newOpen) {
      setTrailer(null);
      setError(null);
    }
  };

  return (
    <Card className='w-full'>
      <CardContent className='py-0 px-2'>
        <div className='text-center'>
          <h3 className='text-sm font-bold mb-1'>{movieDetail.Title}</h3>
          <p className='text-xs font-semibold mb-1'>{movieDetail.Year}</p>
          <div className='text-center mb-1'>
            <div className='flex items-center justify-center mb-1'>
              <span className='text-xs font-bold italic'>
                {movieDetail.Rated}
              </span>
              <div className='flex items-center justify-center space-x-2 ml-4'>
                <span className='flex items-center'>
                  <Star className='w-3 h-3 fill-current' />
                  <span className='text-xs font-semibold ml-0'>
                    {movieDetail.imdbRating}
                  </span>
                </span>
                <span className='flex items-center'>
                  <Award className='w-3 h-3' />
                  <span className='text-xs font-semibold ml-0'>
                    {movieDetail.Metascore}
                  </span>
                </span>
              </div>
            </div>
            <p className='text-[0.6rem] font-medium'>
              {toCompact(movieDetail.imdbVotes)}
            </p>
          </div>
          <p className='text-xs font-medium mb-1'>{movieDetail.Genre}</p>
          <p className='text-xs font-normal mb-1'>
            {movieDetail.Language}{' '}
            <span className='font-bold ml-1'>
              {formatRuntime(movieDetail.Runtime)}
            </span>
          </p>
          <p className='text-xs font-light mb-1'>{movieDetail.Country}</p>
          <p className='text-xs font-bold mb-1'>{movieDetail.Awards}</p>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <div className='relative mx-auto w-32 h-48 mb-1 cursor-pointer group'>
                <img
                  src={movieDetail.Poster}
                  alt={movieDetail.Title}
                  className='w-full h-full object-cover rounded-md transition-opacity group-hover:opacity-75'
                />
                <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                  <div className='bg-black/60 rounded-full p-3'>
                    <Play className='w-8 h-8 text-white fill-white' />
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[700px]'>
              <DialogHeader>
                <DialogTitle>
                  {movieDetail.Title} ({movieDetail.Year})
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
                      IMDb ID: {movieDetail.imdbID}
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
                      <span>IMDb ID: {movieDetail.imdbID}</span>
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

          <p className='text-xs font-normal'>{movieDetail.Plot}</p>
        </div>
      </CardContent>
    </Card>
  );
};
