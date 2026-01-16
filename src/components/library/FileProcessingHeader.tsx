import { Button } from '@/components/ui/button';
import { Download, Film, Trash2, X } from 'lucide-react';

interface FileProcessingHeaderProps {
  moviesCount: number;
  onClearAll: () => void;
  onClose: () => void;
  onProcessMovies: () => void;
  processDisabled: boolean;
}

export const FileProcessingHeader = ({
  moviesCount,
  onClearAll,
  onClose,
  onProcessMovies,
  processDisabled,
}: FileProcessingHeaderProps) => {
  return (
    <div className='flex items-center justify-between p-3 border-b border-border bg-muted/30'>
      <div className='flex items-center gap-2 text-sm font-medium'>
        <Film className='w-4 h-4 text-primary' />
        <span>File &amp; Movie Details</span>
        <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs'>
          {moviesCount}
        </span>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={onProcessMovies}
          disabled={processDisabled}
          title='Download movies details with their poster'>
          <Download className='w-4 h-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={onClearAll}
          disabled={moviesCount === 0}
          title='Remove all titles'>
          <Trash2 className='w-4 h-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={onClose}
          title='Close'>
          <X className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
};
