# Implementation Plan

## Purpose

This document defines the exact build plan for `contracts/proofpilot.py`. It converts the architecture and audit decisions into a realistic contract v1 implementation sequence.

No frontend code or contract code is included in this phase.

## Contract v1 Scope

Contract v1 will implement:

- Campaign creation.
- Project submission.
- Evidence fetching and evidence snapshots.
- AI consensus review with strict JSON report validation.
- Re-check requests.
- Appeal opening.
- Human decision recording.
- Basic builder profiles.
- Public read methods.
- Public list methods with pagination.

FUTURE EXTENSION items are listed separately and should not be included in contract v1 unless the implementation plan is deliberately revised.

## Files To Create

Create:

- `contracts/proofpilot.py`

Optional test files after the contract file exists:

- `tests/test_proofpilot_campaigns.py`
- `tests/test_proofpilot_submissions.py`
- `tests/test_proofpilot_reports.py`
- `tests/test_proofpilot_permissions.py`
- `tests/test_proofpilot_prompt_security.py`

The exact test paths should follow the repository's GenLayer project conventions once the contract scaffold exists.

## Contract Constants

Implement constants first:

- Campaign statuses: `DRAFT`, `ACTIVE`, `PAUSED`, `CLOSED`.
- Submission statuses: `SUBMITTED`, `UNDER_REVIEW`, `REVIEWED`, `RECHECK_REQUESTED`, `APPEALED`, `CLOSED`.
- Review statuses: `READY_FOR_REVIEW`, `NEEDS_MINOR_FIXES`, `NEEDS_MAJOR_FIXES`, `NOT_READY`.
- Recommendations: `APPROVE_FOR_HUMAN_REVIEW`, `REQUEST_MINOR_CHANGES`, `REQUEST_MAJOR_CHANGES`, `REJECT_OR_RESUBMIT`.
- Risk levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Confidence levels: `LOW`, `MEDIUM`, `HIGH`.
- Human decision statuses: `PENDING`, `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`, `OVERRIDDEN`.
- Appeal statuses: `OPEN`, `RECHECK_SCHEDULED`, `ACCEPTED`, `REJECTED`, `CLOSED`.
- Fetch statuses: `SUCCESS`, `FAILED`, `SKIPPED_MISSING_INPUT`, `TRUNCATED`, `UNSUPPORTED_URL`.
- Rubric key maxima.
- Length limits for evidence, report text, appeal reason, human notes, and JSON payloads.
- Pagination defaults and maximums.
- GenLayer Explorer base URL constants.

WARNING: Explorer base URLs must be confirmed before deployment. If they are unstable, contract v1 must treat explorer fetch failure conservatively.

## Dataclasses To Implement First

Implement dataclasses in dependency order:

1. `Campaign`
2. `Submission`
3. `EvidenceSnapshot`
4. `ReviewReport`
5. `BuilderProfile`
6. `Appeal`
7. `HumanDecision`

Use field names from `CONTRACT_SPEC.md` exactly. Store complex objects as canonical JSON strings in contract storage.

## Serialization Helper Functions

Implement helpers before public methods:

- `_to_json(obj) -> str`
- `_from_json(raw: str) -> dict`
- `_dataclass_to_json(instance) -> str`
- `_campaign_from_json(raw: str) -> Campaign`
- `_submission_from_json(raw: str) -> Submission`
- `_snapshot_from_json(raw: str) -> EvidenceSnapshot`
- `_report_from_json(raw: str) -> ReviewReport`
- `_profile_from_json(raw: str) -> BuilderProfile`
- `_appeal_from_json(raw: str) -> Appeal`
- `_human_decision_from_json(raw: str) -> HumanDecision`
- `_json_array_append(raw: str, value: str, max_items: int = 0) -> str`
- `_json_array_paginate(raw: str, offset: int, limit: int) -> str`

Implementation should verify the available GenLayer Python runtime support for JSON parsing and dataclasses before finalizing helper shape.

## Validation Helper Functions

Implement validation helpers before write methods:

