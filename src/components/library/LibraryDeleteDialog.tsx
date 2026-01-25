import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMovieLibrary } from '@/hooks/useMovieLibrary';
import { cn } from '@/lib/utils';
import { type Category } from '@/models/MovieModel';
import { movieDbService } from '@/services/MovieDbService';
import { AlertOctagon, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ActionTooltip } from '../ActionTooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';

export const LibraryDeleteDialog = () => {
  const { handleClearLibrary } = useMovieLibrary();
  const [deleteCategories, setDeleteCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleClearLibraryWithReset = async () => {
    // resetState();
    await handleClearLibrary(deleteCategories);
  };

  useEffect(() => {
    const loadCategories = async () => {
      const allCategories = await movieDbService.allCategories();
      setCategories(allCategories);
    };
    void loadCategories();
  }, []);

  return (
    <Dialog>
      <TooltipProvider>
        <ActionTooltip label='Delete Library' variant='destructive'>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className={cn(
                'h-10 w-10 rounded-xl',
                'bg-red-500/10 border border-red-500/20 active:bg-red-500/30',
                'active:scale-90 transition-all',
              )}
              title='Delete Library'>
              <Trash2
                className='w-5 h-5 text-red-600 group-hover:text-white 
               drop-shadow-[0_2px_4px_rgba(220,38,38,0.25)] 
               transition-colors duration-200'
              />
            </Button>
          </DialogTrigger>
        </ActionTooltip>
      </TooltipProvider>
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
        {categories.length > 0 && (
          <div className='mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 max-h-40 overflow-y-auto'>
            <p className='mb-2 text-xs font-medium text-destructive'>
              Categories in your library
            </p>
            <ul className='space-y-1 text-xs'>
              {categories.map((category) => (
                <li
                  key={category.id}
                  className='flex items-center justify-between'>
                  <span>{category.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className='mt-4 flex items-center justify-between rounded-md border p-3'>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Also delete categories</p>
            <p className='text-xs text-muted-foreground'>
              If enabled, all categories will be removed. Otherwise categories
              are kept.
            </p>
          </div>
          <Button
            type='button'
            variant={deleteCategories ? 'destructive' : 'outline'}
            size='sm'
            onClick={() => setDeleteCategories((prev) => !prev)}>
            {deleteCategories ? 'Will delete' : 'Keep categories'}
          </Button>
        </div>
        <DialogFooter className='gap-2 sm:gap-0'>
          <DialogClose asChild>
            <Button variant='ghost'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant='destructive' onClick={handleClearLibraryWithReset}>
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
