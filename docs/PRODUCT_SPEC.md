# Product Spec

## Product

Name: ProofPilot

Tagline: AI consensus review for the builder economy.

One-line pitch: ProofPilot uses GenLayer Intelligent Contracts to verify live project evidence, score submissions against transparent rubrics, and publish on-chain review reports for builders, grants, hackathons, and bounty programs.

## Problem

Builder programs rely on project claims that are often spread across live apps, GitHub repositories, docs, deployment records, and human feedback threads. Reviewers must manually check whether a project is live, whether the repository matches the submission, whether a deployed contract appears consistent, and whether requested fixes were addressed.

This process is slow, inconsistent, and difficult to audit. It is especially painful for hackathons, grant programs, and bounty programs where many submissions need to be reviewed quickly while still preserving fairness and transparency.

## Product Goal

ProofPilot provides a repeatable review layer that can:

- Capture structured builder evidence.
- Fetch live evidence through GenLayer web access.
- Score submissions against transparent campaign rubrics.
- Publish strict JSON review reports on-chain.
- Track builder reputation across campaigns.
- Support re-checks, appeals, and optional human decisions.

## Primary Users

Program owners create campaigns, define rubrics, monitor submissions, and optionally record final human decisions.

Builders submit project evidence, review reports, fix issues, and request re-checks.

Human reviewers use AI consensus reports as a first-pass evidence summary and decision support layer.

Ecosystem observers can inspect public review reports and builder profiles.

## Core Use Cases

- A hackathon team submits a live app, repository, docs, contract address, and deployment transaction for judging readiness.
- A grant recipient submits milestone evidence and asks for review before a funding decision.
- A bounty hunter submits implementation proof and links to feedback they addressed.
- An ecosystem program runs periodic quality reviews of deployed apps.
- A builder accumulates a public reputation profile based on completed reviews.

## MVP-Plus Scope

The first serious version should include:

- Campaign creation and listing.
- Submission creation and listing.
- Evidence snapshots produced by contract-controlled web fetches.
- Review reports with category scores, findings, risks, status, and recommendation.
- Builder profiles with aggregate review history.
- Re-check requests after fixes.
- Appeal records when builders dispute or clarify a review.
- Optional human decision recording.

Out of scope for this documentation phase:

- Frontend implementation.
- GenLayer contract implementation.
- Off-chain indexer implementation.
- Identity, payments, and grant disbursement automation.

## Evidence Submitted By Builder

Each submission can include:

- Live app URL.
- GitHub repo URL.
- Docs URL.
- Deployed contract address.
- Deployment transaction hash.
- Reviewer feedback text.
- Explanation of fixes.

URLs are input data, not direct prompt instructions. The contract must fetch URL content through GenLayer web access and must pass only normalized, bounded evidence summaries into review prompts.

## Campaign Model

`Campaign` represents a review program.

Recommended fields:

- `campaign_id`: unique campaign identifier.
- `owner`: program owner address.
- `title`: public campaign name.
- `description`: campaign purpose and scope.
- `rubric_version`: rubric identifier, initially `rubric_v1`.
- `custom_rubric`: optional campaign-specific rubric extension.
- `submission_requirements`: required evidence fields.
- `review_policy`: thresholds, re-check limits, and human review settings.
- `status`: draft, active, paused, or closed.
- `created_at`: creation timestamp or block context.
- `updated_at`: latest update timestamp or block context.

## Submission Model

`Submission` represents one builder project submitted to a campaign.

Recommended fields:

- `submission_id`: unique submission identifier.
- `campaign_id`: campaign reference.
- `builder`: submitting builder address or profile identifier.
- `project_name`: builder-provided project name.
- `summary`: concise project description.
- `live_app_url`: submitted live app URL.
- `github_repo_url`: submitted GitHub URL.
- `docs_url`: submitted documentation URL.
- `contract_address`: submitted deployed contract address.
- `deployment_tx_hash`: submitted deployment transaction hash.
- `reviewer_feedback_text`: previous reviewer feedback, if any.
- `fixes_explanation`: builder explanation of changes made.
- `status`: submitted, under review, reviewed, recheck requested, appealed, or closed.
- `created_at`: creation timestamp or block context.
- `updated_at`: latest update timestamp or block context.

## EvidenceSnapshot Model

`EvidenceSnapshot` records what the contract fetched and normalized for review.

Recommended fields:

