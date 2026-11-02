# LogShield — Synthetic SOC Detection Dashboard

**Stack:** React, TypeScript, Vite, Vitest. **Data:** locally generated synthetic security events. **Purpose:** demonstrate detection engineering, alert triage, and an analyst-oriented interface; not a production SIEM or real incident response system.

## Capabilities demonstrated

- **Brute-force heuristic:** correlates more than five failed-authentication events from the same source IP over a 10-minute trigger window; a triggered cluster can include nearby subsequent events. This is illustrative rule logic, not a tuned production detector.
- **Location-change heuristic:** highlights successful logins for the same account from differing location labels in a short period. The UI may refer to *Impossible Travel*, but the underlying rule does **not** calculate geographical distance, speed, or impossible travel.
- **Investigation UI:** dashboards, alert listings, log browsing, filters and pagination using fixture data.

## Run locally

Requires Node.js and npm. From the `03-logshield` directory:

```bash
npm ci
npm test -- --run
npm run lint
npm run build
npm run dev
```

Use the localhost URL printed by Vite. Do not expose the development server to the public internet.

## Verification and limits

The project owner previously reported **14/14 Vitest tests passing**, ESLint passing, build passing, and successful manual UI smoke testing on a locally edited version on November 2, 2026. These results should be reproduced on the checked-out revision before using them as current evidence. A production-only npm advisory check previously reported zero findings, while the full audit reported 18 development-dependency findings; neither is a guarantee of security.

No live log ingestion, SIEM backend, enterprise deployment, or incident validation is claimed. Location labels are synthetic; alerts are rule demonstrations rather than independently confirmed attacks.
