# CL0P Intelligence-to-Detection — Synthetic MOVEit Web Request Hunt

**Type:** Independent analytical training exercise (not real victim telemetry).
**Source basis:** FBI/CISA advisory AA23-158A documenting `human2.aspx` as a historical LEMURLOOT-related web artifact. See the parent CL0P report's [S1] citation.
**Hunting question:** Which source IPs make repeated requests for historical MOVEit web-shell-like paths in a synthetic access-log sample?

## Hypothesis and validation

Some requests for `/human2.aspx` or `/human.aspx` can be useful starting points for a *retrospective* web-server investigation. Repeated requests may merit review but are not, by themselves, proof of compromise or a CL0P attribution. Source IPs here are RFC 5737 TEST-NET addresses, and the `mft.lab.example` domain is fictitious.

### Reproduce in Splunk

1. Inspect [`synthetic_moveit_requests.csv`](synthetic_moveit_requests.csv) and its declared schema.
2. In an authorized Splunk test workspace, upload it as a lookup named `synthetic_moveit_requests.csv` (not production telemetry).
3. Run [`hunt.spl`](hunt.spl) as a search using `inputlookup`.
4. Compare the grouped results with [`expected_results.md`](expected_results.md).
5. Investigate why the `AuthorizedTest/1.0` scenario is a false positive rather than a confirmed incident.

**No Splunk environment was executed for this document.** The SPL is a reasoned, reviewable example; results have been cross-checked from the CSV independently using Python. Validate search syntax and lookup permissions in the target Splunk version before claiming a successful Splunk execution.

## Collection and limits

- A real hunt needs validated MOVEit server inventory, request logs with reliable timestamps, relevant response bodies or forensic context where authorized, application logs, and threat context.
- The paths alone could reflect benign monitoring, authorized testing or scanning. A 200 HTTP response does not confirm a deployed shell.
- All event data is fabricated. The query detects only path-pattern repetition in this sample; it does not identify exploitation, exfiltration or attacker identity.
- No active scanning, live IOC collection or victim attribution was performed.

## Analyst disposition

**Triage recommended, not confirmed compromise.** Review context, asset exposure and known testing activities; escalate only when there is corroborating telemetry or other credible evidence.
