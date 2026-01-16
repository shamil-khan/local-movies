import { useRef, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { clogger } from '@/core/ChalkLogger';

export function XFileInput({
  onUpload,
  folder = false,
  multiple = false,
  text = folder ? 'Upload Folder' : multiple ? 'Upload Files' : 'Upload File',
}: {
  onUpload: (files: string[]) => void;
  folder?: boolean;
  multiple?: boolean;
  text?: string;
}) {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!fileList || fileList.length === 0) {
      clogger.info(`No file(s) selected`, 'XFileInput');
      onUpload([]);
      return;
    }

    clogger.info(`Selected ${fileList?.length ?? 0} file(s)`, 'XFileInput');
    const files: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      files.push(file.name);
      // logger.verbose(`File ${i + 1}: ${files[i].name}`, 'XFileInput');
    }

    onUpload(files);
  };

  const triggerUploadInput = () => {
    uploadInputRef.current?.click();
  };

  return (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      {/* The actual input is hidden */}
      <Input
        id='file-upload'
        type='file'
        ref={uploadInputRef}
        onChange={handleUploadFileChange}
        // @ts-expect-error webkitdirectory is not fully standard in HTML types yet
        webkitdirectory={folder ? '' : undefined}
        directory={folder ? '' : undefined}
        multiple={multiple}
        className={cn('hidden')}
      />

      {/* The styled label acts as the visible custom text/button */}
      <Label htmlFor='file-upload' className='cursor-pointer'>
        <Button
          type='button'
          variant='outline'
          onClick={triggerUploadInput}
          className='w-full justify-start'>
          <Upload className='mr-2 h-4 w-4' />
          {text}
        </Button>
      </Label>
    </div>
  );
}
