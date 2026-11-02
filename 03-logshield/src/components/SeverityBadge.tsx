import type { Severity } from '../types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
}

const SEVERITY_STYLES: Record<Severity, string> = {
  Critical: 'bg-critical/20 text-critical border-critical/30',
  High: 'bg-high/20 text-high border-high/30',
  Medium: 'bg-medium/20 text-medium border-medium/30',
  Low: 'bg-low/20 text-low border-low/30',
  Informational: 'bg-info/20 text-text-muted border-info/30',
};

export function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-semibold uppercase tracking-wider ${sizeClass} ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
