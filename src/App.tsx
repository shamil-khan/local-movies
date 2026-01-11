import { useEffect } from 'react';
import { Toaster } from 'sonner';
import '@/App.css';

import { MovieGallery } from '@/components/MovieGallery';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { type XFile } from '@/components/mine/xfileinput';

import { useMovieLibrary } from '@/hooks/library/useMovieLibrary';
import { useMovieFilters } from '@/hooks/library/useMovieFilters';
import { useFileProcessor } from '@/hooks/library/useFileProcessor';

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

  const {
    selectedFiles,
    setSelectedFiles,
    extractedTitles,
    successTitles,
    failedTitles,
    folderLoading,
    folderError,
    handleProcessTitles,
    handleRemoveFile,
    handleRemoveTitle,
    handleRemoveSuccessTitle,
    handleRemoveFailedTitle,
    resetState,
  } = useFileProcessor({ movies, onMoviesUpdated: loadMovies });

  const handleFolderUpload = (files: XFile[]) => {
    resetState();
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleClearLibraryWithReset = async (deleteCategories: boolean) => {
    resetState();
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
      <div className='p-6 w-full'>
        <LibraryHeader
          onMovieAdded={loadMovies}
          onFolderUpload={handleFolderUpload}
          folderLoading={folderLoading}
          folderError={folderError}
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
          selectedFiles={selectedFiles}
          extractedTitles={extractedTitles}
          successTitles={successTitles}
          failedTitles={failedTitles}
          onRemoveFile={handleRemoveFile}
          onRemoveTitle={handleRemoveTitle}
          onRemoveSuccessTitle={handleRemoveSuccessTitle}
          onRemoveFailedTitle={handleRemoveFailedTitle}
          onProcessTitles={handleProcessTitles}
          onClearProcessing={resetState}
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
        categories={categories}
        movieCategoryMap={movieCategoryMap}
        onUpdateCategories={handleUpdateMovieCategories}
      />
      <Toaster />
    </>
  );
}

export default App;
