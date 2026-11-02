# LogShield — Synthetic SOC Detection Dashboard

**Type:** React + TypeScript detection-engineering demonstration using synthetic security events. **Not a production SIEM, real-time external log collection system, or evidence of a real incident.**

## Purpose
Demonstrates practical event triage, rule-based detection, alert correlation and a readable analyst interface. Detection is illustrative and must be corroborated before operational deployment.

## Detectors
- **Brute force:** default trigger is more than five failed authentication events (`4625` or `4771`) from the same source IP within a rolling 10-minute threshold window. The local revised implementation correlates additional nearby failures into one alert; the correlated sequence can extend beyond 10 minutes. This is a demo heuristic, not a validated production rule.
- **Location-change heuristic:** flags successful logins for the same user at different location labels within 30 minutes. It does not calculate travel speed or geodesic distance, so the label **Impossible Travel** is indicative, not proof of impossibility.

## Locally reported verification (2026-11-02)
- Vitest: 14/14 passed
- ESLint: passed
- Production build: passed
- UI smoke test: passed (user-reported)
- `npm audit --omit=dev`: 0 reported vulnerabilities
- Full dependency audit: 18 reported development dependency findings, including two critical classifications, to be evaluated before exposing any development server.

**Source note:** The actual validated local application source is intentionally not contained in this staging ZIP. Import it using `release-checks/import-local-logshield.sh`, then inspect the resulting staged files. These claims reflect the owner's terminal output, not an independent rerun of the final local code.

## Running after source import
```bash
npm ci
npm test -- --run
npm run lint
npm run build
npm run dev
```

Only run on a trusted local development environment. Do not expose the development/test UI to public networks.