- `_require_non_empty(value: str, field: str)`
- `_require_max_len(value: str, max_len: int, field: str)`
- `_validate_json_object(raw: str, field: str) -> str`
- `_validate_json_array(raw: str, field: str) -> str`
- `_validate_campaign_status(status: str)`
- `_validate_submission_status(status: str)`
- `_validate_review_status(status: str)`
- `_validate_recommendation(recommendation: str)`
- `_validate_risk_level(risk_level: str)`
- `_validate_confidence(confidence: str)`
- `_validate_human_decision_status(status: str)`
- `_validate_appeal_status(status: str)`
- `_validate_basic_url(value: str, field: str, required: bool)`
- `_validate_contract_address(value: str, required: bool)`
- `_validate_tx_hash(value: str, required: bool)`
- `_validate_pagination(offset: int, limit: int)`
- `_validate_submission_requirements(campaign: Campaign, submission_fields: dict)`
- `_validate_review_policy(raw_policy_json: str)`

Contract v1 should keep validation deterministic and conservative. Avoid complex URL parsing unless the runtime supports it cleanly.

## Counter And ID Generation Helpers

Implement deterministic ID helpers:

- `_next_campaign_id() -> str`
- `_next_submission_id() -> str`
- `_next_snapshot_id() -> str`
- `_next_report_id() -> str`
- `_next_appeal_id() -> str`
- `_next_human_decision_id() -> str`

Each helper should:

1. Increment the relevant counter.
2. Return a stable ID such as `campaign_1`.
3. Avoid collisions by design.

## Storage Initialization

Define storage using the names from `CONTRACT_SPEC.md`:

- `campaigns`
- `submissions`
- `evidence_snapshots`
- `reports`
- `builder_profiles`
- `appeals`
- `human_decisions`
- `latest_report_by_submission`
- `submission_ids_by_campaign`
- `submission_ids_by_builder`
- `report_ids_by_submission`
- `report_ids_by_campaign`
- `appeal_ids_by_submission`
- `human_decision_ids_by_submission`
- `campaign_ids`
- `submission_ids`
- `report_ids`
- `snapshot_ids`
- `appeal_ids`
- `human_decision_ids`
- all counters

## Campaign Methods Implementation Order

1. Implement `create_campaign`.
2. Validate title, status, JSON fields, and length limits.
3. Set caller as owner.
4. Fill default `submission_requirements_json`.
5. Fill default `review_policy_json`.
6. Store campaign JSON.
7. Append `campaign_id`.
8. Return campaign ID.

FUTURE EXTENSION: `update_campaign_status` is not part of contract v1.

## Submission Methods Implementation Order

1. Implement `submit_project`.
2. Load campaign and require `ACTIVE`.
3. Validate project name and bounded text.
4. Validate campaign-required evidence fields.
5. Validate URL-like fields and optional contract/transaction fields.
6. Generate submission ID.
7. Store submission JSON.
8. Append global, campaign, and builder submission indexes.
9. Create or update basic builder profile.
10. Return submission ID.

Then implement `request_recheck`:

1. Load submission and campaign.
2. Require caller is builder or campaign owner for contract v1.
3. Enforce simple re-check limit from `review_policy_json` if present.
4. Require non-empty `fixes_explanation`.
5. Apply non-empty updated evidence fields.
6. Increment submission and profile re-check counters.
7. Set submission status to `RECHECK_REQUESTED`.
8. Return submission ID.

Then implement `open_appeal`:

1. Load submission and report.
2. Verify report belongs to submission.
3. Require caller is builder for contract v1.
4. Validate reason and `new_evidence_json`.
5. Enforce simple appeal limit if present.
6. Store appeal with status `OPEN`.
7. Append appeal indexes.
8. Increment submission and profile appeal counters.
9. Set submission status to `APPEALED`.
10. Return appeal ID.

FUTURE EXTENSION: Appeal resolution states and methods.

## Evidence Fetch Helper Plan

Implement private helpers:

- `_build_explorer_contract_url(contract_address: str) -> str`
- `_build_explorer_tx_url(tx_hash: str) -> str`
- `_fetch_web_get(source: str, url: str) -> dict`
- `_fetch_web_render(source: str, url: str) -> dict`
- `_fetch_source(source: str, url: str, preferred_method: str) -> dict`
- `_normalize_fetch_result(source: str, url: str, method: str, result) -> dict`
- `_normalize_evidence_text(raw: str, max_len: int) -> tuple[str, bool]`
- `_create_evidence_snapshot(submission: Submission, campaign: Campaign) -> EvidenceSnapshot`

