import { Tag } from 'lucide-react';
import { MultiSelect } from '../ui/multi-select';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import { useState } from 'react';

export const FileProcessingCategoryBar = () => {
  const { categories } = useMovieLibrary();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  return (
    <div className='px-3 pt-3 pb-1 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Tag className='w-4 h-4 text-muted-foreground' />
          <span className='text-xs font-medium text-muted-foreground'>
            Categories
          </span>
        </div>
        <div className='min-w-[140px]'>
          <MultiSelect
            options={categories.map((c) => ({
              label: c.name,
              value: c.id.toString(),
            }))}
            selected={selectedCategories}
            onChange={(val) => setSelectedCategories(val)}
            placeholder='Category'
          />
        </div>
      </div>
    </div>
  );
};
