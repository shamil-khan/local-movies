import { useState } from 'react';
import { CompactFolderUpload } from '@/components/CompactFolderUpload';
import { type MovieFilterCriteria } from '@/models/MovieModel';
// import { LibrarySearchBar } from '@/components/library/LibrarySearchBar';
import { LibraryFilterBar } from '@/components/library/LibraryFilterBar';
import { FileProcessingPanel } from '@/components/library/FileProcessingPanel';
import { LibraryFilterToggleGroup } from '@/components/library/LibraryFilterToggleGroup';
import { LibraryDeleteDialog } from '@/components/library/LibraryDeleteDialog';

interface LibraryHeaderProps {
  onMovieAdded: () => void;
  onClearLibrary: (deleteCategories: boolean) => void | Promise<void>;

  // Filters
  filters: MovieFilterCriteria;
  onFilterChange: (filters: MovieFilterCriteria) => void;
  clearFilters: () => void;
  availableGenres: string[];
  availableYears: string[];
  availableRated: string[];
  availableRatings: string[];
  availableLanguages: string[];
  availableCountries: string[];
  availableCategories: Array<{ label: string; value: string }>;
  onReloadCategories: () => void;
}

export const LibraryHeader = ({
  onMovieAdded,
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
  onReloadCategories,
}: LibraryHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full items-center relative z-20'>
        <div className='flex items-center flex-1'>
          <CompactFolderUpload
            onUploaded={(fileNames) => setUploadedFileNames(fileNames)}
            uploadedFileNames={uploadedFileNames}
          />

          <div className='flex-1'>
            {/* <LibrarySearchBar
              onMovieAdded={onMovieAdded}
              onQueryChange={(query) => onFilterChange({ ...filters, query })}
              query={filters.query}
            /> */}
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

      <FileProcessingPanel fileNames={uploadedFileNames} />
    </div>
  );
};
