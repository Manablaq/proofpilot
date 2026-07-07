# Run Review Failure Note

## Summary

ProofPilot v1 successfully supported campaign creation, project submission, list/read methods, and live dashboard reads on Bradbury. The first live `run_review` attempt on `submission_2` failed before evidence fetching or AI review.

Failed transaction:

`0xb0a5731e5f019e3de1feec5dec811bb7d028ba8c476ae974084fff1c4a94f05f`

No review report was created. `get_latest_report("submission_2")` returned `{"error": "No report yet"}`, `list_reports("campaign_1", "", 0, 10)` returned `[]`, and `submission_2` remained `SUBMITTED`.

## Root Cause

The v1 `run_review` nondeterministic leader captured `self` and called contract methods inside nondeterministic execution:

- `self._fetch_all`
- `self._snapshot`
- `self._ai`
- `self._prompt`

`self._snapshot` also called `self._now`, which reads storage counters. GenLayer trace output showed:

- `web_module.calls: 0`
- `llm_module.calls: 0`
- `stderr: Detected pickling storage class. Reading storage in nondet mode is not supported`

This indicates the failure occurred before web access and before LLM execution because contract storage was captured or read in nondeterministic mode.

## V2 Fix

The v2 patch moves all storage reads and writes outside nondeterministic execution:

- `run_review` loads campaign and submission deterministically.
- Required submission fields are copied into a plain local dictionary before nondeterministic execution.
- The nondeterministic leader does not reference `self`.
- The leader uses module-level pure helpers for evidence fetching, prompt construction, and AI execution.
- Snapshot IDs, report IDs, timestamps, validation, report storage, submission updates, and builder profile updates occur only after the equivalence result returns.

This preserves the review semantics while keeping GenLayer web and AI execution isolated from contract storage.

## V2 Timeout

ProofPilot v2 deployed successfully and fixed the storage capture failure, but the first `run_review` attempt on v2 timed out:

`0xad93bc328a448e0633b1e8a3f3c9d9b4cb0c6128c7b5dba5299f73c062c2669d`

Observed state after failure:

- `submission_1` remained `SUBMITTED`.
- `get_latest_report("submission_1")` returned `{"error":"No report yet"}`.
- `list_reports` returned `[]`.
- Receipt status was `LEADER_TIMEOUT`.
- Execution result was `FINISHED_WITH_ERROR`.
- Validator votes were `NOT_VOTED 5/5`.
- Trace stderr showed `json.loads(out)` failed because equivalence output was empty or non-JSON.

The original receipt contained large fetched evidence output, so v2 reached evidence fetching before timing out. The likely cause was excessive nondeterministic work and large equivalence output from fetching and returning large HTML fragments from the live app, GitHub, docs, and explorer pages.

## V3 Fix

The v3 patch keeps the v2 storage-isolation fix and reduces the live review workload:

- Live app evidence uses `gl.nondet.web.get` only; the render path is removed from nondeterministic review.
- Evidence caps are reduced significantly.
- GitHub repository/docs URLs are normalized to a raw README URL when possible.
- Returned evidence remains bounded for snapshot/report validation.
- Empty or non-string equivalence output is rejected with `review nondet output` before JSON parsing.

This is intended to keep enough evidence for review while reducing timeout risk and avoiding opaque JSON decode failures.
