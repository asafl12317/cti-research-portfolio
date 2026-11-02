import { useState, useEffect } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import type { ActivePage } from '../types';

interface HeaderProps {
  activePage: ActivePage;
  alertCount: number;
  onNavigate: (page: ActivePage) => void;
}

const PAGE_LABELS: Record<ActivePage, string> = {
  dashboard: 'Dashboard',
  logs: 'Raw Logs',
  alerts: 'Alert Center',
  settings: 'Settings',
};

export function Header({ activePage, alertCount, onNavigate }: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-surface border-b border-border flex items-center px-6 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-text-muted">LogShield</span>
        <ChevronRight size={14} className="text-border" />
        <span className="text-text-primary font-medium">{PAGE_LABELS[activePage]}</span>
      </div>

      <div className="ml-auto flex items-center gap-6">
        {/* Live clock */}
        <div className="text-right">
          <p className="text-xs font-mono text-accent">{timeStr} UTC</p>
          <p className="text-xs font-mono text-text-muted">{dateStr}</p>
        </div>

        {/* Notification bell */}
        <button
          onClick={() => onNavigate('alerts')}
          className="relative p-2 rounded hover:bg-surface-2 transition-colors text-text-muted hover:text-text-primary"
          aria-label={`${alertCount} alerts`}
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-critical text-white text-[10px] font-mono rounded-full flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
