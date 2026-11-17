# LogShield — Synthetic SOC Detection Dashboard

**Stack:** React, TypeScript, Vite, Vitest. **Data:** locally generated synthetic security events. **Purpose:** demonstrate detection engineering, alert triage, and an analyst-oriented interface; not a production SIEM or real incident response system.

## Capabilities demonstrated

- **Brute-force heuristic:** correlates more than five failed-authentication events from the same source IP over a 10-minute trigger window; a triggered cluster can include nearby subsequent events. This is illustrative rule logic, not a tuned production detector.
- **Location-change heuristic:** highlights successful logins for the same account from differing location labels in a short period. The UI labels this **Suspicious Location Change** and assigns **Medium** severity; no distance, velocity or true impossible-travel check is performed. Only Windows event ID 4624 is treated as a successful logon in this demonstration; 4648 is not.
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

## Analyst walkthrough — alert to evidence to triage

1. Start the demo with `npm run dev` and open **Alert Center**.
2. Select a brute-force alert. Note the `relatedLogIds` count and its source IP (the dashboard shows correlated results; alert-to-log clickthrough is **not** implemented).
3. Open **Raw Logs** and search the source IP; inspect failed logon event IDs `4625` and `4771` and their timestamps.
4. Record an analyst decision: the synthetic pattern warrants further triage, but repeated failures alone do not prove compromise. Consider administrative tests, expired credentials, service accounts and event duplication as potential false positives.
5. For a location-label change, review the two `4624` events and consider VPN/proxy egress, shared accounts and inaccurate location labels. **Do not infer physical impossible travel.**

### Expected boundary behavior

- With the default threshold of five, **five** failures do not trigger an alert; **six** failures within 10 minutes do.
- A continuous failure cluster may be correlated into one alert beyond the initial trigger window; the reported count is the correlated cluster size, not a claim that every event occurred inside 10 minutes.
- Two independent location-change incidents involving the same account and location pair six hours apart should produce two alerts.
- The tests cover a subset of cases; this is not production-grade alert tuning.
