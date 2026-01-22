import { Button } from '@/components/ui/button';
import { Film, Info, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMovieUploadFolderStore } from '@/store/useMovieUploadFolderStore';

export const FileProcessingEntriesList = () => {
  const { context, removeFileName } = useMovieUploadFolderStore();

  const onRemoveFileName = (fileName: string) => {
    removeFileName(fileName);
  };

  return (
    <div className='px-3 pb-3 space-y-1'>
      {context.movies.map((movie, index) => {
        const movieTitle = `${movie.file.title}${movie.file.year ? ` (${movie.file.year})` : ''}`;
        const movieFileName = movie.file.fileName;
        const headingClass = 'text-sm font-semibold text-foreground';
        const detailClass = 'text-xs text-muted-foreground truncate';

        const iconWrapperClass = movie.error
          ? 'flex-shrink-0 w-7 h-7 rounded bg-green-100 flex items-center justify-center text-green-700 overflow-hidden'
          : 'flex-shrink-0 w-7 h-7 rounded bg-red-100 flex items-center justify-center text-red-700 overflow-hidden';

        return (
          <div
            key={`${movie.file.fileName}-${index}`}
            className='group flex items-center justify-between py-1.5'>
            <div className='flex items-center gap-3 overflow-hidden'>
              <div className={iconWrapperClass}>
                {movie.poster ? (
                  <img
                    src={URL.createObjectURL(movie.poster.blob)}
                    alt={movie.file.title}
                    className='w-full h-full object-cover rounded'
                  />
                ) : (
                  <Film className='w-3 h-3' />
                )}
              </div>
              <div className='flex flex-col overflow-hidden items-start text-left'>
                <span className={`truncate ${headingClass}`}>{movieTitle}</span>
                {movieFileName && (
                  <span className={detailClass}>{movieFileName}</span>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        movie.error
                          ? 'bg-red-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                      <Info className='w-2.5 h-2.5' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className='max-w-xs'>
                      {!movie.poster && (
                        <p className='text-xs font-semibold mb-1'>
                          Poster is not available
                        </p>
                      )}
                      {movie.detail && (
                        <pre className='whitespace-pre-wrap text-[10px]'>
                          {JSON.stringify(movie.detail, null, 2)}
                        </pre>
                      )}
                      {movie.error && (
                        <>
                          <span className='text-xs'>
                            {movie.error.message ||
                              'Failed to load movie details'}
                          </span>
                          {movie.error.detail && (
                            <pre className='whitespace-pre-wrap text-[10px]'>
                              {JSON.stringify(movie.error.detail, null, 2)}
                            </pre>
                          )}
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
                onClick={() => onRemoveFileName(movie.file.fileName)}
                title='Remove from list'>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
