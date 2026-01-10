import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  onRemoveOption?: (value: string) => void;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  className,
  onRemoveOption,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveOption) {
      onRemoveOption(value);
    } else {
      onChange(selected.filter((item) => item !== value));
    }
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <div
        className={cn(
          'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
          open ? 'ring-2 ring-ring ring-offset-2' : '',
        )}
        onClick={() => setOpen(!open)}>
        <div className='flex flex-wrap gap-1'>
          {selected.length > 0 ? (
            selected.length > 2 ? (
              <span className='text-foreground'>
                {selected.length} selected
              </span>
            ) : (
              selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return (
                  <div
                    key={value}
                    className='flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground'>
                    {option?.label || value}
                    <div
                      className='cursor-pointer rounded-full p-0.5 hover:bg-secondary-foreground/20'
                      onClick={(e) => handleRemove(value, e)}>
                      <X className='h-3 w-3' />
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
        </div>
        <ChevronDown className='h-4 w-4 opacity-50' />
      </div>

      {open && (
        <div className='absolute top-full left-0 mt-2 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95'>
          <div className='max-h-64 overflow-y-auto p-1'>
            {options.length === 0 ? (
              <div className='py-6 text-center text-sm text-muted-foreground'>
                No options found.
              </div>
            ) : (
              options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'group relative flex w-full cursor-default select-none items-center justify-start rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none text-left hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                      isSelected ? 'bg-accent text-accent-foreground' : '',
                    )}
                    onClick={() => handleSelect(option.value)}>
                    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                      {isSelected && <Check className='h-4 w-4' />}
                    </span>
                    <span className='flex-1 text-left'>{option.label}</span>
                    {onRemoveOption && (
                      <button
                        type='button'
                        className='ml-2 rounded-full p-0.5 text-red-500 hover:bg-red-100 hover:text-red-700 opacity-0 group-hover:opacity-100'
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveOption(option.value);
                        }}
                        title='Delete category'>
                        <X className='h-3 w-3' />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
