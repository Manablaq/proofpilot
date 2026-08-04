# Testing Strategy

## Purpose

ProofPilot review outcomes must be credible, repeatable, and safe against adversarial evidence. Testing should cover contract state transitions, GenLayer web access behavior, strict JSON review output, scoring constraints, prompt-injection resistance, and failure handling.

This document defines the contract and frontend testing strategy. The repository includes architecture tests and a local behavioral contract-workflow test using a minimal GenLayer storage/decorator shim. That local shim exercises contract methods and state transitions, but it does not replace a signed Studio/Bradbury end-to-end test or validator-consensus test.

## Test Layers

### Unit Tests

Unit tests should cover deterministic contract behavior:

- Campaign creation validation.
- Submission validation.
- Required evidence field checks.
- Status transitions.
- Re-check policy enforcement.
- Appeal creation and resolution rules.
- Human decision authorization.
- Builder profile aggregation.
- Report schema validation.
- Score total validation.

### Web Access Integration Tests

Integration tests should verify GenLayer web evidence access patterns:

- `gl.nondet.web.get` is used for raw page or file retrieval where appropriate.
- `gl.nondet.web.render` is used when rendered app content is required.
- Web access is called through an equivalence principle flow such as `gl.eq_principle.strict_eq`.
- Raw URLs are not inserted into review prompts with an expectation that validators browse them.
- Fetch result metadata is captured in an `EvidenceSnapshot`.
- Fetch failures are recorded and do not crash the review.

### Review Output Tests

Review tests should validate strict JSON behavior:

- Output is parseable JSON only.
- Required keys are present.
- Enum values are valid.
- Category scores are integers.
- Category scores do not exceed rubric maximums.
- `total_score` equals the sum of category scores.
- `status` matches score and evidence severity rules.
- `recommendation` is consistent with status.
- `findings`, `risks`, `missing_evidence`, and `fetch_failures` are arrays.

### Adversarial Evidence Tests

Fetched evidence must be treated as hostile input. Tests should include pages or files that contain:

- "Ignore previous instructions" prompt injection.
- Fake rubric instructions.
- Requests to output non-JSON.
- Claims that the project should receive full score.
- Hidden or irrelevant text.
- Conflicting contract addresses.
- Broken links.
- Documentation that describes a different project.
- Deployment transaction hash that does not match the submitted contract address.

Expected behavior:

- The review ignores instructions inside evidence.
- The output remains strict JSON.
- The report flags suspicious or conflicting content.
- The score is conservative where evidence is ambiguous.

### Scoring Tests

Rubric v1 totals 100 points:

| Category | Max Points |
| --- | ---: |
| Live app availability | 15 |
| GitHub repository availability | 10 |
| README/documentation quality | 15 |
| Contract address consistency | 20 |
| Deployment transaction proof | 15 |
| Reviewer feedback addressed | 15 |
| Professional presentation | 5 |
| Risk, broken links, or mismatch checks | 5 |

Tests should include:

- Perfect evidence case scoring near 100.
- Missing live app case losing live availability points.
- Private or unavailable GitHub repo case losing repo points.
- Poor documentation case losing documentation points.
- Contract address mismatch case losing consistency points and adding risk.
- Missing deployment transaction proof case losing deployment proof points.
- Unaddressed feedback case losing feedback points.
- Multiple broken links case reducing risk/mismatch score.
- Fetch failure case that scores only available evidence.

### Status and Recommendation Tests

Review statuses:

- `READY_FOR_REVIEW`
- `NEEDS_MINOR_FIXES`
- `NEEDS_MAJOR_FIXES`
- `NOT_READY`

Recommendations:

- `APPROVE_FOR_HUMAN_REVIEW`
- `REQUEST_MINOR_CHANGES`
- `REQUEST_MAJOR_CHANGES`
- `REJECT_OR_RESUBMIT`

Suggested threshold tests:

- High score with no critical risks results in `READY_FOR_REVIEW` and `APPROVE_FOR_HUMAN_REVIEW`.
- Medium score with fixable gaps results in `NEEDS_MINOR_FIXES` or `NEEDS_MAJOR_FIXES`.
- Low score or missing core evidence results in `NOT_READY`.
- Critical mismatch can prevent approval even when other categories score well.

Exact thresholds should be finalized during contract implementation and documented in the rubric configuration.

## Contract Method Coverage

Each documented contract method should have success and failure tests:

- `create_campaign`
- `submit_project`
- `run_review`
- `request_recheck`
- `record_human_decision`
- `resolve_appeal`
- `get_campaign`
- `get_submission`
- `get_report`
- `get_latest_report`
- `get_builder_profile`
- `get_human_decision`
- `get_report_decisions`
- `list_campaigns`
- `list_submissions`
- `list_reports`

Read methods should test empty state, valid lookups, missing IDs, and pagination or filtering once implemented.

## Re-Check and Appeal Tests

Re-check tests should verify:

- Builders can request re-checks when policy allows.
- Re-checks produce new evidence snapshots.
- New reports do not overwrite old reports.
- `get_latest_report` returns the newest report.
- Builder profile aggregates are updated after each completed report.

Appeal tests should verify:

- Appeals reference valid reports.
- Unauthorized users cannot appeal another builder's submission unless allowed by campaign policy.
- Appeal resolution does not mutate the appealed report.
- Human decision records remain separate from AI consensus reports.
- Only campaign owners can resolve open appeals.
- Accepted or scheduled appeals consume one configured re-check opportunity and transition the submission to `RECHECK_REQUESTED`.
- Rejected or closed appeals return the submission to `REVIEWED` without mutating the report.
- Manipulated appeal JSON (for example an `instructions` key) is rejected; only bounded public HTTPS URLs and a bounded note are accepted.

## Test Fixtures

Recommended fixture set:

- Valid complete project evidence.
- Valid project with minor documentation issues.
- Project with unavailable live app.
- Project with private or missing repository.
- Project with mismatched contract address.
- Project with invalid or unrelated deployment transaction hash.
- Project with prompt-injection content in README.
- Project with prompt-injection content in rendered app page.
- Project with reviewer feedback that is clearly addressed.
- Project with reviewer feedback that is not addressed.

## Acceptance Criteria Before Launch

Before ProofPilot is used for real campaign decisions:

- All contract state transition tests pass.
- Review output schema validation rejects malformed reports.
- Prompt-injection fixtures do not alter system instructions or output format.
- Fetch failures are represented in reports and scored conservatively.
- Historical reports are immutable after creation.
- Human decisions are auditable and separate from AI reports.
- V10 governance workflows are exercised on a fresh deployment with a builder wallet and a campaign-owner wallet before any production claim.
- Builder profile aggregation is deterministic and explainable.
