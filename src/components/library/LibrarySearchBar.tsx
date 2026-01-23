import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  tmdbApiService,
  type TmdbMovieResult,
} from '@/services/TmdbApiService';
import { logger } from '@/core/logger';
import { toast } from 'sonner';
import { omdbApiService } from '@/services/OmdbApiService';
import { movieDbService } from '@/services/MovieDbService';
import { utilityApiService } from '@/services/UtilityApiService';
import { type MovieInfo } from '@/models/MovieModel';
import { useMovieFilters } from '@/hooks/useMovieFilters';
import { toMovieDetail } from '@/utils/MovieFileHelper';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';

export const LibrarySearchBar = () => {
  const { filters, onFiltersUpdated } = useMovieFilters();
  const { handleAddMovie } = useMovieLibrary();
  const [searchResults, setSearchResults] = useState<TmdbMovieResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const onQueryChange = (query: string) => {
    onFiltersUpdated({ ...filters, query: query.trim() });
  };

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (filters.query.length >= 2) {
        try {
          const results = await tmdbApiService.search(filters.query);
          setSearchResults(results.slice(0, 5));
          setShowDropdown(true);
        } catch (error) {
          console.error('Search failed:', error);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [filters.query]);

  const handleSelectMovie = async (
    tmdbMovie: import('@/services/TmdbApiService').TmdbMovieResult,
  ) => {
    logger.info(`Selected movie: ${tmdbMovie.title} (${tmdbMovie.id})`);
    setShowDropdown(false);
    onQueryChange(tmdbMovie.title);

    try {
      const imdbId = await tmdbApiService.getExternalIds(tmdbMovie.id);

      if (!imdbId) {
        toast.error('Could not find detailed information for this movie.');
        return;
      }

      const movieFromApi = await omdbApiService.getMovieByImdbId(imdbId);

      if (
        movieFromApi &&
        movieFromApi.Response === 'True' &&
        movieFromApi.Poster !== 'N/A'
      ) {
        const posterBlob = await utilityApiService.getPosterImage(
          movieFromApi.Poster,
        );

        const movie: MovieInfo = {
          imdbID: movieFromApi.imdbID,
          title: movieFromApi.Title,
          detail: toMovieDetail(movieFromApi),
          poster: {
            url: movieFromApi.Poster,
            mime: posterBlob.type,
            blob: posterBlob,
          },
        };
        await movieDbService.addMovie(movie);
        toast.success('Movie added to library');
        handleAddMovie(movie);
      } else {
        toast.info('Detailed information not found.');
      }
    } catch (err) {
      logger.error('An error occurred during selection:', err);
      toast.error('Failed to load movie details: ' + (err as Error).message);
    }
  };

  return (
    <div className='relative flex-1'>
      <Input
        type='text'
        placeholder='Search Movie Title...'
        value={filters.query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => {
          if (searchResults.length > 0) setShowDropdown(true);
        }}
        onBlur={() => {
          setTimeout(() => setShowDropdown(false), 200);
        }}
        className='w-full'
      />
      {showDropdown && searchResults.length > 0 && (
        <div className='absolute top-full left-0 right-0 bg-background border border-border shadow-lg rounded-b-md overflow-hidden max-h-96 overflow-y-auto z-50'>
          {searchResults.map((result) => (
            <div
              key={result.id}
              className='flex items-center gap-3 p-2 hover:bg-accent cursor-pointer transition-colors'
              onClick={() => handleSelectMovie(result)}>
              {result.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                  alt={result.title}
                  className='w-10 h-14 object-cover rounded'
                />
              ) : (
                <div className='w-10 h-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground'>
                  No Img
                </div>
              )}
              <div className='flex flex-col text-left'>
                <span className='font-medium text-sm truncate'>
                  {result.title}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {result.release_date
                    ? result.release_date.split('-')[0]
                    : 'Unknown'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
