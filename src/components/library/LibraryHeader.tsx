import { useState } from 'react';
import { CompactFolderUpload } from '@/components/CompactFolderUpload';
import { Button } from '@/components/ui/button';
import { ListFilter, Trash2, Heart, Eye, AlertOctagon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { type XFile } from '@/components/mine/xfileinput';
import { type FilterCriteria, type ExtractedTitle } from '@/models/AppModels';
import { LibrarySearchBar } from './LibrarySearchBar';
import { LibraryFilterBar } from './LibraryFilterBar';
import { FileProcessingStatus } from './FileProcessingStatus';

interface LibraryHeaderProps {
  onMovieAdded: () => void;
  onFolderUpload: (files: XFile[]) => void;
  folderLoading: boolean;
  folderError: string | null;
  onClearLibrary: () => void;

  // Filters
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  clearFilters: () => void;
  availableGenres: string[];
  availableYears: string[];
  availableRated: string[];
  availableRatings: string[];
  availableLanguages: string[];
  availableCountries: string[];
  availableCategories: Array<{ label: string; value: string }>;

  // File Processing
  selectedFiles: XFile[];
  extractedTitles: ExtractedTitle[];
  successTitles: ExtractedTitle[];
  failedTitles: ExtractedTitle[];
  onRemoveFile: (file: XFile) => void;
  onRemoveTitle: (title: ExtractedTitle) => void;
  onRemoveSuccessTitle: (title: ExtractedTitle) => void;
  onRemoveFailedTitle: (title: ExtractedTitle) => void;
  onProcessTitles: (categoryIds?: number[]) => void;
  onClearProcessing: () => void;
}

export const LibraryHeader = ({
  onMovieAdded,
  onFolderUpload,
  folderLoading,
  folderError,
  onClearLibrary,
  filters,
  onFilterChange,
  clearFilters,
  availableGenres,
  availableYears,
  availableRated,
  availableRatings,
  availableLanguages,
  availableCountries,
  availableCategories,
  selectedFiles,
  extractedTitles,
  successTitles,
  failedTitles,
  onRemoveFile,
  onRemoveTitle,
  onRemoveSuccessTitle,
  onRemoveFailedTitle,
  onProcessTitles,
  onClearProcessing,
}: LibraryHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full items-center justify-between gap-2 relative z-20'>
        <div className='flex flex-col gap-2'>
          <CompactFolderUpload
            onUpload={onFolderUpload}
            loading={folderLoading}
            error={folderError}
            selectedFiles={selectedFiles}
          />
        </div>

        <LibrarySearchBar
          onMovieAdded={onMovieAdded}
          onQueryChange={(query) => onFilterChange({ ...filters, query })}
          query={filters.query}
        />

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className={filters.isFavorite ? 'bg-red-100 text-red-500' : ''}
            onClick={() =>
              onFilterChange({ ...filters, isFavorite: !filters.isFavorite })
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
            onClick={() =>
              onFilterChange({ ...filters, isWatched: !filters.isWatched })
            }
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
                <DialogTitle className='flex items-center gap-2 text-destructive'>
                  <AlertOctagon className='h-5 w-5' /> Delete Library?
                </DialogTitle>
                <DialogDescription>
                  This will permanently delete ALL movies, files, and posters
                  from your local database. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className='gap-2 sm:gap-0'>
                <DialogClose asChild>
                  <Button variant='ghost'>Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant='destructive' onClick={onClearLibrary}>
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showFilters && (
        <LibraryFilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          availableGenres={availableGenres}
          availableYears={availableYears}
          availableRated={availableRated}
          availableRatings={availableRatings}
          availableLanguages={availableLanguages}
          availableCountries={availableCountries}
          availableCategories={availableCategories}
          onClearFilters={clearFilters}
        />
      )}

      <FileProcessingStatus
        selectedFiles={selectedFiles}
        extractedTitles={extractedTitles}
        successTitles={successTitles}
        failedTitles={failedTitles}
        loading={folderLoading}
        onRemoveFile={onRemoveFile}
        onRemoveTitle={onRemoveTitle}
        onRemoveSuccessTitle={onRemoveSuccessTitle}
        onRemoveFailedTitle={onRemoveFailedTitle}
        onProcessTitles={onProcessTitles}
        onClearAll={onClearProcessing}
      />
    </div>
  );
};
