import { Button } from '@/components/ui/button';
import { useMovieProcessor } from '@/hooks/useMovieProcessor';
import { useCategoryDialog } from '@/hooks/useCategoryDialog';

import { Download, Film, Tag, Trash2, X, Loader2 } from 'lucide-react';
import { MultiSelect } from '../ui/multi-select';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import {
  SYSTEM_CATEGORY_SEARCHED,
  SYSTEM_CATEGORY_UPLOADED,
} from '@/services/MovieDbService';

interface FileProcessingHeaderProps {
  onClose: () => void;
}

export const FileProcessingHeader = ({
  onClose,
}: FileProcessingHeaderProps) => {
  const { open } = useCategoryDialog();
  const { categories } = useMovieLibrary();
  const {
    movies,
    process,
    clear,
    categoryIds,
    setCategoryIds,
    isProcessing,
    isComplete,
  } = useMovieProcessor();

  const userCategories = categories.filter(
    (c) =>
      c.name !== SYSTEM_CATEGORY_SEARCHED &&
      c.name !== SYSTEM_CATEGORY_UPLOADED,
  );

  return (
    <div className='flex items-center justify-between p-2 border-b border-border bg-muted/30 flex-wrap gap-y-1'>
      <div className='flex items-center gap-2 text-sm font-medium'>
        <Film className='w-4 h-4 text-primary' />
        <span className='hidden sm:inline'>File & Movie Details</span>
        <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs'>
          {movies.length}
        </span>
      </div>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          className='bg-white/50 hover:bg-white/100'
          onClick={() => open()}>
          <Tag className='w-4 h-4 text-muted-foreground' />
          <span className='hidden sm:inline text-xs font-medium text-muted-foreground'>
            Categories
          </span>
        </Button>
        <MultiSelect
          className='w-32 sm:w-48'
          options={userCategories.map((c) => ({
            label: c.name,
            value: c.id.toString(),
          }))}
          selected={(categoryIds || []).map((id) => id.toString())}
          onChange={(val) =>
            setCategoryIds(
              val.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v)),
            )
          }
          placeholder='Category'
        />
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={process}
          disabled={movies.length === 0 || isProcessing || isComplete}
          title={
            isComplete
              ? 'Processing complete'
              : 'Download movies details with their poster'
          }>
          {isProcessing ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Download className='w-4 h-4' />
          )}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={clear}
          disabled={movies.length === 0}
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
