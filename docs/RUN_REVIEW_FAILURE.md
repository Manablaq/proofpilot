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
