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

  // findNotSaved = async (movieFiles: MovieFile[]): Promise<MovieFile[]> => {
  //   if (movieFiles.length === 0) {
  //     return [];
  //   }

  //   const result: MovieFile[] = [];
  //   for (const movieFile of movieFiles) {
  //     const exists = await this.fileExists(movieFile.filename);
  //     if (!exists) result.push(movieFile);
  //   }

  //   return result;
  // };
}

export const movieDbService = new MovieDbService();
