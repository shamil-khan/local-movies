// src/lib/db.ts
import Dexie, { type EntityTable } from 'dexie';
import {
  type MovieFile,
  type MovieDetail,
  type MoviePoster,
} from '@/models/MovieModel';

import logger from '@/core/logger';

interface MovieFileWithId extends MovieFile {
  id?: number;
}

interface MoviePosterWithId extends MoviePoster {
  id?: number;
}

interface MovieDetailWithId extends MovieDetail {
  id?: number;
}

// todo: Find a way to generate it automatically like reflection in C#
const movieFileKeys = ['imdbID', 'title', 'year', 'filename'];
const moviePosterKeys = ['imdbID', 'title', 'url'];
const movieDetailKeys = [
  'imdbID',
  'Title',
  'Year',
  'Rated',
  'Released',
  'Runtime',
  'Genre',
  'Director',
  'Writer',
  'Actors',
  'Plot',
  'Language',
  'Country',
  'Awards',
  'Poster',
  'Ratings',
  'Metascore',
  'imdbRating',
  'imdbVotes',
  'Type',
  'DVD',
  'BoxOffice',
  'Production',
  'Website',
  'Response',
  'Error',
];

const movieFileSchema = movieFileKeys.join(', ');
const moviePosterSchema = moviePosterKeys.join(', ');
const movieDetailSchema = movieDetailKeys.join(', ');

logger.info(`MovieFile Schema: ${movieFileSchema}`);
logger.info(`MoviePoster Schema: ${moviePosterSchema}`);
logger.info(`MovieDetail Schema: ${movieDetailSchema}`);

export class LocalMovieAppDB extends Dexie {
  movieFileTable!: EntityTable<MovieFileWithId, 'id'>;
  moviePosterTable!: EntityTable<MoviePosterWithId, 'id'>;
  movieDetailTable!: EntityTable<MovieDetailWithId, 'id'>;

  constructor() {
    super('LocalMovieAppDB');

    this.version(0.1).stores({
      movieFileTable: `++id, ${movieFileSchema}`,
      moviePosterTable: `++id, ${moviePosterSchema}`,
      movieDetailTable: `++id, ${movieDetailSchema}`,
    });

    this.version(0.2).stores({
      movieUserStatusTable: `++id, imdbID`,
    });
    logger.success('LocalMovieAppDB created successfully');
  }
}

export const db = new LocalMovieAppDB();
