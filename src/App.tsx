import '@/App.css';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { MovieGallery } from '@/components/MovieGallery';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CategoryDialog } from '@/components/CategoryDialog';
import { useMovieFilters } from '@/hooks/useMovieFilters';
import { pluralName } from '@/utils/Helper';

const APP_TITLE = import.meta.env.VITE_APP_TITLE;

function App() {
  const { movies, loadMovies } = useMovieLibrary();
  const { hasActiveFilters, filteredMovies } = useMovieFilters();

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  return (
    <ErrorBoundary>
      <div className='p-1 w-full'>
        <h3 className='text-2xl font-bold'>
          {APP_TITLE} Library has {movies.length} {pluralName(movies, 'movie')}
        </h3>
        {hasActiveFilters && (
          <h6 className='text-md text-muted-foreground font-medium'>
            Filtering result {filteredMovies.length}{' '}
            {pluralName(filteredMovies, 'movie')}
          </h6>
        )}

        <LibraryHeader />
      </div>
      {movies.length === 0 ? (
        <div className='flex h-64 items-center justify-center '>
          <div className='relative flex rounded-full'>
            <div className='animate-pulse text-3xl font-semibold'>
              There is no movie in Local Library.
            </div>
          </div>
        </div>
      ) : (
        <MovieGallery />
      )}
      <Toaster />
      <CategoryDialog />
    </ErrorBoundary>
  );
}

export default App;
