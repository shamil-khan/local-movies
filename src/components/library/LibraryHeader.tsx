import { CompactFolderUpload } from '@/components/CompactFolderUpload';
import { FileProcessingPanel } from '@/components/library/FileProcessingPanel';
import { LibraryDeleteDialog } from '@/components/library/LibraryDeleteDialog';
import { useState } from 'react';
import { LibrarySearchBar } from './LibrarySearchBar';
import { LibraryFilterBar } from './LibraryFilterBar';
import { LibraryFilterToggleGroup } from './LibraryFilterToggleGroup';

export const LibraryHeader = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);

  return (
    <div className='p-4 space-y-4'>
      <div className='flex w-full items-center flex-col sm:flex-row gap-4 sm:gap-2 relative z-20'>
        <div className='w-full sm:flex-1'>
          <LibrarySearchBar />
        </div>

        <div className='flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto'>
          <CompactFolderUpload
            onUploaded={(fileNames) => setUploadedFileNames(fileNames)}
            uploadedFileNames={uploadedFileNames}
          />

          <LibraryFilterToggleGroup
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
          <LibraryDeleteDialog />
        </div>
      </div>

      {showFilters && <LibraryFilterBar />}

      <FileProcessingPanel fileNames={uploadedFileNames} />
    </div>
  );
};
