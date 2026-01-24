import { Button } from '@/components/ui/button';
import { Heart, Eye, ListFilter } from 'lucide-react';
import { useMovieFilters } from '@/hooks/useMovieFilters';

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
    <div className='inline-flex items-center rounded-md border border-input overflow-hidden h-8'>
      <Button
        variant='ghost'
        size='sm'
        className={`rounded-none border-0 px-2 h-8 ${
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
          className={`h-4 w-4 ${filters.isFavorite ? 'fill-current' : ''}`}
        />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        className={`rounded-none border-0 px-2 h-8 ${
          filters.isWatched ? 'bg-blue-100 text-blue-500' : ''
        }`}
        onClick={() =>
          onFiltersUpdated({
            ...filters,
            isWatched: !filters.isWatched,
          })
        }
        title='Show Watched Only'>
        <Eye className={`h-4 w-4 ${filters.isWatched ? 'fill-current' : ''}`} />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        className={`rounded-none border-0 px-2 h-8 ${showFilters ? 'bg-accent' : ''}`}
        onClick={onToggleFilters}
        title='Show Filters'>
        <ListFilter className='h-4 w-4' />
      </Button>
    </div>
  );
};
