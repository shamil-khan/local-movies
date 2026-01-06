import { useRef, type ChangeEvent } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clogger } from '@/core/ChalkLogger';
import { type XFile } from '@/components/mine/xfileinput';

interface CompactFolderUploadProps {
  onUpload: (files: XFile[]) => void;
  onLoad?: () => void;
  selectedFiles?: XFile[];
  loading?: boolean;
  error?: string | null;
}

export const CompactFolderUpload = ({
  onUpload,
  onLoad = () => {},
  selectedFiles = [],
  loading = false,
  error = null,
}: CompactFolderUploadProps) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!fileList || fileList.length === 0) {
      clogger.info(`No file(s) selected`, 'CompactFolderUpload');
      onUpload([]);
      return;
    }

    clogger.info(
      `Selected ${fileList?.length ?? 0} file(s)`,
      'CompactFolderUpload',
    );
    const files: XFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      files.push({
        name: file.name,
        path: file.webkitRelativePath,
        size: file.size,
      });
    }

    onUpload(files);
  };

  const triggerUploadInput = () => {
    uploadInputRef.current?.click();
  };

  return (
    <div className='flex items-center gap-1'>
      <input
        id='folder-upload'
        type='file'
        ref={uploadInputRef}
        onChange={handleUploadFileChange}
        // @ts-expect-error webkitdirectory is not fully standard in HTML types yet
        webkitdirectory=''
        directory=''
        className='hidden'
      />
      <div className='flex'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={triggerUploadInput}
          title='Select Movie Folder'
          className='rounded-l-md rounded-r-none border-r-0'>
          <Upload className='h-4 w-4' />
        </Button>
        <Button
          onClick={onLoad}
          disabled={selectedFiles.length === 0 || loading}
          size='sm'
          className='rounded-l-none rounded-r-none border-r-0'>
          <ChevronDown className='h-4 w-4' />
        </Button>
      </div>
      {loading && <span className='text-sm'>Loading...</span>}
      {error && <span className='text-sm text-red-500'>Error</span>}
    </div>
  );
};
