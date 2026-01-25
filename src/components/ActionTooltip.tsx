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
  variant?:
    | 'default'
    | 'emerald'
    | 'indigo'
    | 'rose'
    | 'amber'
    | 'violet'
    | 'sky'
    | 'slate'
    | 'destructive';
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
      'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-200/50',
    indigo:
      'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-indigo-200/50',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 shadow-rose-200/50',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 shadow-amber-200/50',
    violet:
      'border-violet-200 bg-violet-50 text-violet-700 shadow-violet-200/50',
    sky: 'border-sky-200 bg-sky-50 text-sky-700 shadow-sky-200/50',
    slate: 'border-slate-200 bg-slate-50 text-slate-700 shadow-slate-200/50',
    destructive: 'border-red-200 bg-red-50 text-red-700 shadow-red-200/50',
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
