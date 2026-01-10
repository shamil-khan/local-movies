import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Check,
  AlertCircle,
  Film,
  HardDrive,
  X,
  Download,
  Tag,
} from 'lucide-react';
import { CategorySelector } from '@/components/CategorySelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type XFile } from '@/components/mine/xfileinput';
import { type ExtractedTitle } from '@/models/AppModels';

interface FileProcessingStatusProps {
  selectedFiles: XFile[];
  extractedTitles: ExtractedTitle[];
  successTitles: ExtractedTitle[];
  failedTitles: ExtractedTitle[];
  loading: boolean;
  onRemoveFile: (file: XFile) => void;
  onRemoveTitle: (title: ExtractedTitle) => void;
  onRemoveSuccessTitle: (title: ExtractedTitle) => void;
  onRemoveFailedTitle: (title: ExtractedTitle) => void;
  onProcessTitles: (categoryIds?: number[]) => void;
  onClearAll: () => void;
}

export const FileProcessingStatus = ({
  selectedFiles,
  extractedTitles,
  successTitles,
  failedTitles,
  loading,
  onRemoveFile,
  onRemoveTitle,
  onRemoveSuccessTitle,
  onRemoveFailedTitle,
  onProcessTitles,
  onClearAll,
}: FileProcessingStatusProps) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const hasParsedTitles = extractedTitles.length > 0;
  const hasResults = successTitles.length > 0 || failedTitles.length > 0;

  if (
    selectedFiles.length === 0 &&
    extractedTitles.length === 0 &&
    successTitles.length === 0 &&
    failedTitles.length === 0
  ) {
    return null;
  }

  const entries = hasParsedTitles
    ? extractedTitles.map((item) => ({ type: 'parsed' as const, item }))
    : hasResults
      ? [
          ...successTitles.map((item) => ({
            type: 'success' as const,
            item,
          })),
          ...failedTitles.map((item) => ({
            type: 'failed' as const,
            item,
          })),
        ]
      : selectedFiles.map((file) => ({ type: 'uploaded' as const, file }));

  const totalItems = entries.length;

  return (
    <div className='flex flex-col items-start gap-2 w-full'>
      <Button
        variant='link'
        className='p-0 h-auto text-sm text-muted-foreground hover:text-primary'
        onClick={() => setShowDetails((prev) => !prev)}>
        {showDetails ? 'Hide' : 'Show'} file/movie details ({totalItems})
      </Button>

      {showDetails && (
        <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-1 animate-in fade-in slide-in-from-top-2 duration-200'>
          <div className='flex items-center justify-between p-3 border-b border-border bg-muted/30'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Film className='w-4 h-4 text-primary' />
              <span>File &amp; Movie Details</span>
              <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs'>
                {totalItems}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-7 px-2 text-xs'
                onClick={onClearAll}
                disabled={totalItems === 0}>
                Clear
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={() => setShowDetails(false)}
                title='Close'>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>

          <div className='max-h-80 overflow-y-auto'>
            {hasParsedTitles && (
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
                    onCategoryChange={setSelectedCategoryIds}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => onProcessTitles(selectedCategoryIds)}
                        disabled={loading || extractedTitles.length === 0}
                        className='h-8 w-8'>
                        <Download
                          className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download movie info with poster</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            <div className='px-3 pb-3 space-y-1'>
              {entries.map((entry, index) => {
                if (entry.type === 'uploaded') {
                  const file = entry.file;
                  return (
                    <div
                      key={`uploaded-${file.name}-${index}`}
                      className='group flex items-center justify-between py-1.5'>
                      <div className='flex items-center gap-3 overflow-hidden'>
                        <div className='flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center text-muted-foreground'>
                          <HardDrive className='w-3 h-3' />
                        </div>
                        <div className='flex flex-col overflow-hidden'>
                          <span className='truncate text-sm font-semibold'>
                            {file.name}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={() => onRemoveFile(file)}
                        title='Remove file'>
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                  );
                }

                const item = entry.item;
                const isSuccess = entry.type === 'success';
                const isFailed = entry.type === 'failed';

                const heading =
                  entry.type === 'failed'
                    ? item.filename
                    : `${item.title}${item.year ? ` (${item.year})` : ''}`;

                const detail =
                  entry.type === 'failed' ? item.title || '' : item.filename;

                const headingClass = isSuccess
                  ? 'text-sm font-semibold text-green-900'
                  : isFailed
                    ? 'text-sm font-semibold text-red-700'
                    : 'text-sm font-semibold text-foreground';

                const detailClass = isSuccess
                  ? 'text-xs text-green-700/80 truncate'
                  : isFailed
                    ? 'text-xs text-red-500/90 truncate'
                    : 'text-xs text-muted-foreground truncate';

                const iconWrapperClass = isSuccess
                  ? 'flex-shrink-0 w-7 h-7 rounded bg-green-100 flex items-center justify-center text-green-700'
                  : isFailed
                    ? 'flex-shrink-0 w-7 h-7 rounded bg-red-100 flex items-center justify-center text-red-700'
                    : 'flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center text-muted-foreground';

                const removeHandler =
                  entry.type === 'success'
                    ? () => onRemoveSuccessTitle(item)
                    : entry.type === 'failed'
                      ? () => onRemoveFailedTitle(item)
                      : () => onRemoveTitle(item);

                return (
                  <div
                    key={`${entry.type}-${item.title}-${item.filename}-${index}`}
                    className='group flex items-center justify-between py-1.5'>
                    <div className='flex items-center gap-3 overflow-hidden'>
                      <div className={iconWrapperClass}>
                        {isSuccess ? (
                          <Check className='w-3 h-3' />
                        ) : isFailed ? (
                          <AlertCircle className='w-3 h-3' />
                        ) : (
                          <Film className='w-3 h-3' />
                        )}
                      </div>
                      <div className='flex flex-col overflow-hidden'>
                        <span className={`truncate ${headingClass}`}>
                          {heading}
                        </span>
                        {detail && (
                          <span className={detailClass}>{detail}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isSuccess
                          ? 'text-green-700 hover:text-destructive'
                          : isFailed
                            ? 'text-red-600 hover:text-destructive'
                            : 'text-muted-foreground hover:text-destructive'
                      }`}
                      onClick={removeHandler}
                      title='Remove from list'>
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
