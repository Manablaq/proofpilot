# ProofPilot V9 Release Checklist

V9 is a clean Bradbury deployment candidate. It does not upgrade or alter historical deployments.

## What V9 fixes

- V8 allowed AI-generated point allocations to become consensus-critical, which caused an end-to-end review to become undetermined despite valid public evidence.
- V9 derives the authoritative score, recommendation, risk, and confidence from bounded observable facts.
- Validators independently fetch source evidence and reproduce that canonical decision using `gl.vm.run_nondet_unsafe`.
- AI output remains valuable as bounded findings, risks, and missing-evidence commentary, but it cannot affect consensus-critical fields or abort review if malformed.
- The public `/evidence` endpoint gives validators a compact, stable source for product identity and GenLayer integration signals.

## Required release steps

- [x] Deploy `contracts/proofpilot.py` as a new Bradbury contract using GenLayer Studio: [`0x5E32…8504`](https://explorer-bradbury.genlayer.com/address/0x5E327aC97d3462B8c7B4bb4c3C4BE75b954f8504).
- [x] Wait for the deployment to become **finalized** in GenExplorer: [`0xa316…073f`](https://explorer-bradbury.genlayer.com/tx/0xa3168dddac8b51aee73a129188ac987eecb123ed8c559b0ac294952452fe073f).
- [x] Verify `list_campaigns(0, 1)` through the public Bradbury RPC (returned `[]` on Aug 2, 2026).
- [x] Update `src/lib/deployment.ts` with only the finalized V9 address and deployment transaction.
- [ ] Push the address update and verify the public Vercel build serves it.
- [ ] Create an active campaign from the owner wallet.
- [ ] Submit the ProofPilot fixture from a different wallet using `https://proofpilot-two.vercel.app/evidence` as the live evidence URL.
- [ ] Run the review from the campaign-owner wallet and wait for a readable on-chain report.
- [ ] Record finalized campaign, submission, report, contract, and transaction links before portal submission.

## Release gate

Do not describe ProofPilot as submission-ready until the V9 report is accepted, finalized, and independently readable through the public RPC and the public frontend.
