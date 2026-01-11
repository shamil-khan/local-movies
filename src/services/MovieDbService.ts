import {
  type MovieFile,
  type MovieDetail,
  type MoviePoster,
  type Category,
  movieFileSchema,
} from '@/models/MovieModel';
import logger from '@/core/logger';
import { db } from '@/lib/db';

class MovieDbService {
  fileExists = async (filename: string): Promise<[string, boolean]> => {
    const result = await db.movieFileTable
      .where(movieFileSchema.filename)
      .equals(filename)
      .first();
    logger.info(`movie exits ${filename}`, !!result);
    return [filename, !!result];
  };

  addFile = async (movieFile: MovieFile): Promise<number | undefined> => {
    return await db.movieFileTable.add(movieFile);
  };

  addPoster = async (moviePoster: MoviePoster): Promise<number | undefined> => {
    return await db.moviePosterTable.add(moviePoster);
  };

  getPoster = async (imdbID: string): Promise<MoviePoster | undefined> => {
    return await db.moviePosterTable.where('imdbID').equals(imdbID).first();
  };

  addDetail = async (movieDetail: MovieDetail): Promise<number | undefined> => {
    return await db.movieDetailTable.add(movieDetail);
  };

  addMovie = async (
    movieDetail: MovieDetail,
    moviePoster: MoviePoster,
  ): Promise<void> => {
    await db.transaction('rw', db.movieDetailTable, db.moviePosterTable, () => {
      db.movieDetailTable.add(movieDetail);
      db.moviePosterTable.add(moviePoster);
    });
  };

  allMovies = async (): Promise<MovieDetail[]> => {
    return await db.movieDetailTable.toArray();
  };

  findByTitle = async (title: string): Promise<MovieDetail | undefined> => {
    return await db.movieDetailTable
      .where('Title')
      .equalsIgnoreCase(title)
      .first();
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

  updateUserStatus = async (
    imdbID: string,
    status: Partial<
      Omit<
        import('@/models/MovieModel').MovieUserStatus,
        'id' | 'imdbID' | 'updatedAt'
      >
    >,
  ): Promise<void> => {
    const existing = await db.movieUserStatusTable
      .where('imdbID')
      .equals(imdbID)
      .first();

    if (existing) {
      await db.movieUserStatusTable.update(existing.id!, {
        ...status,
        updatedAt: new Date(),
      });
    } else {
      await db.movieUserStatusTable.add({
        imdbID,
        isFavorite: status.isFavorite ?? false,
        isWatched: status.isWatched ?? false,
        updatedAt: new Date(),
      });
    }
  };

  allUserStatuses = async (): Promise<
    import('@/models/MovieModel').MovieUserStatus[]
  > => {
    return await db.movieUserStatusTable.toArray();
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
        updatedAt: new Date(),
      });
      return true;
    } catch (err) {
      logger.error('Failed to update category:', err);
      return false;
    }
  };

  allCategories = async (): Promise<Category[]> => {
    return await db.categoryTable.toArray();
  };

  linkMovieToCategory = async (
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

  linkMovieToCategories = async (
    imdbID: string,
    categoryIds: number[],
  ): Promise<void> => {
    await db.transaction('rw', db.movieCategoryTable, async () => {
      // Remove existing links for this movie
      await db.movieCategoryTable.where('imdbID').equals(imdbID).delete();
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

  deleteCategory = async (categoryId: number): Promise<void> => {
    await db.transaction('rw', db.categoryTable, db.movieCategoryTable, () => {
      db.categoryTable.where('id').equals(categoryId).delete();
      db.movieCategoryTable.where('categoryId').equals(categoryId).delete();
    });
  };
}

export const movieDbService = new MovieDbService();
