import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Plus, Check, X } from 'lucide-react';
import { useMovieLibraryStore } from '@/store/useMovieLibraryStore';
import { useCategoryDialog } from '@/hooks/useCategoryDialog';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

export const CategoryDialog = () => {
  const { isOpen, close, selectedMovie } = useCategoryDialog();
  const {
    categories,
    movies,
    addCategory,
    removeCategory,
    updateCategory,
    addMovieToCategory,
    removeMovieFromCategory,
  } = useMovieLibraryStore();

  // Get the latest movie state from the store to ensure categories are up to date
  const activeMovie = selectedMovie
    ? movies.find((m) => m.imdbID === selectedMovie.imdbID) || selectedMovie
    : null;

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingName, setEditingName] = useState('');

  // Reset state when dialog closes or movie changes
  useEffect(() => {
    if (!isOpen) {
      setNewCategoryName('');
      setEditingCategoryId(null);
      setEditingName('');
    }
  }, [isOpen]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (id: number, name: string) => {
    setEditingCategoryId(id);
    setEditingName(name);
  };

  const handleSaveEdit = (id: number) => {
    if (editingName.trim()) {
      updateCategory(id, editingName.trim());
      setEditingCategoryId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingName('');
  };

  const handleToggleCategoryForMovie = (category: any) => {
    if (!activeMovie) return;

    const isSelected = activeMovie.categories?.some(
      (c) => c.id === category.id,
    );

    if (isSelected) {
      removeMovieFromCategory(activeMovie.imdbID, category);
    } else {
      addMovieToCategory(activeMovie.imdbID, category);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className='w-[calc(100%-2rem)] sm:max-w-[425px] rounded-lg'>
        <DialogHeader>
          <DialogTitle>
            {activeMovie
              ? `Manage Categories for "${activeMovie.title}"`
              : 'Manage Categories'}
          </DialogTitle>
          <DialogDescription>
            {activeMovie
              ? 'Select categories to assign to this movie, or create new ones.'
              : 'Create and manage categories for your library.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex gap-2 my-4'>
          <Input
            placeholder='New category name...'
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCategory();
            }}
          />
          <Button
            onClick={handleAddCategory}
            size='icon'
            disabled={!newCategoryName.trim()}>
            <Plus className='h-4 w-4' />
          </Button>
        </div>

        <div className='bg-accent/20 rounded-md p-2 max-h-[300px] overflow-y-auto space-y-2'>
          {categories.length === 0 && (
            <p className='text-center text-muted-foreground py-4 text-sm'>
              No categories yet.
            </p>
          )}

          {categories.map((category) => {
            const isSelected =
              activeMovie?.categories?.some((c) => c.id === category.id) ??
              false;
            const isEditing = editingCategoryId === category.id;

            return (
              <div
                key={category.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md transition-colors',
                  activeMovie && !isEditing
                    ? 'hover:bg-accent cursor-pointer'
                    : 'bg-transparent',
                  isSelected ? 'bg-accent/50' : '',
                )}
                onClick={() => {
                  if (activeMovie && !isEditing) {
                    handleToggleCategoryForMovie(category);
                  }
                }}>
                {isEditing ? (
                  <div
                    className='flex flex-1 items-center gap-2'
                    onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className='h-8'
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(category.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-8 w-8 text-green-500'
                      onClick={() => handleSaveEdit(category.id)}>
                      <Check className='h-4 w-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-8 w-8 text-red-500'
                      onClick={handleCancelEdit}>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className='flex items-center gap-3'>
                      {activeMovie && (
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground',
                          )}>
                          {isSelected && (
                            <Check className='h-3 w-3 text-primary-foreground' />
                          )}
                        </div>
                      )}
                      <span className='font-medium'>
                        {category.name}
                        <span className='ml-1.5 text-xs text-muted-foreground font-normal'>
                          (
                          {
                            movies.filter((m) =>
                              m.categories?.some((c) => c.id === category.id),
                            ).length
                          }
                          )
                        </span>
                      </span>
                    </div>

                    <div
                      className='flex items-center'
                      onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        onClick={() =>
                          handleStartEdit(category.id, category.name)
                        }>
                        <Edit2 className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-muted-foreground hover:text-destructive'
                        onClick={() => {
                          if (
                            confirm(
                              `Delete category "${category.name}"? This will remove it from all movies.`,
                            )
                          ) {
                            removeCategory(category.id);
                          }
                        }}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
