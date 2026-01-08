import {
  type MovieFile,
  type MovieDetail,
  type MoviePoster,
  movieFileSchema,
} from '@/models/MovieModel';
import logger from '@/core/logger';
import { db } from '@/lib/db';

class MovieDbService {
  test = async () => {
    const m1 = {
      title: 'Downton Abbey The Grand Finale',
      year: 2025,
      ext: 'mkv',
      filename: 'Downton Abbey The Grand Finale 2025.BRRip.Dual.mkv',
    };
    await db.movieFileTable.add(m1);
  };

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
      () => {
        db.movieDetailTable.where('imdbID').equals(imdbID).delete();
        db.moviePosterTable.where('imdbID').equals(imdbID).delete();
        db.movieUserStatusTable.where('imdbID').equals(imdbID).delete();
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
}

export const movieDbService = new MovieDbService();
