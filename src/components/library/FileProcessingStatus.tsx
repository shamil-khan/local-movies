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
  Info,
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
  const [showDetails, setShowDetails] = useState(
    selectedFiles.length > 0 ||
      extractedTitles.length > 0 ||
      successTitles.length > 0 ||
      failedTitles.length > 0,
  );

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

                const heading = `${item.title}${
                  item.year ? ` (${item.year})` : ''
                }`;

                const detail = item.filename;

                const headingClass = 'text-sm font-semibold text-foreground';

                const detailClass = 'text-xs text-muted-foreground truncate';

                const iconWrapperClass = isSuccess
                  ? 'flex-shrink-0 w-7 h-7 rounded bg-green-100 flex items-center justify-center text-green-700 overflow-hidden'
                  : isFailed
                    ? 'flex-shrink-0 w-7 h-7 rounded bg-red-100 flex items-center justify-center text-red-700 overflow-hidden'
                    : 'flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center text-muted-foreground overflow-hidden';

                const posterSrc =
                  item.rawDetail &&
                  item.rawDetail.Response === 'True' &&
                  item.rawDetail.Poster &&
                  item.rawDetail.Poster !== 'N/A'
                    ? item.rawDetail.Poster
                    : undefined;

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
                        {posterSrc ? (
                          <img
                            src={posterSrc}
                            alt={item.title}
                            className='w-full h-full object-cover rounded'
                          />
                        ) : isSuccess ? (
                          <Check className='w-3 h-3' />
                        ) : isFailed ? (
                          <AlertCircle className='w-3 h-3' />
                        ) : (
                          <Film className='w-3 h-3' />
                        )}
                      </div>
                      <div className='flex flex-col overflow-hidden items-start text-left'>
                        <span className={`truncate ${headingClass}`}>
                          {heading}
                        </span>
                        {detail && (
                          <span className={detailClass}>{detail}</span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                isSuccess
                                  ? 'bg-green-600 text-white'
                                  : isFailed
                                    ? 'bg-red-600 text-white'
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                              <Info className='w-2.5 h-2.5' />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className='max-w-xs'>
                              {item.rawDetail &&
                              item.rawDetail.Response === 'True' &&
                              item.rawDetail.Poster === 'N/A' ? (
                                <>
                                  <p className='text-xs font-semibold mb-1'>
                                    Poster is not available
                                  </p>
                                  <pre className='whitespace-pre-wrap text-[10px]'>
                                    {JSON.stringify(item.rawDetail, null, 2)}
                                  </pre>
                                </>
                              ) : isSuccess && item.rawDetail ? (
                                <pre className='whitespace-pre-wrap text-[10px]'>
                                  {JSON.stringify(item.rawDetail, null, 2)}
                                </pre>
                              ) : isFailed ? (
                                <span className='text-xs'>
                                  {item.error || 'Failed to load movie details'}
                                </span>
                              ) : (
                                <span className='text-xs'>
                                  Not processed yet
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
                        onClick={removeHandler}
                        title='Remove from list'>
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
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
