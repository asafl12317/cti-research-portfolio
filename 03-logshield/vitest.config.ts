/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// Vitest configuration — separate from vite.config.ts so the build stays clean.
// Run tests with: npm test  (requires: npm install --save-dev vitest)
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
