import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileProcessingHeader } from '@/components/library/FileProcessingHeader';
import { FileProcessingCategoryBar } from '@/components/library/FileProcessingCategoryBar';
import { useFileProcessingPanelStore } from '@/store/useFileProcessingPanelStore';
import { useUploadFolder } from '@/hooks/library/useUploadFolder';
import { FileProcessingEntriesList } from '@/components/library/FileProcessingEntriesList';
import { type MovieUploadInfo } from '@/models/MovieModel';

interface FileProcessingPanelProps {
  fileNames: string[];
}

export const FileProcessingPanel = ({
  fileNames,
}: FileProcessingPanelProps) => {
  const categoryIds = useFileProcessingPanelStore((s) => s.categoryIds);
  const setCategoryIds = useFileProcessingPanelStore((s) => s.setCategoryIds);

  const [uploadedMovies, setUploadedMovies] = useState<MovieUploadInfo[]>([]);

  const { handleProcessMovies, handleRemoveFileName, resetState } =
    useUploadFolder({
      fileNames,
      categoryIds,
      onMoviesUpdated: (movies) => setUploadedMovies(movies),
    });

  const showPanel = useFileProcessingPanelStore((s) => s.showPanel);
  const setShowPanel = useFileProcessingPanelStore((s) => s.setShowPanel);
  const toggleShowPanel = useFileProcessingPanelStore((s) => s.toggleShowPanel);

  const prevTotalRef = useRef(0);

  // const handleFolderUpload = (files: string[]) => {
  //   resetState();
  //   if (fileNames && fileNames.length > 0) {
  //     setSelectedFiles(files);
  //   }
  // };

  useEffect(() => {
    // Auto-open when items appear (0 -> n), but don't override a user's manual close.
    if (!showPanel) {
      setShowPanel(true);
    }

    // Auto-close when all items are gone.
    if (fileNames.length === 0 && showPanel) {
      setShowPanel(false);
    }

    prevTotalRef.current = fileNames.length;
  }, [fileNames, showPanel, setShowPanel]);

  return (
    <div className='flex flex-col items-start gap-2 w-full'>
      <Button
        variant='link'
        className='p-0 h-auto text-sm text-muted-foreground hover:text-primary'
        onClick={() => toggleShowPanel()}>
        {showPanel ? 'Cover Details' : 'Uncover Details'} (
        {uploadedMovies.length})
      </Button>

      {showPanel && (
        <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-1 animate-in fade-in slide-in-from-top-2 duration-200'>
          <FileProcessingHeader
            moviesCount={uploadedMovies.length}
            onClearAll={resetState}
            onClose={() => setShowPanel(false)}
            onProcessMovies={handleProcessMovies}
            processDisabled={uploadedMovies.length === 0}
          />

          <div className='max-h-80 overflow-y-auto'>
            {uploadedMovies.length !== 0 && (
              <FileProcessingCategoryBar
                selectedCategoryIds={categoryIds}
                onSelectedCategoryIdsChange={setCategoryIds}
              />
            )}

            <FileProcessingEntriesList
              movies={uploadedMovies}
              onRemoveFileName={handleRemoveFileName}
            />
          </div>
        </div>
      )}
    </div>
  );
};
