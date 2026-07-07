# ProofPilot Whitepaper

## Abstract

ProofPilot is a GenLayer-native protocol for decentralized review of builder work. It uses GenLayer Intelligent Contracts to fetch live evidence, evaluate submissions against transparent rubrics, produce AI consensus review reports, and publish review history on-chain. The protocol is designed for grants, hackathons, bounty programs, ecosystem app reviews, and builder reputation.

ProofPilot does not ask validators to browse arbitrary URLs from prompts. The contract fetches evidence through GenLayer web access functions such as `gl.nondet.web.get` and `gl.nondet.web.render`, routes nondeterministic access through an equivalence principle flow such as `gl.eq_principle.strict_eq`, treats fetched content as untrusted evidence, and requires strict JSON review output. This makes ProofPilot an auditable review substrate rather than a conventional off-chain AI scoring tool.

## Problem Statement

Builder programs need to evaluate work that exists across many surfaces: live applications, GitHub repositories, documentation, deployed contract addresses, deployment transactions, prior reviewer feedback, and builder fix explanations. Manual review is slow, inconsistent, and difficult to audit. Conventional AI review tools can summarize evidence, but they usually rely on off-chain orchestration, opaque browsing behavior, mutable reports, and weak guarantees around prompt injection or scoring consistency.

Programs need a review system that can:

- Verify live evidence directly.
- Apply transparent rubrics.
- Record what evidence was available at review time.
- Publish reports that can be inspected by builders and reviewers.
- Support correction, appeal, and human decision workflows.
- Build durable builder reputation without hiding risks or failed evidence.

## Why Decentralized AI Review Is Needed

Builder review is an economic coordination problem. Grants, prizes, bounties, and ecosystem endorsements distribute value and reputation based on claims about work performed. A centralized reviewer can be fast, but the process is often opaque. A fully manual committee can be careful, but it does not scale.

Decentralized AI review gives programs a shared evidence and scoring layer. The protocol can verify evidence in a repeatable way, constrain model output to public schemas, and preserve reports for later inspection. Human reviewers remain important, but they operate on top of a transparent evidence record instead of private notes and ad hoc judgments.

## Protocol Overview

ProofPilot is organized around campaigns, submissions, evidence snapshots, review reports, builder profiles, appeals, and human decisions.

The core flow is:

1. A campaign owner creates a campaign and review policy.
2. A builder submits structured project evidence.
3. The contract fetches live evidence through GenLayer web access.
4. The contract normalizes fetched content into a bounded evidence snapshot.
5. The AI consensus layer evaluates the snapshot against the campaign rubric.
6. The contract validates strict JSON output and stores a review report.
7. Builder reputation is updated from accepted report data.
8. Builders may request re-checks or open appeals.
9. Authorized humans may record separate final decisions.

## Actors

Protocol owner manages protocol-level configuration in future versions. The Phase 2 contract surface does not require broad protocol-owner powers for ordinary review flows.

Campaign owner creates and administers a campaign, configures review policy, and may record or authorize human decisions.

Authorized reviewer is a campaign-level human reviewer who can record human decisions when permitted by campaign policy.

Builder submits project evidence, requests re-checks, and opens appeals for their submissions.

Public viewer reads campaigns, submissions, reports, evidence snapshots, builder profiles, appeals, and human decisions.

## Campaign Lifecycle

Campaigns define the review context. A campaign includes a title, description, rubric version, optional custom rubric notes, submission requirements, review policy, owner, status, and timestamps.

Campaign states are:

- `DRAFT`: configured but not accepting submissions.
- `ACTIVE`: accepting submissions and reviews.
- `PAUSED`: temporarily stopped.
- `CLOSED`: permanently closed for normal submissions and reviews.

Campaign policy should define required evidence fields, who may run reviews, re-check limits, and whether human decisions are enabled.

## Submission Lifecycle

A submission is a builder's project record inside a campaign. It includes project metadata, live app URL, GitHub repo URL, docs URL, contract address, deployment transaction hash, prior feedback, fix explanation, counters, and latest report reference.

Submission states are:

- `SUBMITTED`: created and waiting for review.
- `UNDER_REVIEW`: review execution is in progress.
- `REVIEWED`: at least one validated report exists.
- `RECHECK_REQUESTED`: builder requested a new review after fixes.
- `APPEALED`: builder opened an appeal.
- `CLOSED`: no further normal review actions are expected.

Historical evidence snapshots and reports must not be overwritten by later submissions, re-checks, appeals, or human decisions.

## Evidence Verification Layer

