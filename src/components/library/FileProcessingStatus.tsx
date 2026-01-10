import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { UploadedFilesPanel } from '@/components/UploadedFilesPanel';
import { ExtractedTitlesPanel } from '@/components/ExtractedTitlesPanel';
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
}: FileProcessingStatusProps) => {
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [showTitlesPanel, setShowTitlesPanel] = useState(false);
  const [successCollapsed, setSuccessCollapsed] = useState(false);
  const [failedCollapsed, setFailedCollapsed] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const showSuccessPanel = successTitles.length > 0 && !successCollapsed;
  const showFailedPanel = failedTitles.length > 0 && !failedCollapsed;

  if (
    selectedFiles.length === 0 &&
    extractedTitles.length === 0 &&
    successTitles.length === 0 &&
    failedTitles.length === 0
  ) {
    return null;
  }

  return (
    <div className='flex flex-col items-start gap-2 w-full'>
      <div className='flex items-center gap-4 flex-wrap'>
        {selectedFiles.length > 0 && (
          <Button
            variant='link'
            className='p-0 h-auto text-sm text-muted-foreground hover:text-primary'
            onClick={() => setShowFilesPanel(!showFilesPanel)}>
            {showFilesPanel ? 'Hide' : 'Show'} uploaded {selectedFiles.length}{' '}
            files
          </Button>
        )}
        {extractedTitles.length > 0 && (
          <Button
            variant='link'
            className='p-0 h-auto text-sm text-green-600 hover:text-green-700'
            onClick={() => setShowTitlesPanel(!showTitlesPanel)}>
            {showTitlesPanel ? 'Hide' : 'Show'} Found {extractedTitles.length}{' '}
            Titles
          </Button>
        )}
        {successTitles.length > 0 && (
          <Button
            variant='link'
            className='p-0 h-auto text-sm text-green-700 hover:text-green-800'
            onClick={() => setSuccessCollapsed((prev) => !prev)}>
            {showSuccessPanel ? 'Hide' : 'Show'} Successfully downloaded{' '}
            {successTitles.length} titles
          </Button>
        )}
        {failedTitles.length > 0 && (
          <Button
            variant='link'
            className='p-0 h-auto text-sm text-red-600 hover:text-red-700'
            onClick={() => setFailedCollapsed((prev) => !prev)}>
            {showFailedPanel ? 'Hide' : 'Show'} Failed to download info for{' '}
            {failedTitles.length} titles
          </Button>
        )}
      </div>

      {showFilesPanel && (
        <UploadedFilesPanel
          files={selectedFiles}
          onRemove={onRemoveFile}
          onClose={() => setShowFilesPanel(false)}
        />
      )}

      {showTitlesPanel && (
        <ExtractedTitlesPanel
          titles={extractedTitles}
          onRemove={onRemoveTitle}
          onProcess={() => onProcessTitles(selectedCategoryIds)}
          onClose={() => setShowTitlesPanel(false)}
          processing={loading}
          showCategorySelector={true}
          selectedCategoryIds={selectedCategoryIds}
          onCategoryChange={setSelectedCategoryIds}
        />
      )}

      {showSuccessPanel && (
        <ExtractedTitlesPanel
          titles={successTitles}
          onRemove={(title) => {
            if (successTitles.length === 1) setSuccessCollapsed(false);
            onRemoveSuccessTitle(title);
          }}
          onClose={() => setSuccessCollapsed(true)}
          panelTitle='Successfully Downloaded'
          panelIcon={<Check className='w-4 h-4' />}
          headerColor='text-green-700'
          badgeColor='bg-green-100 text-green-700'
        />
      )}

      {showFailedPanel && (
        <ExtractedTitlesPanel
          titles={failedTitles}
          onRemove={(title) => {
            if (failedTitles.length === 1) setFailedCollapsed(false);
            onRemoveFailedTitle(title);
          }}
          onClose={() => setFailedCollapsed(true)}
          panelTitle='Failed Downloads'
          panelIcon={<AlertCircle className='w-4 h-4' />}
          headerColor='text-red-600'
          badgeColor='bg-red-100 text-red-600'
        />
      )}
    </div>
  );
};
