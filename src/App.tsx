import { useEffect } from 'react';
import { Toaster } from 'sonner';
import '@/App.css';

import { MovieGallery } from '@/components/MovieGallery';
import { LibraryHeader } from '@/components/library/LibraryHeader';

import { useMovieLibrary } from '@/hooks/library/useMovieLibrary';
import { useMovieFilters } from '@/hooks/library/useMovieFilters';

function App() {
  const {
    movies,
    userStatuses,
    categories,
    movieCategoryMap,
    loading,
    error,
    loadMovies,
    handleDeleteMovie,
    handleToggleFavorite,
    handleToggleWatched,
    handleClearLibrary,
    handleUpdateMovieCategories,
  } = useMovieLibrary();

  const {
    filterCriteria,
    setFilterCriteria,
    filteredMovies,
    availableGenres,
    availableYears,
    availableRated,
    availableRatings,
    availableLanguages,
    availableCountries,
    clearFilters,
  } = useMovieFilters({ movies, userStatuses, movieCategoryMap });

  const handleClearLibraryWithReset = async (deleteCategories: boolean) => {
    // resetState();
    await handleClearLibrary(deleteCategories);
  };

  // Initial load
  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const availableCategories = categories.map((c) => ({
    label: c.name,
    value: c.id!.toString(),
  }));

  return (
    <>
      <div className='p-1 w-full'>
        <LibraryHeader
          onMovieAdded={loadMovies}
          onReloadCategories={loadMovies}
          onClearLibrary={handleClearLibraryWithReset}
          filters={filterCriteria}
          onFilterChange={setFilterCriteria}
          clearFilters={clearFilters}
          availableGenres={availableGenres}
          availableYears={availableYears}
          availableRated={availableRated}
          availableRatings={availableRatings}
          availableLanguages={availableLanguages}
          availableCountries={availableCountries}
          availableCategories={availableCategories}
        />
      </div>

      <MovieGallery
        movies={filteredMovies}
        userStatuses={userStatuses}
        loading={loading}
        error={error}
        onDelete={handleDeleteMovie}
        onToggleFavorite={handleToggleFavorite}
        onToggleWatched={handleToggleWatched}
        movieCategoryMap={movieCategoryMap}
        onUpdateCategories={handleUpdateMovieCategories}
      />
      <Toaster />
    </>
  );
}

export default App;
