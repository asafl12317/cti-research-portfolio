export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface LogEntry {
  id: string;
  timestamp: string;      // ISO 8601
  sourceIp: string;
  targetIp: string;
  eventId: string;
  severity: Severity;
  description: string;
  location?: string;      // Synthetic location label for heuristic
  userId?: string;
}

export interface Alert {
  id: string;
  type: 'ImpossibleTravel' | 'BruteForce' | 'AnomalyDetected';
  relatedLogIds: string[];
  severity: Severity;
  message: string;
  timestamp: string;
}

export type SortField = keyof Pick<LogEntry, 'timestamp' | 'severity' | 'sourceIp' | 'targetIp' | 'eventId'>;
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export type ActivePage = 'dashboard' | 'logs' | 'alerts' | 'settings';

// ─── Detection configuration ──────────────────────────────────────────────────
// Controls the thresholds used by the noise-reduction engine.
// Stored in App state so Settings can mutate it and trigger re-detection live.
export interface DetectionConfig {
  /** Alert when failed logins exceed this number in the trigger window */
  bruteForceThreshold: number;
  /** Rolling time window (minutes) for Brute Force detection */
  bruteForceWindowMinutes: number;
  /** Maximum interval (minutes) for location-label change detection */
  impossibleTravelWindowMinutes: number;
}

export interface ChartDataPoint {
  hour: string;
  Critical: number;
  High: number;
  Medium: number;
}
