import type { Alert } from '../types';
import { AlertsPanel } from './AlertsPanel';

interface AlertsPageProps {
  alerts: Alert[];
}

export function AlertsPage({ alerts }: AlertsPageProps) {
  const bf = alerts.filter((a) => a.type === 'BruteForce').length;
  const it = alerts.filter((a) => a.type === 'ImpossibleTravel').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pb-2 border-b border-border">
        <div className="text-xs font-mono text-text-muted">
          Total: <span className="text-text-primary">{alerts.length}</span>
        </div>
        <div className="text-xs font-mono text-text-muted">
          Brute Force: <span className="text-high">{bf}</span>
        </div>
        <div className="text-xs font-mono text-text-muted">
          Suspicious Location Change: <span className="text-critical">{it}</span>
        </div>
      </div>
      <AlertsPanel alerts={alerts} />
    </div>
  );
}
