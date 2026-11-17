# CL0P / Cl0p — Threat Intelligence Profile

**Portfolio research | WP-02 Intelligence Verification**  
**Intelligence cutoff:** 2026-11-01 (inclusive)  
**Verification performed:** 2026-11-02  
**Scope:** publicly documented MOVEit Transfer 2023 and Oracle E-Business Suite 2025 campaigns, with a limited 2026 corroboration check  
**Assessment standard:** observed fact / source attribution / analyst assessment / unknown are distinguished explicitly.

## Executive assessment

**High confidence:** FBI/CISA documented exploitation of MOVEit Transfer CVE-2023-34362 by actors described as the CL0P ransomware gang in 2023, including the LEMURLOOT web shell and data theft. Google Threat Intelligence Group (GTIG)/Mandiant documented a separate 2025 Oracle E-Business Suite intrusion-and-extortion sequence associated with actors **claiming affiliation with the CL0P brand**. [S1, S2]

**Moderate confidence (analytic assessment):** these campaigns illustrate continuity in an extortion model centered on high-leverage enterprise application exploitation and stolen data. Such similarity does **not** establish that the same human operators conducted both campaigns. [S2]

**Not established:** a one-to-one equation between the CL0P extortion brand, FIN11, TA505, the operators of the 2023 MOVEit campaign, and the operators of the 2025 Oracle campaign. GTIG explicitly discusses evidence of multiple distinct actors and possible membership/partnership changes. [S2]

## 1. Source-derived campaign chronology

| Period | Supported observation | Attribution boundary | Evidence |
|---|---|---|---|
| May–June 2023 | Exploitation of MOVEit Transfer CVE-2023-34362; LEMURLOOT web-shell activity; database data theft | FBI/CISA uses the CL0P label; not independent proof of individual operators | [S1] |
| July–October 2025 | Oracle EBS intrusion activity preceded extortion emails beginning September 29; exploitation likely involving CVE-2025-61882, with chain ambiguity in the original technical analysis | Extortion messages claimed CL0P affiliation; campaign-to-operator identity remains uncertain | [S2] |
| March 2026 | GTIG retrospective discussed 2025 financially motivated zero-day exploitation, including EBS CVE-2025-61882 and/or CVE-2025-61884 | Retrospective corroboration of 2025 activity, not evidence of a new CL0P operation in 2026 | [S3] |

**Coverage limitation:** This is **not** an exhaustive census of all CL0P-linked operations reported through November 1, 2026. The 2026 check is targeted and does not substantiate claims about a current campaign's operational status.

## 2. Actor / brand attribution model

- **CL0P brand:** data-leak/extortion identity used in communications and publication infrastructure; evidence of brand association alone does not uniquely identify operators. [S2]
- **FIN11:** GTIG says the CL0P data-leak site was historically associated with FIN11 and that much mass-exploitation activity has been attributed to FIN11 or suspected associated clusters. GTIG also reports evidence of at least one actor with distinct TTPs using CL0P ransomware or the data-leak site. [S2]
- **TA505:** appears as a historical label in the FBI/CISA advisory; do not automatically treat all labels as interchangeable across vendors and years. [S1]
- **Oracle EBS 2025:** correctly describe the observed extortion as **actors claiming affiliation with CL0P**, rather than a conclusively identified, single stable operator group. [S2]

## 3. ATT&CK mappings — campaign-scoped

| Technique | Tactic | Evidence and applicability | Confidence | Decision |
|---|---|---|---|---|
| **T1190 — Exploit Public-Facing Application** | Initial Access | MOVEit Transfer externally exposed application exploited with CVE-2023-34362; FBI/CISA explicitly lists T1190. Oracle EBS exploitation also consistent with this behavior. [S1, S2, S4] | High | RETAIN |
| **T1505.003 — Server Software Component: Web Shell** | Persistence | LEMURLOOT was placed on MOVEit web applications and used in follow-on activity. The ATT&CK definition explicitly covers web shells. [S1, S5] | High | RETAIN, scoped to MOVEit |
| **T1041 — Exfiltration Over C2 Channel** | Exfiltration | Data theft is documented, but the precise channel needed for this particular sub-technique is not established in this report. | Unsupported at this granularity | EXCLUDE |
| **Any technique based only on historic group profile** | — | General FIN11/TA505 behavior should not be presented as observed in these two campaigns without campaign-specific evidence. | Not assessed | EXCLUDE |

## 4. IOC validation register and use policy

