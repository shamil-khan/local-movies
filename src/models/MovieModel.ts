export interface MovieFile {
  imdbID?: string;
  title: string;
  year: number;
  ext: string;
  filename: string;
}

export interface MoviePoster {
  imdbID: string;
  title: string;
  url: string;
  mime: string;
  blob: Blob;
}

export interface MovieDetail {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: [
    { Source: string; Value: string },
    { Source: string; Value: string },
    { Source: string; Value: string },
  ];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: 'True' | 'False';
  Error?: string;
}

export const MovieNotFound = {
  Response: 'False',
  Error: 'Movie not found!',
};

export const movieFileSchema = {
  title: 'title',
  year: 'year',
  ext: 'ext',
  filename: 'filename',
};
