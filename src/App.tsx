import '@/App.css';
import { Toaster } from 'sonner';

import { useMovieLibrary } from '@/hooks/library/useMovieLibrary';
import { LibraryHeader } from './components/library/LibraryHeader';

function App() {
  const { movies } = useMovieLibrary();

  // const { filterCriteria, setFilterCriteria, filteredMovies, clearFilters } =
  //   useMovieFilters({ movies, userStatuses, movieCategoryMap });

  // // Initial load
  // useEffect(() => {
  //   loadMovies();
  // }, [loadMovies]);

  // const availableCategories = categories.map((c) => ({
  //   label: c.name,
  //   value: c.id!.toString(),
  // }));

  return (
    <>
      <div className='p-1 w-full'>
        <h3 className='text-2xl font-bold'>
          Movie Library has {movies.length} movies
        </h3>
        <LibraryHeader />
      </div>

      {/* <MovieGallery /> */}
      <Toaster />
    </>
  );
}

export default App;
