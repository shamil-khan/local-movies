import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { format, parse } from 'numerable';
import { enIN } from 'numerable/locale';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { type MovieDetail } from '@/models/MovieModel';

interface MovieCardProps {
  movieDetail: MovieDetail;
}

const toCompact = (value: string) =>
  format(parse(value), '0.00 a', {
    locale: enIN,
  }).replace(/\.00$/, '');

export function MovieCard({ movieDetail }: MovieCardProps) {
  return (
    <Card className='flex flex-col h-full hover:shadow-lg transition-shadow duration-300'>
      <CardHeader className='mb-0'>
        <div className='flex justify-between items-start'>
          <Link to={`/movie/${movieDetail.imdbID}`} className='hover:underline'>
            <CardTitle className='text-lg line-clamp-1'>
              {movieDetail.Title}&nbsp;({movieDetail.Year})
            </CardTitle>
          </Link>
          <div className='items-center text-yellow-500 text-sm'>
            <Star className='w-4 h-4 fill-current' />
            <span className='ml-1 text-foreground'>
              <span className='font-bold'>{movieDetail.imdbRating}</span>(
              {toCompact(movieDetail.imdbVotes)})
            </span>
          </div>
        </div>
        <p>
          <Badge variant='outline'>{movieDetail.Language}</Badge>
          <Badge variant='outline'>{movieDetail.Rated}</Badge>
          <Badge variant='outline'>{movieDetail.Genre}</Badge>
          <Badge variant='outline'>{movieDetail.Runtime}</Badge>
        </p>
        <p>
          <Badge variant='outline'>{movieDetail.Awards}</Badge>
        </p>
      </CardHeader>
      <CardContent className='mt-0'>
        <Link to={`/movie/${movieDetail.imdbID}`}>
          <AspectRatio ratio={16 / 9} className='bg-muted rounded-lg'>
            <img
              src={movieDetail.Poster}
              alt={movieDetail.Title}
              className='h-full w-full rounded-lg object-cover hover:shadow-lg dark:brightness-[0.2] dark:grayscale"'
            />
          </AspectRatio>
        </Link>
      </CardContent>
      <CardFooter>
        <p className='text-sm text-muted-foreground line-clamp-2'>
          {movieDetail.Plot}
        </p>
      </CardFooter>
    </Card>
  );
}
