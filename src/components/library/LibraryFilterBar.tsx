import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { type FilterCriteria } from '@/models/AppModels';
import { movieDbService } from '@/services/MovieDbService';
import { toast } from 'sonner';

interface LibraryFilterBarProps {
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  availableGenres: string[];
  availableYears: string[];
  availableRated: string[];
  availableRatings: string[];
  availableLanguages: string[];
  availableCountries: string[];
  availableCategories: Array<{ label: string; value: string }>;
  onClearFilters: () => void;
  onReloadCategories: () => void;
}

export const LibraryFilterBar = ({
  filters,
  onFilterChange,
  availableGenres,
  availableYears,
  availableRated,
  availableRatings,
  availableLanguages,
  availableCountries,
  availableCategories,
  onClearFilters,
  onReloadCategories,
}: LibraryFilterBarProps) => {
  type MultiFilterKey =
    | 'genre'
    | 'year'
    | 'rating'
    | 'rated'
    | 'language'
    | 'country'
    | 'category';

  const handleChange = (key: MultiFilterKey, value: string[]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleDeleteSingleCategory = async (value: string) => {
    const id = parseInt(value, 10);
    if (Number.isNaN(id)) return;

    try {
      await movieDbService.deleteCategory(id);
      onReloadCategories();
      const remaining =
        filters.category?.filter((v) => parseInt(v, 10) !== id) ?? [];
      onFilterChange({ ...filters, category: remaining });
      toast.success('Category deleted');
    } catch (err) {
      console.error('Failed to delete category:', err);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSelectedCategories = async () => {
    if (!filters.category || filters.category.length === 0) {
      toast.error('Select at least one category to delete');
      return;
    }

    try {
      const idsToDelete = filters.category.map((v) => parseInt(v, 10));
      for (const id of idsToDelete) {
        await movieDbService.deleteCategory(id);
      }
      onReloadCategories();
      onFilterChange({ ...filters, category: [] });
      toast.success(
        idsToDelete.length === 1 ? 'Category deleted' : 'Categories deleted',
      );
    } catch (err) {
      console.error('Failed to delete categories:', err);
      toast.error('Failed to delete categories');
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-accent/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200'>
      <MultiSelect
        options={availableGenres.map((g) => ({ label: g, value: g }))}
        selected={filters.genre}
        onChange={(val) => handleChange('genre', val)}
        placeholder='Genre'
      />
      <MultiSelect
        options={availableYears.map((y) => ({ label: y, value: y }))}
        selected={filters.year}
        onChange={(val) => handleChange('year', val)}
        placeholder='Year'
      />
      <MultiSelect
        options={availableRatings.map((r) => ({ label: r, value: r }))}
        selected={filters.rating}
        onChange={(val) => handleChange('rating', val)}
        placeholder='Rating'
      />
      <MultiSelect
        options={availableRated.map((r) => ({ label: r, value: r }))}
        selected={filters.rated}
        onChange={(val) => handleChange('rated', val)}
        placeholder='Rated'
      />
      <MultiSelect
        options={availableLanguages.map((l) => ({ label: l, value: l }))}
        selected={filters.language}
        onChange={(val) => handleChange('language', val)}
        placeholder='Language'
      />
      <MultiSelect
        options={availableCountries.map((c) => ({ label: c, value: c }))}
        selected={filters.country}
        onChange={(val) => handleChange('country', val)}
        placeholder='Country'
      />
      {availableCategories.length > 0 && (
        <div className='flex items-center gap-2'>
          <div className='flex-1'>
            <MultiSelect
              options={availableCategories}
              selected={filters.category || []}
              onChange={(val) => handleChange('category', val)}
              placeholder='Category'
              onRemoveOption={handleDeleteSingleCategory}
            />
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 text-red-500 hover:text-red-700'
            onClick={handleDeleteSelectedCategories}
            disabled={!filters.category || filters.category.length === 0}
            title='Delete selected categories'>
            <X className='h-4 w-4' />
          </Button>
        </div>
      )}

      <Button
        variant='ghost'
        onClick={onClearFilters}
        className='text-red-500 hover:text-red-700 hover:bg-red-100 col-span-1 md:col-span-6 justify-self-end'>
        Browse All <X className='ml-2 h-4 w-4' />
      </Button>
    </div>
  );
};
