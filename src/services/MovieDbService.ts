import { db } from '@/lib/db';
import {
  type MovieDetail,
  type MoviePoster,
  type MovieUserStatus,
  type MovieCategory,
  type Category,
  type MovieInfo,
  movieDetailSchema,
  moviePosterSchema,
  movieUserStatusSchema,
  categorySchema,
  movieCategorySchema,
} from '@/models/MovieModel';
import logger from '@/core/logger';

// System Category Names
export const SYSTEM_CATEGORY_SEARCHED = 'Searched';
export const SYSTEM_CATEGORY_UPLOADED = 'Uploaded';

class MovieDbService {
  constructor() {
    this.initDatabase();
  }

  async initDatabase() {
    logger.info('Initializing MovieDbService database');
    await this.ensureCategory(SYSTEM_CATEGORY_SEARCHED);
    await this.ensureCategory(SYSTEM_CATEGORY_UPLOADED);
  }

  // Helper to ensure a category exists
  private async ensureCategory(name: string) {
    const existing = await db.categoryTable
      .where(categorySchema.name)
      .equalsIgnoreCase(name)
      .first();
    if (!existing) {
      await db.categoryTable.add({ name });
      logger.info(`Initialized system category: ${name}`);
    }
  }

  allMovieDetails = async (): Promise<MovieDetail[]> =>
    await db.movieDetailTable.toArray();

  allMoviePosters = async (): Promise<MoviePoster[]> =>
    await db.moviePosterTable.toArray();

  allMovieUserStatuses = async (): Promise<MovieUserStatus[]> =>
    await db.movieUserStatusTable.toArray();

  allCategories = async (): Promise<Category[]> =>
    await db.categoryTable.toArray();

  allMovieCategories = async (): Promise<MovieCategory[]> =>
    await db.movieCategoryTable.toArray();

  findMovieDetailByTitle = async (
    title: string,
    year: string,
  ): Promise<MovieDetail | undefined> =>
    await db.movieDetailTable
      .where(`${movieDetailSchema.title}`)
      .equalsIgnoreCase(title)
      .and((x) => x.year === year)
      .first();

  findMovieDetailByImdbID = async (
    imdbID: string,
  ): Promise<MovieDetail | undefined> =>
    await db.movieDetailTable
      .where(`${movieDetailSchema.imdbID}`)
      .equalsIgnoreCase(imdbID)
      .first();

  addUpdateUserStatus = async (
    imdbID: string,
    status: Partial<Omit<MovieUserStatus, 'id' | 'imdbID'>>,
  ): Promise<void> => {
    const existing = await db.movieUserStatusTable
      .where(movieUserStatusSchema.imdbID)
      .equals(imdbID)
      .first();

    if (existing) {
      await db.movieUserStatusTable.update(existing.id!, {
        ...status,
      });
    } else {
      await db.movieUserStatusTable.add({
        imdbID,
        isFavorite: status.isFavorite ?? false,
        isWatched: status.isWatched ?? false,
      });
    }
  };

  addCategory = async (name: string): Promise<number | undefined> => {
    const existing = await db.categoryTable
      .where(categorySchema.name)
      .equalsIgnoreCase(name)
      .first();
    if (existing) {
      return existing.id;
    }
    return await db.categoryTable.add({
      name: name.trim(),
    });
  };

  updateCategory = async (
    categoryId: number,
    name: string,
  ): Promise<boolean> => {
    try {
      const existing = await db.categoryTable
        .where(categorySchema.id)
        .equals(categoryId)
        .first();
      if (!existing) return false;
      await db.categoryTable.update(categoryId, {
        name: name.trim(),
      });
      return true;
    } catch (err) {
      logger.error('Failed to update category:', err);
      return false;
    }
  };

  deleteCategory = async (categoryId: number): Promise<void> =>
    db.transaction('rw', db.categoryTable, db.movieCategoryTable, () => {
      db.categoryTable.where(categorySchema.id).equals(categoryId).delete();
      db.movieCategoryTable
        .where(movieCategorySchema.categoryId)
        .equals(categoryId)
        .delete();
    });

