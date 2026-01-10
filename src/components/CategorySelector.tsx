import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { movieDbService } from '@/services/MovieDbService';
import { type Category } from '@/models/MovieModel';
import { toast } from 'sonner';

interface CategorySelectorProps {
  selectedCategoryIds: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  className?: string;
  onCategoriesDeleted?: () => void;
}

export const CategorySelector = ({
  selectedCategoryIds,
  onCategoryChange,
  className,
  onCategoriesDeleted,
}: CategorySelectorProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [initialized, setInitialized] = useState(false);

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

  const handleDeleteSelectedCategories = async () => {
    if (selectedCategoryIds.length === 0) {
      toast.error('Select at least one category to delete');
      return;
    }

    try {
      const idsToDelete = [...selectedCategoryIds];
      for (const id of idsToDelete) {
        await movieDbService.deleteCategory(id);
      }
      await loadCategories();
      onCategoryChange(
        selectedCategoryIds.filter((id) => !idsToDelete.includes(id)),
      );
      if (onCategoriesDeleted) {
        onCategoriesDeleted();
      }
      toast.success(
        idsToDelete.length === 1 ? 'Category deleted' : 'Categories deleted',
      );
    } catch (error) {
      console.error('Failed to delete categories:', error);
      toast.error('Failed to delete categories');
    }
  };

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
        onCategoryChange([...selectedCategoryIds, categoryId]);
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

  const selectedValues = selectedCategoryIds.map((id) => id.toString());

  const handleDeleteSingleCategory = async (value: string) => {
    const id = parseInt(value, 10);
    if (Number.isNaN(id)) return;

    try {
      await movieDbService.deleteCategory(id);
      await loadCategories();
      onCategoryChange(
        selectedCategoryIds.filter((categoryId) => categoryId !== id),
      );
      if (onCategoriesDeleted) {
        onCategoriesDeleted();
      }
      toast.success('Category deleted');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className={className} onClick={ensureCategoriesLoaded}>
      <div className='flex items-center gap-2'>
        <div className='flex-1'>
          <MultiSelect
            options={categoryOptions}
            selected={selectedValues}
            onChange={(values) => {
              onCategoryChange(values.map((v) => parseInt(v, 10)));
            }}
            placeholder='Select categories'
            onRemoveOption={handleDeleteSingleCategory}
          />
        </div>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='shrink-0 text-red-500 hover:text-red-700'
          onClick={handleDeleteSelectedCategories}
          disabled={selectedCategoryIds.length === 0}
          title='Delete selected categories'>
          <X className='h-4 w-4' />
        </Button>
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
    </div>
  );
};
