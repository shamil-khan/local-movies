import logger from '@/core/logger';
import { db } from '@/lib/db';
import {
  movieFileSchema,
  type Category,
  type MovieCategory,
  type MovieDetail,
  type MovieFile,
  type MovieInfo,
  type MoviePoster,
  type MovieUserStatus,
} from '@/models/MovieModel';

class MovieDbService {
  allMovieDetails = async (): Promise<MovieDetail[]> => {
    return await db.movieDetailTable.toArray();
  };

  allMoviePosters = async (): Promise<MoviePoster[]> => {
    return await db.moviePosterTable.toArray();
  };

  allMovieUserStatuses = async (): Promise<
    import('@/models/MovieModel').MovieUserStatus[]
  > => {
    return await db.movieUserStatusTable.toArray();
  };

  allCategories = async (): Promise<Category[]> => {
    return await db.categoryTable.toArray();
  };

  allMovieCategories = async (): Promise<MovieCategory[]> => {
    return await db.movieCategoryTable.toArray();
  };

  fileExists = async (fileName: string): Promise<boolean> => {
    const result = await db.movieFileTable
      .where(movieFileSchema.fileName)
      .equals(fileName)
      .first();
    logger.info(
      `Movie file name ${fileName} ${result ? 'already' : 'does not'} exits `,
    );
    return !!result;
  };

  addFile = async (movieFile: MovieFile): Promise<number | undefined> => {
    return await db.movieFileTable.add(movieFile);
  };

  addDetail = async (movieDetail: MovieDetail): Promise<number | undefined> => {
    return await db.movieDetailTable.add(movieDetail);
  };

  addPoster = async (moviePoster: MoviePoster): Promise<number | undefined> => {
    return await db.moviePosterTable.add(moviePoster);
  };

  // Category methods
  addCategory = async (name: string): Promise<number | undefined> => {
    const existing = await db.categoryTable
      .where('name')
      .equalsIgnoreCase(name)
      .first();
    if (existing) {
      return existing.id;
    }
    return await db.categoryTable.add({
      name: name.trim(),
    });
  };

  addUpdateUserStatus = async (
    imdbID: string,
    status: Partial<Omit<MovieUserStatus, 'id' | 'imdbID'>>,
  ): Promise<void> => {
    const existing = await db.movieUserStatusTable
      .where('imdbID')
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

  updateCategory = async (
    categoryId: number,
    name: string,
  ): Promise<boolean> => {
    try {
      const existing = await db.categoryTable
        .where('id')
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

  deleteCategory = async (categoryId: number): Promise<void> => {
    await db.transaction('rw', db.categoryTable, db.movieCategoryTable, () => {
      db.categoryTable.where('id').equals(categoryId).delete();
      db.movieCategoryTable.where('categoryId').equals(categoryId).delete();
    });
  };

  getPoster = async (imdbID: string): Promise<MoviePoster | undefined> => {
    return await db.moviePosterTable.where('imdbID').equals(imdbID).first();
  };

  findByTitle = async (title: string): Promise<MovieDetail | undefined> => {
    return await db.movieDetailTable
      .where('Title')
      .equalsIgnoreCase(title)
      .first();
  };

  addMovie = async (movie: MovieInfo): Promise<void> => {
    await db.transaction(
      'rw',
      db.movieDetailTable,
      db.moviePosterTable,
      db.movieUserStatusTable,
      db.movieCategoryTable,
      () => {
        db.movieDetailTable.add({
          ...movie.detail,
          imdbID: movie.imdbID,
          title: movie.title,
        });
        if (movie.poster) {
          db.moviePosterTable.add({
            ...movie.poster,
            imdbID: movie.imdbID,
            title: movie.title,
          });
        }
        if (movie.status) {
          db.movieUserStatusTable.add({
            ...movie.status,
            imdbID: movie.imdbID,
          });
        }
        if (movie.categories) {
          movie.categories.forEach((c) =>
            db.movieCategoryTable.add({
              categoryId: c.id,
              imdbID: movie.imdbID,
            }),
          );
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
        db.movieDetailTable.where('imdbID').equals(imdbID).delete();
        db.moviePosterTable.where('imdbID').equals(imdbID).delete();
        db.movieUserStatusTable.where('imdbID').equals(imdbID).delete();
        db.movieCategoryTable.where('imdbID').equals(imdbID).delete();
      },
    );
  };

  updateMovieFileImdbID = async (
    fileName: string,
    imdbID: string,
  ): Promise<void> => {
    logger.info(`Updating movie file imdbID ${fileName} ${imdbID}`);
    const existing = await db.movieFileTable
      .where(movieFileSchema.fileName)
      .equals(fileName)
      .first();

    if (existing && (!existing.imdbID || existing.imdbID !== imdbID)) {
      await db.movieFileTable.update(existing.id!, {
        imdbID: imdbID,
      });
    }
  };

  clearDatabase = async (deleteCategories = false) => {
    await db.movieFileTable.clear();
    await db.movieDetailTable.clear();
    await db.moviePosterTable.clear();
    // await db.movieUserStatusTable.clear(); // Keep user statuses? User said "delete local-movies library".
    // Usually means content. But if I delete movies, status for them is orphan.
    // Let's clear everything for a true reset.
    await db.movieUserStatusTable.clear();
    await db.movieCategoryTable.clear();
    if (deleteCategories) {
      await db.categoryTable.clear();
    }
    // Note: Categories are kept even when clearing movies
  };

  addMovieToCategory = async (
    imdbID: string,
    categoryId: number,
  ): Promise<void> => {
    const existing = await db.movieCategoryTable
      .where('[imdbID+categoryId]')
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
      .where('[imdbID+categoryId]')
      .equals([imdbID, categoryId])
      .delete();
  };

  addMovieToCategories = async (
    imdbID: string,
    categoryIds: number[],
  ): Promise<void> => {
    await db.transaction('rw', db.movieCategoryTable, async () => {
      // Remove existing links for this movie
      // await db.movieCategoryTable.where('imdbID').equals(imdbID).delete();
      // Add new links
      for (const categoryId of categoryIds) {
        await db.movieCategoryTable.add({ imdbID, categoryId });
      }
    });
  };

  getMovieCategories = async (imdbID: string): Promise<Category[]> => {
    const movieCategories = await db.movieCategoryTable
      .where('imdbID')
      .equals(imdbID)
      .toArray();
    const categoryIds = movieCategories.map((mc) => mc.categoryId);
    if (categoryIds.length === 0) return [];
    return await db.categoryTable.where('id').anyOf(categoryIds).toArray();
  };

  getMoviesByCategory = async (categoryId: number): Promise<string[]> => {
    const movieCategories = await db.movieCategoryTable
      .where('categoryId')
      .equals(categoryId)
      .toArray();
    return movieCategories.map((mc) => mc.imdbID);
  };
}

export const movieDbService = new MovieDbService();
