import { Button } from '@/components/ui/button';
import { Film, Flag, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMovieProcessor } from '@/hooks/useMovieProcessor';

export const FileProcessingEntriesList = () => {
  const { movies, removeByFileName } = useMovieProcessor();

  return (
    <div className='px-3 pb-3 space-y-1'>
      {movies.map((movie, index) => {
        const movieTitle = `${movie.file.title}${movie.file.year ? ` (${movie.file.year})` : ''}`;
        const movieFileName = movie.file.fileName;
        const headingClass = 'text-sm font-semibold text-foreground';
        const detailClass = 'text-xs text-muted-foreground truncate';
        const notProcessed = !movie.detail && !movie.error;

        // const iconWrapperClass = alreadyExists
        //   ? 'flex-shrink-0 w-7 h-7 rounded  flex items-center justify-center overflow-hidden'
        //   : movie.error
        //     ? 'flex-shrink-0 w-7 h-7 flex items-center justify-center overflow-hidden'
        //     : 'flex-shrink-0 w-7 h-7 rounded bg-red-100 flex items-center justify-center text-red-700 overflow-hidden';

        return (
          <div
            key={`${movie.file.fileName}-${index}`}
            className='group flex items-center justify-between py-1.5'>
            <div className='flex items-center gap-3 overflow-hidden'>
              <div className='flex-shrink-0 w-7 h-7 flex items-center justify-center overflow-hidden'>
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
                      className={`w-4 h-4 flex items-center justify-center  ${
                        notProcessed
                          ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          : movie.error
                            ? 'text-red-600 hover:text-red-600 hover:bg-red-100'
                            : 'text-green-600 hover:text-green-600 hover:bg-green-100'
                      }`}>
                      <Flag />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className='max-w-xs'>
                      {notProcessed && (
                        <p className='text-xs font-semibold mb-1'>
                          Not Processed Yet
                        </p>
                      )}
                      {movie.detail && !movie.poster && (
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
                        <div className='text-xs'>
                          {movie.error.message ||
                            'Failed to load movie details'}

                          {
                            <pre className='whitespace-pre-wrap text-[10px]'>
                              {JSON.stringify(movie.error.detail, null, 2)}
                            </pre>
                          }
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
                onClick={() => removeByFileName(movie.file.fileName)}
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
