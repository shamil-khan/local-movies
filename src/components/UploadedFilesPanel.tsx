import { X, File, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type XFile } from '@/components/mine/xfileinput';

// Inline helper if utils doesn't have it or I don't want to check right now.
// Actually, let's just make a simple one here to be safe and dependency-free for now.
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface UploadedFilesPanelProps {
    files: XFile[];
    onRemove: (file: XFile) => void;
    onClose: () => void;
}

export const UploadedFilesPanel = ({
    files,
    onRemove,
    onClose,
}: UploadedFilesPanelProps) => {
    if (files.length === 0) return null;

    return (
        <div className='w-full bg-background border border-border rounded-lg shadow-sm mt-2 animate-in fade-in slide-in-from-top-2 duration-200'>
            <div className='flex items-center justify-between p-3 border-b border-border bg-muted/30'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                    <HardDrive className='w-4 h-4 text-primary' />
                    <span>Uploaded Files</span>
                    <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs'>
                        {files.length}
                    </span>
                </div>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={onClose}
                    title='Close Panel'>
                    <X className='w-4 h-4' />
                </Button>
            </div>

            <div className='max-h-60 overflow-y-auto p-2 space-y-1'>
                {files.map((file, index) => (
                    <div
                        key={`${file.name}-${index}`}
                        className='group flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors text-sm'>
                        <div className='flex items-center gap-3 overflow-hidden'>
                            <div className='flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground'>
                                <File className='w-4 h-4' />
                            </div>
                            <div className='flex flex-col overflow-hidden'>
                                <span className='truncate font-medium text-foreground/90'>
                                    {file.name}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                    {formatFileSize(file.size)}
                                </span>
                            </div>
                        </div>

                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
                            onClick={() => onRemove(file)}
                            title='Remove File'>
                            <X className='w-4 h-4' />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
