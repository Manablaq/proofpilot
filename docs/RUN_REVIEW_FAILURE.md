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

## V3 Malformed Equivalence Output

ProofPilot v3 deployed successfully and reduced the evidence path, but the first `run_review` attempt still failed:

`0x2575865bc2cee3033f1d4e44115198c5d99f3ab3dcee5899daa6f93f16896710`

Observed state after failure:

- `submission_1` remained `SUBMITTED`.
- `get_latest_report("submission_1")` returned `{"error":"No report yet"}`.
- `list_reports` returned `[]`.
- Receipt status was `LEADER_TIMEOUT`.
- Result was `IDLE`.
- Execution result was `FINISHED_WITH_ERROR`.
- Validator votes were `NOT_VOTED 5/5`.
- Trace stderr showed `json.loads(out)` failed with an unterminated string error.

The equivalence output included a large JSON/code-fenced JSON-like payload with fetched evidence. This indicates v3 still returned too much data from nondeterministic execution and could produce malformed or truncated equivalence output.

## V4 Fix

The v4 patch changes `run_review` to a review-lite evidence path:

- Explorer contract and transaction pages are not fetched.
- Contract address and deployment transaction are included as compact submitted metadata and marked `UNSUPPORTED_URL`.
- Live app evidence uses `gl.nondet.web.get` only and is capped to a small snippet.
- GitHub and docs evidence use normalized raw README URLs when possible.
- If GitHub and docs normalize to the same URL, the README is fetched once and reused for docs evidence.
- The prompt is shorter while retaining prompt-injection defenses, strict JSON requirements, rubric constraints, and conservative scoring rules.
- The nondeterministic leader returns compact evidence and the AI review object, avoiding a double-encoded raw review string.
- Deterministic parsing accepts plain JSON or fenced ```json blocks and raises `review nondet output` for empty or malformed equivalence output.

This reduces timeout and truncation risk while preserving meaningful report validation.

## V4 Timeout

ProofPilot v4 deployed successfully and kept the review-lite evidence path, but the first `run_review` attempt still failed:

`0xfc533b84fac026b348a99ad2733178fdd7443891cd1dba20d2131c225010c8f3`

Observed state after failure:

- `submission_1` remained `SUBMITTED`.
- `get_latest_report("submission_1")` returned `{"error":"No report yet"}`.
- `list_reports` returned `[]`.
- Receipt status was `LEADER_TIMEOUT`.
- Result was `IDLE`.
- Execution result was `FINISHED_WITH_ERROR`.
- Validator votes were `NOT_VOTED 5/5`.
- Equivalence output still contained a large fetched evidence payload.

The root issue was architectural: even bounded text snippets can make equivalence output too large when raw evidence is returned from nondeterministic execution. For review/scoring decisions, non-comparative validation is also not the correct consensus pattern.

## V5 Fix

The v5 patch follows the GenLayer guidance for consensus review decisions:

- Raw HTML and raw README text are not returned from nondeterministic execution.
- Web access derives compact facts only, such as reachability, keyword mentions, format checks, fetch failures, and warnings.
- Explorer pages are not fetched.
- `gl.nondet.web.render` is not used.
- `run_review` no longer uses `prompt_non_comparative`.
- `run_review` uses `gl.vm.run_nondet_unsafe` with a custom validator.
- The leader derives compact facts, runs the AI review over those facts, validates the compact review, and returns only `{"facts": ..., "review": ...}`.
- The validator independently derives facts, reruns the review prompt, validates the validator review, and compares decision fields, score tolerances, proof buckets, and failure representation.
- Deterministic storage then creates the evidence snapshot and review report from compact facts and the validated compact review.

This keeps consensus output small and makes validation about independently derived review decisions rather than schema-only acceptance.

## V5 Validator Timeout

ProofPilot v5 fixed the large-output failure mode. The `run_review` leader reached output and returned compact facts plus a compact review instead of raw HTML or README text.

The transaction still ended as a timeout:

- Receipt status was `LEADER_TIMEOUT`.
- Result was `IDLE`.
- Execution result was `FINISHED_WITH_RETURN`.
- Validator votes were `NOT_VOTED 5/5`.
- Equivalence output contained compact facts and review data, not a huge fetched evidence payload.

The remaining issue was validator workload. The v5 validator independently derived facts and reran `pp_ai` / LLM review inside validators. That made validator execution too slow or too expensive for the live Bradbury review path.

## V6 Fix

The v6 patch keeps the v5 compact evidence architecture and removes validator-side LLM review:

- The leader still performs AI review over compact facts.
- The leader applies deterministic score, status, recommendation, risk, and confidence rules based on compact facts.
- The validator independently derives compact facts.
- The validator does not call `pp_ai` or `gl.nondet.exec_prompt`.
- The validator compares stable facts and verifies deterministic score/status/recommendation/risk/confidence outcomes.
- The validator verifies failed or unsupported evidence is represented in `missing_evidence` or `fetch_failures`.
- Contract address and deployment transaction remain metadata-only proof in v6 and receive zero proof points when explorer evidence is unsupported.

This preserves leader-side AI review while making validator-side consensus timeout-safe and deterministic.

## Resolved V6 Outcome

Final live Bradbury v6 contract:

`0xC11b90c7c2C1C9F7E99ef767c80a7AD7Bc3F6f87`

Final live review transaction:

`0x03dce7d374e767e4a99b9b8b6da51e5a704aa8ba402c96081723f32a882ab1f8`

The v6 `run_review` transaction was accepted with `AGREE 5/5` and stored:

- Campaign: `campaign_1`
- Submission: `submission_1`
- Evidence snapshot: `snapshot_1`
- Review report: `report_1`

Final read state:

- Submission status: `REVIEWED`
- Latest report ID: `report_1`
- Review count: `1`
- Total score: `61`
- Review status: `NEEDS_MINOR_FIXES`
- Recommendation: `REQUEST_MINOR_CHANGES`
- Risk level: `MEDIUM`
- Confidence: `HIGH`

The final architecture is leader-side AI review with validator-side deterministic consensus checks.
