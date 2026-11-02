import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'accent';
  subtitle?: string;
}

const ACCENT_CLASSES: Record<NonNullable<SummaryCardProps['accent']>, string> = {
  default: 'text-text-muted bg-surface-2',
  critical: 'text-critical bg-critical/10',
  high: 'text-high bg-high/10',
  medium: 'text-medium bg-medium/10',
  low: 'text-low bg-low/10',
  accent: 'text-accent bg-accent/10',
};

const VALUE_CLASSES: Record<NonNullable<SummaryCardProps['accent']>, string> = {
  default: 'text-text-primary',
  critical: 'text-critical',
  high: 'text-high',
  medium: 'text-medium',
  low: 'text-low',
  accent: 'text-accent',
};

export function SummaryCard({ title, value, icon: Icon, accent = 'default', subtitle }: SummaryCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-start gap-4">
      <div className={`p-2.5 rounded ${ACCENT_CLASSES[accent]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted uppercase tracking-widest font-medium">{title}</p>
        <p className={`text-2xl font-bold font-mono mt-1 ${VALUE_CLASSES[accent]}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
