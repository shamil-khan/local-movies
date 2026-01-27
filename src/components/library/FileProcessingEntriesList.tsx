import { Film, Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMovieProcessor } from '@/hooks/useMovieProcessor';
import type { MovieUploadInfo } from '@/store/useMovieProcessorStore';

export const FileProcessingEntriesList = () => {
  const { movies, removeFile } = useMovieProcessor();

  const getTooltipFlagStyle = (movie: MovieUploadInfo) => {
    return movie.inDb === undefined
      ? 'text-gray-600 hover:text-gray-600 hover:bg-gray-100'
      : movie.inDb === true
        ? 'text-blue-600 hover:text-blue-600 hover:bg-blue-100'
        : movie.detail
          ? 'text-green-600 hover:text-green-600 hover:bg-green-100'
          : 'text-red-600 hover:text-red-600 hover:bg-red-100';
  };

  const getTooltipContent = (
    movie: MovieUploadInfo,
  ): { message: string; detail: string } => {
    if (!movie.isProcessed) {
      return {
        message: 'The file has not been processed yet.',
        detail: '',
      };
    }

    if (movie.inDb) {
      return {
        message: `The movie already exists in library ${movie.poster ? 'with poster.' : 'but has no poster.'}`,
        detail: JSON.stringify(movie.detail, null, 2),
      };
    }

    if (movie.detail) {
      return {
        message: `The movie detailed has been downloaded ${movie.poster ? 'with poster.' : 'but has no poster.'}`,
        detail: `${movie.error ? JSON.stringify(movie.detail, null, 2) : ''}${JSON.stringify(movie.detail, null, 2)}`,
      };
    }

    if (movie.error) {
      return {
        message: movie.error?.message,
        detail: JSON.stringify(movie.error?.detail, null, 2),
      };
    }

    return {
      message: 'Unknown state',
      detail: 'No more information is available',
    };
  };

  return (
    <div className='px-3 pb-3 space-y-1'>
      {movies.map((movie, index) => {
        const movieTitle = `${movie.file.title}${movie.file.year ? ` (${movie.file.year})` : ''}`;
        const movieFileName = movie.file.fileName;
        const headingClass = 'text-sm font-semibold text-foreground';
        const detailClass = 'text-xs text-muted-foreground truncate';
        const tooltip = getTooltipContent(movie);

        return (
          <div
            key={`${movie.file.title}-${index}`}
            className='group flex items-center justify-between py-1.5'>
            <div className='flex items-center gap-3 overflow-hidden'>
              <div className='shrink-0 w-7 h-7 flex items-center justify-center overflow-hidden'>
                {movie.poster ? (
                  <img
                    // src='/generic-movie-poster.svg'
                    src={URL.createObjectURL(movie.poster)}
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
                      className={`w-4 h-4 flex items-center justify-center  ${getTooltipFlagStyle(
                        movie,
                      )}`}>
                      <Flag />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className='max-w-xs'>
                      <p className='text-xs font-semibold mb-1'>
                        {tooltip.message}
                      </p>
                      {tooltip.detail && (
                        <pre className='whitespace-pre-wrap text-[10px]'>
                          {tooltip.detail}
                        </pre>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {!movie.isProcessed && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
                  onClick={() => removeFile(movie.file)}
                  title='Remove from list'>
                  <X className='w-4 h-4' />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
