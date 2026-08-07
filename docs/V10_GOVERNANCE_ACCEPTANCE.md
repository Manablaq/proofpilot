# ProofPilot Bradbury Governance Acceptance Record

## Scope

This record documents the completed on-chain acceptance flow for ProofPilot's report-linked governance workflow. It identifies what was exercised; it does not claim that a review recommendation proves legal ownership, security, or universal project quality.

## Finalized contract

| Field | Value |
| --- | --- |
| Network | GenLayer Bradbury Testnet |
| Contract | [`0x4FCf070e2dB9Fc0f54f7849BA58260FedD881D6A`](https://explorer-bradbury.genlayer.com/address/0x4FCf070e2dB9Fc0f54f7849BA58260FedD881D6A) |
| Deployment transaction | [`0x2a568e2f999401ca3f53de5df0f03f8ea01762feaf0670bb0897416476570d0c`](https://explorer-bradbury.genlayer.com/tx/0x2a568e2f999401ca3f53de5df0f03f8ea01762feaf0670bb0897416476570d0c) |
| Deployment state | Finalized |

## Completed acceptance flow

The campaign owner and builder used distinct Bradbury wallets. The following records were created and read during the test; their respective transactions have finalized.

| Step | On-chain record | Verified result |
| --- | --- | --- |
| Campaign creation | `campaign_1` | Active campaign created by the owner. |
| Builder submission | `submission_1` | Public project evidence recorded for the builder. |
| Initial review | `report_1` / `snapshot_1` | A separate consensus report was created. |
| Builder appeal | `appeal_1` | Bounded HTTPS evidence and a bounded note were accepted; appeal status was `OPEN`. |
| Owner resolution | `appeal_1` | `RECHECK_SCHEDULED` transitioned `submission_1` to `RECHECK_REQUESTED`. |
| Re-check review | `report_2` / `snapshot_2` | A new report and snapshot were created without replacing `report_1`. |
| Human decision | `human_decision_1` | Owner recorded `APPROVED`, separately linked to `report_2`. |
| Public ledger read | `get_report_decisions("report_2")` | Returned the immutable report and its linked human decision. |

The accepted appeal and appeal-resolution transactions are public on Bradbury:

- [`open_appeal`](https://explorer-bradbury.genlayer.com/tx/0xd9ed438a3aceb018bbd0e1ee7e3aebaa936af0ffc28fb810dd450d7a7ce2aeaf)
- [`resolve_appeal`](https://explorer-bradbury.genlayer.com/tx/0xfdb854bafe8f55a661456b96e7f4ecc1e88a45e5bbb6fe127a22a6cd782a891a)

## Assertions

1. Appeals are append-only governance records linked to a specific report.
2. Resolution does not alter the appealed consensus report.
3. An allowed appeal resolution consumes one re-check opportunity and enables a new review.
4. The later review retains its own report and snapshot identifiers.
5. A human decision is a separate record, linked to a report and retrievable through `get_report_decisions`.
6. Public readers can retrieve report-linked governance records without acting as the campaign owner or builder.

## Boundaries

ProofPilot fetches and evaluates public evidence under a campaign rubric. Public reachability, format checks, and bounded evaluation do not establish legal identity, ownership, security, originality, or objective universal quality. The final program decision remains human-governed.
