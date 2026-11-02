# Cyber Threat Intelligence | Research Portfolio

This portfolio demonstrates public-source threat intelligence research, source validation, analytic judgment, MITRE ATT&CK interpretation, and hands-on detection engineering. It contains two research exercises and one locally runnable software demonstration.

> **Access:** Private repository. Materials are shared only with approved reviewers. The research reports describe their evidence limits; software demonstrations use synthetic data.

## Featured projects

### 1. CL0P — Evidence-Based Threat Intelligence

A scoped historical analysis of MOVEit Transfer exploitation in 2023 and Oracle E-Business Suite extortion activity in 2025. Skills demonstrated: campaign timeline construction, primary-source evaluation, actor-vs-brand attribution, campaign-specific ATT&CK mapping, historical IOC qualification, and confidence assessment. Coverage through November 1, 2026 is selective, not exhaustive.

[Threat intelligence report](01-cl0p-intelligence/01_Cl0p_Threat_Intelligence_Verified_2026-11-01.md) · [Claim-level evidence log](01-cl0p-intelligence/01_Cl0p_Evidence_Log_Verified_2026-11-01.csv)

### 2. Synthetic Initial-Access Listing — OSINT Validation and Non-Attribution

**Explicitly synthetic methodology exercise, not an investigation of a confirmed compromise.** Examines how an analyst would evaluate an unverified initial-access sales claim, distinguish a seller's assertion from corroborated evidence, assess alternative explanations, and document why victim attribution must be withheld without adequate proof.

[OSINT case study](02-underground-access/02_Underground_Access_Public_Safe_OSINT_Case_Study.md) · [Evidence/decision log](02-underground-access/02_Underground_Access_Evidence_Log_Public_Safe.csv)

### 3. LogShield — Synthetic SOC Detection Dashboard

A React/TypeScript application with synthetic log generation, rule-based brute-force detection, a location-label change heuristic, and a dashboard for exploring alerts and events. Demonstrates readable detection logic, unit testing, and analyst-oriented UI design. **Not a production SIEM, live telemetry integration, or validated impossible-travel geolocation detector.**

[Source and run instructions](03-logshield/README.md)

## Analytical boundaries

- Claims are separated from source reporting, assessments, hypotheses, and unknowns.
- ATT&CK techniques are tied to evidenced behavior or explicitly identified as hypothetical.
- Historical indicators and disclosed vulnerabilities are not automatically current malicious IOCs.
- The synthetic case does not identify a victim or claim access to underground forums.
- No employer-owned assessment prompts, credentials, or nonpublic third-party exhibits are included intentionally. Repository contents should be reviewed before any wider distribution.

## Verification

Previously reported local LogShield results: 14 Vitest tests passed, ESLint passed, production build passed, and `npm audit --omit=dev` reported zero findings at that check date. These outcomes are **historical checks** on locally edited code, not evidence that the current GitHub revision was independently retested. A full development-dependency audit previously reported 18 findings. Run the project checks yourself using its README when evaluating the current revision.
