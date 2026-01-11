import { Button } from '@/components/ui/button';
import { CategorySelector } from '@/components/CategorySelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, Tag } from 'lucide-react';

interface FileProcessingCategoryBarProps {
  selectedCategoryIds: number[];
  onSelectedCategoryIdsChange: (categoryIds: number[]) => void;
  onProcessTitles: (categoryIds?: number[]) => void;
  disabled: boolean;
}

export const FileProcessingCategoryBar = ({
  selectedCategoryIds,
  onSelectedCategoryIdsChange,
  onProcessTitles,
  disabled,
}: FileProcessingCategoryBarProps) => {
  return (
    <div className='px-3 pt-3 pb-1 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Tag className='w-4 h-4 text-muted-foreground' />
          <span className='text-xs font-medium text-muted-foreground'>
            Categories
          </span>
        </div>
        <CategorySelector
          selectedCategoryIds={selectedCategoryIds}
          onCategoryChange={onSelectedCategoryIdsChange}
        />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => onProcessTitles(selectedCategoryIds)}
              disabled={disabled}
              className='h-8 w-8'>
              <Download className='w-4 h-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download movie info with poster</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
