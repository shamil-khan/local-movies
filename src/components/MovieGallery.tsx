import { useState, useEffect } from 'react';
import { movieDbService } from '@/services/MovieDbService';
import { type MovieDetail } from '@/models/MovieModel';
import { XMovieCard } from '@/components/XMovieCard';

export const MovieGallery = () => {
  const [movies, setMovies] = useState<MovieDetail[]>([]);

  useEffect(() => {
    const loadMovies = async () => {
      const movieDetails = await movieDbService.allMovies();
      setMovies(movieDetails);
    };
    loadMovies();
  }, []);

  return (
    <div className='grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {movies.map((movie) => (
        <XMovieCard key={movie.imdbID} movieDetail={movie} />
      ))}
    </div>
  );
};
