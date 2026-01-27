import { useState } from 'react';
import { Download, Film, Tag, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import type { Category } from '@/models/MovieModel';
import {
  SYSTEM_CATEGORY_SEARCHED,
  SYSTEM_CATEGORY_UPLOADED,
} from '@/services/MovieDbService';
import { useCategoryDialog } from '@/hooks/useCategoryDialog';
import { useMovieProcessor } from '@/hooks/useMovieProcessor';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import logger from '@/core/logger';

export const FileProcessingHeader = () => {
  const { open } = useCategoryDialog();
  const { categories, getCategory } = useMovieLibrary();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { movies, processFiles, clear, isProcessing, isCompleted } =
    useMovieProcessor();

  const userCategories = categories.filter(
    (c) =>
      c.name !== SYSTEM_CATEGORY_SEARCHED &&
      c.name !== SYSTEM_CATEGORY_UPLOADED,
  );

  const onProcessMovies = async () => {
    const uploaded = getCategory(SYSTEM_CATEGORY_UPLOADED);
    const all = new Set<Category | undefined>();
    all.add(uploaded);

    selectedCategories.forEach((c: string) => {
      const id = parseInt(c, 10);
      all.add(categories.find((c) => c.id === id));
    });
    const final = Array.from(all).filter(Boolean) as Category[];
    await processFiles(final);
  };

  const onClose = () => {
    setSelectedCategories([]);
    clear();
    logger.info('Remove all files and close.');
  };

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
          className='bg-white/50 hover:bg-white'
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
          selected={selectedCategories}
          onChange={setSelectedCategories}
          placeholder='Category'
        />
      </div>
      <div className='flex items-center gap-2'>
        {!isCompleted && (
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={onProcessMovies}
            disabled={isProcessing}
            title={`Click to process file${movies.length === 1 ? '.' : 's.'}`}>
            {isProcessing ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Download className='w-4 h-4' />
            )}
          </Button>
        )}
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={onClose}
          title='Remove all files and close'>
          <Trash2 className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
};
