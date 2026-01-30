import { useEffect, useState } from 'react';
import { Download, Film, Tag, Trash2, Loader2, Flag } from 'lucide-react';
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
import type { MovieUploadInfo } from '@/store/useMovieProcessorStore';
import { cn } from '@/lib/utils';

export const FileProcessingStatus = {
  All: 'all',
  Success: 'success',
  Failed: 'failed',
  InDb: 'inDb',
} as const;

export type FileProcessingStatusType =
  (typeof FileProcessingStatus)[keyof typeof FileProcessingStatus];

type StatusCount = {
  all: number;
  success: number;
  failed: number;
  inDb: number;
};

interface FileProcessingHeaderProps {
  onChangeStatus: (status: FileProcessingStatusType) => void;
}

export const isMovieInStatus = (
  status: FileProcessingStatusType,
  movie: MovieUploadInfo,
): boolean => {
  if (status === FileProcessingStatus.All) return true;
  if (status === FileProcessingStatus.InDb && movie.inDb === true) return true;
  if (
    status === FileProcessingStatus.Success &&
    !movie.inDb &&
    movie.detail != undefined
  )
    return true;
  if (
    status === FileProcessingStatus.Failed &&
    !movie.inDb &&
    movie.error != undefined
  )
    return true;
  return false;
};

export const FileProcessingHeader = ({
  onChangeStatus,
}: FileProcessingHeaderProps) => {
  const { open } = useCategoryDialog();
  const { categories, getCategory } = useMovieLibrary();
  const { movies, processFiles, clear, isProcessing, isCompleted } =
    useMovieProcessor();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusCount, setStatusCount] = useState<StatusCount>({
    all: 0,
    success: 0,
    failed: 0,
    inDb: 0,
  });

  useEffect(() => {
    const loadStatusCount = async () => {
      const all = movies.length;
      const success = movies.filter((m) =>
        isMovieInStatus(FileProcessingStatus.Success, m),
      ).length;
      const failed = movies.filter((m) =>
        isMovieInStatus(FileProcessingStatus.Failed, m),
      ).length;
      const inDb = movies.filter((m) =>
        isMovieInStatus(FileProcessingStatus.InDb, m),
      ).length;
      setStatusCount({
        all,
        success,
        failed,
        inDb,
      });
    };
    void loadStatusCount();
  }, [movies]);

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
        <Button
          variant='ghost'
          onClick={() => onChangeStatus(FileProcessingStatus.All)}>
          <Film className='w-4 h-4 text-primary' />
          <span className='hidden sm:inline'>File & Movie Details</span>
          <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs'>
            {movies.length}
          </span>
        </Button>
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
        {isCompleted && (
          <div className='flex items-center gap-2'>
            {statusCount.success + statusCount.failed + statusCount.inDb !==
              statusCount.all && (
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => onChangeStatus(FileProcessingStatus.All)}
                title={`All Count: ${statusCount.all}`}>
                <Flag
                  className={cn('w-4 h-4', 'text-gray-600 hover:text-gray-600')}
                />
              </Button>
            )}
            {statusCount.success > 0 && (
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => onChangeStatus(FileProcessingStatus.Success)}
                title={`Success Count: ${statusCount.success}`}>
                <Flag
                  className={cn(
                    'w-4 h-4',
                    'text-green-600 hover:text-green-600 hover:bg-green-100',
                  )}
                />
              </Button>
            )}
            {statusCount.failed > 0 && (
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => onChangeStatus(FileProcessingStatus.Failed)}
                title={`Failed Count: ${statusCount.failed}`}>
                <Flag
                  className={cn(
                    'w-4 h-4',
                    'text-red-600 hover:text-red-600 hover:bg-red-100',
                  )}
                />
              </Button>
            )}
            {statusCount.inDb > 0 && (
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => onChangeStatus(FileProcessingStatus.InDb)}
                title={`Already Exists Count: ${statusCount.inDb}`}>
                <Flag
                  className={cn(
                    'w-4 h-4',
                    'text-blue-600 hover:text-blue-600 hover:bg-blue-100',
                  )}
                />
              </Button>
            )}
          </div>
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
