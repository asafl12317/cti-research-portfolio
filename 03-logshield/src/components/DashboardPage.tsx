import { Database, ShieldAlert, Ban, Filter } from 'lucide-react';
import type { LogEntry, Alert } from '../types';
import { SummaryCard } from './SummaryCard';
import { AlertVolumeChart } from './AlertVolumeChart';
import { LogTable } from './LogTable';
import { getCriticalSourceIps, getInformationalCount } from '../features/logs/parser';

interface DashboardPageProps {
  logs: LogEntry[];
  alerts: Alert[];
}

export function DashboardPage({ logs, alerts }: DashboardPageProps) {
  const criticalIps = getCriticalSourceIps(logs);
  const noiseFiltered = getInformationalCount(logs);
  const criticalAlerts = alerts.filter((a) => a.severity === 'Critical').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Logs Ingested"
          value={logs.length}
          icon={Database}
          accent="accent"
          subtitle="Last 24 hours"
        />
        <SummaryCard
          title="Critical Alerts"
          value={criticalAlerts}
          icon={ShieldAlert}
          accent="critical"
          subtitle="Require immediate action"
        />
        <SummaryCard
          title="Critical Source IPs"
          value={criticalIps.size}
          icon={Ban}
          accent="high"
          subtitle="Unique IPs with critical-severity events"
        />
        <SummaryCard
          title="Noise Filtered"
          value={noiseFiltered}
          icon={Filter}
          accent="default"
          subtitle="Informational events suppressed"
        />
      </div>

      {/* Chart */}
      <AlertVolumeChart logs={logs} />

      {/* Recent Logs */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-widest mb-3">
          Recent Log Feed
        </h2>
        <LogTable logs={logs} />
      </div>
    </div>
  );
}
