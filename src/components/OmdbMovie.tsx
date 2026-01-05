import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type MovieDetail } from '@/models/MovieModel';
import { movieApiService } from '@/services/MovieApiService';
import { logger } from '@/core/logger';
import { MovieCard } from '@/components/MovieCard';

export const MovieSearch = () => {
  const [query, setQuery] = useState<string>('Guardians of the Galaxy Vol. 2');
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMovie = async (title: string) => {
    setLoading(true);
    try {
      const response = await movieApiService.getMovieByTitle(title);
      logger.info(response.data);
      setMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md p-4'>
      <Input
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Enter movie title'
      />
      <Button onClick={() => fetchMovie(query)}>Search</Button>
      {loading && <p>Loading...</p>}
      {movie?.Response === 'True' ? (
        <MovieCard key={movie.imdbID} movieDetail={movie} />
      ) : (
        movie?.Error && <p>Error: {movie.Error}</p>
      )}
    </Card>
  );
};
