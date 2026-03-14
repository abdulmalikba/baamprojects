import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  colorClass?: string;
}

export default function StatusBadge({ status, colorClass }: StatusBadgeProps) {
  const defaultColor = (() => {
    const s = status.toLowerCase();
    if (s.includes('live') || s.includes('closed') || s.includes('resolved') || s.includes('done') || s.includes('completed')) return 'bg-emerald/10 text-emerald';
    if (s.includes('open') || s.includes('writing')) return 'bg-blue/10 text-blue';
    if (s.includes('progress') || s.includes('fixed') || s.includes('retested')) return 'bg-amber/10 text-amber';
    if (s.includes('delayed') || s.includes('blocked')) return 'bg-rose/10 text-rose';
    return 'bg-muted text-muted-foreground';
  })();

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', colorClass || defaultColor)}>
      {status}
    </span>
  );
}
