import { X, Film, CheckCircle, Download, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ExtractedTitle } from '@/models/AppModels';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CategorySelector } from '@/components/CategorySelector';

interface ExtractedTitlesPanelProps {
  titles: ExtractedTitle[];
  onRemove: (title: ExtractedTitle) => void;
  onProcess?: () => void;
  onClose: () => void;
  processing?: boolean;
  panelTitle?: string;
  panelIcon?: React.ReactNode;
  headerColor?: string; // e.g. "text-primary", "text-green-600", "text-red-600"
  badgeColor?: string; // e.g. "bg-primary/10 text-primary"
  selectedCategoryIds?: number[];
  onCategoryChange?: (categoryIds: number[]) => void;
  showCategorySelector?: boolean;
}

export const ExtractedTitlesPanel = ({
  titles,
  onRemove,
  onProcess,
  onClose,
  processing = false,
  panelTitle = 'Found Titles',
  panelIcon = <Film className='w-4 h-4' />,
  headerColor = 'text-primary',
  badgeColor = 'bg-primary/10 text-primary',
  selectedCategoryIds = [],
  onCategoryChange,
  showCategorySelector = false,
}: ExtractedTitlesPanelProps) => {
  if (titles.length === 0) return null;

  return (
    <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-2 animate-in fade-in slide-in-from-top-2 duration-200'>
      <div className='flex items-center justify-between p-3 border-b border-border bg-muted/30'>
        <div className={`flex items-center gap-2 text-sm font-medium`}>
          <div className={headerColor}>{panelIcon}</div>
          <span>{panelTitle}</span>
          <span className={`${badgeColor} px-1.5 py-0.5 rounded text-xs`}>
            {titles.length}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {onProcess && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={onProcess}
                    disabled={processing || titles.length === 0}
                    className='h-8 w-8 p-0'>
                    <Download
                      className={`w-4 h-4 ${processing ? 'animate-pulse' : ''}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Downloading Movie Info with poster</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={onClose}
            title='Close Panel'>
            <X className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {showCategorySelector && onCategoryChange && (
        <div className='p-3 border-b border-border bg-muted/20'>
          <div className='flex items-center gap-2 mb-2'>
            <Tag className='w-4 h-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Categories</span>
          </div>
          <CategorySelector
            selectedCategoryIds={selectedCategoryIds}
            onCategoryChange={onCategoryChange}
          />
        </div>
      )}

      <div className='max-h-60 overflow-y-auto p-2 space-y-1'>
        {titles.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className='group flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors text-sm'>
            <div className='flex items-center gap-3 overflow-hidden'>
              <div
                className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${
                  item.inDb
                    ? 'bg-green-100 text-green-600'
                    : 'bg-muted text-muted-foreground'
                }`}>
                {item.inDb ? (
                  <CheckCircle className='w-4 h-4' />
                ) : (
                  <Film className='w-4 h-4' />
                )}
              </div>
              <div className='flex flex-col overflow-hidden'>
                <span className='truncate font-medium text-foreground/90'>
                  {item.title}
                </span>
                <span className='text-xs text-muted-foreground truncate'>
                  {item.filename}
                </span>
              </div>
              {item.inDb && (
                <span className='text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full ml-2 whitespace-nowrap hidden sm:inline-block'>
                  In Library
                </span>
              )}
              {/* Status indicator if needed later, currently using inDb or panel context */}
            </div>

            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => onRemove(item)}
              title='Remove Title'>
              <X className='w-4 h-4' />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
