type Schema<T> = Record<keyof T, string>;

export interface MovieFile {
  imdbID?: string;
  title: string;
  year: number;
  fileName: string;
}

export interface MovieDetail {
  imdbID: string;
  title: string;
  year: string;
  rated: string;
  runtime: string;
  genre: string;
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  metascore: string;
  imdbRating: string;
  imdbVotes: string;
  type: string;
}

export interface MoviePoster {
  imdbID: string;
  title: string;
  url: string;
  mime: string;
  blob: Blob;
}

export interface MovieUserStatus {
  imdbID: string;
  isFavorite: boolean;
  isWatched: boolean;
  updatedAt: Date;
}

export interface Category {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieCategory {
  imdbID: string;
  categoryId: number;
}

export const movieFileSchema: Schema<MovieFile> = {
  imdbID: 'imdbID',
  title: 'title',
  year: 'year',
  fileName: 'fileName',
};

export const movieDetailSchema: Schema<MovieDetail> = {
  imdbID: 'imdbID',
  title: 'title',
  year: 'year',
  rated: 'rated',
  runtime: 'runtime',
  genre: 'genre',
  plot: 'plot',
  language: 'language',
  country: 'country',
  awards: 'awards',
  poster: 'poster',
  metascore: 'metascore',
  imdbRating: 'imdbRating',
  imdbVotes: 'imdbVotes',
  type: 'type',
};

export const moviePosterSchema: Schema<Omit<MoviePoster, 'blob'>> = {
  imdbID: 'imdbID',
  title: 'title',
  url: 'url',
  mime: 'mime',
};

export const movieUserStatusSchema: Schema<MovieUserStatus> = {
  imdbID: 'imdbID',
  isFavorite: 'isFavorite',
  isWatched: 'isWatched',
  updatedAt: 'updatedAt',
};

export const categorySchema: Schema<Category> = {
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export const movieCategorySchema: Schema<MovieCategory> = {
  imdbID: 'imdbID',
  categoryId: 'categoryId',
};

export const MovieNotFound = {
  Response: 'False',
  Error: 'Movie not found!',
};

export type MovieUploadInfo = {
  file: MovieFile;
  detail?: MovieDetail;
  poster?: MoviePoster;
  error?: { message: string; detail?: object };
};

export type MovieUploadContext = {
  movies: MovieUploadInfo[];
  categoryIds?: number[];
};

export interface MovieFilterCriteria {
  genre: string[];
  year: string[];
  rating: string[];
  rated: string[];
  language: string[];
  country: string[];
  category: string[];
  isFavorite: boolean;
  isWatched: boolean;
}
