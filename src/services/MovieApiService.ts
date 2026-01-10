import logger from '@/core/logger';
import { type MovieDetail, type MoviePoster } from '@/models/MovieModel';
import { ApiService } from '@/services/ApiService';

const baseURL = import.meta.env.VITE_MOVIE_API_URL;
const apiKey = import.meta.env.VITE_MOVIE_API_KEY;

logger.info(`MovieApiService: baseURL: ${baseURL}`);
logger.info(
  `MovieApiService: apiKey: ${apiKey ? '***configured***' : 'NOT SET'}`,
);
class MovieApiService {
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
      `?t=${title}&year=${year}&apikey=${apiKey}`,
    );

  getMovieByImdbId = async (imdbId: string) =>
    await this.apiService.get<MovieDetail>(`?i=${imdbId}&apikey=${apiKey}`);

  getPoster = async (movie: {
    imdbID: string;
    Title: string;
    Poster: string;
  }): Promise<MoviePoster> => {
    const response = await this.apiService.get(movie.Poster, {
      responseType: 'blob',
    });

    // Extract the MIME type from the response headers
    const mimeType = response.headers['content-type'];
    if (!mimeType || !mimeType.startsWith('image/')) {
      throw new Error('Did not receive an image MIME type');
    }
    const poster = {
      imdbID: movie.imdbID,
      title: movie.Title,
      url: movie.Poster,
      mime: mimeType as string,
      blob: response.data as Blob,
    };

    return poster;
  };
}

export const movieApiService = new MovieApiService();
