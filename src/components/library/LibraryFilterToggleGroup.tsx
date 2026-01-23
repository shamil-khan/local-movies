import { Button } from '@/components/ui/button';
import { Heart, Eye, ListFilter } from 'lucide-react';
import { useMovieFilters } from '@/hooks/library/useMovieFilters';

interface LibraryFilterToggleGroupProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const LibraryFilterToggleGroup = ({
  showFilters,
  onToggleFilters,
}: LibraryFilterToggleGroupProps) => {
  const { filters, onFiltersUpdated } = useMovieFilters();

  return (
    <div className='inline-flex rounded-md border border-input overflow-hidden'>
      <Button
        variant='ghost'
        size='icon'
        className={`rounded-none border-0 ${
          filters.isFavorite ? 'bg-red-100 text-red-500' : ''
        }`}
        onClick={() =>
          onFiltersUpdated({
            ...filters,
            isFavorite: !filters.isFavorite,
          })
        }
        title='Show Favorites Only'>
        <Heart
          className={`h-5 w-5 ${filters.isFavorite ? 'fill-current' : ''}`}
        />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className={`rounded-none border-0 ${
          filters.isWatched ? 'bg-blue-100 text-blue-500' : ''
        }`}
        onClick={() =>
          onFiltersUpdated({
            ...filters,
            isWatched: !filters.isWatched,
          })
        }
        title='Show Watched Only'>
        <Eye className={`h-5 w-5 ${filters.isWatched ? 'fill-current' : ''}`} />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className={`rounded-none border-0 ${showFilters ? 'bg-accent' : ''}`}
        onClick={onToggleFilters}
        title='Show Filters'>
        <ListFilter className='h-5 w-5' />
      </Button>
    </div>
  );
};
