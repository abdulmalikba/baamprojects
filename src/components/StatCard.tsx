import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, color = 'bg-primary/10 text-primary', subtitle }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1 text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
