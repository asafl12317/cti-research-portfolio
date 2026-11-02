import { useMemo } from 'react';
import type { LogEntry, Alert, DetectionConfig } from '../types';
import { runNoiseReduction, DEFAULT_DETECTION_CONFIG } from '../features/logs/noiseReducer';

interface UseAlertsReturn {
  alerts: Alert[];
  criticalCount: number;
  bruteForceCount: number;
  impossibleTravelCount: number;
}

export function useAlerts(
  logs: LogEntry[],
  config: DetectionConfig = DEFAULT_DETECTION_CONFIG,
): UseAlertsReturn {
  // Re-runs whenever logs OR config changes — Settings thresholds take effect immediately
  const alerts = useMemo(() => runNoiseReduction(logs, config), [logs, config]);

  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;
  const bruteForceCount = alerts.filter((a) => a.type === 'BruteForce').length;
  const impossibleTravelCount = alerts.filter((a) => a.type === 'ImpossibleTravel').length;

  return { alerts, criticalCount, bruteForceCount, impossibleTravelCount };
}
