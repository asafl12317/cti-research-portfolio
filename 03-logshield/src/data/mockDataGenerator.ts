import type { LogEntry, Severity } from '../types';

const EVENT_IDS: Record<string, string> = {
  '4624': 'Successful Logon',
  '4625': 'Failed Logon',
  '4648': 'Logon with Explicit Credentials',
  '4720': 'User Account Created',
  '4776': 'Credential Validation',
  '4768': 'Kerberos Authentication Ticket Requested',
  '4771': 'Kerberos Pre-authentication Failed',
  '4732': 'Member Added to Security-Enabled Local Group',
  '4698': 'Scheduled Task Created',
  '4697': 'Service Installed on System',
};

const EVENT_ID_LIST = Object.keys(EVENT_IDS);

const CITIES = [
  'New York', 'London', 'Tel Aviv', 'Moscow', 'Beijing',
  'São Paulo', 'Lagos', 'Sydney', 'Tokyo', 'Berlin',
];

const INTERNAL_IPS = [
  '10.0.0.', '10.0.1.', '192.168.1.', '192.168.0.', '172.16.0.',
];

const EXTERNAL_IPS = [
  '185.220.101.', '91.108.4.', '45.33.32.', '198.51.100.', '203.0.113.',
  '178.62.', '104.21.', '162.243.', '67.205.', '159.89.',
];

let idCounter = 0;
function genId(): string {
  return `log-${String(++idCounter).padStart(5, '0')}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIp(prefix: string): string {
  return `${prefix}${randomInt(1, 254)}`;
}

function isoOffset(minsAgo: number): string {
  return new Date(Date.now() - minsAgo * 60 * 1000).toISOString();
}

function severityFromBias(): Severity {
  const r = Math.random();
  if (r < 0.05) return 'Critical';
  if (r < 0.20) return 'High';
  if (r < 0.50) return 'Medium';
  if (r < 0.80) return 'Low';
  return 'Informational';
}

function descriptionForEvent(eventId: string, severity: Severity): string {
  const base = EVENT_IDS[eventId] ?? 'Security Event';
  const prefixes: Record<Severity, string> = {
    Critical: '[CRITICAL] ',
    High: '[HIGH] ',
    Medium: '',
    Low: '',
    Informational: '[INFO] ',
  };
  return `${prefixes[severity]}${base}`;
}

// ─── Brute-force clusters ─────────────────────────────────────────────────────
// 3 clusters: same sourceIp, >5 failed logins within 10 minutes
function buildBruteForceCluster(baseTime: number, sourceIp: string, targetIp: string, userId: string): LogEntry[] {
  const entries: LogEntry[] = [];
  const count = randomInt(6, 12);
  for (let i = 0; i < count; i++) {
    const minsOffset = Math.random() * 9; // within 9 minutes
    entries.push({
      id: genId(),
      timestamp: new Date(baseTime - minsOffset * 60 * 1000).toISOString(),
      sourceIp,
      targetIp,
      eventId: '4625',
      severity: 'High',
      description: '[HIGH] Failed Logon — repeated attempt detected',
      userId,
    });
  }
  return entries;
}

// ─── Location-change heuristic examples ───────────────────────────────────────────────
// 2 scenarios: same userId from 2 cities within 30 minutes
function buildImpossibleTravel(
  baseTime: number,
  userId: string,
  city1: string,
  city2: string,
  ip1: string,
  ip2: string,
  targetIp: string,
): LogEntry[] {
  return [
    {
      id: genId(),
      timestamp: new Date(baseTime).toISOString(),
      sourceIp: ip1,
      targetIp,
      eventId: '4624',
      severity: 'Medium',
      description: 'Successful Logon — differing synthetic location labels',
      location: city1,
      userId,
    },
    {
      id: genId(),
      timestamp: new Date(baseTime - randomInt(5, 25) * 60 * 1000).toISOString(),
      sourceIp: ip2,
      targetIp,
      eventId: '4624',
      severity: 'Medium',
      description: 'Successful Logon — differing synthetic location labels',
      location: city2,
      userId,
    },
  ];
}

// ─── Random filler entries ────────────────────────────────────────────────────
function buildRandomEntry(minsAgo: number): LogEntry {
  const severity = severityFromBias();
  const eventId = randomItem(EVENT_ID_LIST);
  const isExternal = Math.random() > 0.4;
  const srcPrefix = isExternal
    ? randomItem(EXTERNAL_IPS)
    : randomItem(INTERNAL_IPS);
  const dstPrefix = randomItem(INTERNAL_IPS);
  const hasUser = Math.random() > 0.5;

  return {
    id: genId(),
    timestamp: isoOffset(minsAgo),
    sourceIp: randomIp(srcPrefix),
    targetIp: randomIp(dstPrefix),
    eventId,
    severity,
    description: descriptionForEvent(eventId, severity),
    location: Math.random() > 0.7 ? randomItem(CITIES) : undefined,
    userId: hasUser ? `user-${randomInt(100, 999)}` : undefined,
  };
}

// ─── Main generator ───────────────────────────────────────────────────────────
export function generateMockData(): LogEntry[] {
  idCounter = 0;
  const entries: LogEntry[] = [];
  const now = Date.now();

  // 3 brute-force clusters
  entries.push(...buildBruteForceCluster(now - 60 * 60 * 1000, randomIp('91.108.4.'), randomIp('10.0.0.'), 'user-401'));
  entries.push(...buildBruteForceCluster(now - 3 * 60 * 60 * 1000, randomIp('185.220.101.'), randomIp('192.168.1.'), 'user-502'));
  entries.push(...buildBruteForceCluster(now - 11 * 60 * 60 * 1000, randomIp('45.33.32.'), randomIp('10.0.1.'), 'user-677'));

  // 2 location-change examples
  entries.push(...buildImpossibleTravel(
    now - 2 * 60 * 60 * 1000,
    'user-201',
    'New York', 'Moscow',
    randomIp('198.51.100.'), randomIp('178.62.'),
    randomIp('10.0.0.'),
  ));
  entries.push(...buildImpossibleTravel(
    now - 7 * 60 * 60 * 1000,
    'user-333',
    'Tel Aviv', 'Beijing',
    randomIp('91.108.4.'), randomIp('104.21.'),
    randomIp('192.168.1.'),
  ));

  // Fill up to 200 with random entries
  const remaining = 200 - entries.length;
  for (let i = 0; i < remaining; i++) {
    const minsAgo = randomInt(0, 24 * 60);
    entries.push(buildRandomEntry(minsAgo));
  }

  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return entries;
}

export const MOCK_LOGS: LogEntry[] = generateMockData();
