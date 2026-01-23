import '@/App.css';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import { LibraryHeader } from './components/library/LibraryHeader';
import { MovieGallery } from './components/MovieGallery';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  const { movies, loadMovies } = useMovieLibrary();

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  return (
    <ErrorBoundary>
      <div className='p-1 w-full'>
        <h3 className='text-2xl font-bold'>
          Movie Library has {movies.length} movies
        </h3>
        <LibraryHeader />
      </div>

      <MovieGallery />
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
