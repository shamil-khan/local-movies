import logger from '@/core/logger';
import { ApiService } from '@/services/ApiService';

const baseURL = 'https://api.themoviedb.org/3';
const apiKey = import.meta.env.VITE_TMDB_API_KEY;

logger.info(`TmdbApiService: baseURL: ${baseURL}`);
logger.info(`TmdbApiService: apiKey: ${apiKey ? '***configured***' : 'NOT SET'}`);

interface TmdbFindResponse {
  movie_results: Array<{
    id: number;
    title: string;
    original_title: string;
  }>;
}

interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}

export interface MovieTrailer {
  youtubeKey: string;
  name: string;
  official: boolean;
}

class TmdbApiService {
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

  /**
   * Find TMDb movie ID using IMDb ID
   */
  private findMovieByImdbId = async (
    imdbId: string,
  ): Promise<number | null> => {
    try {
      const response = await this.apiService.get<TmdbFindResponse>(
        `/find/${imdbId}`,
        {
          params: {
            api_key: apiKey,
            external_source: 'imdb_id',
          },
        },
      );

      if (
        response.data.movie_results &&
        response.data.movie_results.length > 0
      ) {
        return response.data.movie_results[0].id;
      }

      logger.warn(`No TMDb movie found for IMDb ID: ${imdbId}`);
      return null;
    } catch (error) {
      logger.error(`Error finding movie by IMDb ID ${imdbId}:`, error);
      throw error;
    }
  };

  /**
   * Get movie videos (trailers) using TMDb movie ID
   */
  private getMovieVideos = async (
    movieId: number,
  ): Promise<TmdbVideo[]> => {
    try {
      const response = await this.apiService.get<TmdbVideosResponse>(
        `/movie/${movieId}/videos`,
        {
          params: {
            api_key: apiKey,
          },
        },
      );

      return response.data.results || [];
    } catch (error) {
      logger.error(`Error getting videos for movie ID ${movieId}:`, error);
      throw error;
    }
  };

  /**
   * Get YouTube trailer for a movie using IMDb ID
   * Returns the first official trailer, or the first trailer if no official one exists
   */
  getTrailerByImdbId = async (
    imdbId: string,
  ): Promise<MovieTrailer | null> => {
    try {
      // Step 1: Find TMDb movie ID
      const movieId = await this.findMovieByImdbId(imdbId);
      if (!movieId) {
        return null;
      }

      // Step 2: Get videos for the movie
      const videos = await this.getMovieVideos(movieId);

      // Step 3: Filter for YouTube trailers
      const trailers = videos.filter(
        (video) => video.site === 'YouTube' && video.type === 'Trailer',
      );

      if (trailers.length === 0) {
        logger.warn(`No trailers found for IMDb ID: ${imdbId}`);
        return null;
      }

      // Prefer official trailers
      const officialTrailer = trailers.find((trailer) => trailer.official);
      const selectedTrailer = officialTrailer || trailers[0];

      return {
        youtubeKey: selectedTrailer.key,
        name: selectedTrailer.name,
        official: selectedTrailer.official,
      };
    } catch (error) {
      logger.error(`Error getting trailer for IMDb ID ${imdbId}:`, error);
      throw error;
    }
  };
}

export const tmdbApiService = new TmdbApiService();
