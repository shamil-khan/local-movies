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

function App() {
  const { movies, loadMovies } = useMovieLibrary();
  const { filteredMovies } = useMovieFilters();

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  return (
    <ErrorBoundary>
      <div className='p-1 w-full'>
        <h3 className='text-2xl font-bold'>
          Movie Library has {movies.length} {pluralName(movies, 'movie')}
        </h3>
        {movies.length > filteredMovies.length && (
          <h6 className='text-md text-muted-foreground'>
            Filtered {filteredMovies.length}{' '}
            {pluralName(filteredMovies, 'movie')}
          </h6>
        )}

        <LibraryHeader />
      </div>

      <MovieGallery />
      <Toaster />
      <CategoryDialog />
    </ErrorBoundary>
  );
}

export default App;
