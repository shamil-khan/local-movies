import { cn } from '@/lib/utils';

interface ImdbLinkProps {
  imdbID: string;
  title: string;
  size?: 'sm' | 'md' | 'lg'; // Added size prop
}

export const ImdbLink = ({ imdbID, title, size = 'md' }: ImdbLinkProps) => {
  // Define scaling map for the logo
  const sizeStyles = {
    sm: 'text-[8px] px-1 py-0.5 rounded-sm',
    md: 'text-[10px] px-1.5 py-0.5 rounded-md', // Your current default
    lg: 'text-[12px] px-2 py-1 rounded-lg',
  };

  return (
    <a
      href={`https://www.imdb.com/title/${imdbID}`}
      target='_blank'
      rel='noopener noreferrer'
      className='group/imdb relative inline-flex items-center w-fit'>
      {/* Resizable Logo Badge */}
      <span
        className={cn(
          'bg-[#F5C518] text-black font-black leading-none shadow-sm transition-all shrink-0',
          'hover:brightness-105 active:scale-95',
          sizeStyles[size],
        )}>
        IMDb
      </span>

      {/* Floating Tooltip Label */}
      <span
        className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
        px-2 py-1 rounded bg-zinc-800 text-[10px] font-medium text-white shadow-xl
        opacity-0 translate-y-1 group-hover/imdb:opacity-100 group-hover/imdb:translate-y-0 
        transition-all duration-300 pointer-events-none whitespace-nowrap z-50'>
        Open {title} in IMDb
        <span className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800' />
      </span>
    </a>
  );
};
