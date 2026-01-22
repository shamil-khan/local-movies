import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileProcessingHeader } from '@/components/library/FileProcessingHeader';
import { FileProcessingCategoryBar } from '@/components/library/FileProcessingCategoryBar';
import { useMovieProcessor } from '@/hooks/library/useMovieProcessor';
import { FileProcessingEntriesList } from '@/components/library/FileProcessingEntriesList';

interface FileProcessingPanelProps {
  fileNames: string[];
}

export const FileProcessingPanel = ({
  fileNames,
}: FileProcessingPanelProps) => {
  const hasSynced = useRef(false);

  const [panelVisible, setPanelVisible] = useState(false);

  const { movies, load } = useMovieProcessor();

  useEffect(() => {
    load(fileNames);
  }, [fileNames, load]);

  useEffect(() => {
    const revisePanelVisibility = async () => {
      if (movies.length === 0) {
        setPanelVisible(false);
      } else if (movies.length > 0 && !panelVisible) {
        setPanelVisible(true);
      }
    };
    revisePanelVisibility();
  }, [load]);

  return (
    <div className='flex flex-col items-start gap-2 w-full'>
      {movies.length > 0 && (
        <Button
          variant='link'
          className='p-0 h-auto text-sm text-muted-foreground hover:text-primary'
          onClick={() => setPanelVisible(!panelVisible)}>
          {panelVisible ? 'Cover Details' : 'Uncover Details'} ({movies.length})
        </Button>
      )}

      {panelVisible && (
        <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-1 animate-in fade-in slide-in-from-top-2 duration-200'>
          <FileProcessingHeader onClose={() => setPanelVisible(false)} />

          <div className='max-h-80 overflow-y-auto'>
            <FileProcessingCategoryBar />
            <FileProcessingEntriesList />
          </div>
        </div>
      )}
    </div>
  );
};
