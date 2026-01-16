// src/lib/db.ts
import Dexie, { type EntityTable } from 'dexie';
import {
  type MovieFile,
  type MovieDetail,
  type MoviePoster,
  type MovieUserStatus,
  type Category,
  type MovieCategory,
  movieFileSchema,
  movieDetailSchema,
  moviePosterSchema,
  movieUserStatusSchema,
  categorySchema,
  movieCategorySchema,
} from '@/models/MovieModel';

import logger from '@/core/logger';

interface MovieFileWithId extends MovieFile {
  id?: number;
}

interface MovieDetailWithId extends MovieDetail {
  id?: number;
}

interface MoviePosterWithId extends MoviePoster {
  id?: number;
}

interface MovieUserStatusWithId extends MovieUserStatus {
  id?: number;
}

interface CategoryWithId extends Category {
  id?: number;
}

interface MovieCategoryWithId extends MovieCategory {
  id?: number;
}

// Automated schema generation using imported schemas
const movieFileSchemaStr = Object.values(movieFileSchema).join(', ');
const moviePosterSchemaStr = Object.values(moviePosterSchema).join(', ');
const movieDetailSchemaStr = Object.values(movieDetailSchema).join(', ');
const movieUserStatusSchemaStr = Object.values(movieUserStatusSchema).join(
  ', ',
);
const categorySchemaStr = Object.values(categorySchema).join(', ');
const movieCategorySchemaStr = Object.values(movieCategorySchema).join(', ');

logger.info(`MovieFile Schema: ${movieFileSchemaStr}`);
logger.info(`MoviePoster Schema: ${moviePosterSchemaStr}`);
logger.info(`MovieDetail Schema: ${movieDetailSchemaStr}`);
logger.info(`MovieUserStatus Schema: ${movieUserStatusSchemaStr}`);
logger.info(`Category Schema: ${categorySchemaStr}`);
logger.info(`MovieCategory Schema: ${movieCategorySchemaStr}`);

export class LocalMovieAppDB extends Dexie {
  movieFileTable!: EntityTable<MovieFileWithId, 'id'>;
  moviePosterTable!: EntityTable<MoviePosterWithId, 'id'>;
  movieDetailTable!: EntityTable<MovieDetailWithId, 'id'>;
  movieUserStatusTable!: EntityTable<MovieUserStatusWithId, 'id'>;
  categoryTable!: EntityTable<CategoryWithId, 'id'>;
  movieCategoryTable!: EntityTable<MovieCategoryWithId, 'id'>;

  constructor() {
    super('LocalMovieAppDB');

    this.version(0.1).stores({
      movieFileTable: `++id, ${movieFileSchemaStr}`,
      moviePosterTable: `++id, ${moviePosterSchemaStr}`,
      movieDetailTable: `++id, ${movieDetailSchemaStr}`,
      movieUserStatusTable: `++id, ${movieUserStatusSchemaStr}`,
      categoryTable: `++id, ${categorySchemaStr}`,
      movieCategoryTable: `++id, ${movieCategorySchemaStr}`,
    });

    logger.success('LocalMovieAppDB created successfully');
  }
}

export const db = new LocalMovieAppDB();
