import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, X, Tag, Edit, Trash2, Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { movieDbService } from '@/services/MovieDbService';
import { type Category } from '@/models/MovieModel';
import { toast } from 'sonner';
// import { useFileProcessingPanelStore } from '@/store/useFileProcessingPanelStore';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  selectedCategoryIds?: number[];
  onCategoryChange?: (categoryIds: number[]) => void;
  className?: string;
  onCategoriesDeleted?: () => void;
  allowCategoryDeletion?: boolean;
}

export const CategorySelector = ({
  selectedCategoryIds: selectedCategoryIdsProp,
  onCategoryChange,
  className,
  onCategoriesDeleted,
  allowCategoryDeletion = true,
}: CategorySelectorProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [initialized, setInitialized] = useState(false);
  const storeSelectedCategoryIds = useFileProcessingPanelStore(
    (s) => s.categoryIds,
  );
  const setStoreSelectedCategoryIds = useFileProcessingPanelStore(
    (s) => s.setCategoryIds,
  );

  const loadCategories = async () => {
    try {
      const allCategories = await movieDbService.allCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const ensureCategoriesLoaded = () => {
    if (initialized) return;
    setInitialized(true);
    void loadCategories();
  };

  // Bulk-delete button removed; per-option delete is handled in dropdown

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      const categoryId = await movieDbService.addCategory(
        newCategoryName.trim(),
      );
      if (categoryId) {
        await loadCategories();
        // Auto-select the newly created category
        const currentSelected =
          selectedCategoryIdsProp ?? storeSelectedCategoryIds;
        const next = [...currentSelected, categoryId];
        setStoreSelectedCategoryIds(next);
        if (onCategoryChange) onCategoryChange(next);
        setNewCategoryName('');
        setShowNewCategoryInput(false);
        toast.success('Category created');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
    }
  };

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id!.toString(),
  }));

  const effectiveSelected = selectedCategoryIdsProp ?? storeSelectedCategoryIds;
  const selectedValues = effectiveSelected.map((id) => id.toString());

  const handleDeleteSingleCategory = async (value: string) => {
    if (!allowCategoryDeletion) {
      return;
    }
    const id = parseInt(value, 10);
    if (Number.isNaN(id)) return;
    try {
      const movies = await movieDbService.getMoviesByCategory(id);
      const count = movies.length;
      const cat = categories.find((c) => c.id === id);
      const name = cat?.name ?? value;
      const confirmMsg = `Delete category "${name}"? This will remove the category and unlink it from ${count} movie${count !== 1 ? 's' : ''}.`;
      if (!confirm(confirmMsg)) return;

      await movieDbService.deleteCategory(id);
      await loadCategories();
      const currentSelected =
        selectedCategoryIdsProp ?? storeSelectedCategoryIds;
      const next = currentSelected.filter((categoryId) => categoryId !== id);
      setStoreSelectedCategoryIds(next);
      if (onCategoryChange) onCategoryChange(next);
      if (onCategoriesDeleted) {
        onCategoriesDeleted();
      }
      toast.success('Category deleted');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleRenameCategory = async (value: string, newLabel: string) => {
    const id = parseInt(value, 10);
    if (Number.isNaN(id)) return false;
    if (!newLabel.trim()) {
      toast.error('Category name cannot be empty');
      return false;
    }
    try {
      const ok = await movieDbService.updateCategory(id, newLabel.trim());
      if (ok) {
        await loadCategories();
        toast.success('Category renamed');
        return true;
      }
      toast.error('Failed to rename category');
      return false;
    } catch (err) {
      console.error('Failed to rename category:', err);
      toast.error('Failed to rename category');
      return false;
    }
  };

  // Sync controlled prop to store when parent provides selection
  useEffect(() => {
    if (
      selectedCategoryIdsProp !== undefined &&
      JSON.stringify(selectedCategoryIdsProp) !==
        JSON.stringify(storeSelectedCategoryIds)
    ) {
      setStoreSelectedCategoryIds(selectedCategoryIdsProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryIdsProp]);

  const [manageOpen, setManageOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [open, setOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setEditingValue(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    setStoreSelectedCategoryIds(next.map((v) => parseInt(v, 10)));
    if (onCategoryChange) onCategoryChange(next.map((v) => parseInt(v, 10)));
  };

  const handleRemove = (value: string) => {
    const next = selectedValues.filter((item) => item !== value);
    setStoreSelectedCategoryIds(next.map((v) => parseInt(v, 10)));
    if (onCategoryChange) onCategoryChange(next.map((v) => parseInt(v, 10)));
  };

  const startEditing = (value: string, label: string) => {
    setEditingValue(value);
    setEditingLabel(label);
  };

  const saveEditing = async () => {
    if (!editingValue || !editingLabel.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    const success = await handleRenameCategory(editingValue, editingLabel);
    if (success) {
      setEditingValue(null);
      setEditingLabel('');
    }
  };

  const cancelEditing = () => {
    setEditingValue(null);
    setEditingLabel('');
  };

  const deleteEditing = async () => {
    if (!editingValue) return;
    await handleDeleteSingleCategory(editingValue);
    setEditingValue(null);
    setEditingLabel('');
  };

  return (
    <div className={className} onClick={ensureCategoriesLoaded}>
      <div className='flex items-center gap-2'>
        <div className='flex-1 flex items-center gap-2'>
          <div className='flex-1 relative' ref={containerRef}>
            <div
              className={cn(
                'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
                open ? 'ring-2 ring-ring ring-offset-2' : '',
              )}
              onClick={() => setOpen(!open)}>
              <div className='flex flex-wrap gap-1'>
                {selectedValues.length > 0 ? (
                  selectedValues.length > 2 ? (
                    <span className='text-foreground'>
                      {selectedValues.length} selected
                    </span>
                  ) : (
                    selectedValues.map((value) => {
                      const option = categoryOptions.find(
                        (o) => o.value === value,
                      );
                      return (
                        <div
                          key={value}
                          className='flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground'>
                          {option?.label || value}
                          <div
                            className='cursor-pointer rounded-full p-0.5 hover:bg-secondary-foreground/20'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(value);
                            }}>
                            <X className='h-3 w-3' />
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  <span className='text-muted-foreground'>
                    Select categories
                  </span>
                )}
              </div>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </div>

            {open && (
              <div className='absolute top-full left-0 mt-2 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95'>
                <div className='max-h-64 overflow-y-auto p-1'>
                  {categoryOptions.length === 0 ? (
                    <div className='py-6 text-center text-sm text-muted-foreground'>
                      No categories found.
                    </div>
                  ) : (
                    categoryOptions.map((option) => {
                      const isSelected = selectedValues.includes(option.value);
                      const isEditing = editingValue === option.value;
                      return (
                        <div
                          key={option.value}
                          className={cn(
                            'relative flex w-full cursor-default select-none items-center justify-start rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none text-left hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                            isSelected
                              ? 'bg-accent text-accent-foreground'
                              : '',
                          )}>
                          {!isEditing && (
                            <>
                              <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                                {isSelected && <Check className='h-4 w-4' />}
                              </span>
                              <span
                                className='flex-1 text-left'
                                onDoubleClick={() =>
                                  startEditing(option.value, option.label)
                                }
                                onClick={() => handleSelect(option.value)}>
                                {option.label}
                              </span>
                            </>
                          )}
                          {isEditing && (
                            <>
                              <Input
                                value={editingLabel}
                                onChange={(e) =>
                                  setEditingLabel(e.target.value)
                                }
                                className='flex-1 h-8 ml-6'
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    void saveEditing();
                                  } else if (e.key === 'Escape') {
                                    cancelEditing();
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6'
                                onClick={() => void saveEditing()}>
                                <Check className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 text-red-500'
                                onClick={() => void deleteEditing()}>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 text-foreground/70 hover:text-foreground'
            onClick={() => setManageOpen(true)}
            title='Manage categories'>
            <Tag className='h-4 w-4' />
          </Button>
        </div>
        {/* bulk-delete removed; deletion via dropdown only */}
        {!showNewCategoryInput ? (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setShowNewCategoryInput(true)}
            className='shrink-0'>
            <Plus className='h-4 w-4 mr-1' />
            New
          </Button>
        ) : (
          <div className='flex items-center gap-1 shrink-0'>
            <Input
              type='text'
              placeholder='Category name'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCategory();
                } else if (e.key === 'Escape') {
                  setShowNewCategoryInput(false);
                  setNewCategoryName('');
                }
              }}
              className='w-32 h-9'
              autoFocus
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}>
              <Plus className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName('');
              }}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Rename or delete categories. Deleting will unlink the category
              from any movies.
            </DialogDescription>
          </DialogHeader>

          <div className='mt-4 space-y-2 max-h-64 overflow-y-auto'>
            {categories.map((cat) => (
              <div key={cat.id} className='flex items-center gap-2'>
                {editingId === cat.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className='flex-1'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          void handleRenameCategory(
                            String(cat.id),
                            editingName,
                          );
                          setEditingId(null);
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        void handleRenameCategory(String(cat.id), editingName);
                        setEditingId(null);
                      }}>
                      <Check className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setEditingId(null)}>
                      <X className='h-4 w-4' />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className='flex-1'>{cat.name}</div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        setEditingId(cat.id!);
                        setEditingName(cat.name);
                      }}>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() =>
                        void handleDeleteSingleCategory(String(cat.id))
                      }>
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
