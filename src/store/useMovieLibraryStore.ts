import { create } from 'zustand';
import {
  type MovieDetail,
  type MovieUserStatus,
  type Category,
} from '@/models/MovieModel';
import { movieDbService } from '@/services/MovieDbService';
import { toast } from 'sonner';

interface MovieLibraryState {
  movies: MovieDetail[];
  userStatuses: Record<string, MovieUserStatus>;
  categories: Category[];
  movieCategoryMap: Record<string, number[]>;
  loading: boolean;
  error: Error | null;
  loadMovies: () => Promise<void>;
  deleteMovie: (imdbID: string) => Promise<void>;
  toggleFavorite: (imdbID: string) => Promise<void>;
  toggleWatched: (imdbID: string) => Promise<void>;
  clearLibrary: (deleteCategories: boolean) => Promise<boolean>;
  updateMovieCategories: (
    imdbID: string,
    categoryIds: number[],
  ) => Promise<void>;
}

export const useMovieLibraryStore = create<MovieLibraryState>((set, get) => ({
  movies: [],
  userStatuses: {},
  categories: [],
  movieCategoryMap: {},
  loading: true,
  error: null,

  loadMovies: async () => {
    try {
      set({ loading: true, error: null });
      const [movieDetails, statuses, allCategories] = await Promise.all([
        movieDbService.allMovies(),
        movieDbService.allUserStatuses(),
        movieDbService.allCategories(),
      ]);

      const statusMap: Record<string, MovieUserStatus> = {};
      statuses.forEach((status) => {
        statusMap[status.imdbID] = status;
      });

      const categoryMap: Record<string, number[]> = {};
      for (const movie of movieDetails) {
        const movieCategories = await movieDbService.getMovieCategories(
          movie.imdbID,
        );
        categoryMap[movie.imdbID] = movieCategories.map((c) => c.id!);
      }

      set({
        movies: movieDetails,
        categories: allCategories,
        userStatuses: statusMap,
        movieCategoryMap: categoryMap,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({ error: err as Error, loading: false });
    }
  },

  deleteMovie: async (imdbID: string) => {
    try {
      await movieDbService.deleteMovie(imdbID);
      set((state) => ({
        movies: state.movies.filter((m) => m.imdbID !== imdbID),
      }));
      toast.success('Movie deleted successfully');
    } catch (err) {
      toast.error('Failed to delete movie');
      // eslint-disable-next-line no-console
      console.error('Failed to delete movie:', err);
    }
  },

  toggleFavorite: async (imdbID: string) => {
    const { userStatuses } = get();
    const currentStatus = userStatuses[imdbID];
    const newFavoriteStatus = !currentStatus?.isFavorite;

    const nextState: Record<string, MovieUserStatus> = {
      ...userStatuses,
      [imdbID]: {
        ...currentStatus,
        imdbID,
        isFavorite: newFavoriteStatus,
        isWatched: currentStatus?.isWatched ?? false,
        updatedAt: new Date(),
      },
    };

    set({ userStatuses: nextState });

    try {
      await movieDbService.updateUserStatus(imdbID, {
        isFavorite: newFavoriteStatus,
      });
      toast.success(
        newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle favorite:', err);
      toast.error('Failed to update favorite status');
    }
  },

  toggleWatched: async (imdbID: string) => {
    const { userStatuses } = get();
    const currentStatus = userStatuses[imdbID];
    const newWatchedStatus = !currentStatus?.isWatched;

    const nextState: Record<string, MovieUserStatus> = {
      ...userStatuses,
      [imdbID]: {
        ...currentStatus,
        imdbID,
        isFavorite: currentStatus?.isFavorite ?? false,
        isWatched: newWatchedStatus,
        updatedAt: new Date(),
      },
    };

    set({ userStatuses: nextState });

    try {
      await movieDbService.updateUserStatus(imdbID, {
        isWatched: newWatchedStatus,
      });
      toast.success(
        newWatchedStatus ? 'Marked as watched' : 'Marked as unwatched',
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle watched status:', err);
      toast.error('Failed to update watched status');
    }
  },

  clearLibrary: async (deleteCategories: boolean) => {
    try {
      await movieDbService.clearDatabase(deleteCategories);
      const allCategories = await movieDbService.allCategories();
      set({
        movies: [],
        userStatuses: {},
        movieCategoryMap: {},
        categories: allCategories,
      });
      toast.success('Library deleted successfully');
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear library:', err);
      toast.error('Failed to clear library');
      return false;
    }
  },

  updateMovieCategories: async (imdbID: string, categoryIds: number[]) => {
    try {
      await movieDbService.linkMovieToCategories(imdbID, categoryIds);
      const allCategories = await movieDbService.allCategories();
      set((state) => ({
        categories: allCategories,
        movieCategoryMap: {
          ...state.movieCategoryMap,
          [imdbID]: categoryIds,
        },
      }));
      toast.success('Categories updated');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update movie categories:', err);
      toast.error('Failed to update categories');
    }
  },
}));