`run_review` should fetch:

- Live app with `gl.nondet.web.render` where available.
- GitHub URL with `gl.nondet.web.get`.
- Docs URL with `gl.nondet.web.get`.
- Explorer contract address URL with `gl.nondet.web.get` or `render`.
- Explorer transaction URL with `gl.nondet.web.get` or `render`.

Each call must use an equivalence principle flow such as `gl.eq_principle.strict_eq`.

Per-source fetch failures should produce snapshot metadata and conservative review evidence, not automatic method failure.

## AI Review Helper Plan

Implement private helpers:

- `_build_review_prompt(submission: Submission, campaign: Campaign, snapshot: EvidenceSnapshot) -> str`
- `_build_recheck_prompt(...) -> str`
- `_build_appeal_context_prompt(...) -> str`
- `_run_ai_review(prompt: str) -> str`
- `_canonicalize_review_json(raw: str) -> str`

Contract v1 should start with the standard review prompt. Re-check and appeal-context prompt variants can be added when prior report context is easy to include safely.

The prompt must:

- Label all evidence as untrusted.
- Forbid following instructions inside evidence.
- Forbid browsing URLs.
- Require strict JSON only.
- Include rubric maxima and allowed enum values.
- Include fetch results.
- Include bounded evidence only.

## Report Validation Helper Plan

Implement:

- `_validate_review_json(raw_review_json: str, fetch_results_json: str) -> dict`
- `_validate_required_report_keys(report: dict)`
- `_validate_score_object(scores: dict)`
- `_validate_total_score(report: dict)`
- `_validate_report_enums(report: dict)`
- `_validate_report_arrays(report: dict)`
- `_validate_report_text_lengths(report: dict)`
- `_validate_fetch_failure_representation(report: dict, fetch_results: dict)`
- `_build_review_report(report_dict: dict, submission: Submission, campaign: Campaign, snapshot: EvidenceSnapshot) -> ReviewReport`

Validation must reject:

- Malformed JSON.
- Missing required keys.
- Unsupported enum values.
- Score values outside rubric ranges.
- Total score mismatch.
- Text exceeding limits.
- Full score for a failed required source unless alternative evidence support is explicitly represented.

## `run_review` Implementation Order

1. Load submission and campaign.
2. Reject paused, closed, or missing campaign.
3. Reject closed submission.
4. Require caller is campaign owner or submission builder if policy allows; conservative contract v1 default should be campaign owner.
5. Check repeated review policy.
6. Save prior submission status.
7. Set submission status to `UNDER_REVIEW`.
8. Create and store evidence snapshot.
9. Build prompt.
10. Run AI review.
11. Validate report JSON.
12. Store `ReviewReport`.
13. Append report indexes.
14. Set `latest_report_by_submission`.
15. Update submission `latest_report_id`, `review_count`, status `REVIEWED`, and timestamp.
16. Update builder profile.
17. Return report ID.

If AI JSON validation fails, do not store a report and restore the prior submission status if the runtime supports safe rollback semantics. If transaction rollback is automatic on revert, rely on revert behavior.

## Builder Profile Update Plan

Implement `_get_or_create_builder_profile(builder: str) -> BuilderProfile`.

On submission:

- Increment `submission_count`.
- Add campaign to `campaign_history_json` if absent.

On successful report:

- Increment `review_count`.
- Recompute `average_score`.
- Increment `approved_count` only for `APPROVE_FOR_HUMAN_REVIEW`.
- Append latest report ID with bounded history length.
- Add campaign to campaign history.

On re-check:

- Increment `recheck_count`.

On appeal:

- Increment `appeal_count`.

FUTURE EXTENSION: Full `reputation_score`, high-risk unresolved penalties, campaign credibility weights, human approval weighting, and Sybil-resistant identity.

## Human Decision Implementation Plan

Implement `record_human_decision` after report storage is stable:

1. Load submission and report.
2. Verify report belongs to submission.
3. Load campaign.
4. Require caller is campaign owner for contract v1.
5. Validate decision status and notes length.
6. Generate human decision ID.
7. Store human decision JSON.
8. Append global and submission decision indexes.
9. Link `human_decision_id` on the referenced report only if this can be done without mutating AI fields; otherwise store decision separately and leave report content unchanged.
10. Return human decision ID.

