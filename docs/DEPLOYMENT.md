# ProofPilot Deployment

## Final Bradbury V6 Deployment

| Field | Value |
| --- | --- |
| Network | GenLayer Bradbury Testnet |
| RPC | `https://rpc-bradbury.genlayer.com` |
| Live app | https://proofpilot-two.vercel.app |
| Contract address | `0xC11b90c7c2C1C9F7E99ef767c80a7AD7Bc3F6f87` |
| Deployment transaction hash | `0x9a5add3f91daa277f1a09d27e0dd83ee27ec3d04c132c29c7e89e7b9d62d5877` |
| Deployment status | Successful |
| Current deployed contract source | `contracts/proofpilot.py` |
| Review architecture | Leader-side AI review, validator-side deterministic consensus checks |

## Explorer Links

- Contract: https://explorer-bradbury.genlayer.com/address/0xC11b90c7c2C1C9F7E99ef767c80a7AD7Bc3F6f87
- Deployment transaction: https://explorer-bradbury.genlayer.com/tx/0x9a5add3f91daa277f1a09d27e0dd83ee27ec3d04c132c29c7e89e7b9d62d5877
- Campaign transaction: https://explorer-bradbury.genlayer.com/tx/0x8a218d872394e7ef393ae3cd3c5c42c8b25d97afab67f550548f60db5b9eb99b
- Submit GenLayer transaction: https://explorer-bradbury.genlayer.com/tx/0x550e04c381b332ceae70fb3d9b3a4e5bbce8bb1955fad9b7229672d2db6fabb4
- Submit EVM transaction: https://explorer-bradbury.genlayer.com/tx/0x12b6d4b5e8c531e6c81fca28fda8bfbb7f239fff1b857c6be34b7d608727f0fe
- Run review transaction: https://explorer-bradbury.genlayer.com/tx/0x03dce7d374e767e4a99b9b8b6da51e5a704aa8ba402c96081723f32a882ab1f8

## Live Smoke Test

- Test status: passed
- `create_campaign` transaction hash: `0x8a218d872394e7ef393ae3cd3c5c42c8b25d97afab67f550548f60db5b9eb99b`
- Campaign ID: `campaign_1`
- Validators agreed: `5/5`
- This confirms the deployed v6 contract can write state and read state on Bradbury.

## First Live Submission

| Field | Value |
| --- | --- |
| Campaign ID | `campaign_1` |
| Submission ID | `submission_1` |
| Submit GenLayer transaction | `0x550e04c381b332ceae70fb3d9b3a4e5bbce8bb1955fad9b7229672d2db6fabb4` |
| Submit EVM transaction | `0x12b6d4b5e8c531e6c81fca28fda8bfbb7f239fff1b857c6be34b7d608727f0fe` |
| Final submission status | `REVIEWED` |
| Latest report ID | `report_1` |
| Review count | `1` |

## First Live Review Report

| Field | Value |
| --- | --- |
| Run review transaction | `0x03dce7d374e767e4a99b9b8b6da51e5a704aa8ba402c96081723f32a882ab1f8` |
| Report ID | `report_1` |
| Snapshot ID | `snapshot_1` |
| Total score | `61` |
| Review status | `NEEDS_MINOR_FIXES` |
| Recommendation | `REQUEST_MINOR_CHANGES` |
| Risk level | `MEDIUM` |
| Confidence | `HIGH` |
| Validators | `AGREE 5/5` |

Scores:

| Category | Score |
| --- | ---: |
| Live app availability | 15 |
| GitHub repository availability | 10 |
| README/documentation quality | 15 |
| Contract address consistency | 0 |
| Deployment transaction proof | 0 |
| Reviewer feedback addressed | 15 |
| Professional presentation | 3 |
| Risk, broken links, or mismatch checks | 3 |

Evidence status:

| Source | Status |
| --- | --- |
| Live app | `SUCCESS` `200` |
| GitHub | `SUCCESS` `200` |
| Docs | `SUCCESS` `200` |
| Contract address | `UNSUPPORTED_URL` metadata |
| Deployment transaction | `UNSUPPORTED_URL` metadata |

Fetch failures represented in the report:

- `contract_address`
- `deployment_tx`

## Deployment Notes

The original larger contract source failed deployment with `BlockPubdataLimitReached`. Earlier deployed versions proved campaign and submission flows, but `run_review` required several iterations before the final v6 architecture succeeded.

The final v6 contract keeps the leader-side AI review over compact facts and uses validator-side deterministic consensus checks. It does not return raw HTML or README text from nondeterministic execution, does not fetch explorer HTML, does not use `gl.nondet.web.render`, and does not rerun LLM review in validators.

## Public DApp Transaction Flow

The public frontend uses browser wallet signing only:

- The product app lives under `/app` with an app shell, sidebar navigation, wallet/status topbar, and live report/campaign/submission pages.
- Users connect an EIP-1193 wallet.
- The server prepares GenLayer consensus calldata but does not sign.
- The browser sends the prepared transaction to the Bradbury consensus contract through the wallet.
- The app waits for the EVM receipt and attempts to decode the GenLayer transaction ID from consensus logs.
- The app links both EVM and GenLayer transaction hashes when available.
- Final success is verified through contract reads and GenLayer transaction state, not by wallet submission alone.

No private keys are requested, stored, logged, or sent to the backend.

Known Bradbury gas defaults:

- `create_campaign`: `2,000,000`
- `submit_project`: `5,000,000`
- `run_review`: `7,000,000`

These values are user-adjustable in the UI before wallet signing.
