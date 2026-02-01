import '@/App.css';
import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import { useMovieFilters } from '@/hooks/useMovieFilters';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { MovieGallery } from '@/components/MovieGallery';
import { CategoryDialog } from '@/components/CategoryDialog';
import { pluralName } from '@/utils/Helper';

const APP_TITLE = import.meta.env.VITE_APP_TITLE;

function App() {
  const { movies, loadMovies } = useMovieLibrary();
  const { hasActiveFilters, filteredMovies } = useMovieFilters();
  const appRef = useRef(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (appRef.current) {
      return;
    }

    const loadingId = setTimeout(() => {
      appRef.current = true;
      const loadAll = async () => {
        await loadMovies();
        setLoaded(true);
      };
      void loadAll();
    }, 500);

    return () => clearTimeout(loadingId);
  }, [loadMovies]);

  if (!loaded) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spinner className='h-10 w-10 text-blue-600' />
        <span className='font-bold'>Loading {APP_TITLE} Library </span>
      </div>
    );
  }

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

      <CategoryDialog />
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
