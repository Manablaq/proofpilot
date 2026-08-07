# Permissions

## Purpose

This document defines the ProofPilot authorization model. Permissions must protect write actions while keeping review data publicly readable.

## Actors

Protocol owner manages protocol-level configuration in future extensions. This actor should not have routine power to edit campaign reports.

Campaign owner creates a campaign, controls campaign policy, resolves open appeals, and records human decisions.

The current deployment does not implement delegated reviewer roles or reviewer allowlists. References to an “authorized reviewer” below describe a future extension, not an available permission.

Builder creates submissions, requests re-checks for their submissions, and opens appeals for their reports.

Public viewer reads public protocol data.

## Permission Matrix

| Method | Protocol Owner | Campaign Owner | Authorized Reviewer | Builder | Public Viewer |
| --- | --- | --- | --- | --- | --- |
| `create_campaign` | yes | yes | yes as owner of new campaign | yes as owner of new campaign | no |
| `submit_project` | yes as builder | yes as builder | yes as builder | yes | no |
| `run_review` | policy-dependent | policy-dependent | policy-dependent | policy-dependent | policy-dependent |
| `request_recheck` | no by default | yes | yes if policy allows | yes for own submission | no |
| `open_appeal` | no by default | no by default | no by default | yes for own submission | no |
| `resolve_appeal` | no | yes | no (not implemented) | no | no |
| `record_human_decision` | no | yes | no (not implemented) | no | no |
| read methods | yes | yes | yes | yes | yes |
| list methods | yes | yes | yes | yes | yes |

`run_review` should be governed by campaign policy. Supported modes may include owner-triggered, reviewer-triggered, builder-triggered, or open-triggered review. If not configured, the conservative default is campaign owner or authorized reviewer.

## Method Authorization Rules

### `create_campaign`

Any authenticated caller can create a campaign and becomes its campaign owner. Future extensions may add protocol-level fees, allowlists, or campaign verification.

### `submit_project`

Any authenticated builder can submit to an `ACTIVE` campaign if requirements are satisfied and campaign policy allows submissions. The caller is recorded as `builder`.

### `run_review`

The caller must satisfy campaign review policy. The method must reject closed submissions, closed campaigns, paused campaigns, and repeated review attempts that violate policy.

### `request_recheck`

The caller must be the submission builder, campaign owner, or authorized reviewer when policy permits. Re-check count must remain within campaign limits.

### `open_appeal`

The caller must be the submission builder unless campaign policy explicitly allows delegated appeal filing. The appeal must reference a valid report for the same submission.

### `record_human_decision`

The caller must be the campaign owner. The decision must reference a valid submission and report. The method must not edit AI report contents.

### `resolve_appeal`

The caller must be the campaign owner. The appeal must still be `OPEN`; its resolution is append-only state on the separate appeal record. `ACCEPTED` and `RECHECK_SCHEDULED` transition the associated submission to `RECHECK_REQUESTED`; `REJECTED` and `CLOSED` transition it to `REVIEWED`.

### Read Methods

The following are public:

- `get_campaign`
- `get_submission`
- `get_evidence_snapshot`
- `get_report`
- `get_latest_report`
- `get_builder_profile`
- `get_appeal`
- `get_report_decisions`

### List Methods

The following are public with pagination bounds:

- `list_campaigns`
- `list_submissions`
- `list_reports`

## Admin Safety Rules

- Protocol owner should not be able to rewrite reports, snapshots, or builder history.
- Campaign owner should not be able to mutate AI report scores or findings.
- Authorized reviewer permissions should be campaign-scoped.
- Human decision powers should be append-only.
- Status updates should be explicit and logged when implemented.
- Closed campaigns and submissions should remain readable.

## Why AI Reports Must Not Be Mutable By Humans

AI reports are protocol evidence records. They represent what the AI consensus review produced from a specific evidence snapshot at a specific time. If humans can edit scores, findings, or missing evidence, the report no longer has audit value.

Human disagreement is valid, but it must be recorded as a separate decision or appeal resolution. This preserves the distinction between evidence review and governance judgment.

## Human Decisions As Separate Records

Human decisions should contain:

- Decision ID.
- Submission ID.
- Campaign ID.
- Report ID.
- Reviewer.
- Decision status.
- Notes.
- Timestamp.

The frontend should display human decisions beside AI reports, not as replacements for them. Human override notes must remain visible.
