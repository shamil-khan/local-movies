'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ActionTooltipProps {
  label: string;
  children: React.ReactNode;
  variant?: 'default' | 'emerald' | 'indigo' | 'rose';
}

export const ActionTooltip = ({
  label,
  children,
  variant = 'default',
}: ActionTooltipProps) => {
  // Define glow styles for 2026 aesthetic
  const variants = {
    default: 'border-white/20 bg-black/80 shadow-white/5',
    emerald:
      'border-emerald-500/30 bg-emerald-950/90 text-emerald-100 shadow-emerald-500/20',
    indigo:
      'border-indigo-500/30 bg-indigo-950/90 text-indigo-100 shadow-indigo-500/20',
    rose: 'border-rose-500/30 bg-rose-950/90 text-rose-100 shadow-rose-500/20',
  };

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        sideOffset={10} // Adds space between button and tooltip
        className={cn(
          'px-3 py-1.5 text-xs font-medium backdrop-blur-xl border shadow-2xl animate-in fade-in zoom-in-95',
          variants[variant],
        )}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};
