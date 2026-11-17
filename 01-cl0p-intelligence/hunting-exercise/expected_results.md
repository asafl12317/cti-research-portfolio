# Expected Results and False-Positive Review

The filter matches exact case-insensitive `/human.aspx` or `/human2.aspx` paths. It retains source IPs with **two or more** candidate requests.

| Source IP | Candidate requests | Statuses | Analyst assessment |
|---|---:|---|---|
| `198.51.100.25` | 2 | 404, 200 | **Investigate:** repeated candidate path with both GET and POST. Corroboration required; not proof of web shell. |
| `192.0.2.72` | 2 | 404 | **Likely benign simulation:** user agent says `AuthorizedTest/1.0` but user agents can be spoofed; confirm test approval in a real environment. |

Not retained: `203.0.113.11` has one candidate request; `203.0.113.44` has no candidate requests.

**Interpretation:** Synthetic input yields **two grouped rows**, one ambiguous suspicious pattern and one modeled authorized-test false positive. The result is not an observed live compromise or an attribution to CL0P. This table is a hand-verified expectation from the CSV; Splunk execution is not claimed.
