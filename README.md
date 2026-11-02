# Cyber Threat Intelligence | Research Portfolio

Three projects demonstrating source evaluation, threat-intelligence reporting, analytic restraint, and hands-on detection engineering.

**Status:** Private staging. Not approved for public release until the final file/secrets/rights review is complete.

## Projects

### 1. CL0P — Evidence-Based Threat Intelligence
Historical public-source profile of the 2023 MOVEit campaign and 2025 Oracle E-Business Suite extortion activity. Demonstrates campaign scoping, ATT&CK mapping, IOC interpretation and separation of extortion branding from operator attribution. Coverage through 2026-11-01 is *selective, not exhaustive*.

[Read report](01-cl0p-intelligence/01_Cl0p_Threat_Intelligence_Verified_2026-11-01.md) · [Evidence log](01-cl0p-intelligence/01_Cl0p_Evidence_Log_Verified_2026-11-01.csv)

### 2. Synthetic Initial-Access Listing — OSINT Validation and Non-Attribution
**Synthetic analytical exercise; not a real-world breach investigation.** Demonstrates verification gates, source reliability, confidence assessment, and justified withholding of victim attribution.

[Read case study](02-underground-access/02_Underground_Access_Public_Safe_OSINT_Case_Study.md) · [Evidence log](02-underground-access/02_Underground_Access_Evidence_Log_Public_Safe.csv)

### 3. LogShield — Synthetic SOC Detection Dashboard
React/TypeScript local dashboard using synthetic event logs, including brute-force and location-change heuristics. This is a portfolio demonstration, **not** a production SOC, live ingest pipeline, or proof of a real compromise. Source must be imported from the owner's validated local directory before any release.

[Project directory](03-logshield/)

## Research and ethical boundaries
- Source-derived facts, analytic judgments and hypotheses are clearly distinguished.
- Historical IOCs are not presented as currently active malicious infrastructure.
- No employer recruiting assignment, confidential exhibits, victim-identifying claims, credentials or private artifacts are authorized for release.
- ATT&CK mappings are campaign-specific or explicitly hypothetical.

## Verification summary
The owner reported 14/14 local LogShield Vitest tests passing, ESLint passing, Vite production build passing, and `npm audit --omit=dev` reporting zero findings on 2026-11-02. The exact **edited local source** has not been independently re-run here; development dependencies had 18 reported audit findings. See release checks before publishing.