  getPoster = async (imdbID: string): Promise<MoviePoster | undefined> =>
    await db.moviePosterTable
      .where(moviePosterSchema.imdbID)
      .equals(imdbID)
      .first();

  addMovie = async (movie: MovieInfo): Promise<void> => {
    await db.transaction(
      'rw',
      db.movieDetailTable,
      db.moviePosterTable,
      db.movieCategoryTable,
      () => {
        // Check and add movie details
        db.movieDetailTable
          .where(movieDetailSchema.imdbID)
          .equals(movie.imdbID)
          .first()
          .then((existing) => {
            if (!existing) {
              db.movieDetailTable.add({
                ...movie.detail,
                imdbID: movie.imdbID,
                title: movie.title,
              });
            } else {
              logger.info(`Movie detail already exists for ${movie.title}`);
            }
          });

        if (movie.poster) {
          db.moviePosterTable
            .where(moviePosterSchema.imdbID)
            .equals(movie.imdbID)
            .first()
            .then((existing) => {
              if (!existing && movie.poster) {
                db.moviePosterTable.add({
                  imdbID: movie.imdbID,
                  title: movie.title,
                  url: movie.poster.url || '',
                  mime: movie.poster.mime || '',
                  blob: movie.poster.blob || new Blob(),
                });
              }
            });
        }

        if (movie.categories) {
          movie.categories.forEach((c) => {
            db.movieCategoryTable
              .where(
                `[${movieCategorySchema.imdbID}+${movieCategorySchema.categoryId}]`,
              )
              .equals([movie.imdbID, c.id])
              .first()
              .then((existing) => {
                if (!existing) {
                  db.movieCategoryTable.add({
                    categoryId: c.id,
                    imdbID: movie.imdbID,
                  });
                }
              });
          });
        }
      },
    );
  };

  deleteMovie = async (imdbID: string): Promise<void> => {
    await db.transaction(
      'rw',
      db.movieDetailTable,
      db.moviePosterTable,
      db.movieUserStatusTable,
      db.movieCategoryTable,
      () => {
        db.movieDetailTable
          .where(movieDetailSchema.imdbID)
          .equals(imdbID)
          .delete();
        db.moviePosterTable
          .where(moviePosterSchema.imdbID)
          .equals(imdbID)
          .delete();
        db.movieUserStatusTable
          .where(movieUserStatusSchema.imdbID)
          .equals(imdbID)
          .delete();
        db.movieCategoryTable
          .where(movieCategorySchema.imdbID)
          .equals(imdbID)
          .delete();
      },
    );
  };

  clearDatabase = async (deleteCategories = false) => {
    await db.movieDetailTable.clear();
    await db.moviePosterTable.clear();
    await db.movieUserStatusTable.clear();
    await db.movieCategoryTable.clear();
    if (deleteCategories) {
      await db.categoryTable
        .where(categorySchema.name)
        .noneOf([SYSTEM_CATEGORY_SEARCHED, SYSTEM_CATEGORY_UPLOADED])
        .delete();
    }
  };

  addMovieToCategory = async (
    imdbID: string,
    categoryId: number,
  ): Promise<void> => {
    const existing = await db.movieCategoryTable
      .where(
        `[${movieCategorySchema.imdbID}+${movieCategorySchema.categoryId}]`,
      )
      .equals([imdbID, categoryId])
      .first();
    if (!existing) {
      await db.movieCategoryTable.add({ imdbID, categoryId });
    }
  };

  removeMovieFromCategory = async (
    imdbID: string,
    categoryId: number,
  ): Promise<void> => {
    await db.movieCategoryTable
      .where(
        `[${movieCategorySchema.imdbID}+${movieCategorySchema.categoryId}]`,
      )
      .equals([imdbID, categoryId])
      .delete();
  };
}

export const movieDbService = new MovieDbService();
