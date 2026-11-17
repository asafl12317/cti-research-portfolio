import { Settings, Shield, Clock, Database } from 'lucide-react';
import type { DetectionConfig } from '../types';

interface SettingsPageProps {
  config: DetectionConfig;
  onConfigChange: (patch: Partial<DetectionConfig>) => void;
}

export function SettingsPage({ config, onConfigChange }: SettingsPageProps) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-surface border border-border rounded-lg divide-y divide-border">

        {/* Section: Detection Engine */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Detection Engine</h3>
            <span className="ml-auto text-xs font-mono text-low bg-low/10 border border-low/20 rounded px-2 py-0.5">
              LIVE — changes re-run detection instantly
            </span>
          </div>
          <div className="space-y-5">
            <SliderRow
              label="Brute Force Threshold"
              description="Failed logins from the same IP required to trigger an alert"
              value={config.bruteForceThreshold}
              min={3}
              max={20}
              step={1}
              unit="attempts"
              onChange={(v) => onConfigChange({ bruteForceThreshold: v })}
            />
            <SliderRow
              label="Brute Force Window"
              description="Rolling time window for counting failed logins"
              value={config.bruteForceWindowMinutes}
              min={5}
              max={60}
              step={5}
              unit="min"
              onChange={(v) => onConfigChange({ bruteForceWindowMinutes: v })}
            />
            <SliderRow
              label="Suspicious Location Change Window"
              description="Maximum time between two logins from different locations"
              value={config.impossibleTravelWindowMinutes}
              min={10}
              max={120}
              step={10}
              unit="min"
              onChange={(v) => onConfigChange({ impossibleTravelWindowMinutes: v })}
            />
          </div>
        </div>

        {/* Section: Data */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Database size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Data Ingestion</h3>
          </div>
          <div className="space-y-4">
            <ReadOnlyRow
              label="Log Volume"
              description="Total log entries in the current dataset"
              value="200 entries"
            />
            <ReadOnlyRow
              label="Informational Filter"
              description="Default filter state for informational logs in the Raw Logs view"
              value="Hidden by default"
            />
          </div>
        </div>

        {/* Section: Display */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Display</h3>
          </div>
          <div className="space-y-4">
            <ReadOnlyRow
              label="Timezone"
              description="Timestamp display format"
              value="UTC"
            />
            <ReadOnlyRow
              label="Rows per page"
              description="Log table pagination size"
              value="25"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-muted font-mono border border-border rounded p-3 bg-surface">
        <Settings size={12} />
        LogShield v1.0.0-soc — Detection thresholds are wired to the live engine.
      </div>
    </div>
  );
}

// ─── SliderRow ────────────────────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function SliderRow({ label, description, value, min, max, step, unit, onChange }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
        <span
          className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 rounded px-2 py-1 whitespace-nowrap shrink-0 min-w-[5rem] text-center"
          aria-live="polite"
        >
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-border accent-accent"
        aria-label={`${label}: ${value} ${unit}`}
      />
      <div className="flex justify-between text-xs text-text-muted font-mono">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// ─── ReadOnlyRow ──────────────────────────────────────────────────────────────
function ReadOnlyRow({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <span className="text-xs font-mono text-text-muted bg-surface-2 border border-border rounded px-2 py-1 whitespace-nowrap shrink-0">
        {value}
      </span>
    </div>
  );
}
