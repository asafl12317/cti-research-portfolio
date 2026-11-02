import { ShieldAlert, Globe, Zap, AlertTriangle, Clock, Hash } from 'lucide-react';
import type { Alert } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface AlertsPanelProps {
  alerts: Alert[];
}

const TYPE_META: Record<Alert['type'], { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  BruteForce: { label: 'Brute Force', icon: Zap, color: 'text-high bg-high/10 border-high/30' },
  ImpossibleTravel: { label: 'Impossible Travel', icon: Globe, color: 'text-critical bg-critical/10 border-critical/30' },
  AnomalyDetected: { label: 'Anomaly', icon: AlertTriangle, color: 'text-medium bg-medium/10 border-medium/30' },
};

function formatTs(iso: string): string {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 19);
}

function AlertCard({ alert }: { alert: Alert }) {
  const meta = TYPE_META[alert.type];
  const Icon = meta.icon;

  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:border-text-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded border ${meta.color} shrink-0`}>
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${meta.color}`}>
              {meta.label}
            </span>
            <SeverityBadge severity={alert.severity} />
          </div>

          <p className="text-sm text-text-primary mt-2 leading-snug">{alert.message}</p>

          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs font-mono text-text-muted">
              <Clock size={11} />
              {formatTs(alert.timestamp)}
            </span>
            <span className="flex items-center gap-1 text-xs font-mono text-text-muted">
              <Hash size={11} />
              {alert.relatedLogIds.length} log{alert.relatedLogIds.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-mono text-text-muted/60">{alert.id}</span>
          </div>
        </div>

        <div className="shrink-0">
          <ShieldAlert size={14} className={alert.severity === 'Critical' ? 'text-critical' : 'text-high'} />
        </div>
      </div>
    </div>
  );
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'Critical');
  const otherAlerts = alerts.filter((a) => a.severity !== 'Critical');

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <section>
          <h3 className="text-xs text-critical uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-critical inline-block animate-pulse" />
            Critical Alerts ({criticalAlerts.length})
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
        </section>
      )}

      {otherAlerts.length > 0 && (
        <section>
          <h3 className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-3">
            Other Alerts ({otherAlerts.length})
          </h3>
          <div className="space-y-3">
            {otherAlerts.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
        </section>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-16 text-text-muted font-mono text-sm">
          No alerts detected.
        </div>
      )}
    </div>
  );
}
