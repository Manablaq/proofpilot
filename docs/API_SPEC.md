# API Specification

## Purpose

This document defines the contract-facing interface expected by a future frontend. It describes method names, read/write type, parameters, return types, success responses, error conditions, and usage notes.

The planned contract file is `contracts/proofpilot.py`, with class `ProofPilot(gl.Contract)`.

## Response Conventions

Write methods return the ID of the created or updated primary record. Read and list methods return canonical JSON strings.

Errors should be explicit and stable. Implementation may use reverts or structured error JSON depending on GenLayer contract conventions, but frontend handling must account for both.

## Methods

### `create_campaign`

Type: write

Parameters:

- `title: str`
- `description: str`
- `custom_rubric_json: str = "{}"`
- `submission_requirements_json: str = "{}"`
- `review_policy_json: str = "{}"`
- `status: str = "ACTIVE"`

Return type: `str`

Success response: campaign ID, for example `campaign_1`.

Error conditions: empty title, invalid status, malformed JSON, oversized fields.

Frontend usage notes: Use after owner confirms campaign settings. Show returned campaign page after success.

### `submit_project`

Type: write

Parameters:

- `campaign_id: str`
- `project_name: str`
- `summary: str`
- `live_app_url: str`
- `github_repo_url: str`
- `docs_url: str`
- `contract_address: str`
- `deployment_tx_hash: str`
- `reviewer_feedback_text: str = ""`
- `fixes_explanation: str = ""`

Return type: `str`

Success response: submission ID.

Error conditions: missing campaign, inactive campaign, missing required evidence, malformed URL-like fields, oversized text.

Frontend usage notes: Validate client-side for usability, but rely on contract validation as source of truth.

### `run_review`

Type: write

Parameters:

- `submission_id: str`

Return type: `str`

Success response: report ID.

Error conditions: missing submission, unauthorized caller, campaign not reviewable, repeated review disallowed, web access failure that prevents review construction, malformed AI JSON, score mismatch, unsupported enum.

Frontend usage notes: Show `UNDER_REVIEW` after transaction submission. On success, load `get_report(report_id)` and `get_evidence_snapshot(snapshot_id)`.

### `request_recheck`

Type: write

Parameters:

- `submission_id: str`
- `fixes_explanation: str`
- `updated_live_app_url: str = ""`
- `updated_github_repo_url: str = ""`
- `updated_docs_url: str = ""`
- `updated_contract_address: str = ""`
- `updated_deployment_tx_hash: str = ""`

Return type: `str`

Success response: submission ID.

Error conditions: missing submission, unauthorized caller, re-check limit exceeded, empty fix explanation, oversized text, invalid updated fields.

Frontend usage notes: Display prior report and require builder to explain what changed.

### `open_appeal`

Type: write

Parameters:

- `submission_id: str`
- `report_id: str`
- `reason: str`
- `new_evidence_json: str = "{}"`

Return type: `str`

Success response: appeal ID.

Error conditions: missing submission, missing report, report does not belong to submission, unauthorized caller, empty reason, malformed new evidence JSON, appeal limit exceeded.

Frontend usage notes: Appeals should be attached to a specific report, not only to a submission.

### `record_human_decision`

Type: write

Parameters:

- `submission_id: str`
- `report_id: str`
- `decision_status: str`
- `notes: str = ""`

Return type: `str`

Success response: human decision ID.

Error conditions: unauthorized caller, missing submission, missing report, report/submission mismatch, invalid decision status, oversized notes.

Frontend usage notes: Display as separate human decision panel. Do not overwrite AI report display.

### `get_campaign`

Type: read

Parameters: `campaign_id: str`

Return type: serialized `Campaign` JSON.

Success response: full campaign object.

Error conditions: missing campaign.

Frontend usage notes: Use for campaign detail page and submission form requirements.

### `get_submission`

Type: read

Parameters: `submission_id: str`

Return type: serialized `Submission` JSON.

Success response: full submission object.

Error conditions: missing submission.

Frontend usage notes: Use for submission detail page and status display.

### `get_evidence_snapshot`

Type: read

Parameters: `snapshot_id: str`

Return type: serialized `EvidenceSnapshot` JSON.

Success response: full evidence snapshot object.

Error conditions: missing snapshot.

Frontend usage notes: Use for evidence timeline and fetch failure display.

### `get_report`

Type: read

Parameters: `report_id: str`

Return type: serialized `ReviewReport` JSON.

Success response: full report object.

Error conditions: missing report.

Frontend usage notes: Use for report certificate view.

### `get_latest_report`

Type: read

Parameters: `submission_id: str`

Return type: serialized `ReviewReport` JSON.

Success response: latest report for submission.

Error conditions: missing submission, no report yet.

Frontend usage notes: Use for submission cards and quick status, but retain access to report history.

### `get_builder_profile`

Type: read

Parameters: `builder: str`

Return type: serialized `BuilderProfile` JSON.

Success response: builder profile or default empty profile.

Error conditions: malformed builder identifier if validation is implemented.

Frontend usage notes: Display profile metrics with limitations. Do not present as identity verification.

### `get_appeal`

Type: read

Parameters: `appeal_id: str`

Return type: serialized `Appeal` JSON.

Success response: full appeal object.

Error conditions: missing appeal.

Frontend usage notes: Link appeals from submission and report pages.

### `list_campaigns`

Type: read

Parameters:

- `offset: int = 0`
- `limit: int = 50`

Return type: JSON array string.

Success response: campaign IDs or compact summaries.

Error conditions: invalid pagination.

Frontend usage notes: Use for campaign discovery with pagination.

### `list_submissions`

Type: read

Parameters:

- `campaign_id: str = ""`
- `builder: str = ""`
- `offset: int = 0`
- `limit: int = 50`

Return type: JSON array string.

Success response: submission IDs filtered by campaign, builder, or global list.

Error conditions: invalid pagination, missing filter target if implementation requires existing IDs.

Frontend usage notes: Use campaign filter for campaign pages and builder filter for profiles.

### `list_reports`

Type: read

Parameters:

- `campaign_id: str = ""`
- `submission_id: str = ""`
- `offset: int = 0`
- `limit: int = 50`

Return type: JSON array string.

Success response: report IDs filtered by campaign, submission, or global list.

Error conditions: invalid pagination, missing filter target if implementation requires existing IDs.

Frontend usage notes: Use submission filter for evidence timeline and campaign filter for review feeds.
