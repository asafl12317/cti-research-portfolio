import { describe, it, expect } from 'vitest';
import { detectBruteForce, detectImpossibleTravel, DEFAULT_DETECTION_CONFIG } from './noiseReducer';
import type { LogEntry, DetectionConfig } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeIdGen() {
  let n = 0;
  return () => `alert-${String(++n).padStart(4, '0')}`;
}

function makeLog(overrides: Partial<LogEntry>): LogEntry {
  return {
    id: `log-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    sourceIp: '1.2.3.4',
    targetIp: '10.0.0.1',
    eventId: '4625',
    severity: 'High',
    description: 'Failed Logon',
    ...overrides,
  };
}

/** Build N failed-login entries from the same IP within `durationMinutes` */
function buildFailedLogins(
  ip: string,
  count: number,
  baseTime: Date,
  durationMinutes = 9,
): LogEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const msSinceBase = (durationMinutes * 60 * 1000 * i) / Math.max(count - 1, 1);
    return makeLog({
      id: `log-bf-${ip}-${i}`,
      sourceIp: ip,
      eventId: '4625',
      severity: 'High',
      timestamp: new Date(baseTime.getTime() + msSinceBase).toISOString(),
    });
  });
}

const cfg: DetectionConfig = DEFAULT_DETECTION_CONFIG; // {threshold:5, window:10min, travel:30min}

// ─── detectBruteForce ─────────────────────────────────────────────────────────

describe('detectBruteForce', () => {
  it('returns no alert when failures equal the threshold (boundary — strictly greater required)', () => {
    const now = new Date();
    const logs = buildFailedLogins('10.0.0.1', cfg.bruteForceThreshold, now);
    const alerts = detectBruteForce(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(0);
  });

  it('fires exactly one alert when failures exceed the threshold by one', () => {
    const now = new Date();
    const logs = buildFailedLogins('10.0.0.2', cfg.bruteForceThreshold + 1, now);
    const alerts = detectBruteForce(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('BruteForce');
    expect(alerts[0].severity).toBe('High');
  });

  it('includes the correct number of related log IDs in the alert', () => {
    const now = new Date();
    const count = cfg.bruteForceThreshold + 2; // 7 failures
    const logs = buildFailedLogins('10.0.0.3', count, now);
    const alerts = detectBruteForce(logs, cfg, makeIdGen());
    expect(alerts[0].relatedLogIds).toHaveLength(count);
  });

  it('detects two separate clusters from the same IP with a gap between them', () => {
    const now = new Date();
    // Cluster 1: 6 failures within first 9 minutes
    const cluster1 = buildFailedLogins('10.0.0.4', 6, now, 9);
    // Cluster 2: 6 failures starting 20 minutes later (clearly outside first window)
    const cluster2Start = new Date(now.getTime() + 20 * 60 * 1000);
    const cluster2 = buildFailedLogins('10.0.0.4', 6, cluster2Start, 9);

    const alerts = detectBruteForce([...cluster1, ...cluster2], cfg, makeIdGen());
    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });

  it('ignores successful-login event IDs (4624)', () => {
    const logs = Array.from({ length: 10 }, (_, i) =>
      makeLog({ id: `log-ok-${i}`, sourceIp: '10.0.0.5', eventId: '4624' }),
    );
    const alerts = detectBruteForce(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(0);
  });

  it('respects a custom threshold passed via config', () => {
    const now = new Date();
    const customCfg: DetectionConfig = { ...cfg, bruteForceThreshold: 2 };
    // 3 failures — enough to exceed threshold of 2
    const logs = buildFailedLogins('10.0.0.6', 3, now);
    const alerts = detectBruteForce(logs, customCfg, makeIdGen());
    expect(alerts).toHaveLength(1);
  });

  it('does not fire when all failures fall outside the time window', () => {
    // 6 failures spread over 60 minutes — window is only 10 min
    const now = new Date();
    const logs = buildFailedLogins('10.0.0.7', 6, now, 60);
    const alerts = detectBruteForce(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(0);
  });
});


describe('Brute Force extended-window validation', () => {
  it('does not describe a long correlated sequence as entirely within 10 minutes', () => {
    const now = new Date('2026-11-02T10:00:00.000Z');

    const logs = buildFailedLogins('10.0.0.88', 8, now, 14);
    const alerts = detectBruteForce(logs, cfg, makeIdGen());

    expect(alerts).toHaveLength(1);

    const alert = alerts[0];
    const relatedLogs = logs.filter((log) =>
      alert.relatedLogIds.includes(log.id),
    );

    const timestamps = relatedLogs.map((log) =>
      new Date(log.timestamp).getTime(),
    );

    const spanMinutes =
      (Math.max(...timestamps) - Math.min(...timestamps)) / 60000;

    if (spanMinutes > cfg.bruteForceWindowMinutes) {
      expect(alert.message).not.toMatch(/8 failed logins.*within 10 minutes/i);
    }
  });
});


describe('Brute Force sustained attack correlation', () => {
  it('correlates a sustained 22-minute attack without duplicate alerts', () => {
    const start = new Date('2026-11-02T10:00:00.000Z');
    const logs = buildFailedLogins('10.0.0.99', 12, start, 22);

    const alerts = detectBruteForce(logs, cfg, makeIdGen());

    expect(alerts).toHaveLength(1);
    expect(alerts[0].relatedLogIds).toHaveLength(12);
    expect(new Set(alerts[0].relatedLogIds).size).toBe(12);
  });
});

// ─── detectImpossibleTravel ───────────────────────────────────────────────────

describe('detectImpossibleTravel', () => {
  it('fires a Critical alert when the same user logs in from two different cities within 30 minutes', () => {
    const now = new Date();
    const logs: LogEntry[] = [
      makeLog({
        id: 'it-a',
        userId: 'user-42',
        location: 'Tel Aviv',
        eventId: '4624',
        severity: 'Critical',
        timestamp: now.toISOString(),
      }),
      makeLog({
        id: 'it-b',
        userId: 'user-42',
        location: 'Moscow',
        eventId: '4624',
        severity: 'Critical',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // 10 min earlier
      }),
    ];
    const alerts = detectImpossibleTravel(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('ImpossibleTravel');
    expect(alerts[0].severity).toBe('Critical');
    expect(alerts[0].relatedLogIds).toContain('it-a');
    expect(alerts[0].relatedLogIds).toContain('it-b');
  });

  it('does NOT fire when both logins are from the same location', () => {
    const now = new Date();
    const logs: LogEntry[] = [
      makeLog({ id: 'same-a', userId: 'user-99', location: 'London', eventId: '4624', timestamp: now.toISOString() }),
      makeLog({ id: 'same-b', userId: 'user-99', location: 'London', eventId: '4624', timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString() }),
    ];
    const alerts = detectImpossibleTravel(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(0);
  });

  it('does NOT fire when the two logins exceed the 30-minute travel window', () => {
    const now = new Date();
    const logs: LogEntry[] = [
      makeLog({ id: 'far-a', userId: 'user-77', location: 'New York', eventId: '4624', timestamp: now.toISOString() }),
      makeLog({ id: 'far-b', userId: 'user-77', location: 'Beijing', eventId: '4624', timestamp: new Date(now.getTime() - 31 * 60 * 1000).toISOString() }),
    ];
    const alerts = detectImpossibleTravel(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(0);
  });

  it('does NOT fire for logins without a location field', () => {
    const now = new Date();
    const logs: LogEntry[] = [
      makeLog({ id: 'noloc-a', userId: 'user-55', eventId: '4624', timestamp: now.toISOString() }),
      makeLog({ id: 'noloc-b', userId: 'user-55', eventId: '4624', timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString() }),
    ];
    const alerts = detectImpossibleTravel(logs, cfg, makeIdGen());
    expect(alerts).toHaveLength(0);
  });

  it('deduplicates: fires only one alert for the same (userId, locationPair)', () => {
    const now = new Date();
    // Three logins: Tel Aviv / Moscow / Tel Aviv — the Tel Aviv↔Moscow pair should fire once
    const logs: LogEntry[] = [
      makeLog({ id: 'dup-a', userId: 'user-11', location: 'Tel Aviv', eventId: '4624', timestamp: now.toISOString() }),
      makeLog({ id: 'dup-b', userId: 'user-11', location: 'Moscow',   eventId: '4624', timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString() }),
      makeLog({ id: 'dup-c', userId: 'user-11', location: 'Tel Aviv', eventId: '4624', timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString() }),
    ];
    const alerts = detectImpossibleTravel(logs, cfg, makeIdGen());
    const travelAlerts = alerts.filter((a) => a.type === 'ImpossibleTravel');
    // Only 1 unique pair: Tel Aviv | Moscow
    expect(travelAlerts.length).toBeLessThanOrEqual(1);
  });
});
