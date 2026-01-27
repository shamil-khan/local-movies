import { useMovieLibraryStore } from '@/store/useMovieLibraryStore';

export const useMovieLibrary = () => {
  const {
    movies,
    categories,
    loadMovies,
    addMovie,
    removeMovie,
    addCategory,
    removeCategory,
    getCategory,
    updateCategory,
    addMovieToCategory,
    removeMovieFromCategory,
    toggleMovieFavorite,
    toggleMovieWatched,
    clearStore,
  } = useMovieLibraryStore();

  return {
    movies,
    categories,
    loadMovies,
    getCategory,
    handleAddMovie: addMovie,
    handleRemoveMovie: removeMovie,
    handleAddCategory: addCategory,
    handleRemoveCategory: removeCategory,
    handleUpdateCategory: updateCategory,
    handleAddMovieToCategory: addMovieToCategory,
    handleRemoveMovieFromCategory: removeMovieFromCategory,
    handleToggleMovieFavorite: toggleMovieFavorite,
    handleToggleMovieWatched: toggleMovieWatched,
    handleClearLibrary: clearStore,
  };
};
