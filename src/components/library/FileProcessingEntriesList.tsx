import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Film, HardDrive, Info, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type XFile } from '@/components/mine/xfileinput';
import { type ExtractedTitle } from '@/models/AppModels';

type UploadedEntry = {
  type: 'uploaded';
  file: XFile;
};

type ParsedEntry = {
  type: 'parsed' | 'success' | 'failed';
  item: ExtractedTitle;
};

export type FileProcessingEntry = UploadedEntry | ParsedEntry;

interface FileProcessingEntriesListProps {
  entries: FileProcessingEntry[];
  onRemoveFile: (file: XFile) => void;
  onRemoveTitle: (title: ExtractedTitle) => void;
  onRemoveSuccessTitle: (title: ExtractedTitle) => void;
  onRemoveFailedTitle: (title: ExtractedTitle) => void;
}

export const FileProcessingEntriesList = ({
  entries,
  onRemoveFile,
  onRemoveTitle,
  onRemoveSuccessTitle,
  onRemoveFailedTitle,
}: FileProcessingEntriesListProps) => {
  return (
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

        const heading = `${item.title}${item.year ? ` (${item.year})` : ''}`;

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
                <span className={`truncate ${headingClass}`}>{heading}</span>
                {detail && <span className={detailClass}>{detail}</span>}
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
                        <span className='text-xs'>Not processed yet</span>
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
  );
};
