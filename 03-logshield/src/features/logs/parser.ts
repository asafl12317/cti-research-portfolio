import type { LogEntry, Severity } from '../../types';

export type GroupedLogs = Record<Severity, LogEntry[]>;

export function groupBySeverity(logs: LogEntry[]): GroupedLogs {
  const grouped: GroupedLogs = {
    Critical: [],
    High: [],
    Medium: [],
    Low: [],
    Informational: [],
  };

  for (const log of logs) {
    grouped[log.severity].push(log);
  }

  return grouped;
}

export function filterLogs(
  logs: LogEntry[],
  showInformational: boolean,
  searchQuery: string,
): LogEntry[] {
  return logs.filter((log) => {
    if (!showInformational && log.severity === 'Informational') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.sourceIp.includes(q) ||
        log.targetIp.includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.eventId.includes(q) ||
        (log.userId?.toLowerCase().includes(q) ?? false)
      );
    }

    return true;
  });
}

export function getCriticalSourceIps(logs: LogEntry[]): Set<string> {
  return new Set(
    logs.filter((l) => l.severity === 'Critical').map((l) => l.sourceIp),
  );
}

export function getInformationalCount(logs: LogEntry[]): number {
  return logs.filter((l) => l.severity === 'Informational').length;
}
