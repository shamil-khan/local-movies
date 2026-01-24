import { type MovieInfo } from '@/models/MovieModel';
import { Trash2, Heart, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import { ActionTooltip } from './ActionTooltip';
import { cn } from '@/lib/utils';

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
      className={cn(
        'z-20 transition-all duration-500 ease-out',
        /* MOBILE: Light Scrim, expands card vertically, permanent visibility */
        'relative w-full py-2.5 px-3 bg-white/60 border-t border-zinc-200',
        /* DESKTOP (sm): Floating White Glass Island, only appears on hover */
        'sm:absolute sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[92%]',
        'sm:rounded-2xl sm:border sm:border-zinc-100 sm:bg-white/50 sm:backdrop-blur-md',
        'sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-0',
      )}
      onClick={(e) => e.stopPropagation()}>
      {/* Desktop Shimmer Line (Subtle gray shimmer for light theme) */}
      <div className='hidden sm:block absolute top-0 left-1/4 right-1/4 h-[1px] bg-linear-to-r from-transparent via-zinc-400 to-transparent animate-shimmer' />

      <TooltipProvider>
        <div className='flex w-full justify-around items-center max-w-sm mx-auto gap-1'>
          {/* 1. FAVORITE - Rose Pulse */}
          <ActionTooltip
            label={
              movie.status?.isFavorite
                ? 'Remove from Favorites'
                : 'Add to Favorites'
            }
            variant={movie.status?.isFavorite ? 'rose' : 'default'}>
            <Button
              variant='ghost'
              size='icon'
              className='h-10 w-10 rounded-xl bg-zinc-100/70 hover:bg-zinc-200 active:scale-90 active:bg-rose-500/20 transition-all'
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMovieFavorite(movie.imdbID);
              }}>
              <Heart
                className={cn(
                  'w-5 h-5',
                  movie.status?.isFavorite
                    ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                    : 'text-zinc-600',
                )}
              />
            </Button>
          </ActionTooltip>

          {/* 2. WATCH - Emerald Border Glow */}
          <ActionTooltip
            label={
              movie.status?.isWatched ? 'Unmark as Watched' : 'Mark as Watched'
            }
            variant={movie.status?.isWatched ? 'emerald' : 'default'}>
            <Button
              variant='ghost'
              size='icon'
              className={cn(
                'h-10 w-10 rounded-xl active:scale-90 transition-all border',
                movie.status?.isWatched
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-zinc-100/70 border-transparent',
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMovieWatched(movie.imdbID);
              }}>
              <Eye
                className={cn(
                  'w-5 h-5',
                  movie.status?.isWatched
                    ? 'text-emerald-600 fill-emerald-600/30'
                    : 'text-zinc-600',
                )}
              />
            </Button>
          </ActionTooltip>

          {/* 3. CATEGORY - Vivid Indigo */}
          <ActionTooltip label='Category' variant='indigo'>
            <Button
              variant='ghost'
              size='icon'
              className='h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-400/40 hover:bg-indigo-500/20 active:scale-90 transition-all'
              onClick={(e) => {
                e.stopPropagation();
                onCategoryOpen();
              }}>
              <Tag className='w-5 h-5 text-indigo-600 drop-shadow-[0_0_5px_rgba(79,70,229,0.3)]' />
            </Button>
          </ActionTooltip>

          {/* 4. DELETE - Clean Rose */}
          <ActionTooltip label='Delete' variant='rose'>
            <Button
              variant='ghost'
              size='icon'
              className='h-10 w-10 rounded-xl bg-zinc-100/70 hover:bg-rose-500/10 active:bg-rose-600/20 active:scale-90 transition-all'
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(`Are you sure you want to delete "${movie.title}"?`)
                ) {
                  handleRemoveMovie(movie.imdbID);
                }
              }}>
              <Trash2 className='w-5 h-5 text-rose-600/80' />
            </Button>
          </ActionTooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
