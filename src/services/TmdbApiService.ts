import logger from '@/core/logger';
import { ApiService } from '@/services/ApiService';
import { compressImageBuffer } from '@/utils/MovieFileHelper';

const TMDB_IMAGE_URL = import.meta.env.VITE_TMDB_IMAGE_URL;
const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

logger.info(`TmdbApiService: baseURL: ${TMDB_API_URL}`);
logger.info(
  `TmdbApiService: apiKey: ${TMDB_API_KEY ? '***configured***' : 'NOT SET'}`,
);

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

export interface TmdbMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
}

interface TmdbSearchResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}

interface TmdbExternalIdsResponse {
  imdb_id: string | null;
  id: number;
}

class TmdbApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService({
      baseURL: TMDB_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search for movies by title
   */
  search = async (query: string): Promise<TmdbMovieResult[]> => {
    try {
      const response = await this.apiService.get<TmdbSearchResponse>(
        '/search/movie',
        {
          params: {
            api_key: TMDB_API_KEY,
            query: query,
            include_adult: false,
          },
        },
      );

      return response.data.results || [];
    } catch (error) {
      logger.error(`Error searching for movie '${query}':`, error);
      throw error;
    }
  };

  /**
   * Get external IDs (like IMDb ID) for a movie
   */
  getExternalIds = async (movieId: number): Promise<string | null> => {
    try {
      const response = await this.apiService.get<TmdbExternalIdsResponse>(
        `/movie/${movieId}/external_ids`,
        {
          params: {
            api_key: TMDB_API_KEY,
          },
        },
      );

      return response.data.imdb_id;
    } catch (error) {
      logger.error(
        `Error getting external IDs for movie ID ${movieId}:`,
        error,
      );
      throw error;
    }
  };

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
            api_key: TMDB_API_KEY,
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
  private getMovieVideos = async (movieId: number): Promise<TmdbVideo[]> => {
    try {
      const response = await this.apiService.get<TmdbVideosResponse>(
        `/movie/${movieId}/videos`,
        {
          params: {
            api_key: TMDB_API_KEY,
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
  getTrailerByImdbId = async (imdbId: string): Promise<MovieTrailer | null> => {
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

  getPosterImage = async (posterPath: string): Promise<Blob> => {
    const response = await this.apiService.get(
      `${TMDB_IMAGE_URL}/w342${posterPath}`,
      {
        responseType: 'arraybuffer',
      },
    );

    const blob = await compressImageBuffer(
      response.data as ArrayBuffer,
      response.headers['content-type'],
    );

    return blob;
  };
}

export const tmdbApiService = new TmdbApiService();
