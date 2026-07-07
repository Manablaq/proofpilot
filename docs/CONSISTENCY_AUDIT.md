# Consistency Audit

## Purpose

This is the final architecture consistency audit before implementing `contracts/proofpilot.py`. It checks the committed product, architecture, contract, protocol, security, API, testing, and frontend data docs for conflicts, scope drift, and first-deploy risk.

## Source Documents Reviewed

- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTRACT_SPEC.md`
- `docs/REVIEW_STRATEGY.md`
- `docs/TESTING.md`
- `docs/WHITEPAPER.md`
- `docs/STATE_MACHINE.md`
- `docs/THREAT_MODEL.md`
- `docs/PERMISSIONS.md`
- `docs/PROMPT_SECURITY.md`
- `docs/REPUTATION_MODEL.md`
- `docs/API_SPEC.md`
- `docs/FRONTEND_DATA_CONTRACT.md`

## Executive Verdict

The architecture is implementation-ready for a focused contract v1.

No BLOCKER was found in the core method set, enum set, rubric, evidence snapshot model, review report model, or frontend JSON shapes. The design is internally consistent enough to implement `ProofPilot(gl.Contract)` with campaign creation, submissions, evidence snapshots, strict JSON AI review reports, basic builder profiles, appeals, human decisions, and public read/list methods.

The audit identifies several WARNING items where protocol-grade vision exceeds the first contract version. These must be explicitly scoped as FUTURE EXTENSION during implementation rather than partially implemented.

## Method Name Consistency

### Contract v1 Method Set

The consistent contract v1 method set is:

- `create_campaign`
- `submit_project`
- `run_review`
- `request_recheck`
- `open_appeal`
- `record_human_decision`
- `get_campaign`
- `get_submission`
- `get_evidence_snapshot`
- `get_report`
- `get_latest_report`
- `get_builder_profile`
- `get_appeal`
- `list_campaigns`
- `list_submissions`
- `list_reports`

### Findings

No conflicting method names exist between `CONTRACT_SPEC.md` and `API_SPEC.md`.

WARNING: `ARCHITECTURE.md` and `TESTING.md` list an older smaller method set and omit `open_appeal` and `get_evidence_snapshot`. This is not a conflict because `CONTRACT_SPEC.md` and `API_SPEC.md` are the later, more precise sources. Implementation should follow `CONTRACT_SPEC.md` and `API_SPEC.md`.

WARNING: The docs define `HumanDecision` storage and frontend shape but do not define `get_human_decision` or `list_human_decisions`. Contract v1 can still store human decisions and link the latest one through `ReviewReport.human_decision_id`, but a frontend cannot directly read a human decision by ID unless a read method is added. Contract v1 should either add read support deliberately or defer detailed human decision retrieval to FUTURE EXTENSION. To avoid method drift, do not add extra methods unless the implementation plan is updated first.

FUTURE EXTENSION: `update_campaign_status`, appeal resolution methods, close submission methods, reviewer management methods, deposit/staking methods, and reputation formula upgrade methods are documented as future protocol capabilities but are not part of the contract v1 method set.

## Dataclass Field Name Consistency

### Canonical Contract v1 Field Names

The canonical field names for implementation are the dataclass fields in `CONTRACT_SPEC.md` and the matching JSON shapes in `FRONTEND_DATA_CONTRACT.md`.

### Findings

No conflicting dataclass field names exist between `CONTRACT_SPEC.md` and `FRONTEND_DATA_CONTRACT.md`.

WARNING: `PRODUCT_SPEC.md` uses conceptual names such as `custom_rubric`, `submission_requirements`, `review_policy`, `fetch_attempts`, `live_app_snapshot`, `github_snapshot`, `deployment_snapshot`, `scores`, `findings`, `risks`, `missing_evidence`, `fetch_failures`, and `human_decision`. `CONTRACT_SPEC.md` refines these into storage-oriented fields such as `custom_rubric_json`, `submission_requirements_json`, `review_policy_json`, `fetch_results_json`, `live_app_evidence`, `github_evidence`, `deployment_tx_evidence`, `scores_json`, `findings_json`, `risks_json`, `missing_evidence_json`, `fetch_failures_json`, and `human_decision_id`.

This is acceptable. Contract v1 should use the storage-oriented field names from `CONTRACT_SPEC.md`.

WARNING: `Architecture.md` uses storage names such as `campaigns_by_id`, `submissions_by_id`, `snapshots_by_id`, `reports_by_id`, and `appeals_by_id`. `CONTRACT_SPEC.md` uses `campaigns`, `submissions`, `evidence_snapshots`, `reports`, and `appeals`. Contract v1 should use the `CONTRACT_SPEC.md` names.

## Enum And Status Consistency

### Campaign Statuses

Consistent across docs:

- `DRAFT`
- `ACTIVE`
- `PAUSED`
- `CLOSED`

### Submission Statuses

Consistent across docs:

- `SUBMITTED`
- `UNDER_REVIEW`
- `REVIEWED`
- `RECHECK_REQUESTED`
- `APPEALED`
- `CLOSED`

### Review Statuses

Consistent across docs:

- `READY_FOR_REVIEW`
- `NEEDS_MINOR_FIXES`
- `NEEDS_MAJOR_FIXES`
- `NOT_READY`

### Recommendations

Consistent across docs:

- `APPROVE_FOR_HUMAN_REVIEW`
- `REQUEST_MINOR_CHANGES`
- `REQUEST_MAJOR_CHANGES`
- `REJECT_OR_RESUBMIT`

### Risk Levels

Consistent across Phase 2 and Phase 3:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### Confidence Levels

Consistent across Phase 2 and Phase 3:

- `LOW`
- `MEDIUM`
- `HIGH`

### Human Decision Statuses

Consistent across Phase 2 and Phase 3:

- `PENDING`
- `APPROVED`
- `CHANGES_REQUESTED`
- `REJECTED`
- `OVERRIDDEN`

### Findings

No enum value conflict was found.

WARNING: `ARCHITECTURE.md` has an older example with `"confidence": "low"` in lowercase. Later docs standardize confidence values as uppercase. Contract v1 must enforce uppercase enum values.

## Contract Spec And API Spec Alignment

`CONTRACT_SPEC.md` and `API_SPEC.md` match on method names, parameter lists, return types, and primary behavior for the contract v1 surface.

WARNING: `CONTRACT_SPEC.md` says read methods may revert or return an empty JSON error object depending on implementation style. `API_SPEC.md` says frontend handling must account for both. Contract v1 should choose one style before implementation. Recommendation: use explicit reverts/errors for missing IDs if that is idiomatic in the GenLayer SDK, and document the final behavior after implementation.

WARNING: `run_review` mentions "web access failure that prevents review construction" in `API_SPEC.md`, while other docs say fetch failures should be handled gracefully and scored conservatively. The consistent rule is: individual source fetch failures should not fail the whole review; only failures that prevent prompt construction, AI execution, or valid report validation should fail `run_review`.

## Frontend Data Contract And Contract Spec Alignment

`FRONTEND_DATA_CONTRACT.md` matches the `CONTRACT_SPEC.md` dataclass shapes for:

- `Campaign`
- `Submission`
- `EvidenceSnapshot`
- `ReviewReport`
- `BuilderProfile`
- `Appeal`
- `HumanDecision`

WARNING: The frontend data contract includes `HumanDecision`, but the contract API lacks `get_human_decision`. Contract v1 can still expose the latest decision through a linked `human_decision_id` in `ReviewReport`, but this is not enough to render full decision details from contract state unless the frontend already has the decision ID and a read method exists. Treat full human decision history display as FUTURE EXTENSION unless adding read methods before implementation.

WARNING: Frontend evidence timeline expects every snapshot and report in chronological order. Contract v1 provides `list_reports` but no `list_evidence_snapshots`. The frontend can derive snapshot IDs from reports, but standalone snapshot history listing is FUTURE EXTENSION.

## State Machine And Permissions Alignment

The core state machine and permissions model align for contract v1:

- Builders create submissions.
- Campaign owners create campaigns.
- `run_review` is governed by campaign policy.
- Builders can request re-checks and open appeals for their own submissions.
- Campaign owners or authorized reviewers can record human decisions.
- Reads and lists are public.

WARNING: `Authorized reviewer` is documented, but no reviewer allowlist or role storage exists in the contract v1 dataclasses. Contract v1 should treat campaign owner as the only concrete authorized human reviewer unless `review_policy_json` is parsed for a simple static reviewer list. Reviewer allowlists should be FUTURE EXTENSION unless implemented deliberately and tested.

WARNING: Campaign status transitions beyond creation are documented in `STATE_MACHINE.md` through future `update_campaign_status`, but no method exists. Contract v1 can create campaigns as `DRAFT` or `ACTIVE`, but cannot later pause, resume, or close them unless a new method is added. Status update methods should be FUTURE EXTENSION.

WARNING: Appeal resolution states are documented, but there is no appeal resolution method. Contract v1 can create `OPEN` appeals only. `RECHECK_SCHEDULED`, `ACCEPTED`, `REJECTED`, and `CLOSED` appeal transitions are FUTURE EXTENSION unless a resolution method is added.

## Features Not Fully Implementable In First Contract Version

The following are documented but not implementable in contract v1 without additional methods, storage, or policy design:

- FUTURE EXTENSION: Campaign status updates after creation.
- FUTURE EXTENSION: Reviewer allowlists and delegated reviewer management.
- FUTURE EXTENSION: Appeal resolution workflow.
- FUTURE EXTENSION: Submission close workflow.
- FUTURE EXTENSION: Protocol owner administration.
- FUTURE EXTENSION: Protocol-level campaign verification.
- FUTURE EXTENSION: Deposits, staking, fees, or anti-spam payments.
- FUTURE EXTENSION: Advanced Sybil resistance.
- FUTURE EXTENSION: Full reputation score formula with high-risk unresolved penalties.
- FUTURE EXTENSION: Campaign credibility weights.
- FUTURE EXTENSION: Human reviewer credibility weights.
- FUTURE EXTENSION: Off-chain indexer and analytics.
- FUTURE EXTENSION: Cross-chain explorer support.
- FUTURE EXTENSION: Multi-stage milestone workflows.
- FUTURE EXTENSION: Human review committees and quorum decisions.

## Contract v1 Scope

Contract v1 should include:

- `create_campaign`
- `submit_project`
- `run_review`
- `request_recheck`
- `open_appeal`
- `record_human_decision`
- `get_campaign`
- `get_submission`
- `get_evidence_snapshot`
- `get_report`
- `get_latest_report`
- `get_builder_profile`
- `get_appeal`
- `list_campaigns`
- `list_submissions`
- `list_reports`
- Evidence snapshots with bounded normalized evidence.
- Strict JSON review reports.
- Basic builder profile counters and average score.
- Basic campaign policy JSON validation.
- Basic re-check and appeal count limits if simple policy parsing is feasible.

## Risky Or Too Large For First Deploy

WARNING: Implementing reviewer allowlists, campaign status management, appeal resolution, advanced reputation, and anti-spam economics in the first deploy would increase state-machine complexity and test surface. Keep these out of contract v1.

WARNING: Explorer URL construction requires concrete GenLayer Explorer base URLs. If base URLs are not stable before implementation, contract v1 should define constants clearly and make explorer fetch failures conservative rather than blocking all reviews.

WARNING: `run_review` is the highest-risk method because it combines authorization, web access, evidence normalization, AI output, JSON validation, report storage, and builder profile updates. Implement it after deterministic storage, validation, and read methods are stable.

WARNING: Strict JSON validation may be constrained by available GenLayer Python runtime JSON support. Implementation should verify JSON parsing and serialization support before writing the full review path.

## Final Implementation-Ready Verdict

The design is implementation-ready for contract v1 with the realistic scope listed above.

There are no BLOCKER issues if implementation follows these audit decisions:

- Use `CONTRACT_SPEC.md` as the canonical contract source.
- Use uppercase enum values only.
- Use storage-oriented JSON field names from `CONTRACT_SPEC.md`.
- Treat `API_SPEC.md` as the public method interface.
- Keep future-only state transitions out of contract v1.
- Treat campaign owner as the only concrete authorized reviewer in contract v1 unless simple reviewer policy parsing is intentionally added.
- Store human decisions as separate records and do not mutate AI reports.
- Preserve snapshots and reports immutably.
- Handle per-source fetch failures conservatively.
- Reject malformed AI JSON, unsupported enums, score range errors, and total score mismatches.
