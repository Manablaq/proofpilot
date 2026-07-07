# Reputation Model

## Purpose

ProofPilot builder reputation summarizes review history across campaigns. It is designed to help programs reason about verified work without hiding report-level evidence, risks, fetch failures, or human decisions.

Reputation is not identity verification. It is an address-bound review history derived from protocol records.

## Reputation Fields

`BuilderProfile` should include:

- `builder`
- `display_name`
- `submission_count`
- `review_count`
- `approved_count`
- `average_score`
- `latest_report_ids_json`
- `campaign_history_json`
- `appeal_count`
- `recheck_count`
- `updated_at`

Future extension fields may include:

- `reputation_score`
- `high_risk_unresolved_count`
- `human_approved_count`
- `campaign_diversity_score`
- `consistency_score`
- `last_reviewed_at`

## Score Calculation V1

The simple direction for reputation is:

```text
reputation_score = weighted average based on report scores,
completed reviews,
approved recommendations,
consistency across campaigns,
and penalty for unresolved high-risk reports.
```

Recommended v1 components:

| Component | Weight | Description |
| --- | ---: | --- |
| Average report score | 50% | Mean of validated report `total_score` values. |
| Approved recommendation ratio | 20% | Share of reports with `APPROVE_FOR_HUMAN_REVIEW`. |
| Completed review volume | 10% | Credit for completed reviews, capped to prevent spam farming. |
| Campaign consistency | 10% | Credit for positive outcomes across multiple campaigns. |
| High-risk penalty | -10% to -30% | Penalty for unresolved `HIGH` or `CRITICAL` risk reports. |

The first implementation may store only `average_score` and component counts. Full `reputation_score` can be introduced as a future extension if validation rules are finalized.

## Average Score Logic

`average_score` should be computed from stored reports:

```text
average_score = floor(sum(report.total_score) / review_count)
```

Only validated and stored reports count. Failed review attempts with malformed JSON do not count.

## Approval Count Logic

`approved_count` increments when a report recommendation is:

```text
APPROVE_FOR_HUMAN_REVIEW
```

Human approval can be tracked separately in future extensions. AI recommendation and human decision must not be collapsed into one field.

## Re-Check Impact

Re-check reports should count as real reports because they represent new evidence snapshots. However, reputation display should show re-check count so viewers understand whether a score improved after repeated attempts.

Recommended handling:

- Include re-check reports in average score.
- Track `recheck_count`.
- Keep latest report IDs visible.
- Do not delete earlier low-scoring reports.

Future extension: weighted recency model that gives later corrected reports more weight while retaining history.

## Appeal Impact

Opening an appeal should not directly lower reputation. Appeals are a normal dispute mechanism. Reputation impact should come from resulting reports and unresolved high-risk findings.

Recommended handling:

- Track `appeal_count`.
- Do not penalize appeal count alone.
- If appeal resolves with corrected evidence, reputation can improve through the new report.
- If appeal is rejected and high-risk findings remain unresolved, the high-risk penalty may apply.

## Human Decision Impact

Human decisions should be displayed separately from AI reputation fields in v1. Human approvals may become a future reputation component, but only if decision authority and campaign quality are modeled.

Recommended v1 handling:

- Do not mutate AI report scores based on human decisions.
- Display human decisions alongside reports.
- Track future `human_approved_count` only as an extension.

## Avoiding Unfair Punishment From Fetch Failures

External fetch failures can be outside the builder's control. Reputation should avoid excessive punishment when:

- Evidence was previously available.
- Failure affects only one source.
- Re-check later succeeds.
- The report explicitly identifies infrastructure failure rather than project failure.

Recommended handling:

- Let fetch failures reduce the affected report score.
- Do not add extra reputation penalty solely for fetch failure.
- Penalize unresolved high-risk evidence mismatches more than temporary fetch failures.

## Sybil Limitations

ProofPilot reputation is address-bound. A builder can create a new address and start with no history. The protocol should not claim Sybil resistance in v1.

Mitigations and future extensions:

- Campaign-level identity requirements.
- Stake or deposit requirements.
- Verifiable credentials.
- Social or GitHub account attestations.
- Duplicate evidence detection.
- Cross-campaign reviewer attestations.

## Future Extensions

Future reputation work may include:

- Versioned reputation formulas.
- Campaign credibility weights.
- Human-reviewer credibility weights.
- Time decay.
- Milestone-specific reputation.
- Domain tags such as DeFi, games, infra, tooling, or AI.
- Exportable reputation attestations.
- Public reputation API optimized by an indexer.

All future extensions must preserve underlying reports and never hide failed fetches, risks, or human override notes.
