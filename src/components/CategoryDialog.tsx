import { type MovieInfo } from '@/models/MovieModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import logger from '@/core/logger';

// import { CategorySelector } from '@/components/CategorySelector';

interface CategoryDialogProps {
  movie: MovieInfo;
  open: boolean;
  onClose: () => void;
}

export const CategoryDialog = ({
  movie,
  open,
  onClose,
}: CategoryDialogProps) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedCategoryIds([]);
  }, []);

  // Load poster from DB
  // Fetch trailer when dialog opens
  // const handleSaveCategories = () => {
  //   // if (onUpdateCategories) {
  //   //   onUpdateCategories(movieDetail.imdbID, selectedCategoryIds);
  //   // }
  //   setCategoryDialogOpen(false);
  // };

  const handleOpenChange = () => onClose();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Categories</DialogTitle>
          <DialogDescription>
            Manage categories for {movie.title}
          </DialogDescription>
        </DialogHeader>
        <div className='mt-2'>
          {/* <CategorySelector
                  selectedCategoryIds={selectedCategoryIds}
                  onCategoryChange={setSelectedCategoryIds}
                  allowCategoryDeletion={false}
                /> */}
        </div>
        <div className='mt-4 flex justify-end gap-2'>
          {/* <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size='sm' onClick={handleSaveCategories}>
                  Save
                </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