- `snapshot_id`: unique evidence snapshot identifier.
- `submission_id`: submission reference.
- `campaign_id`: campaign reference.
- `fetch_attempts`: per-source fetch results.
- `live_app_snapshot`: normalized live app evidence.
- `github_snapshot`: normalized repository evidence.
- `docs_snapshot`: normalized docs evidence.
- `deployment_snapshot`: normalized deployment proof evidence.
- `feedback_snapshot`: normalized reviewer feedback and fix explanation evidence.
- `warnings`: fetch failures, truncated content, mismatches, or suspicious content.
- `created_at`: snapshot timestamp or block context.

Fetched content is untrusted. It can contain prompt injection, stale content, irrelevant content, or misleading claims. The review layer must treat snapshots as evidence to evaluate, not instructions to follow.

## ReviewReport Model

`ReviewReport` is the public AI consensus output for a submission.

Recommended fields:

- `report_id`: unique report identifier.
- `submission_id`: submission reference.
- `campaign_id`: campaign reference.
- `builder`: builder reference.
- `snapshot_id`: evidence snapshot used for the report.
- `rubric_version`: rubric version applied.
- `scores`: category score object.
- `total_score`: integer from 0 to 100.
- `status`: one of the supported review statuses.
- `recommendation`: one of the supported recommendations.
- `findings`: concise evidence-backed findings.
- `risks`: broken links, mismatches, missing proof, or suspicious content.
- `missing_evidence`: required but unavailable evidence.
- `fetch_failures`: sources that could not be fetched.
- `confidence`: review confidence level.
- `human_decision`: optional final human decision reference.
- `created_at`: report timestamp or block context.

## BuilderProfile Model

`BuilderProfile` aggregates a builder's public review history.

Recommended fields:

- `builder`: builder address or identifier.
- `display_name`: optional display name.
- `submission_count`: number of submitted projects.
- `review_count`: number of completed reports.
- `approved_count`: reports that reached approval-oriented recommendations.
- `average_score`: average score across reports.
- `latest_report_ids`: recent review references.
- `campaign_history`: campaigns participated in.
- `appeal_count`: number of appeals.
- `recheck_count`: number of requested re-checks.
- `updated_at`: latest profile update timestamp or block context.

## Appeal Model

`Appeal` represents a builder request for reconsideration.

Recommended fields:

- `appeal_id`: unique appeal identifier.
- `submission_id`: submission reference.
- `campaign_id`: campaign reference.
- `builder`: builder reference.
- `report_id`: report being appealed.
- `reason`: builder-provided appeal reason.
- `new_evidence`: optional corrected or additional evidence fields.
- `status`: open, recheck scheduled, accepted, rejected, or closed.
- `resolution_notes`: optional human or program owner resolution.
- `created_at`: appeal timestamp or block context.
- `resolved_at`: optional resolution timestamp or block context.

## Rubric V1

Total: 100 points.

| Category | Points | Review Intent |
| --- | ---: | --- |
| Live app availability | 15 | Confirm the submitted app can be reached and appears usable. |
| GitHub repository availability | 10 | Confirm repository availability and basic project relevance. |
| README/documentation quality | 15 | Assess clarity, setup instructions, usage notes, and project explanation. |
| Contract address consistency | 20 | Check whether submitted contract address is present and consistent across evidence. |
| Deployment transaction proof | 15 | Check whether deployment transaction evidence supports the submitted contract claim. |
| Reviewer feedback addressed | 15 | Compare previous feedback against the builder's explanation of fixes. |
| Professional presentation | 5 | Evaluate polish, organization, and public readiness. |
| Risk, broken links, or mismatch checks | 5 | Penalize broken evidence, suspicious mismatches, and unresolved risk. |

## Review Statuses

- `READY_FOR_REVIEW`: evidence is strong enough for human approval or final program review.
- `NEEDS_MINOR_FIXES`: submission is mostly complete but has limited fixable issues.
- `NEEDS_MAJOR_FIXES`: important evidence is missing, inconsistent, or broken.
- `NOT_READY`: submission lacks core proof or cannot be meaningfully reviewed.

## Recommendations

- `APPROVE_FOR_HUMAN_REVIEW`: strong submission, ready for final human decision.
- `REQUEST_MINOR_CHANGES`: ask builder to correct small gaps.
- `REQUEST_MAJOR_CHANGES`: ask builder to resolve material problems.
- `REJECT_OR_RESUBMIT`: submission should be rejected or substantially resubmitted.

## Success Criteria

ProofPilot succeeds when reviewers can use the reports to make faster and more consistent decisions, builders understand exactly what evidence is missing or weak, and public reports provide a credible audit trail for ecosystem programs.
