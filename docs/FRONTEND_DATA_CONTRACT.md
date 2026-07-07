# Frontend Data Contract

## Purpose

This document defines what a future ProofPilot frontend must expect from contract responses. It is not frontend implementation. It is a display and data integrity contract for consuming ProofPilot protocol state.

The frontend must not hide failed fetches, missing evidence, address mismatches, high-risk warnings, or human override notes.

## JSON Shapes

### Campaign

```json
{
  "campaign_id": "campaign_1",
  "owner": "0x...",
  "title": "Builder Grants Round",
  "description": "Review scope.",
  "rubric_version": "rubric_v1",
  "custom_rubric_json": "{}",
  "submission_requirements_json": "{}",
  "review_policy_json": "{}",
  "status": "ACTIVE",
  "created_at": "0",
  "updated_at": "0"
}
```

### Submission

```json
{
  "submission_id": "submission_1",
  "campaign_id": "campaign_1",
  "builder": "0x...",
  "project_name": "ProofPilot Demo",
  "summary": "Project summary.",
  "live_app_url": "https://example.com",
  "github_repo_url": "https://github.com/example/repo",
  "docs_url": "https://docs.example.com",
  "contract_address": "0x...",
  "deployment_tx_hash": "0x...",
  "reviewer_feedback_text": "",
  "fixes_explanation": "",
  "status": "REVIEWED",
  "latest_report_id": "report_1",
  "review_count": 1,
  "recheck_count": 0,
  "appeal_count": 0,
  "created_at": "0",
  "updated_at": "0"
}
```

### EvidenceSnapshot

```json
{
  "snapshot_id": "snapshot_1",
  "submission_id": "submission_1",
  "campaign_id": "campaign_1",
  "builder": "0x...",
  "source_urls_json": "{}",
  "fetch_results_json": "{}",
  "live_app_evidence": "bounded text",
  "github_evidence": "bounded text",
  "docs_evidence": "bounded text",
  "contract_address_evidence": "bounded text",
  "deployment_tx_evidence": "bounded text",
  "feedback_evidence": "bounded text",
  "warnings_json": "[]",
  "created_at": "0"
}
```

### ReviewReport

```json
{
  "report_id": "report_1",
  "submission_id": "submission_1",
  "campaign_id": "campaign_1",
  "builder": "0x...",
  "snapshot_id": "snapshot_1",
  "rubric_version": "rubric_v1",
  "scores_json": "{}",
  "total_score": 82,
  "status": "READY_FOR_REVIEW",
  "recommendation": "APPROVE_FOR_HUMAN_REVIEW",
  "risk_level": "LOW",
  "confidence": "HIGH",
  "findings_json": "[]",
  "risks_json": "[]",
  "missing_evidence_json": "[]",
  "fetch_failures_json": "[]",
  "raw_review_json": "{}",
  "human_decision_id": "",
  "created_at": "0"
}
```

### BuilderProfile

```json
{
  "builder": "0x...",
  "display_name": "",
  "submission_count": 1,
  "review_count": 1,
  "approved_count": 1,
  "average_score": 82,
  "latest_report_ids_json": "[\"report_1\"]",
  "campaign_history_json": "[\"campaign_1\"]",
  "appeal_count": 0,
  "recheck_count": 0,
  "updated_at": "0"
}
```

### Appeal

```json
{
  "appeal_id": "appeal_1",
  "submission_id": "submission_1",
  "campaign_id": "campaign_1",
  "builder": "0x...",
  "report_id": "report_1",
  "reason": "The latest deployment evidence was not available during review.",
  "new_evidence_json": "{}",
  "status": "OPEN",
  "resolution_notes": "",
  "created_at": "0",
  "resolved_at": ""
}
```

### HumanDecision

```json
{
  "human_decision_id": "human_decision_1",
  "submission_id": "submission_1",
  "campaign_id": "campaign_1",
  "report_id": "report_1",
  "reviewer": "0x...",
  "decision_status": "APPROVED",
  "notes": "Approved after manual review.",
  "created_at": "0"
}
```

## Frontend Display Rules

### Campaign Cards

Display title, status, owner, rubric version, and submission policy summary. Disable submit actions unless campaign status is `ACTIVE`.

### Submission Cards

Display project name, builder, campaign, submission status, latest score if available, latest recommendation if available, and whether re-check or appeal is active.

### Review Report Certificate

Display report ID, snapshot ID, campaign, builder, total score, status, recommendation, risk level, confidence, created timestamp, category scores, findings, risks, missing evidence, and fetch failures.

### Score Display

Show total score and category breakdown. Do not show a total without category scores. If score JSON cannot be parsed, show "report unavailable" and do not invent a score.

### Risk Badge Display

Map risk levels:

- `LOW`: neutral or success badge.
- `MEDIUM`: warning badge.
- `HIGH`: high-risk badge.
- `CRITICAL`: critical badge requiring prominent display.

High and critical risks must be visible on cards and report pages.

### Evidence Timeline

Display every snapshot and report in chronological order. Show fetch status for each source. Show truncation warnings. Do not replace old reports with latest report only.

### Builder Profile

Display submission count, review count, approved count, average score, campaigns, latest reports, appeal count, and re-check count. Include a note that reputation is address-bound review history, not identity verification.

### Human Decision Panel

Display human decisions separately from AI reports. Show reviewer, decision status, notes, and timestamp. If a human decision conflicts with AI recommendation, display both.

## Error States

### Missing Campaign

Show that the campaign was not found. Do not redirect to a generic active campaign.

### Missing Submission

Show that the submission was not found. Do not infer submission details from cached list data.

### No Report Yet

Show "No review report yet" and the current submission status.

### Fetch Failures

Display failed source, reason, and affected categories when available. Failed fetches must not be hidden behind a generic warning.

### Malformed Report Unavailable

If report data cannot be parsed, show "report unavailable" and avoid displaying partial scores. Link to raw contract response only in developer/debug contexts.

### Under Review

Show in-progress state and avoid displaying stale pending scores as if they are final. Previous reports can be shown as history if clearly labeled.

### Re-Check Requested

Show pending re-check status and latest completed report separately.

### Appeal Open

Show appeal status, appeal reason, and referenced report. Do not hide original report risks.

## Non-Hiding Requirements

The frontend must never hide:

- Failed fetches.
- Missing evidence.
- Address mismatches.
- High-risk warnings.
- Critical-risk warnings.
- Human override notes.
- Prior reports after a re-check.
- Original reports after an appeal.
