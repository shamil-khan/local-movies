import { MovieCard } from '@/components/MovieCard';
import { useMovieFilters } from '@/hooks/useMovieFilters';

export const MovieGallery = () => {
  const { filteredMovies } = useMovieFilters();

  return (
    <div className='relative'>
      {filteredMovies.length > 0 ? (
        <div className='grid grid-flow-row-dense grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>
      ) : (
        <div className='flex h-64 items-center justify-center '>
          <div className='relative flex rounded-full'>
            <div className='animate-pulse text-3xl font-semibold'>
              Filtered returns no movie.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
