import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileProcessingHeader } from '@/components/library/FileProcessingHeader';
import { FileProcessingCategoryBar } from '@/components/library/FileProcessingCategoryBar';
import { useFileProcessingPanelStore } from '@/store/useFileProcessingPanelStore';
import { useMovieProcessor } from '@/hooks/library/useMovieProcessor';
import { FileProcessingEntriesList } from '@/components/library/FileProcessingEntriesList';

interface FileProcessingPanelProps {
  fileNames: string[];
}

export const FileProcessingPanel = ({
  fileNames,
}: FileProcessingPanelProps) => {
  const hasSynced = useRef(false);
  const { panelVisible, closePanel, togglePanel } =
    useFileProcessingPanelStore();

  const { movies, load } = useMovieProcessor();

  useEffect(() => {
    load(fileNames);
  }, [fileNames, load]);

  useEffect(() => {
    if (!panelVisible) {
      togglePanel();
    }
    hasSynced.current = true;

    // Auto-close when all items are gone.
  }, [panelVisible, togglePanel]);

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
