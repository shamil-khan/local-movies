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
  const hasSynced = useRef(false);
  const { panelVisible, closePanel, togglePanel } =
    useFileProcessingPanelStore();

  const { movies } = useUploadFolder({
    fileNames,
  });

  // const handleFolderUpload = (files: string[]) => {
  //   resetState();
  //   if (fileNames && fileNames.length > 0) {
  //     setSelectedFiles(files);
  //   }
  // };

  useEffect(() => {
    if (!panelVisible) {
      togglePanel();
    }
    hasSynced.current = true;

    // Auto-close when all items are gone.
  }, [togglePanel]);

  return (
    <div className='flex flex-col items-start gap-2 w-full'>
      {movies.length > 0 && (
        <Button
          variant='link'
          className='p-0 h-auto text-sm text-muted-foreground hover:text-primary'
          onClick={() => togglePanel()}>
          {panelVisible ? 'Cover Details' : 'Uncover Details'} ({movies.length})
        </Button>
      )}

      {panelVisible && (
        <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-1 animate-in fade-in slide-in-from-top-2 duration-200'>
          <FileProcessingHeader onClose={() => closePanel()} />

          <div className='max-h-80 overflow-y-auto'>
            <FileProcessingCategoryBar />
            <FileProcessingEntriesList />
          </div>
        </div>
      )}
    </div>
  );
};
