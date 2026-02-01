import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import type { MovieInfo } from '@/models/MovieModel';
import { useMovieFilters } from '@/hooks/useMovieFilters';
import {
  tmdbApiService,
  type TmdbMovieResult,
} from '@/services/TmdbApiService';
import { omdbApiService, OmdbApi } from '@/services/OmdbApiService';
import { SYSTEM_CATEGORY_SEARCHED } from '@/services/MovieDbService';
import { utilityApiService } from '@/services/UtilityApiService';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import { toMovieDetail } from '@/utils/MovieFileHelper';
import { logger } from '@/core/logger';
import { cn } from '@/lib/utils';

const TMDB_IMAGE_URL = import.meta.env.VITE_TMDB_IMAGE_URL;

export const LibrarySearchBar = () => {
  const { filters, onFiltersUpdated } = useMovieFilters();
  const { handleAddMovie, movies, categories } = useMovieLibrary();
  const [searchResults, setSearchResults] = useState<TmdbMovieResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const ignoreSearch = useRef(false);

  const onQueryChange = (query: string) => {
    onFiltersUpdated({ ...filters, query: query });
    setActiveIndex(-1); // Reset active index on query change
  };

  const onClear = () => {
    onFiltersUpdated({ ...filters, query: '' });
    setSearchResults([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    setLoading(false);
  };

  // Fetch TMDB suggestions based on filters.query
  useEffect(() => {
    if (ignoreSearch.current) {
      ignoreSearch.current = false;
      return;
    }

    const searchTimer = setTimeout(async () => {
      if (filters.query.length >= 2) {
        try {
          const results = await tmdbApiService.search(filters.query);
          setSearchResults(results.slice(0, 15));
          setShowDropdown(true);
          setActiveIndex(-1);
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

  const handleSelectMovie = async (tmdbMovie: TmdbMovieResult) => {
    ignoreSearch.current = true;
    setShowDropdown(false);
    onQueryChange(tmdbMovie.title);

    const existingMovie = movies.find(
      (m) => m.title.toLowerCase() === tmdbMovie.title.toLowerCase(),
    );

    if (existingMovie) {
      toast.info(`"${tmdbMovie.title}" already exists in your library.`);
      return;
    }

    logger.info(`Selected movie: ${tmdbMovie.title} (${tmdbMovie.id})`);
    setLoading(true);

    try {
      const imdbId = await tmdbApiService.getExternalIds(tmdbMovie.id);

      if (!imdbId) {
        toast.info(`"${tmdbMovie.title}" IMDB ID is not available.`);
        return;
      }

      if (movies.findIndex((m) => m.imdbID === imdbId) !== -1) {
        toast.info(`"${tmdbMovie.title}" already exists in your library.`);
        return;
      }

      const imdbMovie = await omdbApiService.getMovieByImdbId(imdbId);
      if (!imdbMovie || imdbMovie.Response === OmdbApi.ReservedWords.False) {
        toast.info(`"${tmdbMovie.title}" IMDB information is not available.`);
        return;
      }

      const posterURL =
        imdbMovie.Poster === OmdbApi.ReservedWords.NotAvailable &&
        tmdbMovie?.poster_path !== null
          ? tmdbApiService.getPosterURL(tmdbMovie.poster_path)
          : imdbMovie.Poster;
      const posterBlob = await utilityApiService.getPosterImage(posterURL);
      imdbMovie.Poster = posterURL;
      imdbMovie.Plot =
        imdbMovie.Plot === OmdbApi.ReservedWords.NotAvailable
          ? tmdbMovie.overview
          : imdbMovie.Plot;
      imdbMovie.Year =
        imdbMovie.Year === OmdbApi.ReservedWords.NotAvailable
          ? new Date(tmdbMovie.release_date).getFullYear().toString()
          : imdbMovie.Year;

      // Find "Searched" category
      const searchedCategory = categories.find(
        (c) => c.name === SYSTEM_CATEGORY_SEARCHED,
      );

      const movie: MovieInfo = {
        imdbID: imdbMovie.imdbID,
        title: imdbMovie.Title,
        year: imdbMovie.Year,
        detail: toMovieDetail(imdbMovie),
        poster: posterBlob
          ? {
              url: imdbMovie.Poster,
              mime: posterBlob?.type,
              blob: posterBlob,
            }
          : undefined,
        categories: searchedCategory ? [searchedCategory] : [],
      };
      handleAddMovie(movie);
      toast.success(
        `Movie added to library${
          searchedCategory ? ` (in "${SYSTEM_CATEGORY_SEARCHED}")` : ''
        }`,
      );
    } catch (err) {
      logger.error('An error occurred during selection:', err);
      toast.error(
        `The "${tmdbMovie.title}" is failed to load as ${(err as Error).message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setActiveIndex((prev) => (prev + 1) % searchResults.length);
        if (!showDropdown) setShowDropdown(true);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setActiveIndex((prev) =>
          prev <= 0 ? searchResults.length - 1 : prev - 1,
        );
      }
    } else if (e.key === 'Enter') {
      if (showDropdown && activeIndex >= 0 && searchResults[activeIndex]) {
        handleSelectMovie(searchResults[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className='relative flex-1'>
      <div className='relative flex items-center gap-3 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-zinc-200 focus-within:ring-2 focus-within:ring-red-500/30 transition-all'>
        <div className='pl-2 border-r border-zinc-100 pr-3'>
          <span
            className={cn(
              'text-[#d80f1c] font-black leading-none shadow-sm transition-all shrink-0',
              'hover:brightness-105 active:scale-95',
              'text-[10px] px-1.5 py-0.5 rounded-md',
            )}>
            LMDb
          </span>
        </div>
        <Input
          type='text'
          placeholder='Search or Filter Movie Title...'
          value={filters.query}
          onChange={(e) => {
            ignoreSearch.current = false;
            onQueryChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchResults.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 200);
          }}
          className='h-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400'
        />
        {filters.query && (
          <button
            disabled={loading}
            onClick={onClear}
            className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1'>
            {loading ? (
              <Spinner className='h-4 w-4' />
            ) : (
              <X className='h-4 w-4' />
            )}
          </button>
        )}
      </div>
      {showDropdown && searchResults.length > 0 && (
        <div className='absolute top-full left-0 right-0 bg-background border border-border shadow-lg rounded-b-md overflow-hidden max-h-96 overflow-y-auto z-50'>
          {searchResults.map((movie, index) => (
            <div
              key={movie.id}
              className={`flex items-center gap-3 p-2 cursor-pointer transition-colors ${
                index === activeIndex ? 'bg-accent' : 'hover:bg-accent'
              }`}
              onClick={() => handleSelectMovie(movie)}
              onMouseEnter={() => setActiveIndex(index)}>
              {movie.poster_path ? (
                <img
                  src={`${TMDB_IMAGE_URL}/w92${movie.poster_path}`}
                  alt={movie.title}
                  className='w-10 h-14 object-cover rounded'
                />
              ) : (
                <div className='w-10 h-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground'>
                  No Img
                </div>
              )}
              <div className='flex flex-col text-left'>
                <span className='font-medium text-sm truncate'>
                  {movie.title}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {movie.release_date
                    ? movie.release_date.split('-')[0]
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