| Indicator | Type | Evidence | Historical status | 2026 operational status |
|---|---|---|---|---|
| `CVE-2023-34362` | Vulnerability identifier, **not an IOC** | Official 2023 MOVEit advisory [S1] | Confirmed campaign-relevant vulnerability | Still useful for historical exposure review; current exploit activity not assessed |
| `human2.aspx` | Historical file/artifact name | CISA/FBI describes as an example associated with LEMURLOOT [S1] | Historically reported | Not sufficient by itself for conclusive detection |
| `3a977446ed70b02864ef8cfa3135d8b134c93ef868a4cc0aa5d3c2a74545725b` | SHA-256 from CISA YARA rule metadata | CISA/FBI advisory [S1] | Historical published sample reference | Not independently rehashed or re-detonated; do not claim active |
| `CVE-2025-61882` | Vulnerability identifier, **not an IOC** | GTIG/Mandiant Oracle EBS analysis and later GTIG retrospective [S2, S3] | Campaign-relevant vulnerability / exploit-chain caveats apply | Not a current compromise indicator |
| `/OA_HTML/configurator/UiServlet` | HTTP request path | Mandiant reported suspicious EBS activity targeting this component [S2] | Contextual hunting lead | Requires contextual log correlation; path alone is not malicious proof |
| `/OA_HTML/SyncServlet` | HTTP request path | GTIG monitoring guidance [S2] | Contextual hunting lead | Requires context and baselining |
| `TemplatePreviewPG` with `TemplateCode` beginning `TMP` or `DEF` | Request-pattern hunting lead | GTIG guidance [S2] | Strong indicator of attempted exploitation **in the described context** | Verify against environment-specific telemetry |
| Oracle EBS collection hosted by GTI/VirusTotal | External IOC collection | Linked from GTIG article [S2] | Source link identified | **NOT VERIFIED**: membership and current freshness not checked; access may be required |

**IOCs are historical evidence, not timeless blocklist entries.** No mass IP blocking, active-maliciousness assertion, or comprehensive 2026 IOC validation is made. Hash identification is based on a government advisory's rule metadata, not local sample analysis.

## 5. Defender-focused recommendations

1. Inventory internet-exposed managed file transfer services and Oracle EBS instances, including third-party hosted services; document owner, version and external exposure. [S1, S2]
2. Validate vendor security updates and investigate unresolved historical exposure windows; do not use a CVE string as evidence of compromise. [S1, S2]
3. For MOVEit, hunt retrospectively for documented LEMURLOOT-related artifacts with corroborating application/database telemetry. [S1]
4. For Oracle EBS, review relevant application paths and suspicious exploit-like request patterns, and corroborate with process, application and outbound network telemetry. [S2]
5. Maintain incident evidence retention, third-party notification contacts and an escalation path for suspected data theft and extortion.

## 6. Analytic confidence, alternatives and limits

- **High:** source-authenticated history of MOVEit compromise and GTIG's *reported observations* on Oracle EBS.
- **Moderate:** continuity of extortion business model across campaigns; this is inference, not operator identity proof.
- **Low/not established:** same individuals behind all branded activities; specific alleged victims not independently examined; live operational status of historical infrastructure.
- **Alternatives:** re-used brand, changing operator membership, partnerships, and independent activity clusters.
- **No access:** no direct compromise investigation, reverse engineering, victim telemetry or live IOC scanning was performed.
- **Temporal scope:** 2026 source coverage is selective rather than exhaustive.

## 7. Methodology and provenance

This is an independently written, public-source portfolio profile. No confidential assignment, nonpublic victim exhibit or claimed first-hand incident access is included. The companion `01_Cl0p_Evidence_Log_Verified_2026-11-01.csv` records claim-level disposition. Original pre-WP02 expanded 20-row evidence log was referenced in the earlier draft but **was not available for complete row-by-row reconciliation in this verification pass**; this CSV is a newly verified replacement register, not an attestation that all prior 20 rows have been revalidated.


## Hands-on companion hunt

[Simulated MOVEit web request hunting exercise](hunting-exercise/README.md) includes a narrowly scoped hypothesis, sample access logs, SPL search, expected findings, and false-positive limitations. **No live hunt or victim telemetry is claimed.**

## Sources (exact public URLs)

- **[S1]** FBI/CISA. *#StopRansomware: CL0P Ransomware Gang Exploits CVE-2023-34362 MOVEit Vulnerability*, AA23-158A. Published 2023-06-07; updated 2023-06-16. https://www.cisa.gov/sites/default/files/2023-06/aa23-158a-stopransomware-cl0p-ransomware-gang-exploits-moveit-vulnerability_7.pdf
- **[S2]** Google Threat Intelligence Group / Mandiant. *Oracle E-Business Suite Zero-Day Exploited in Widespread Extortion Campaign*. 2025-10-09; update 2025-10-11. https://cloud.google.com/blog/topics/threat-intelligence/oracle-ebusiness-suite-zero-day-exploitation/
- **[S3]** Google Threat Intelligence Group. *Look What You Made Us Patch: 2025 Zero-Days in Review*. 2026-03-05. https://cloud.google.com/blog/topics/threat-intelligence/2025-zero-day-review
- **[S4]** MITRE ATT&CK, T1190 — Exploit Public-Facing Application. https://attack.mitre.org/techniques/T1190/
- **[S5]** MITRE ATT&CK, T1505.003 — Server Software Component: Web Shell. https://attack.mitre.org/techniques/T1505/003/
