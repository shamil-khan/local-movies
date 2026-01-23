import { MovieCard } from '@/components/MovieCard';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMovieFilters } from '@/hooks/useMovieFilters';

export const MovieGallery = () => {
  const [loading, setLoading] = useState(false);
  const { filteredMovies } = useMovieFilters();

  return (
    <div className='relative'>
      {loading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm'>
          <Loader2 className='h-12 w-12 animate-spin' />
        </div>
      )}

      {filteredMovies.length > 0 ? (
        <div className='grid grid-flow-row-dense grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>
      ) : (
        <div className='flex h-64 items-center justify-center'>
          <div>No Movie found</div>
        </div>
      )}
    </div>
  );
};