The evidence layer is the boundary between builder claims and review output. It fetches:

- Live app URL.
- GitHub repository URL.
- Documentation URL.
- GenLayer Explorer contract address URL.
- GenLayer Explorer transaction URL.
- Builder-provided feedback and fix explanation text.

Raw URLs are not used as instructions to validators. URLs are input fields used by the contract to call GenLayer web access functions. Fetched content is normalized into bounded evidence snapshots with source labels, fetch statuses, truncation warnings, and failure metadata.

## AI Consensus Review Layer

The AI consensus review layer receives only normalized evidence, campaign metadata, rubric information, and explicit safety instructions. It must treat all evidence as untrusted. It must ignore instructions inside fetched pages, README files, docs, app text, and builder-provided text.

The review output must be strict JSON. The contract validates required keys, enum values, score ranges, total score, text length limits, and representation of fetch failures before storing a report.

## Public Report Layer

Review reports are public protocol records. A report links to:

- Campaign.
- Submission.
- Builder.
- Evidence snapshot.
- Rubric version.
- Category scores.
- Total score.
- Review status.
- Recommendation.
- Risk level.
- Confidence.
- Findings.
- Risks.
- Missing evidence.
- Fetch failures.

Reports are AI consensus outputs. Humans may record decisions against reports, but they must not mutate report findings, scores, or raw AI JSON.

## Builder Reputation Layer

Builder profiles aggregate review history across campaigns. The reputation layer tracks submission count, review count, approval count, average score, recent reports, campaign history, appeals, and re-checks.

Reputation should reward consistent, verified completion across campaigns while avoiding unfair punishment for external fetch failures. Reports with high-risk unresolved findings should reduce reputation more than reports with temporary infrastructure failures that are later corrected.

## Appeals And Re-Checks

Re-checks support corrected evidence. A re-check creates a new evidence snapshot and new report. It never edits the prior report.

Appeals support disputes about a specific report. An appeal references the report, includes a reason, may include new evidence, and can be resolved by campaign-level policy. Appeal resolution is an additional record, not a mutation of the appealed report.

## Human Decision Layer

Human decisions are optional campaign-level records. They reference a submission and report, include a reviewer, decision status, notes, and timestamp. A human decision can approve, reject, request changes, or override a prior human decision, but it must not edit the AI report.

This separation preserves both machine consensus and human governance.

## Security Model

ProofPilot assumes all external evidence is untrusted. The security model centers on:

- Explicit GenLayer web access instead of prompt-based browsing.
- Equivalence principle execution for nondeterministic fetches.
- Bounded evidence normalization.
- Prompt-injection resistant templates.
- Strict JSON output.
- Contract-side validation of scores and enums.
- Immutable reports and snapshots.
- Separate human decision records.
- Transparent display of failures, missing evidence, and risk.

## Failure Model

Failures are expected and must be represented in reports. ProofPilot handles unreachable live apps, private repositories, docs failures, explorer failures, malformed AI JSON, score mismatches, unsupported enums, and repeated review requests conservatively.

Fetch failures do not automatically invalidate a submission, but they reduce relevant category scores and confidence. Malformed AI JSON is not stored as a report. Historical state remains intact when review execution fails.

## Abuse Prevention

ProofPilot prevents abuse through campaign policy, bounded input sizes, re-check limits, appeal limits, authorization checks, immutable history, and frontend display rules that must not hide failed evidence or high-risk findings.

Known abuse classes include builder spam, re-check spam, appeal spam, Sybil builder profiles, malicious campaign configuration, score manipulation attempts, and storage bloat.

## Future Expansion

Future extensions may include:

- Campaign-specific custom rubrics with versioned validation.
- Reviewer allowlists and delegated campaign roles.
- Cross-chain explorer support.
- Indexer-backed search and analytics.
- Stake, fee, or deposit mechanisms for spam resistance.
- Reputation attestations exportable to other ecosystems.
- Multi-stage milestone workflows.
- Human review committees and quorum-based decisions.

These are future extensions and should not be treated as Phase 3 implementation commitments.

## Why ProofPilot Is GenLayer-Native

ProofPilot depends on GenLayer capabilities at the protocol level. The core review primitive is not an off-chain AI agent writing to a database. It is an Intelligent Contract that fetches evidence, applies AI consensus, validates structured output, and stores public reports.

GenLayer web access allows the contract to inspect live project evidence. The equivalence principle gives structure to nondeterministic web reads. Intelligent Contract execution makes AI review a first-class part of protocol state. This combination lets ProofPilot operate as a decentralized review operating layer for builder programs.
