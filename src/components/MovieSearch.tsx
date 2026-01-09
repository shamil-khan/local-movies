import { useState, useEffect } from 'react';
import { movieDbService } from '@/services/MovieDbService';
import { movieApiService } from '@/services/MovieApiService';
import { tmdbApiService } from '@/services/TmdbApiService';
import { type MovieDetail } from '@/models/MovieModel';
import { XMovieCard } from '@/components/XMovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ListFilter, X, Heart, Eye } from 'lucide-react';
import { logger } from '@/core/logger';
import { toast } from 'sonner';
import { type XFile } from '@/components/mine/xfileinput';
import { CompactFolderUpload } from '@/components/CompactFolderUpload';
import { MultiSelect } from '@/components/ui/multi-select';
import { UploadedFilesPanel } from '@/components/UploadedFilesPanel';
import { ExtractedTitlesPanel } from '@/components/ExtractedTitlesPanel';
import { type ExtractedTitle } from '@/App';
import { Check, AlertCircle, Trash2, AlertOctagon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

interface FilterCriteria {
  query: string;
  genre: string[];
  year: string[];
  rating: string[];
  rated: string[];
  language: string[];
  country: string[];
  isFavorite: boolean;
  isWatched: boolean;
}

interface MovieSearchProps {
  onMovieAdded: () => void;
  onFolderUpload?: (files: XFile[]) => void;
  onRemoveFile?: (file: XFile) => void;
  onLoad?: () => void;
  selectedFiles?: XFile[];
  extractedTitles?: ExtractedTitle[];
  onRemoveTitle?: (title: ExtractedTitle) => void;
  onProcessTitles?: () => void;
  successTitles?: ExtractedTitle[];
  failedTitles?: ExtractedTitle[];
  onRemoveSuccessTitle?: (title: ExtractedTitle) => void;
  onRemoveFailedTitle?: (title: ExtractedTitle) => void;
  folderLoading?: boolean;
  folderError?: string | null;
  onClearLibrary?: () => void;
  onFilterChange: (filters: FilterCriteria) => void;
  filters: FilterCriteria;
  availableGenres: string[];
  availableYears: string[];
  availableRated: string[];
  availableRatings: string[];
  availableLanguages: string[];
  availableCountries: string[];
}

export const MovieSearch = ({
  onMovieAdded,
  onFolderUpload,
  onRemoveFile,
  onLoad,
  selectedFiles = [],
  extractedTitles = [],
  onRemoveTitle,
  onProcessTitles,
  successTitles = [],
  failedTitles = [],
  onRemoveSuccessTitle,
  onRemoveFailedTitle,
  folderLoading = false,
  folderError,
  onClearLibrary,
  onFilterChange,
  filters,
  availableGenres,
  availableYears,
  availableRated,
  availableRatings,
  availableLanguages,
  availableCountries,
}: MovieSearchProps) => {
  const [title, setTitle] = useState('');
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    import('@/services/TmdbApiService').TmdbMovieResult[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [showTitlesPanel, setShowTitlesPanel] = useState(false);
  const [showSuccessPanel, setShowSuccessPanel] = useState(false);
  const [showFailedPanel, setShowFailedPanel] = useState(false);

  // Auto-open panels when items arrive
  useEffect(() => {
    if (successTitles.length > 0) setShowSuccessPanel(true);
  }, [successTitles.length]);

  useEffect(() => {
    if (failedTitles.length > 0) setShowFailedPanel(true);
  }, [failedTitles.length]);

  // Debounced search effect
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      // Always update filter
      onFilterChange({ ...filters, query: title });

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

  const handleSelectMovie = async (
    tmdbMovie: import('@/services/TmdbApiService').TmdbMovieResult,
  ) => {
    logger.info(`Selected movie: ${tmdbMovie.title} (${tmdbMovie.id})`);
    setShowDropdown(false);
    setTitle(tmdbMovie.title); // Update input for feedback

    try {
      setLoading(true);
      setMovie(null);

      // 1. Get IMDb ID
      const imdbId = await tmdbApiService.getExternalIds(tmdbMovie.id);

      if (!imdbId) {
        logger.warn(
          'No IMDb ID found for this movie. Trying title fallback (risky but better than nothing).',
        );
        toast.error('Could not find detailed information for this movie.');
        return;
      }

      logger.info(`Found IMDb ID: ${imdbId}. Fetching details...`);

      // 2. Fetch from OMDb
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

  const handleFilterChange = (
    key: keyof FilterCriteria,
    value: string | string[] | boolean,
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setTitle('');
    onFilterChange({
      query: '',
      genre: [],
      year: [],
      rating: [],
      rated: [],
      language: [],
      country: [],
      isFavorite: false,
      isWatched: false,
    });
  };

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full items-center justify-between gap-2 relative z-20'>
        {onFolderUpload && (
          <div className='flex flex-col gap-2'>
            <CompactFolderUpload
              onUpload={onFolderUpload}
              onLoad={onLoad}
              selectedFiles={selectedFiles}
              loading={folderLoading}
              error={folderError}
            />
          </div>
        )}

        <div className='flex-1 relative'>
          <Input
            type='text'
            placeholder='Search Movie Title...'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className={filters.isFavorite ? 'bg-red-100 text-red-500' : ''}
            onClick={() =>
              handleFilterChange('isFavorite', !filters.isFavorite)
            }
            title='Show Favorites Only'>
            <Heart
              className={`h-5 w-5 ${filters.isFavorite ? 'fill-current' : ''}`}
            />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className={filters.isWatched ? 'bg-blue-100 text-blue-500' : ''}
            onClick={() => handleFilterChange('isWatched', !filters.isWatched)}
            title='Show Watched Only'>
            <Eye
              className={`h-5 w-5 ${filters.isWatched ? 'fill-current' : ''}`}
            />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className={showFilters ? 'bg-accent' : ''}
            onClick={() => setShowFilters(!showFilters)}>
            <ListFilter className='h-5 w-5' />
          </Button>

          {onClearLibrary && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive hover:bg-destructive/10'
                  title='Delete Library'>
                  <Trash2 className='h-5 w-5' />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertOctagon className="h-5 w-5" /> Delete Library?
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently delete ALL movies, files, and posters from your local database.
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={onClearLibrary}>Delete</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className='grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-accent/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200'>
          <MultiSelect
            options={availableGenres.map((g) => ({ label: g, value: g }))}
            selected={filters.genre}
            onChange={(val) => handleFilterChange('genre', val)}
            placeholder='Genre'
          />
          <MultiSelect
            options={availableYears.map((y) => ({ label: y, value: y }))}
            selected={filters.year}
            onChange={(val) => handleFilterChange('year', val)}
            placeholder='Year'
          />
          <MultiSelect
            options={availableRatings.map((r) => ({ label: r, value: r }))}
            selected={filters.rating}
            onChange={(val) => handleFilterChange('rating', val)}
            placeholder='Rating'
          />
          <MultiSelect
            options={availableRated.map((r) => ({ label: r, value: r }))}
            selected={filters.rated}
            onChange={(val) => handleFilterChange('rated', val)}
            placeholder='Rated'
          />
          <MultiSelect
            options={availableLanguages.map((l) => ({ label: l, value: l }))}
            selected={filters.language}
            onChange={(val) => handleFilterChange('language', val)}
            placeholder='Language'
          />
          <MultiSelect
            options={availableCountries.map((c) => ({ label: c, value: c }))}
            selected={filters.country}
            onChange={(val) => handleFilterChange('country', val)}
            placeholder='Country'
          />

          <Button
            variant='ghost'
            onClick={clearFilters}
            className='text-red-500 hover:text-red-700 hover:bg-red-100 col-span-1 md:col-span-6 justify-self-end'>
            Browse All <X className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Uploaded Files Message & Panel */}
      {/* Uploaded Files & Extracted Titles Section */}
      {(selectedFiles.length > 0 || extractedTitles.length > 0) && (
        <div className='flex flex-col items-start gap-2'>
          <div className='flex items-center gap-4'>
            {selectedFiles.length > 0 && (
              <Button
                variant='link'
                className='p-0 h-auto text-sm text-muted-foreground hover:text-primary'
                onClick={() => setShowFilesPanel(!showFilesPanel)}>
                {showFilesPanel ? 'Hide' : 'Show'} uploaded {selectedFiles.length}{' '}
                files
              </Button>
            )}
            {extractedTitles.length > 0 && (
              <Button
                variant='link'
                className='p-0 h-auto text-sm text-green-600 hover:text-green-700'
                onClick={() => setShowTitlesPanel(!showTitlesPanel)}>
                {showTitlesPanel ? 'Hide' : 'Show'} Found {extractedTitles.length}{' '}
                Titles
              </Button>
            )}
            {successTitles.length > 0 && (
              <Button
                variant='link'
                className='p-0 h-auto text-sm text-green-700 hover:text-green-800'
                onClick={() => setShowSuccessPanel(!showSuccessPanel)}>
                {showSuccessPanel ? 'Hide' : 'Show'} Successfully downloaded {successTitles.length}{' '}
                titles
              </Button>
            )}
            {failedTitles.length > 0 && (
              <Button
                variant='link'
                className='p-0 h-auto text-sm text-red-600 hover:text-red-700'
                onClick={() => setShowFailedPanel(!showFailedPanel)}>
                {showFailedPanel ? 'Hide' : 'Show'} Failed to download info for {failedTitles.length}{' '}
                titles
              </Button>
            )}
          </div>

          {showFilesPanel && onRemoveFile && (
            <UploadedFilesPanel
              files={selectedFiles}
              onRemove={onRemoveFile}
              onClose={() => setShowFilesPanel(false)}
            />
          )}

          {showTitlesPanel && onRemoveTitle && onProcessTitles && (
            <ExtractedTitlesPanel
              titles={extractedTitles}
              onRemove={onRemoveTitle}
              onProcess={onProcessTitles}
              onClose={() => setShowTitlesPanel(false)}
              processing={folderLoading}
            />
          )}

          {showSuccessPanel && onRemoveSuccessTitle && (
            <ExtractedTitlesPanel
              titles={successTitles}
              onRemove={onRemoveSuccessTitle}
              onClose={() => setShowSuccessPanel(false)}
              panelTitle="Successfully Downloaded"
              panelIcon={<Check className='w-4 h-4' />}
              headerColor="text-green-700"
              badgeColor="bg-green-100 text-green-700"
            />
          )}

          {showFailedPanel && onRemoveFailedTitle && (
            <ExtractedTitlesPanel
              titles={failedTitles}
              onRemove={onRemoveFailedTitle}
              onClose={() => setShowFailedPanel(false)}
              panelTitle="Failed Downloads"
              panelIcon={<AlertCircle className='w-4 h-4' />}
              headerColor="text-red-600"
              badgeColor="bg-red-100 text-red-600"
            />
          )}
        </div>
      )}

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
