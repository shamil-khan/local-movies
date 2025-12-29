import { type MovieDetail } from '@/types/MovieDetail';
import { ApiService } from '@/services/ApiService';

const baseURL = import.meta.env.MOVIE_API_URL || 'https://www.omdbapi.com';
const apiKey = import.meta.env.MOVIE_API_KEY || '';

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
