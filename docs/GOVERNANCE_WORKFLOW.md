# ProofPilot Governance Workflow

## Status and scope

This document specifies ProofPilot's report-linked governance workflow. It is live on the finalized [Bradbury deployment](https://explorer-bradbury.genlayer.com/address/0x4FCf070e2dB9Fc0f54f7849BA58260FedD881D6A), with the recorded acceptance flow summarized in [V10_GOVERNANCE_ACCEPTANCE.md](./V10_GOVERNANCE_ACCEPTANCE.md). It does not retroactively change historical deployments or their public fixtures.

ProofPilot keeps two distinct record classes:

1. A consensus `ReviewReport`, produced from a bounded evidence snapshot.
2. Governance records—re-check requests, appeal outcomes, and human decisions—linked to that report.

Governance records never rewrite the consensus report, its score, or its evidence snapshot.

## Roles

| Role | On-chain authority |
| --- | --- |
| Builder | Request a re-check for their own submission; open an appeal for their own report. |
| Campaign owner | Run a review, resolve an open appeal, and record a human decision for the campaign. |
| Public reader | Read the report, linked appeals, and linked human decisions without a wallet. |

The current deployment does not introduce a delegated reviewer allowlist. The campaign owner is the only concrete human decision-maker.

## State transitions

```text
REVIEWED -- builder opens appeal --> APPEALED
APPEALED -- owner accepts / schedules re-check --> RECHECK_REQUESTED
APPEALED -- owner rejects / closes appeal --> REVIEWED
RECHECK_REQUESTED -- owner runs review --> UNDER_REVIEW --> REVIEWED
REVIEWED -- owner records APPROVED / REJECTED / OVERRIDDEN --> CLOSED
REVIEWED -- owner records CHANGES_REQUESTED --> RECHECK_REQUESTED
```

`run_review` creates a new evidence snapshot and report. Earlier reports remain available and no appeal resolution modifies their contents.

## Appeals

`open_appeal(submission_id, report_id, reason, new_evidence_json)` accepts:

```json
{
  "public_urls": ["https://example.org/public-proof"],
  "notes": "Optional public context."
}
```

Only the keys `public_urls` and `notes` are permitted. There can be at most five public `https://` URLs. Arbitrary instruction fields, private data, non-object JSON, oversized entries, and invalid URLs are rejected. Appeal material is not inserted into the consensus-review prompt; a later re-check re-fetches only the submission’s declared evidence fields.

`resolve_appeal(appeal_id, resolution_status, resolution_notes)` is campaign-owner only. It accepts `RECHECK_SCHEDULED`, `ACCEPTED`, `REJECTED`, or `CLOSED`. The resolution note is required. An accepted or scheduled appeal consumes one configured re-check allowance; a rejected or closed appeal returns the submission to `REVIEWED`.

## Human decisions

`record_human_decision(submission_id, report_id, decision_status, notes)` is campaign-owner only. Its supported terminal statuses are `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`, and `OVERRIDDEN`.

- `APPROVED`, `REJECTED`, and `OVERRIDDEN` close the submission.
- `CHANGES_REQUESTED` transitions the submission to `RECHECK_REQUESTED`.

This record is a program-governance decision, not a replacement for an AI consensus report or a claim of legal identity, ownership, security, or universal quality.

## Public report ledger

`get_report_decisions(report_id)` returns the immutable report plus every appeal and human decision linked to it. The browser dApp exposes this same record through `/api/reports/{reportId}/decisions` and the public report page’s **Recorded governance decisions** section.

## Bradbury acceptance test

The following sequence was completed against the finalized Bradbury deployment:

1. Deploy the exact committed V10 source as a fresh Studio or CLI deployment.
2. Wait for the deployment to finalize, then read `list_campaigns` from accepted state.
3. Create a test campaign with distinct builder and owner wallets.
4. Submit and review a public test project.
5. Open an appeal as the builder using an allowed public HTTPS URL.
6. Resolve it as the campaign owner and confirm both the appeal and submission state.
7. Record a human decision and read `get_report_decisions(report_id)`.
8. Verify the public report page displays the linked ledger without a page reload after the transaction’s accepted state is observable.

Record all transaction and explorer links in the new deployment evidence document. Do not use historical V9 links as evidence that V10 governance paths are live.
