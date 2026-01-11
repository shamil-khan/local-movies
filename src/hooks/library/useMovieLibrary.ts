import { useMovieLibraryStore } from '@/store/useMovieLibraryStore';

export const useMovieLibrary = () => {
  const {
    movies,
    userStatuses,
    categories,
    movieCategoryMap,
    loading,
    error,
    loadMovies,
    deleteMovie,
    toggleFavorite,
    toggleWatched,
    clearLibrary,
    updateMovieCategories,
  } = useMovieLibraryStore();

  return {
    movies,
    userStatuses,
    categories,
    movieCategoryMap,
    loading,
    error,
    loadMovies,
    handleDeleteMovie: deleteMovie,
    handleToggleFavorite: toggleFavorite,
    handleToggleWatched: toggleWatched,
    handleClearLibrary: clearLibrary,
    handleUpdateMovieCategories: updateMovieCategories,
  };
};
