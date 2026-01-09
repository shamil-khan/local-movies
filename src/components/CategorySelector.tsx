import { useState, useEffect } from 'react';
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
}

export const CategorySelector = ({
  selectedCategoryIds,
  onCategoryChange,
  className,
}: CategorySelectorProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const allCategories = await movieDbService.allCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
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

  return (
    <div className={className}>
      <div className='flex items-center gap-2'>
        <div className='flex-1'>
          <MultiSelect
            options={categoryOptions}
            selected={selectedValues}
            onChange={(values) => {
              onCategoryChange(values.map((v) => parseInt(v, 10)));
            }}
            placeholder='Select categories'
          />
        </div>
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
