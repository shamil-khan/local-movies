import logger from '@/core/logger';
import {
  type Category,
  type MovieInfo,
  type MovieUserStatus,
} from '@/models/MovieModel';
import { movieDbService } from '@/services/MovieDbService';
import { toast } from 'sonner';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface MovieLibraryState {
  movies: MovieInfo[];
  categories: Category[];
  loadMovies: () => Promise<void>;
  addMovie: (movie: MovieInfo) => Promise<void>;
  removeMovie: (imdbID: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  removeCategory: (categoryId: number) => Promise<void>;
  updateCategory: (categoryId: number, name: string) => Promise<void>;
  addMovieToCategory: (imdbID: string, category: Category) => Promise<void>;
  removeMovieFromCategory: (
    imdbID: string,
    category: Category,
  ) => Promise<void>;
  toggleMovieFavorite: (imdbID: string) => Promise<void>;
  toggleMovieWatched: (imdbID: string) => Promise<void>;
  clearStore: (deleteCategories: boolean) => Promise<boolean>;
}

export const useMovieLibraryStore = create<MovieLibraryState>()(
  immer((set, get) => {
    const toggleUserStatus = async (
      imdbID: string,
      isFavorite = false,
      isWatched = false,
    ): Promise<Omit<MovieUserStatus, 'imdbID'>> => {
      const movie = get().movies.find((m) => m.imdbID === imdbID)!;

      const status = movie.status
        ? {
          isFavorite: movie.status.isFavorite,
          isWatched: movie.status.isWatched,
        }
        : { isFavorite: false, isWatched: false };

      status.isFavorite = isFavorite ? !status.isFavorite : status.isFavorite;
      status.isWatched = isWatched ? !status.isWatched : status.isWatched;

      set((state) => {
        state.movies = state.movies.map((m) =>
          m.imdbID !== imdbID ? m : { ...m, status: status },
        );
      });

      await movieDbService.addUpdateUserStatus(imdbID, status);
      return status!;
    };

    return {
      movies: [],
      categories: [],

      loadMovies: async () => {
        try {
          const [details, posters, statuses, categories, movieCategories] =
            await Promise.all([
              movieDbService.allMovieDetails(),
              movieDbService.allMoviePosters(),
              movieDbService.allMovieUserStatuses(),
              movieDbService.allCategories(),
              movieDbService.allMovieCategories(),
            ]);

          const movies: MovieInfo[] = details.map((detail) => ({
            imdbID: detail.imdbID,
            title: detail.title,
            detail: detail,
            poster: posters.find((p) => p.imdbID === detail.imdbID),
            status: statuses.find((s) => s.imdbID === detail.imdbID),
            categories: categories.filter((c) =>
              movieCategories.some(
                (mc) => mc.categoryId === c.id && mc.imdbID === detail.imdbID,
              ),
            ),
          }));

          set({
            movies: movies,
            categories: categories,
          });
        } catch (err) {
          logger.error('Failed to load movies:', err);
          set({ movies: [], categories: [] });
        }
      },

      addMovie: async (movie: MovieInfo) => {
        try {
          await movieDbService.addMovie(movie);
          set((state) => {
            state.movies.push(movie);
          });
          toast.success('Movie added successfully');
        } catch (err) {
          toast.error('Failed to add movie');
          logger.error('Failed to add movie:', err);
        }
      },

      removeMovie: async (imdbID: string) => {
        try {
          await movieDbService.deleteMovie(imdbID);
          set((state) => {
            state.movies = state.movies.filter((m) => m.imdbID !== imdbID);
          });
          toast.success('Movie deleted successfully');
        } catch (err) {
          toast.error('Failed to delete movie');
          logger.error('Failed to delete movie:', err);
        }
      },

      addCategory: async (name: string) => {
        try {
          if (!get().categories.some((c) => c.name === name)) {
            toast.warning('Category already exists');
          }
          const categoryId = await movieDbService.addCategory(name);
          if (categoryId) {
            const category: Category = { id: categoryId, name };
            set((state) => {
              state.categories.push(category);
            });
            toast.success('Category added successfully');
          }
        } catch (err) {
          toast.error('Failed to add category');
          logger.error('Failed to add category:', err);
        }
      },

      removeCategory: async (categoryId: number) => {
        try {
          if (!get().categories.some((c) => c.id === categoryId)) {
            toast.warning('Category does not exist');
          }

          await movieDbService.deleteCategory(categoryId);
          set((state) => {
            state.categories = state.categories.filter(
              (category) => category.id !== categoryId,
            );
          });
          toast.success('Category deleted successfully');
        } catch (err) {
          toast.error('Failed to delete category');
          logger.error('Failed to delete category:', err);
        }
      },

      updateCategory: async (categoryId: number, name: string) => {
        try {
          if (!get().categories.some((c) => c.id === categoryId)) {
            toast.warning('Category does not exist');
          }

          await movieDbService.updateCategory(categoryId, name);
          set((state) => {
            state.categories = state.categories.map((category) =>
              category.id === categoryId ? { ...category, name } : category,
            );
          });
          toast.success('Category updated successfully');
        } catch (err) {
          toast.error('Failed to update category');
          logger.error('Failed to update category:', err);
        }
      },

      addMovieToCategory: async (imdbID: string, category: Category) => {
        try {
          await movieDbService.addMovieToCategory(imdbID, category.id);
          set((state) => {
            state.movies = state.movies.map((movie) =>
              movie.imdbID === imdbID
                ? {
                  ...movie,
                  categories: [...(movie.categories || []), category],
                }
                : movie,
            );
          });
          toast.success('Category added successfully');
        } catch (err) {
          toast.error('Failed to add category');
          logger.error('Failed to add category:', err);
        }
      },

      removeMovieFromCategory: async (imdbID: string, category: Category) => {
        try {
          await movieDbService.removeMovieFromCategory(imdbID, category.id);
          set((state) => {
            state.movies = state.movies.map((movie) =>
              movie.imdbID === imdbID
                ? {
                  ...movie,
                  categories: movie.categories?.filter(
                    (c) => c.id !== category.id,
                  ),
                }
                : movie,
            );
          });
          toast.success('Category removed successfully');
        } catch (err) {
          toast.error('Failed to remove category');
          logger.error('Failed to remove category:', err);
        }
      },

      toggleMovieFavorite: async (imdbID: string) => {
        try {
          const status = await toggleUserStatus(imdbID, true, false);
          toast.success(
            status.isFavorite ? 'Added to favorites' : 'Removed from favorites',
          );
        } catch (err) {
          logger.error('Failed to toggle favorite:', err);
          toast.error('Failed to update favorite status');
        }
      },

      toggleMovieWatched: async (imdbID: string) => {
        try {
          const status = await toggleUserStatus(imdbID, false, true);
          toast.success(
            status.isWatched ? 'Added to watched' : 'Removed from watched',
          );
        } catch (err) {
          logger.error('Failed to toggle watched:', err);
          toast.error('Failed to update watched status');
        }
      },

      clearStore: async (deleteCategories: boolean) => {
        try {
          await movieDbService.clearDatabase(deleteCategories);
          const categories = await movieDbService.allCategories();
          set({
            movies: [],
            categories: categories,
          });
          toast.success('Library deleted successfully');
          return true;
        } catch (err) {
          logger.error('Failed to clear library:', err);
          toast.error('Failed to clear library');
          return false;
        }
      },
    };
  }),
);
