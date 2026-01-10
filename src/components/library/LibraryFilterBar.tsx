import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { type FilterCriteria } from '@/models/AppModels';

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
        <MultiSelect
          options={availableCategories}
          selected={filters.category || []}
          onChange={(val) => handleChange('category', val)}
          placeholder='Category'
        />
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
