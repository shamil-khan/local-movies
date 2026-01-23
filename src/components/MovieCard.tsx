import { type MovieInfo } from '@/models/MovieModel';
import { Card, CardContent } from '@/components/ui/card';
import { format, parse } from 'numerable';
import { en } from 'numerable/locale';
import { Star, Award, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { movieDbService } from '@/services/MovieDbService';
import { MovieCardBottomBar } from '@/components/MovieCardBottomBar';
import { TrailerDialog } from '@/components/TrailerDialog';
import { CategoryDialog } from '@/components/CategoryDialog';
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

interface MovieCardProps {
  movie: MovieInfo;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const [trailerDialogOpen, setTrailerDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [posterSrc, setPosterSrc] = useState<string>(
    '/generic-movie-poster.svg',
  );

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPoster = async () => {
      logger.info(`Loading poster for ${movie.title} from DB`);
      try {
        const poster = await movieDbService.getPoster(movie.imdbID);
        if (poster && poster.blob) {
          objectUrl = URL.createObjectURL(poster.blob);
          setPosterSrc(objectUrl);
          logger.success(`Loaded poster for ${movie.title} from DB`);
        } else {
          // If not in DB, use a generic movie poster image
          logger.warn(`Failed to load poster for ${movie.title} from DB`);
          setPosterSrc('/generic-movie-poster.svg');
        }
      } catch (e) {
        logger.error(`Failed to load poster for ${movie.title}`, e);
        setPosterSrc('/generic-movie-poster.svg');
      }
    };

    loadPoster();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [movie.imdbID, movie.poster, movie.title]);

  return (
    <Card className='w-full overflow-visible group'>
      <CardContent className='py-0 px-2 h-full'>
        <div className='text-center relative h-full flex flex-col'>
          <h3 className='text-sm font-bold mb-1'>{movie.title}</h3>
          <p className='text-xs font-semibold mb-1'>{movie.detail.year}</p>
          <div className='text-center mb-1'>
            <div className='flex items-center justify-center mb-1'>
              <span className='text-xs font-bold italic'>
                {movie.detail.rated}
              </span>
              <div className='flex items-center justify-center space-x-2 ml-4'>
                <span className='flex items-center'>
                  <Star className='w-3 h-3 fill-current' />
                  <span className='text-xs font-semibold ml-0'>
                    {movie.detail.imdbRating}
                  </span>
                </span>
                <span className='flex items-center'>
                  <Award className='w-3 h-3' />
                  <span className='text-xs font-semibold ml-0'>
                    {movie.detail.metascore}
                  </span>
                </span>
              </div>
            </div>
            <p className='text-[0.6rem] font-medium'>
              {toCompact(movie.detail.imdbVotes)}
            </p>
          </div>
          <p className='text-xs font-medium mb-1'>{movie.detail.genre}</p>
          <p className='text-xs font-normal mb-1'>
            {movie.detail.language}{' '}
            <span className='font-bold ml-1'>
              {formatRuntime(movie.detail.runtime)}
            </span>
          </p>
          <p className='text-xs font-light mb-1'>{movie.detail.country}</p>
          <p className='text-xs font-bold mb-1'>{movie.detail.awards}</p>

          <div
            className='relative mx-auto w-32 h-48 mb-1 cursor-pointer group/image'
            onClick={() => setTrailerDialogOpen(true)}>
            <img
              src={posterSrc}
              alt={movie.title}
              className='w-full h-full object-cover rounded-md transition-opacity group-hover/image:opacity-75'
            />
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity'>
              <div className='bg-black/60 rounded-full p-3'>
                <Play className='w-8 h-8 text-white fill-white' />
              </div>
            </div>
          </div>

          <p className='text-xs font-normal'>{movie.detail.plot}</p>
          <MovieCardBottomBar
            movie={movie}
            onCategoryOpen={() => setCategoryDialogOpen(true)}
          />

          <TrailerDialog
            open={trailerDialogOpen}
            onClose={() => setTrailerDialogOpen(false)}
            movie={movie}
          />

          <CategoryDialog
            open={categoryDialogOpen}
            onClose={() => setCategoryDialogOpen(false)}
            movie={movie}
          />
        </div>
      </CardContent>
    </Card>
  );
};
