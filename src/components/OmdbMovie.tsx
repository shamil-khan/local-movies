import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { movieService, type MovieDetail } from '@/services/MovieService';

export const MovieSearch = () => {
  const [query, setQuery] = useState<string>('Guardians of the Galaxy Vol. 2');
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMovie = async (title: string) => {
    setLoading(true);
    try {
      const response = await movieService.getMovieByTitle(title);
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
        <div>
          <h2>
            {movie.Title} ({movie.Year})
          </h2>
          <p>
            <strong>Director:</strong> {movie.Director}
          </p>
          <p>{movie.Plot}</p>
          <img src={movie.Poster} alt={movie.Title} />
          <p>IMDb Rating: {movie.imdbRating}</p>
        </div>
      ) : (
        movie?.Error && <p>Error: {movie.Error}</p>
      )}
    </Card>
  );
};
