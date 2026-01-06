import { type MovieDetail } from '@/models/MovieModel';
import { Card, CardContent } from '@/components/ui/card';
import { format, parse } from 'numerable';
import { en } from 'numerable/locale';
import { Star, Award } from 'lucide-react';

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
          <div className='mx-auto w-32 h-48 mb-1'>
            <img
              src={movieDetail.Poster}
              alt={movieDetail.Title}
              className='w-full h-full object-cover rounded-md'
            />
          </div>
          <p className='text-xs font-normal'>{movieDetail.Plot}</p>
        </div>
      </CardContent>
    </Card>
  );
};
