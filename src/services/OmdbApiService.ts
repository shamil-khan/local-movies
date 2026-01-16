import logger from '@/core/logger';
import { ApiService } from '@/services/ApiService';

const baseURL = import.meta.env.VITE_OMDB_API_URL;
const apiKey = import.meta.env.VITE_OMDB_API_KEY;

logger.info(`OmdbApiService: baseURL: ${baseURL}`);
logger.info(
  `OmdbApiService: apiKey: ${apiKey ? '***configured***' : 'NOT SET'}`,
);

// Response interfaces
export interface OmdbSearchMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearchResponse {
  Search?: OmdbSearchMovie[];
  totalResults?: string;
  Response: 'True' | 'False';
  Error?: string;
}

export interface OmdbMovieResult {
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

class OmdbApiService {
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
   * Search for movies by title (returns multiple results)
   */
  searchMovies = async (
    query: string,
    year?: number,
  ): Promise<OmdbSearchMovie[]> => {
    try {
      const params: Record<string, string | number> = {
        apikey: apiKey,
        s: query,
      };
      if (year) params.y = year;

      const response = await this.apiService.get<OmdbSearchResponse>('', {
        params,
      });

      if (response.data.Response === 'False') {
        logger.warn(
          `No movies found for query '${query}': ${response.data.Error}`,
        );
        return [];
      }

      return response.data.Search || [];
    } catch (error) {
      logger.error(`Error searching for movies '${query}':`, error);
      throw error;
    }
  };

  /**
   * Get movie details by title
   */
  getMovieByTitle = async (
    title: string,
    year?: number,
  ): Promise<OmdbMovieResult> => {
    try {
      const params: Record<string, string | number> = {
        apikey: apiKey,
        t: title,
      };
      if (year) params.y = year;

      const response = await this.apiService.get<OmdbMovieResult>('', {
        params,
      });

      if (response.data.Response === 'False') {
        logger.warn(
          `Movie not found for title '${title}': ${response.data.Error}`,
        );
        throw new Error(response.data.Error || 'Movie not found');
      }

      return response.data;
    } catch (error) {
      logger.error(`Error getting movie by title '${title}':`, error);
      throw error;
    }
  };

  /**
   * Get movie details by IMDb ID
   */
  getMovieByImdbId = async (imdbId: string): Promise<OmdbMovieResult> => {
    try {
      const response = await this.apiService.get<OmdbMovieResult>('', {
        params: {
          apikey: apiKey,
          i: imdbId,
        },
      });

      if (response.data.Response === 'False') {
        logger.warn(
          `Movie not found for IMDb ID '${imdbId}': ${response.data.Error}`,
        );
        throw new Error(response.data.Error || 'Movie not found');
      }

      return response.data;
    } catch (error) {
      logger.error(`Error getting movie by IMDb ID '${imdbId}':`, error);
      throw error;
    }
  };
}

export const omdbApiService = new OmdbApiService();
