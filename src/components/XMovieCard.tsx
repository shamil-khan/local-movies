import { type MovieDetail } from '@/models/MovieModel';

export const XMovieCard = ({ movieDetail }: { movieDetail: MovieDetail }) => {
  return (
    <div>
      <img src={movieDetail.Poster} alt={movieDetail.Title} />
    </div>
  );
};
