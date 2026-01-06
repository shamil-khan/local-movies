import { type MovieDetail } from '@/models/MovieModel';

export const XMovieCard = ({ movieDetail }: { movieDetail: MovieDetail }) => {
  return (
    <div className='w-full bg-muted outline-muted'>
      <img
        src={movieDetail.Poster}
        alt={movieDetail.Title}
        className='rounded-md object-contain h-full w-full aspect-square'
      />
    </div>
  );
};
