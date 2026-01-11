import { useState } from 'react';
import { CompactFolderUpload } from '@/components/CompactFolderUpload';
import { type XFile } from '@/components/mine/xfileinput';
import { type FilterCriteria, type ExtractedTitle } from '@/models/AppModels';
import { LibrarySearchBar } from './LibrarySearchBar';
import { LibraryFilterBar } from './LibraryFilterBar';
import { FileProcessingStatus } from './FileProcessingStatus';
import { LibraryFilterToggleGroup } from './LibraryFilterToggleGroup';
import { LibraryDeleteDialog } from './LibraryDeleteDialog';

interface LibraryHeaderProps {
  onMovieAdded: () => void;
  onFolderUpload: (files: XFile[]) => void;
  folderLoading: boolean;
  folderError: string | null;
  onClearLibrary: (deleteCategories: boolean) => void | Promise<void>;

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
  onReloadCategories: () => void;

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
  onReloadCategories,
}: LibraryHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full items-center relative z-20'>
        <div className='flex items-center flex-1'>
          <CompactFolderUpload
            onUpload={onFolderUpload}
            loading={folderLoading}
            error={folderError}
            selectedFiles={selectedFiles}
          />

          <div className='flex-1'>
            <LibrarySearchBar
              onMovieAdded={onMovieAdded}
              onQueryChange={(query) => onFilterChange({ ...filters, query })}
              query={filters.query}
            />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <LibraryFilterToggleGroup
            filters={filters}
            onFilterChange={onFilterChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
          <LibraryDeleteDialog onClearLibrary={onClearLibrary} />
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
          onReloadCategories={onReloadCategories}
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
