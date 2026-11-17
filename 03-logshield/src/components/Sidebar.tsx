import { Shield, LayoutDashboard, FileText, Bell, Settings, Radio } from 'lucide-react';
import type { ActivePage } from '../types';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  alertCount: number;
}

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'logs', label: 'Raw Logs', icon: FileText },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activePage, onNavigate, alertCount }: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-surface border-r border-border flex flex-col z-30 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-accent/10 text-accent">
          <Shield size={18} />
        </div>
        <span className="font-semibold text-text-primary tracking-wide text-sm">
          Log<span className="text-accent">Shield</span>
        </span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Radio size={12} className="text-low animate-pulse" />
        <span className="text-xs text-text-muted font-mono">SYNTHETIC DEMO</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative
                ${isActive
                  ? 'text-accent bg-accent/10 border-r-2 border-accent'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
            >
              <Icon size={16} className={isActive ? 'text-accent' : ''} />
              <span>{label}</span>
              {id === 'alerts' && alertCount > 0 && (
                <span className="ml-auto bg-critical text-white text-xs font-mono rounded-full w-5 h-5 flex items-center justify-center">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-text-muted font-mono">v1.0.0-soc</p>
        <p className="text-xs text-text-muted mt-0.5">© 2024 LogShield</p>
      </div>
    </aside>
  );
}
