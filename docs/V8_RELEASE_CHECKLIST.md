# ProofPilot V8 Release Checklist

V8 is a new Bradbury deployment candidate. It does not alter the historical V7 contract.

## What V8 fixes

- V7 could abort a review when an otherwise valid AI narrative item exceeded the stored-text limit (`review item`).
- V8 constrains the prompt and normalizes explanatory list text before storage.
- Rubric values, evidence facts, required fields, score totals, statuses, and validator equivalence checks remain strict.

## Required release steps

- [x] Deploy `contracts/proofpilot.py` as a new Bradbury contract: [`0x35B5…B86e`](https://explorer-bradbury.genlayer.com/address/0x35B51C656609507203093B7D9976F1C856e6B86e).
- [x] Wait for the deployment to become **finalized** in GenExplorer: [`0x5205…6be5`](https://explorer-bradbury.genlayer.com/tx/0x5205519d400e5ba3359ecae4858a0396fc2fd465d4397af05e8956e6d3986be5).
- [x] Verify the new contract can serve `list_campaigns(0, 1)` through the public RPC (returned `[]` on Aug 2, 2026).
- [x] Update `src/lib/deployment.ts` with only the finalized V8 address and deployment transaction.
- [x] Push the deployment-address update and verify the public Vercel build serves it (the live site returned the V8 address on Aug 2, 2026).
- [ ] Create a clean campaign and submit a valid project from a different wallet.
- [ ] Verify the public control flow, then run a review from the campaign-owner wallet.
- [ ] Record the finalized campaign, submission, report, contract, and transaction links before describing the app as submission-ready.

## Frontend release criteria

- Submission, campaign, workspace, report, and overview views update from contract reads automatically.
- A submitted project form clears only when the new on-chain submission record is readable.
- The interface never treats an EVM receipt alone as the final contract outcome.
- Public UI does not present an internal contract release label.
