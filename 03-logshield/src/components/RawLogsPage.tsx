import type { LogEntry } from '../types';
import { LogTable } from './LogTable';

interface RawLogsPageProps {
  logs: LogEntry[];
}

export function RawLogsPage({ logs }: RawLogsPageProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted font-mono border-b border-border pb-2">
        Full log stream — {logs.length} entries ingested
      </p>
      <LogTable logs={logs} />
    </div>
  );
}
