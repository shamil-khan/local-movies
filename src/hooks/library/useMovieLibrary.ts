import { useState, useCallback } from 'react';
import {
  type MovieDetail,
  type MovieUserStatus,
  type Category,
} from '@/models/MovieModel';
import { movieDbService } from '@/services/MovieDbService';
import { toast } from 'sonner';

export const useMovieLibrary = () => {
  const [movies, setMovies] = useState<MovieDetail[]>([]);
  const [userStatuses, setUserStatuses] = useState<
    Record<string, MovieUserStatus>
  >({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [movieCategoryMap, setMovieCategoryMap] = useState<
    Record<string, number[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      const [movieDetails, statuses, allCategories] = await Promise.all([
        movieDbService.allMovies(),
        movieDbService.allUserStatuses(),
        movieDbService.allCategories(),
      ]);
      setMovies(movieDetails);
      setCategories(allCategories);

      const statusMap: Record<string, MovieUserStatus> = {};
      statuses.forEach((status) => {
        statusMap[status.imdbID] = status;
      });
      setUserStatuses(statusMap);

      // Load category mappings for all movies
      const categoryMap: Record<string, number[]> = {};
      for (const movie of movieDetails) {
        const movieCategories = await movieDbService.getMovieCategories(
          movie.imdbID,
        );
        categoryMap[movie.imdbID] = movieCategories.map((c) => c.id!);
      }
      setMovieCategoryMap(categoryMap);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteMovie = useCallback(async (imdbID: string) => {
    try {
      await movieDbService.deleteMovie(imdbID);
      setMovies((prev) => prev.filter((m) => m.imdbID !== imdbID));
      toast.success('Movie deleted successfully');
    } catch (err) {
      console.error('Failed to delete movie:', err);
      toast.error('Failed to delete movie');
    }
  }, []);

  const handleToggleFavorite = useCallback(async (imdbID: string) => {
    setUserStatuses((prev) => {
      const currentStatus = prev[imdbID];
      const newFavoriteStatus = !currentStatus?.isFavorite;

      // Optimistic update
      const nextState = {
        ...prev,
        [imdbID]: {
          ...prev[imdbID],
          imdbID,
          isFavorite: newFavoriteStatus,
          isWatched: prev[imdbID]?.isWatched ?? false,
          updatedAt: new Date(),
        },
      };

      // Async update
      movieDbService
        .updateUserStatus(imdbID, { isFavorite: newFavoriteStatus })
        .then(() =>
          toast.success(
            newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
          ),
        )
        .catch((err) => {
          console.error('Failed to toggle favorite:', err);
          toast.error('Failed to update favorite status');
          // Revert or handle error - for simplicity we just log/toast here
          // In a perfect world we would revert the optimistic update
        });

      return nextState;
    });
  }, []);

  const handleToggleWatched = useCallback(async (imdbID: string) => {
    setUserStatuses((prev) => {
      const currentStatus = prev[imdbID];
      const newWatchedStatus = !currentStatus?.isWatched;

      // Optimistic update
      const nextState = {
        ...prev,
        [imdbID]: {
          ...prev[imdbID],
          imdbID,
          isFavorite: prev[imdbID]?.isFavorite ?? false,
          isWatched: newWatchedStatus,
          updatedAt: new Date(),
        },
      };

      // Async update
      movieDbService
        .updateUserStatus(imdbID, { isWatched: newWatchedStatus })
        .then(() =>
          toast.success(
            newWatchedStatus ? 'Marked as watched' : 'Marked as unwatched',
          ),
        )
        .catch((err) => {
          console.error('Failed to toggle watched status:', err);
          toast.error('Failed to update watched status');
        });

      return nextState;
    });
  }, []);

  const handleClearLibrary = useCallback(async (deleteCategories: boolean) => {
    try {
      await movieDbService.clearDatabase(deleteCategories);
      setMovies([]);
      setUserStatuses({});
      setMovieCategoryMap({});
      const allCategories = await movieDbService.allCategories();
      setCategories(allCategories);
      toast.success('Library deleted successfully');
      return true;
    } catch (err) {
      console.error('Failed to clear library:', err);
      toast.error('Failed to clear library');
      return false;
    }
  }, []);

  const handleUpdateMovieCategories = useCallback(
    async (imdbID: string, categoryIds: number[]) => {
      try {
        await movieDbService.linkMovieToCategories(imdbID, categoryIds);
        const allCategories = await movieDbService.allCategories();
        setCategories(allCategories);
        setMovieCategoryMap((prev) => ({
          ...prev,
          [imdbID]: categoryIds,
        }));
        toast.success('Categories updated');
      } catch (err) {
        console.error('Failed to update movie categories:', err);
        toast.error('Failed to update categories');
      }
    },
    [],
  );

  return {
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
  };
};
