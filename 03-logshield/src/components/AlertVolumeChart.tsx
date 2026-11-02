import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { LogEntry, ChartDataPoint } from '../types';

interface AlertVolumeChartProps {
  logs: LogEntry[];
}

function buildChartData(logs: LogEntry[]): ChartDataPoint[] {
  const buckets = new Map<string, ChartDataPoint>();

  // Build 24 hourly buckets
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i, 0, 0, 0);
    const key = `${String(d.getHours()).padStart(2, '0')}:00`;
    buckets.set(key, { hour: key, Critical: 0, High: 0, Medium: 0 });
  }

  for (const log of logs) {
    if (log.severity === 'Low' || log.severity === 'Informational') continue;
    const d = new Date(log.timestamp);
    const key = `${String(d.getHours()).padStart(2, '0')}:00`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (log.severity === 'Critical') bucket.Critical++;
    else if (log.severity === 'High') bucket.High++;
    else if (log.severity === 'Medium') bucket.Medium++;
  }

  return Array.from(buckets.values());
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded px-3 py-2 text-xs font-mono">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function AlertVolumeChart({ logs }: AlertVolumeChartProps) {
  const data = buildChartData(logs);

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-widest">
          Alert Volume — Last 24 Hours
        </h2>
        <p className="text-xs text-text-muted mt-0.5">Hourly distribution of Critical / High / Medium events</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={8} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#1f2937' }}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}
          />
          <Bar dataKey="Critical" fill="#ef4444" radius={[2, 2, 0, 0]} />
          <Bar dataKey="High" fill="#f97316" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Medium" fill="#eab308" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