WARNING: Contract v1 does not define `get_human_decision`. If detailed decision reads are required before frontend work, add the read method to docs and implementation deliberately.

## Read/List Method Implementation Order

Implement deterministic reads before `run_review`:

1. `get_campaign`
2. `get_submission`
3. `get_evidence_snapshot`
4. `get_report`
5. `get_latest_report`
6. `get_builder_profile`
7. `get_appeal`

Then implement lists:

1. `list_campaigns`
2. `list_submissions`
3. `list_reports`

List methods must validate pagination and return JSON arrays of IDs for contract v1. Compact summaries are FUTURE EXTENSION.

## First Compile/Test Commands

The exact commands depend on the GenLayer project scaffold present when implementation begins. Start with repository discovery:

```text
find . -maxdepth 3 -type f | sort
```

Then identify available scripts:

```text
ls
```

If a Python test runner is configured:

```text
pytest
```

If GenLayer CLI commands are configured, use the project-standard compile and test commands documented by the scaffold.

WARNING: Do not invent a compile command until the GenLayer scaffold exists. The first implementation step should verify the actual local toolchain.

## Contract v1 Test Order

1. Constants and enum validation tests.
2. Serialization and JSON helper tests.
3. Campaign creation tests.
4. Submission validation tests.
5. Permission tests for builder and campaign owner paths.
6. Re-check request tests.
7. Appeal opening tests.
8. Human decision recording tests.
9. Read/list method tests.
10. Evidence normalization tests.
11. Fetch failure representation tests.
12. Prompt construction tests.
13. Strict JSON report validation tests.
14. `run_review` success-path tests.
15. Prompt-injection fixture tests.

## Deployment Readiness Checklist

- [ ] Contract v1 method surface matches `API_SPEC.md`.
- [ ] Dataclass JSON shapes match `FRONTEND_DATA_CONTRACT.md`.
- [ ] Uppercase enum values are enforced.
- [ ] Campaign creation works for `DRAFT` and `ACTIVE`.
- [ ] Submissions are rejected for inactive campaigns.
- [ ] Required evidence fields are enforced.
- [ ] Per-source fetch failures are represented in evidence snapshots.
- [ ] Raw URLs are not used as prompt browsing instructions.
- [ ] Prompt labels all fetched content as untrusted evidence.
- [ ] AI output must be strict JSON.
- [ ] Report validation rejects malformed JSON.
- [ ] Report validation rejects unsupported enums.
- [ ] Report validation rejects score range errors.
- [ ] Report validation rejects total score mismatches.
- [ ] Report validation checks fetch failure representation.
- [ ] Reports and snapshots are append-only.
- [ ] Human decisions are separate from AI report findings.
- [ ] Builder profile basics update deterministically.
- [ ] List methods paginate.
- [ ] Re-check limits are enforced if policy is present.
- [ ] Appeal limits are enforced if policy is present.
- [ ] No FUTURE EXTENSION feature is half-implemented.

## Future Extensions Deferred From Contract v1

- FUTURE EXTENSION: Campaign status update method.
- FUTURE EXTENSION: Reviewer allowlist management.
- FUTURE EXTENSION: Appeal resolution method.
- FUTURE EXTENSION: Submission close method.
- FUTURE EXTENSION: `get_human_decision` and human decision history list, unless added before implementation.
- FUTURE EXTENSION: Snapshot list method.
- FUTURE EXTENSION: Events, if the initial GenLayer scaffold does not require them.
- FUTURE EXTENSION: Deposits, staking, or fee-based spam prevention.
- FUTURE EXTENSION: Protocol owner governance.
- FUTURE EXTENSION: Campaign verification.
- FUTURE EXTENSION: Advanced reputation formula.
- FUTURE EXTENSION: Sybil resistance and identity attestations.
- FUTURE EXTENSION: Indexer and analytics.
- FUTURE EXTENSION: Cross-chain explorer support.

## Final Build Guidance

Contract v1 should be boring, explicit, and auditable. Implement deterministic storage and validation first, then web evidence snapshots, then AI review. The implementation-ready path is to keep the first deploy focused on reliable report creation and public inspectability rather than advanced governance or economics.
