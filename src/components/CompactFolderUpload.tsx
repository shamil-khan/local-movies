import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clogger } from '@/core/ChalkLogger';
import logger from '@/core/logger';

interface CompactFolderUploadProps {
  onUploaded: (files: string[]) => void;
  uploadedFileNames?: string[];
}

export const CompactFolderUpload = ({
  onUploaded,
}: CompactFolderUploadProps) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const fileList = event.target.files;

    if (!fileList || fileList.length === 0) {
      clogger.info(`No file(s) selected`, 'CompactFolderUpload');
      onUploaded([]);
      return;
    }

    clogger.info(
      `Selected ${fileList?.length ?? 0} file(s)`,
      'CompactFolderUpload',
    );
    const fileNames: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      fileNames.push(file.name);
    }

    logger.info(`Uploaded ${fileNames.length} files `, fileNames);

    setLoading(false);
    onUploaded(fileNames);
  };

  return (
    <div className='flex items-center gap-1' ref={containerRef}>
      <input
        id='folder-upload'
        type='file'
        ref={folderInputRef}
        onChange={handleUploadFileChange}
        // @ts-expect-error webkitdirectory is not fully standard in HTML types yet
        webkitdirectory=''
        directory=''
        className='hidden'
      />
      <input
        id='files-upload'
        type='file'
        ref={filesInputRef}
        onChange={handleUploadFileChange}
        multiple
        className='hidden'
      />
      <div className='relative'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setMenuOpen((open) => !open)}
          title='Upload movies'
          disabled={loading}
          className='rounded-md'>
          <Upload className='h-4 w-4 mr-1' />
          <ChevronDown className='h-4 w-4' />
        </Button>
        {menuOpen && (
          <div className='absolute left-0 mt-1 w-40 rounded-md border bg-background shadow-md z-50'>
            <button
              type='button'
              className='w-full px-3 py-2 text-left text-sm hover:bg-accent cursor-pointer'
              onClick={() => {
                setMenuOpen(false);
                folderInputRef.current?.click();
              }}>
              Upload Folder
            </button>
            <button
              type='button'
              className='w-full px-3 py-2 text-left text-sm hover:bg-accent cursor-pointer'
              onClick={() => {
                setMenuOpen(false);
                filesInputRef.current?.click();
              }}>
              Upload Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
