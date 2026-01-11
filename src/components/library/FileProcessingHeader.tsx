import { Button } from '@/components/ui/button';
import { Film, X } from 'lucide-react';

interface FileProcessingHeaderProps {
  totalItems: number;
  onClearAll: () => void;
  onClose: () => void;
}

export const FileProcessingHeader = ({
  totalItems,
  onClearAll,
  onClose,
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
          variant='outline'
          size='sm'
          className='h-7 px-2 text-xs'
          onClick={onClearAll}
          disabled={totalItems === 0}>
          Clear
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
