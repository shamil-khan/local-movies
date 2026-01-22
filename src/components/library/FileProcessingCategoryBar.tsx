import { CategorySelector } from '@/components/CategorySelector';
import { Tag } from 'lucide-react';

export const FileProcessingCategoryBar = () => {
  return (
    <div className='px-3 pt-3 pb-1 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Tag className='w-4 h-4 text-muted-foreground' />
          <span className='text-xs font-medium text-muted-foreground'>
            Categories
          </span>
        </div>
        {/* <CategorySelector
          selectedCategoryIds={selectedCategoryIds}
          onCategoryChange={onSelectedCategoryIdsChange}
        /> */}
      </div>
    </div>
  );
};
