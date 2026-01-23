import { type MovieInfo } from '@/models/MovieModel';
import { Trash2, Heart, Eye, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';

interface MovieCardBottomBarProps {
  movie: MovieInfo;
  onCategoryOpen: () => void;
}

export const MovieCardBottomBar = ({
  movie,
  onCategoryOpen,
}: MovieCardBottomBarProps) => {
  const {
    handleRemoveMovie,
    handleToggleMovieFavorite,
    handleToggleMovieWatched,
  } = useMovieLibrary();

  return (
    <div
      className='absolute bottom-0 left-0 right-0 flex justify-center gap-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-blue-900/80 via-blue-900/60 to-transparent'
      onClick={(e) => e.stopPropagation()}>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 text-white'
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMovieFavorite(movie.imdbID);
              }}>
              <Heart
                className={`w-4 h-4 ${movie.status?.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='text-xs font-medium'>
            <p>{movie.status?.isFavorite ? 'Favorited' : 'Add to Favorites'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 text-white'
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMovieWatched(movie.imdbID);
              }}>
              <Eye
                className={`w-4 h-4 ${movie.status?.isWatched ? 'fill-blue-400 text-blue-400' : 'text-white'}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='text-xs font-medium'>
            <p>{movie.status?.isWatched ? 'Watched' : 'Mark as Watched'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 text-white'
              onClick={(e) => {
                e.stopPropagation();
                onCategoryOpen();
              }}>
              <Tags className='w-4 h-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='text-xs font-medium'>
            <p>Manage Categories</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white'
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(`Are you sure you want to delete "${movie.title}"?`)
                ) {
                  handleRemoveMovie(movie.imdbID);
                }
              }}>
              <Trash2 className='w-4 h-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='text-xs font-medium'>
            <p>Delete from Library</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
