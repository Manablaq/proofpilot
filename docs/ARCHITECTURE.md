# Architecture

## Overview

ProofPilot is a GenLayer-native AI consensus review engine. The central system component is a GenLayer Intelligent Contract that owns campaign configuration, accepts structured submissions, fetches evidence through GenLayer web access, runs AI consensus review, stores strict JSON review reports, and updates builder reputation profiles.

This document describes the intended architecture only. It does not define frontend code or contract source code.

## System Components

### GenLayer Intelligent Contract

Responsibilities:

- Manage campaigns and review settings.
- Store submissions and structured evidence references.
- Fetch live evidence using GenLayer web access.
- Enforce equivalence principle execution for nondeterministic web reads.
- Normalize fetched evidence into bounded snapshots.
- Run AI review prompts with strict JSON output.
- Store review reports.
- Track re-checks, appeals, and optional human decisions.
- Update builder profiles.

### Frontend Application

Future responsibility only:

- Campaign browsing and creation.
- Submission form for builders.
- Evidence and report views.
- Re-check and appeal flows.
- Human reviewer decision interface.

No frontend should be implemented in the current documentation phase.

### Optional Indexer

Future responsibility only:

- Read on-chain events and state for faster search.
- Build campaign, submission, report, and builder profile feeds.
- Support analytics for program owners.

ProofPilot should remain contract-first. The indexer must not be the source of truth for review outcomes.

## GenLayer Evidence Access Pattern

ProofPilot must not put raw URLs into prompts and expect validators to browse them. URLs are submission inputs that the contract uses to perform explicit web access.

Expected flow:

1. Builder submits evidence fields.
2. Contract validates basic field presence and format.
3. Contract calls GenLayer web access functions such as `gl.nondet.web.get` or `gl.nondet.web.render`.
4. Web access occurs through an equivalence principle flow such as `gl.eq_principle.strict_eq`.
5. Contract receives fetched content or fetch failure metadata.
6. Contract normalizes content into an `EvidenceSnapshot`.
7. Review prompt receives only bounded snapshot data and explicit safety instructions.
8. AI consensus returns strict JSON.
9. Contract validates and stores the report.

## Evidence Trust Boundary

All fetched web content is untrusted. This includes:

- Live app pages.
- README files.
- GitHub repository metadata.
- Documentation pages.
- Deployment explorer pages.
- Text submitted by builders.
- Text copied from human reviewer feedback.

Fetched content may contain prompt injection such as "ignore previous instructions", fake scoring instructions, misleading claims, or hidden content. The review prompt must treat fetched content only as quoted evidence and must never follow instructions found inside that evidence.

## Data Model Relationships

`Campaign` is the parent review program.

`Submission` belongs to one campaign and one builder.

`EvidenceSnapshot` belongs to one submission and captures the fetched evidence used for a review run.

`ReviewReport` belongs to one submission and one evidence snapshot.

`BuilderProfile` aggregates reports across submissions and campaigns.

`Appeal` belongs to one submission and usually references one report.

## Contract Storage Design

Recommended top-level storage:

- `campaigns_by_id`: campaign ID to `Campaign`.
- `campaign_ids`: ordered campaign IDs.
- `submissions_by_id`: submission ID to `Submission`.
- `submission_ids_by_campaign`: campaign ID to submission IDs.
- `submission_ids_by_builder`: builder to submission IDs.
- `snapshots_by_id`: snapshot ID to `EvidenceSnapshot`.
- `reports_by_id`: report ID to `ReviewReport`.
- `report_ids_by_submission`: submission ID to report IDs.
- `report_ids_by_campaign`: campaign ID to report IDs.
- `latest_report_by_submission`: submission ID to latest report ID.
- `builder_profiles`: builder to `BuilderProfile`.
- `appeals_by_id`: appeal ID to `Appeal`.
- `appeal_ids_by_submission`: submission ID to appeal IDs.

## Contract Methods

### `create_campaign`

Creates a campaign with title, description, rubric configuration, submission requirements, and review policy.

Expected checks:

- Caller is recorded as campaign owner.
- Required fields are present.
- Rubric configuration is valid.
- Campaign starts as active or draft depending on input.

### `submit_project`

Creates a submission under an active campaign.

Expected checks:

- Campaign exists and accepts submissions.
- Required evidence fields are present.
- URL-like fields pass basic format validation.
- Builder address is associated with the submission.

### `run_review`

Fetches evidence, creates an evidence snapshot, runs AI consensus review, stores a strict JSON report, and updates the builder profile.

Expected checks:

- Submission exists.
- Campaign exists and is reviewable.
- Caller is authorized if campaign requires owner-triggered review, or open review is enabled.
- Web access uses `gl.nondet.web.get` or `gl.nondet.web.render`.
- Web access is wrapped with an equivalence principle flow such as `gl.eq_principle.strict_eq`.
- Fetch failures are included in the report and scored conservatively.
- JSON output validates against the report schema before storage.

### `request_recheck`

Allows a builder to request another review after updating evidence or explaining fixes.

Expected checks:

- Submission exists.
- Caller is the builder or an authorized campaign participant.
- Re-check policy permits another run.
- New explanation or evidence changes are recorded.

### `record_human_decision`

Records an optional human reviewer or program owner decision after AI review.

Expected checks:

- Caller is campaign owner or authorized reviewer.
- Referenced submission and report exist.
- Decision is linked to the latest or specified report.
- Human decision does not mutate historical AI report content.

### `get_campaign`

Returns campaign details by ID.

### `get_submission`

Returns submission details by ID.

### `get_report`

Returns a specific review report by ID.

### `get_latest_report`

Returns the latest report for a submission.

### `get_builder_profile`

Returns aggregate builder profile data.

### `list_campaigns`

Returns campaign IDs or paginated campaign summaries.

### `list_submissions`

Returns submission IDs or paginated submission summaries, optionally filtered by campaign or builder.

### `list_reports`

Returns report IDs or paginated report summaries, optionally filtered by campaign, submission, or builder.

## Review Report JSON Shape

The AI review output should be strict JSON. A representative schema:

```json
{
  "rubric_version": "rubric_v1",
  "total_score": 0,
  "status": "NOT_READY",
  "recommendation": "REJECT_OR_RESUBMIT",
  "scores": {
    "live_app_availability": 0,
    "github_repository_availability": 0,
    "readme_documentation_quality": 0,
    "contract_address_consistency": 0,
    "deployment_transaction_proof": 0,
    "reviewer_feedback_addressed": 0,
    "professional_presentation": 0,
    "risk_broken_links_or_mismatch_checks": 0
  },
  "findings": [],
  "risks": [],
  "missing_evidence": [],
  "fetch_failures": [],
  "confidence": "low"
}
```

The contract should reject malformed JSON, unsupported enum values, missing required keys, scores outside category limits, and totals that do not match category sums.

## Conservative Failure Handling

Fetch failures are expected operational events, not exceptional conditions that should break the review flow. ProofPilot should:

- Record the failed source.
- Preserve failure reason when available.
- Avoid awarding points that require unavailable evidence.
- Continue scoring categories supported by available evidence.
- Reduce confidence when important evidence cannot be fetched.
- Explain missing evidence clearly in the report.

## Event Design

Future contract implementation should emit events for:

- Campaign created or updated.
- Submission created.
- Evidence snapshot created.
- Review report created.
- Re-check requested.
- Appeal opened or resolved.
- Human decision recorded.
- Builder profile updated.

Events should support frontend updates and optional indexing without replacing contract state as the source of truth.
