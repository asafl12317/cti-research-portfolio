import type { LogEntry, Alert, DetectionConfig } from '../../types';

// ─── Default config ───────────────────────────────────────────────────────────
export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  bruteForceThreshold: 5,
  bruteForceWindowMinutes: 10,
  impossibleTravelWindowMinutes: 30,
};

// ─── ID generator — local, no module-level mutable state ─────────────────────
function makeIdGen() {
  let counter = 0;
  return () => `alert-${String(++counter).padStart(4, '0')}`;
}

// ─── Brute Force ─────────────────────────────────────────────────────────────
// >threshold failed logins (eventId 4625 or 4771) from same sourceIp
// within bruteForceWindowMinutes
export function detectBruteForce(
  logs: LogEntry[],
  config: DetectionConfig,
  genId: () => string,
): Alert[] {
  const FAILED_EVENTS = new Set(['4625', '4771']);
  const WINDOW_MS = config.bruteForceWindowMinutes * 60 * 1000;
  const THRESHOLD = config.bruteForceThreshold;

  const failedByIp = new Map<string, LogEntry[]>();

  for (const log of logs) {
    if (!FAILED_EVENTS.has(log.eventId)) continue;

    const bucket = failedByIp.get(log.sourceIp) ?? [];
    bucket.push(log);
    failedByIp.set(log.sourceIp, bucket);
  }

  const alerts: Alert[] = [];

  for (const [ip, ipLogs] of failedByIp) {
    const sorted = [...ipLogs].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    );

    let windowStart = 0;
    let clusterStart = -1;
    let clusterEnd = -1;

    const emitCluster = () => {
      if (clusterStart < 0) return;

      const cluster = sorted.slice(clusterStart, clusterEnd + 1);

      alerts.push({
        id: genId(),
        type: 'BruteForce',
        relatedLogIds: cluster.map((log) => log.id),
        severity: 'High',
        message:
          `Brute-force detected: ${cluster.length} failed logins ` +
          `from ${ip} within the detection window`,
        timestamp: cluster[cluster.length - 1].timestamp,
      });

      clusterStart = -1;
      clusterEnd = -1;
    };

    for (let i = 0; i < sorted.length; i++) {
      const currentTime = new Date(sorted[i].timestamp).getTime();

      if (clusterStart >= 0) {
        const lastTime =
          new Date(sorted[clusterEnd].timestamp).getTime();

        if (currentTime - lastTime <= WINDOW_MS) {
          clusterEnd = i;
          continue;
        }

        emitCluster();
        windowStart = i;
      }

      while (
        windowStart < i &&
        new Date(sorted[windowStart].timestamp).getTime() <
          currentTime - WINDOW_MS
      ) {
        windowStart++;
      }

      if (i - windowStart + 1 > THRESHOLD) {
        clusterStart = windowStart;
        clusterEnd = i;
      }
    }

    emitCluster();
  }

  return alerts;
}

// ─── Suspicious Location Change (not physical impossible travel) ─────────────
// Uses only synthetic city labels and successful-logon event ID 4624.
// No geolocation, distance, velocity, VPN, proxy or device risk evaluation.
// Keep the legacy function and alert type for compatibility with existing callers.
export function detectImpossibleTravel(
  logs: LogEntry[],
  config: DetectionConfig,
  genId: () => string,
): Alert[] {
  const WINDOW_MS = config.impossibleTravelWindowMinutes * 60 * 1000;
  const loginsByUser = new Map<string, LogEntry[]>();

  for (const log of logs) {
    if (!log.userId || !log.location || log.eventId !== '4624') continue;
    if (!Number.isFinite(Date.parse(log.timestamp))) continue;
    const bucket = loginsByUser.get(log.userId) ?? [];
    bucket.push(log);
    loginsByUser.set(log.userId, bucket);
  }

  const alerts: Alert[] = [];
  for (const [userId, userLogs] of loginsByUser) {
    const sorted = [...userLogs].sort(
      (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
    );
    // De-duplicate near-identical alerts within an incident, NOT forever.
    // An independent pair of events six hours later must still be reported.
    const mostRecentPairAlert = new Map<string, number>();

    for (let i = 0; i < sorted.length; i++) {
      const tI = Date.parse(sorted[i].timestamp);
      for (let j = i + 1; j < sorted.length; j++) {
        const tJ = Date.parse(sorted[j].timestamp);
        if (tI - tJ > WINDOW_MS) break;
        const locI = sorted[i].location!;
        const locJ = sorted[j].location!;
        if (locI === locJ) continue;
        const pairKey = [locI, locJ].sort().join('|');
        const previous = mostRecentPairAlert.get(pairKey);
        if (previous !== undefined && previous - tI <= WINDOW_MS) continue;
        mostRecentPairAlert.set(pairKey, tI);

        alerts.push({
          id: genId(),
          type: 'ImpossibleTravel', // legacy internal key; display name is explicit
          relatedLogIds: [sorted[i].id, sorted[j].id],
          severity: 'Medium',
          message: `Suspicious location change for ${userId}: successful logons labeled "${locJ}" and "${locI}" within ${config.impossibleTravelWindowMinutes} minutes. Review for VPN/proxy, account sharing and geolocation error.`,
          timestamp: sorted[i].timestamp,
        });
      }
    }
  }
  return alerts;
}

// ─── Pipeline entry point ─────────────────────────────────────────────────────
export function runNoiseReduction(
  logs: LogEntry[],
  config: DetectionConfig = DEFAULT_DETECTION_CONFIG,
): Alert[] {
  // ID generator is created fresh every call — no module-level mutable state,
  // safe under React Strict Mode double-invocation and concurrent rendering.
  const genId = makeIdGen();

  const bf = detectBruteForce(logs, config, genId);
  const it = detectImpossibleTravel(logs, config, genId);

  return [...bf, ...it].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
