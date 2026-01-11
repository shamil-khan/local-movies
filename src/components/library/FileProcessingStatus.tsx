import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { type XFile } from '@/components/mine/xfileinput';
import { type ExtractedTitle } from '@/models/AppModels';
import { FileProcessingHeader } from '@/components/library/FileProcessingHeader';
import { FileProcessingCategoryBar } from '@/components/library/FileProcessingCategoryBar';
import { useFileProcessingStore } from '@/store/useFileProcessingStore';
import {
  FileProcessingEntriesList,
  type FileProcessingEntry,
} from '@/components/library/FileProcessingEntriesList';

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
  const selectedCategoryIds = useFileProcessingStore(
    (s) => s.selectedCategoryIds,
  );
  const setSelectedCategoryIds = useFileProcessingStore(
    (s) => s.setSelectedCategoryIds,
  );
  const showDetails = useFileProcessingStore((s) => s.showDetails);
  const setShowDetails = useFileProcessingStore((s) => s.setShowDetails);
  const toggleShowDetails = useFileProcessingStore((s) => s.toggleShowDetails);

  const prevTotalRef = useRef(0);

  useEffect(() => {
    const totalCount =
      selectedFiles.length +
      extractedTitles.length +
      successTitles.length +
      failedTitles.length;

    // Auto-open when items appear (0 -> n), but don't override a user's manual close.
    if (prevTotalRef.current === 0 && totalCount > 0 && !showDetails) {
      setShowDetails(true);
    }

    // Auto-close when all items are gone.
    if (totalCount === 0 && showDetails) {
      setShowDetails(false);
    }

    prevTotalRef.current = totalCount;
  }, [
    selectedFiles.length,
    extractedTitles.length,
    successTitles.length,
    failedTitles.length,
    showDetails,
    setShowDetails,
  ]);

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

  const entries: FileProcessingEntry[] = hasParsedTitles
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

  const handleProcessClick = () => {
    onProcessTitles(selectedCategoryIds);
  };

  return (
    <div className='flex flex-col items-start gap-2 w-full'>
      <Button
        variant='link'
        className='p-0 h-auto text-sm text-muted-foreground hover:text-primary'
        onClick={() => toggleShowDetails()}>
        {showDetails ? 'Cover Details' : 'Uncover Details'} ({totalItems})
      </Button>

      {showDetails && (
        <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-1 animate-in fade-in slide-in-from-top-2 duration-200'>
          <FileProcessingHeader
            totalItems={totalItems}
            onClearAll={onClearAll}
            onClose={() => setShowDetails(false)}
            onProcessTitles={handleProcessClick}
            processDisabled={loading || extractedTitles.length === 0}
          />

          <div className='max-h-80 overflow-y-auto'>
            {hasParsedTitles && (
              <FileProcessingCategoryBar
                selectedCategoryIds={selectedCategoryIds}
                onSelectedCategoryIdsChange={setSelectedCategoryIds}
              />
            )}

            <FileProcessingEntriesList
              entries={entries}
              onRemoveFile={onRemoveFile}
              onRemoveTitle={onRemoveTitle}
              onRemoveSuccessTitle={onRemoveSuccessTitle}
              onRemoveFailedTitle={onRemoveFailedTitle}
            />
          </div>
        </div>
      )}
    </div>
  );
};
