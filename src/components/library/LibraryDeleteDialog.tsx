import { Button } from '@/components/ui/button';
import { Trash2, AlertOctagon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

interface LibraryDeleteDialogProps {
  onClearLibrary: () => void;
}

export const LibraryDeleteDialog = ({
  onClearLibrary,
}: LibraryDeleteDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
          title='Delete Library'>
          <Trash2 className='h-5 w-5' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertOctagon className='h-5 w-5' /> Delete Library?
          </DialogTitle>
          <DialogDescription>
            This will permanently delete ALL movies, files, and posters from
            your local database. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0'>
          <DialogClose asChild>
            <Button variant='ghost'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant='destructive' onClick={onClearLibrary}>
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
