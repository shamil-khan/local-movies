import { CompactFolderUpload } from '@/components/CompactFolderUpload';
import { FileProcessingPanel } from '@/components/library/FileProcessingPanel';
import { LibraryDeleteDialog } from '@/components/library/LibraryDeleteDialog';
import { useState } from 'react';

export const LibraryHeader = () => {
  //const [showFilters, setShowFilters] = useState(false);
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
          {/* <LibraryFilterToggleGroup
            filters={filters}
            onFilterChange={onFilterChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          /> */}
          <LibraryDeleteDialog />
        </div>
      </div>
      {/* 
      {showFilters && (
        <LibraryFilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          availableCategories={availableCategories}
          onClearFilters={clearFilters}
          onReloadCategories={onReloadCategories}
        />
      )}
 */}
      <FileProcessingPanel fileNames={uploadedFileNames} />
    </div>
  );
};
