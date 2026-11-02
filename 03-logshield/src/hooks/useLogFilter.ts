import { useState, useMemo } from 'react';
import type { LogEntry, SortField, SortState } from '../types';
import { filterLogs } from '../features/logs/parser';

const SEVERITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Informational: 4,
};

function sortLogs(logs: LogEntry[], sort: SortState): LogEntry[] {
  return [...logs].sort((a, b) => {
    let cmp = 0;
    switch (sort.field) {
      case 'timestamp':
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'severity':
        cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        break;
      case 'sourceIp':
        cmp = a.sourceIp.localeCompare(b.sourceIp);
        break;
      case 'targetIp':
        cmp = a.targetIp.localeCompare(b.targetIp);
        break;
      case 'eventId':
        cmp = a.eventId.localeCompare(b.eventId);
        break;
    }
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

interface UseLogFilterReturn {
  filteredLogs: LogEntry[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showInformational: boolean;
  toggleInformational: () => void;
  sort: SortState;
  setSort: (field: SortField) => void;
}

export function useLogFilter(logs: LogEntry[]): UseLogFilterReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInformational, setShowInformational] = useState(false);
  const [sort, setSortState] = useState<SortState>({ field: 'timestamp', direction: 'desc' });

  const setSort = (field: SortField) => {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const toggleInformational = () => setShowInformational((v) => !v);

  const filteredLogs = useMemo(() => {
    const filtered = filterLogs(logs, showInformational, searchQuery);
    return sortLogs(filtered, sort);
  }, [logs, showInformational, searchQuery, sort]);

  return {
    filteredLogs,
    searchQuery,
    setSearchQuery,
    showInformational,
    toggleInformational,
    sort,
    setSort,
  };
}
