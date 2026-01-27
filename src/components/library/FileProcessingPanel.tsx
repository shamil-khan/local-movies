import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileProcessingHeader } from '@/components/library/FileProcessingHeader';
import { FileProcessingEntriesList } from '@/components/library/FileProcessingEntriesList';
import { useMovieProcessor } from '@/hooks/useMovieProcessor';

interface FileProcessingPanelProps {
  fileNames: string[];
}

export const FileProcessingPanel = ({
  fileNames,
}: FileProcessingPanelProps) => {
  const [panelVisible, setPanelVisible] = useState(false);
  const { movies, loadFiles } = useMovieProcessor();

  useEffect(() => {
    if (fileNames.length > 0) {
      loadFiles(fileNames);
    }
  }, [fileNames]); // Remove 'load' from dependencies to prevent re-execution loop if 'load' isn't stable

  useEffect(() => {
    const revisePanelVisibility = async () => {
      if (movies.length === 0) {
        setPanelVisible(false);
      } else if (movies.length > 0 && !panelVisible) {
        setPanelVisible(true);
      }
    };
    revisePanelVisibility();
  }, [movies.length]);

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

      {movies.length > 0 && panelVisible && (
        <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-1 animate-in fade-in slide-in-from-top-2 duration-200'>
          <FileProcessingHeader />

          <div className='max-h-80 overflow-y-auto'>
            <FileProcessingEntriesList />
          </div>
        </div>
      )}
    </div>
  );
};
