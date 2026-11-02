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

// ─── Impossible Travel ────────────────────────────────────────────────────────
// Same userId logged in from 2 geographically distinct locations within the
// travel window.  "Distinct" here means different city names; in a production
// system this would use haversine distance + known city coordinates to
// calculate whether the physical travel is actually impossible at aircraft speed.
export function detectImpossibleTravel(
  logs: LogEntry[],
  config: DetectionConfig,
  genId: () => string,
): Alert[] {
  const WINDOW_MS = config.impossibleTravelWindowMinutes * 60 * 1000;
  const SUCCESS_EVENTS = new Set(['4624', '4648']);

  const loginsByUser = new Map<string, LogEntry[]>();

  for (const log of logs) {
    if (!log.userId || !log.location) continue;
    if (!SUCCESS_EVENTS.has(log.eventId)) continue;
    const bucket = loginsByUser.get(log.userId) ?? [];
    bucket.push(log);
    loginsByUser.set(log.userId, bucket);
  }

  const alerts: Alert[] = [];

  for (const [userId, userLogs] of loginsByUser) {
    // Sort descending so that the inner j-loop break (gap only grows) is valid
    const sorted = [...userLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const seenPairs = new Set<string>(); // prevent duplicate pair alerts

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const tI = new Date(sorted[i].timestamp).getTime();
        const tJ = new Date(sorted[j].timestamp).getTime();

        // Since sorted is descending, tI >= tJ, so the gap only grows with j
        if (tI - tJ > WINDOW_MS) break;

        const locI = sorted[i].location!;
        const locJ = sorted[j].location!;

        // Same location — no travel occurred
        if (locI === locJ) continue;

        // Deduplicate: alert once per (user, locationPair) combination
        const pairKey = [userId, locI, locJ].sort().join('|');
        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);

        alerts.push({
          id: genId(),
          type: 'ImpossibleTravel',
          relatedLogIds: [sorted[i].id, sorted[j].id],
          severity: 'Critical',
          message: `Impossible travel for ${userId}: logins from "${locJ}" and "${locI}" within ${config.impossibleTravelWindowMinutes} minutes`,
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
