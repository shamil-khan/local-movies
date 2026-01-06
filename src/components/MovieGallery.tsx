import { type MovieDetail } from '@/models/MovieModel';
import { XMovieCard } from '@/components/XMovieCard';
import { Loader2 } from 'lucide-react';

interface MovieGalleryProps {
  movies: MovieDetail[];
  loading: boolean;
  error: Error | null;
}

export const MovieGallery = ({ movies, loading, error }: MovieGalleryProps) => {
  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-red-500'>Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className='relative'>
      {loading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm'>
          <Loader2 className='h-12 w-12 animate-spin' />
        </div>
      )}

      {movies.length > 0 ? (
        <div className='grid grid-flow-row-dense grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {movies.map((movie) => (
            <XMovieCard key={movie.imdbID} movieDetail={movie} />
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
