import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LogEntry, SortField, SortState } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { useLogFilter } from '../hooks/useLogFilter';
import { usePagination } from '../hooks/usePagination';

interface LogTableProps {
  logs: LogEntry[];
}

interface Column {
  field: SortField;
  label: string;
  mono?: boolean;
}

const COLUMNS: Column[] = [
  { field: 'timestamp', label: 'Timestamp', mono: true },
  { field: 'severity', label: 'Severity' },
  { field: 'sourceIp', label: 'Source IP', mono: true },
  { field: 'targetIp', label: 'Target IP', mono: true },
  { field: 'eventId', label: 'Event ID', mono: true },
];

function SortIcon({ field, sort }: { field: SortField; sort: SortState }) {
  if (sort.field !== field) return <ChevronsUpDown size={12} className="text-border" />;
  return sort.direction === 'asc'
    ? <ChevronUp size={12} className="text-accent" />
    : <ChevronDown size={12} className="text-accent" />;
}

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export function LogTable({ logs }: LogTableProps) {
  const {
    filteredLogs,
    searchQuery,
    setSearchQuery,
    showInformational,
    toggleInformational,
    sort,
    setSort,
  } = useLogFilter(logs);

  const { page, totalPages, pageItems, nextPage, prevPage, goToPage } = usePagination(filteredLogs, 25);

  return (
    <div className="bg-surface border border-border rounded-lg flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap gap-y-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search IP, description, event ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg border border-border rounded pl-8 pr-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          onClick={toggleInformational}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors
            ${showInformational
              ? 'bg-accent/10 border-accent/40 text-accent'
              : 'bg-bg border-border text-text-muted hover:text-text-primary hover:border-text-muted'
            }`}
        >
          {showInformational ? <Eye size={13} /> : <EyeOff size={13} />}
          Informational
        </button>
        <span className="text-xs text-text-muted font-mono">
          {filteredLogs.length.toLocaleString()} entries
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {COLUMNS.map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => setSort(field)}
                  className="px-4 py-2.5 text-left text-text-muted uppercase tracking-widest text-[10px] cursor-pointer hover:text-text-primary select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon field={field} sort={sort} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 text-left text-text-muted uppercase tracking-widest text-[10px] whitespace-nowrap">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-muted font-mono text-xs">
                  No log entries match the current filter.
                </td>
              </tr>
            ) : (
              pageItems.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border/50 hover:bg-surface-2 transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-text-muted whitespace-nowrap">
                    {formatTs(log.timestamp)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <SeverityBadge severity={log.severity} />
                  </td>
                  <td className="px-4 py-2 font-mono text-text-primary whitespace-nowrap">
                    {log.sourceIp}
                  </td>
                  <td className="px-4 py-2 font-mono text-text-muted whitespace-nowrap">
                    {log.targetIp}
                  </td>
                  <td className="px-4 py-2 font-mono text-accent whitespace-nowrap">
                    {log.eventId}
                  </td>
                  <td className="px-4 py-2 text-text-muted max-w-xs truncate">
                    {log.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
        <span className="text-xs text-text-muted font-mono">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={prevPage}
            disabled={page === 1}
            className="p-1.5 rounded border border-border text-text-muted hover:text-text-primary hover:border-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {/* Page number buttons */}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-7 h-7 rounded border text-xs font-mono transition-colors
                  ${p === page
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'border-border text-text-muted hover:text-text-primary hover:border-text-muted'
                  }`}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 7 && (
            <span className="text-text-muted text-xs px-1 font-mono">…</span>
          )}
          <button
            onClick={nextPage}
            disabled={page === totalPages}
            className="p-1.5 rounded border border-border text-text-muted hover:text-text-primary hover:border-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
