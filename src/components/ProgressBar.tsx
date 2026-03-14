import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  const getColor = () => {
    if (value >= 100) return 'bg-emerald';
    if (value >= 60) return 'bg-primary';
    if (value >= 30) return 'bg-amber';
    return 'bg-muted-foreground';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor())}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-mono text-muted-foreground w-8 text-right">{value}%</span>}
    </div>
  );
}
