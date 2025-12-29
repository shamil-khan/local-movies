import { ApiService } from './ApiService';

const baseURL = import.meta.env.MOVIE_API_URL || 'https://www.omdbapi.com';
const apiKey = import.meta.env.MOVIE_API_KEY || '';

export interface MovieDetail {
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
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

export class MovieService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getMovieByTitle = async (title: string) =>
    await this.apiService.get<MovieDetail>(`?t='${title}'&apikey=${apiKey}`);

  getMovieByTitleAndYear = async (title: string, year: number) =>
    await this.apiService.get<MovieDetail>(
      `?t='${title}'&year=${year}&apikey=${apiKey}`,
    );
}

export const movieService = new MovieService();
