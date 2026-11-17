import { describe, expect, it } from 'vitest';
import { generateMockData } from './mockDataGenerator';

function isValidIPv4(ip: string): boolean {
  const octets = ip.split('.');
  return octets.length === 4 && octets.every((part) =>
    /^\d{1,3}$/.test(part) &&
    Number(part) >= 0 &&
    Number(part) <= 255
  );
}

describe('generateMockData IPv4 validation', () => {
  it('generates valid source and target IPv4 addresses', () => {
    for (let run = 0; run < 50; run++) {
      const logs = generateMockData();

      expect(logs).toHaveLength(200);

      for (const log of logs) {
        expect(isValidIPv4(log.sourceIp)).toBe(true);
        expect(isValidIPv4(log.targetIp)).toBe(true);
      }
    }
  });
});
