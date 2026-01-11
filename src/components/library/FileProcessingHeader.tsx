import { Button } from '@/components/ui/button';
import { Download, Film, Trash2, X } from 'lucide-react';

interface FileProcessingHeaderProps {
  totalItems: number;
  onClearAll: () => void;
  onClose: () => void;
  onProcessTitles: () => void;
  processDisabled: boolean;
}

export const FileProcessingHeader = ({
  totalItems,
  onClearAll,
  onClose,
  onProcessTitles,
  processDisabled,
}: FileProcessingHeaderProps) => {
  return (
    <div className='flex items-center justify-between p-3 border-b border-border bg-muted/30'>
      <div className='flex items-center gap-2 text-sm font-medium'>
        <Film className='w-4 h-4 text-primary' />
        <span>File &amp; Movie Details</span>
        <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs'>
          {totalItems}
        </span>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={onProcessTitles}
          disabled={processDisabled}
          title='Download movie info with poster'>
          <Download className='w-4 h-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={onClearAll}
          disabled={totalItems === 0}
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
