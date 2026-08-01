# ProofPilot V8 Release Checklist

V8 is a new Bradbury deployment candidate. It does not alter the historical V7 contract.

## What V8 fixes

- V7 could abort a review when an otherwise valid AI narrative item exceeded the stored-text limit (`review item`).
- V8 constrains the prompt and normalizes explanatory list text before storage.
- Rubric values, evidence facts, required fields, score totals, statuses, and validator equivalence checks remain strict.

## Required release steps

- [ ] Deploy `contracts/proofpilot.py` as a new Bradbury contract.
- [ ] Wait for the deployment to become **finalized** in GenExplorer.
- [ ] Verify the new contract can serve `list_campaigns(0, 1)` through the public RPC.
- [ ] Update `src/lib/deployment.ts` with only the finalized V8 address and deployment transaction.
- [ ] Push the deployment-address update and verify the public Vercel build serves it.
- [ ] Create a clean campaign and submit a valid project from a different wallet.
- [ ] Verify the public control flow, then run a review from the campaign-owner wallet.
- [ ] Record the finalized campaign, submission, report, contract, and transaction links before describing the app as submission-ready.

## Frontend release criteria

- Submission, campaign, workspace, report, and overview views update from contract reads automatically.
- A submitted project form clears only when the new on-chain submission record is readable.
- The interface never treats an EVM receipt alone as the final contract outcome.
- Public UI does not present an internal contract release label.
