import { useState, useEffect } from 'react';
import { movieDbService } from '@/services/MovieDbService';
import { movieApiService } from '@/services/MovieApiService';
import { tmdbApiService } from '@/services/TmdbApiService';
import { type MovieDetail } from '@/models/MovieModel';
import { XMovieCard } from '@/components/XMovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { logger } from '@/core/logger';
import { toast } from 'sonner';
import { type XFile } from '@/components/mine/xfileinput';
import { CompactFolderUpload } from '@/components/CompactFolderUpload';

interface MovieSearchProps {
  onMovieAdded: () => void;
  onFolderUpload?: (files: XFile[]) => void;
  onLoad?: () => void;
  selectedFiles?: XFile[];
  folderLoading?: boolean;
  folderError?: string | null;
}

export const MovieSearch = ({
  onMovieAdded,
  onFolderUpload,
  onLoad,
  selectedFiles = [],
  folderLoading = false,
  folderError,
}: MovieSearchProps) => {
  const [title, setTitle] = useState('');
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    import('@/services/TmdbApiService').TmdbMovieResult[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (title.length >= 2) {
        try {
          const results = await tmdbApiService.search(title);
          setSearchResults(results.slice(0, 5)); // Limit to 5 suggestions
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
  }, [title]);

  const handleSelectMovie = async (tmdbMovie: import('@/services/TmdbApiService').TmdbMovieResult) => {
    logger.info(`Selected movie: ${tmdbMovie.title} (${tmdbMovie.id})`);
    setShowDropdown(false);
    setTitle(tmdbMovie.title); // Update input for feedback
    
    try {
      setLoading(true);
      setMovie(null);

      // 1. Get IMDb ID
      const imdbId = await tmdbApiService.getExternalIds(tmdbMovie.id);
      
      if (!imdbId) {
        logger.warn('No IMDb ID found for this movie. Trying title fallback (risky but better than nothing).');
        // Fallback or error? Let's error for now to be safe, or try OMDb by title?
        // Let's stick to the plan: if we can't get ID, we can't reliably get OMDb details.
        toast.error('Could not find detailed information for this movie.');
        return;
      }

      logger.info(`Found IMDb ID: ${imdbId}. Fetching details...`);

      // 2. Check local DB first using IMDb ID (better than title)
      // *Wait*, movieDbService.findByTitle is what we have. 
      // Ideally we should have findByImdbId. Let's assume title search for now or add ID search later.
      // Actually, let's just fetch from API and overwrite/update to ensure we have the best data.
      
      // 3. Fetch from OMDb
      const movieFromApi = await movieApiService.getMovieByImdbId(imdbId);
      
      if (movieFromApi.data && movieFromApi.data.Response === 'True') {
          logger.success('Movie details found in OMDb.');
          const poster = await movieApiService.getPoster(movieFromApi.data);
          logger.info('Downloading poster...');
          await movieDbService.addMovie(movieFromApi.data, poster);
          logger.success('Movie and poster added to local database.');
          
          setMovie(movieFromApi.data);
          onMovieAdded();
      } else {
           logger.error('Movie not found in OMDb.');
           toast.info('Detailed information not found.');
      }

    } catch (err) {
      logger.error('An error occurred during selection:', err);
      toast.error('Failed to load movie details: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Keep manual search for fallback or simple title entry
  const handleManualSearch = async () => {
      // Existing logic, maybe just for strictly manual entry?
      // Reusing logic is hard without duplication, let's mostly rely on dropdown
      // or implement the "exact match" fallback here if they click "Search" button directly.
      if (!title) return;
      handleSearchInternal(title);
  };

  const handleSearchInternal = async (searchTitle: string) => {
      // Original logic logic for fallback...
       logger.info(`Searching for movie manually: ${searchTitle}`);
    try {
      setLoading(true);
      setMovie(null);
      setShowDropdown(false);

      logger.info('Checking local database...');
      let movieDetail: MovieDetail | null =
        (await movieDbService.findByTitle(searchTitle)) || null;

      if (movieDetail) {
        logger.success('Movie found in local database.');
      } else {
        logger.warn('Movie not found in local database. Fetching from API...');
        const movieFromApi = await movieApiService.getMovieByTitle(searchTitle);

        if (movieFromApi.data && movieFromApi.data.Response === 'True') {
          logger.success('Movie found in API.');
          const poster = await movieApiService.getPoster(movieFromApi.data);
          logger.info('Downloading poster...');
          await movieDbService.addMovie(movieFromApi.data, poster);
          logger.success('Movie and poster added to local database.');
          movieDetail = movieFromApi.data;
          onMovieAdded();
        } else {
          logger.error('Movie not found in API.');
          toast.info('No movie found.');
          movieDetail = null;
        }
      }

      setMovie(movieDetail);
    } catch (err) {
      logger.error('Error:', err);
      toast.error('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full items-center relative z-20'>
        {onFolderUpload && (
          <CompactFolderUpload
            onUpload={onFolderUpload}
            onLoad={onLoad}
            selectedFiles={selectedFiles}
            loading={folderLoading}
            error={folderError}
          />
        )}
        <div className="flex-1 relative">
            <Input
              type='text'
              placeholder='Search Movie Title...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => { if(searchResults.length > 0) setShowDropdown(true); }}
              onBlur={() => { setTimeout(() => setShowDropdown(false), 200); }} // Delay to allow click
              className='w-full rounded-none border-l-0 border-r-0'
            />
            {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border border-border shadow-lg rounded-b-md overflow-hidden max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                        <div
                            key={result.id}
                            className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => handleSelectMovie(result)}
                        >
                            {result.poster_path ? (
                                <img 
                                    src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} 
                                    alt={result.title} 
                                    className="w-10 h-14 object-cover rounded"
                                />
                            ) : (
                                <div className="w-10 h-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                    No Img
                                </div>
                            )}
                            <div className="flex flex-col text-left">
                                <span className="font-medium text-sm truncate">{result.title}</span>
                                <span className="text-xs text-muted-foreground">
                                    {result.release_date ? result.release_date.split('-')[0] : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <Button onClick={handleManualSearch} className='rounded-l-none'>
          Search
        </Button>
      </div>
      <div>
        {loading && (
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='animate-spin h-12 w-12' />
          </div>
        )}
        {movie && <XMovieCard movieDetail={movie} />}
      </div>
    </div>
  );
};
