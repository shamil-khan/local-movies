import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useMovieFilters } from '@/hooks/library/useMovieFilters';

export const LibraryFilterBar = () => {
  const {
    filterCriteria,
    setFilterCriteria,
    availableGenres,
    availableYears,
    availableRated,
    availableRatings,
    availableLanguages,
    availableCountries,
    clearFilters,
  } = useMovieFilters();

  type MultiFilterKey =
    | 'genre'
    | 'year'
    | 'rating'
    | 'rated'
    | 'language'
    | 'country'
    | 'category';

  const handleChange = (key: MultiFilterKey, value: string[]) => {
    setFilterCriteria({ ...filterCriteria, [key]: value });
  };

  // const handleDeleteSingleCategory = async (value: string) => {
  //   const id = parseInt(value, 10);
  //   if (Number.isNaN(id)) return;

  //   try {
  //     await movieDbService.deleteCategory(id);
  //     onReloadCategories();
  //     const remaining =
  //       filters.category?.filter((v) => parseInt(v, 10) !== id) ?? [];
  //     onFilterChange({ ...filters, category: remaining });
  //     toast.success('Category deleted');
  //   } catch (err) {
  //     console.error('Failed to delete category:', err);
  //     toast.error('Failed to delete category');
  //   }
  // };

  const hasActiveFilters =
    (filterCriteria.genre && filterCriteria.genre.length > 0) ||
    (filterCriteria.year && filterCriteria.year.length > 0) ||
    (filterCriteria.rating && filterCriteria.rating.length > 0) ||
    (filterCriteria.rated && filterCriteria.rated.length > 0) ||
    (filterCriteria.language && filterCriteria.language.length > 0) ||
    (filterCriteria.country && filterCriteria.country.length > 0) ||
    (filterCriteria.category && filterCriteria.category.length > 0) ||
    filterCriteria.isFavorite ||
    filterCriteria.isWatched ||
    (filterCriteria.query && filterCriteria.query.trim().length > 0);
  return (
    <div className='flex w-full flex-wrap items-center gap-2 p-4 bg-accent/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200'>
      <div className='min-w-[120px]'>
        <MultiSelect
          options={availableGenres.map((g) => ({ label: g, value: g }))}
          selected={filterCriteria.genre}
          onChange={(val) => handleChange('genre', val)}
          placeholder='Genre'
        />
      </div>
      <div className='min-w-[120px]'>
        <MultiSelect
          options={availableYears.map((y) => ({ label: y, value: y }))}
          selected={filterCriteria.year}
          onChange={(val) => handleChange('year', val)}
          placeholder='Year'
        />
      </div>
      <div className='min-w-[120px]'>
        <MultiSelect
          options={availableRatings.map((r) => ({ label: r, value: r }))}
          selected={filterCriteria.rating}
          onChange={(val) => handleChange('rating', val)}
          placeholder='Rating'
        />
      </div>
      <div className='min-w-[120px]'>
        <MultiSelect
          options={availableRated.map((r) => ({ label: r, value: r }))}
          selected={filterCriteria.rated}
          onChange={(val) => handleChange('rated', val)}
          placeholder='Rated'
        />
      </div>
      <div className='min-w-[120px]'>
        <MultiSelect
          options={availableLanguages.map((l) => ({ label: l, value: l }))}
          selected={filterCriteria.language}
          onChange={(val) => handleChange('language', val)}
          placeholder='Language'
        />
      </div>
      <div className='min-w-[120px]'>
        <MultiSelect
          options={availableCountries.map((c) => ({ label: c, value: c }))}
          selected={filterCriteria.country}
          onChange={(val) => handleChange('country', val)}
          placeholder='Country'
        />
      </div>
      {/* {availableCategories.length > 0 && (
        <div className='min-w-[140px]'>
          <CategoryMultiSelect
            options={availableCategories}
            selected={filters.category || []}
            onChange={(val) => handleChange('category', val)}
            onRemoveOption={handleDeleteSingleCategory}
            placeholder='Category'
          />
        </div>
      )} */}

      {hasActiveFilters && (
        <Button
          variant='ghost'
          onClick={clearFilters}
          className='ml-auto text-red-500 hover:text-red-700 hover:bg-red-100 whitespace-nowrap'>
          Clear All Filters <X className='ml-2 h-4 w-4' />
        </Button>
      )}
    </div>
  );
};
