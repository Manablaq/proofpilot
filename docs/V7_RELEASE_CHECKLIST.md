# ProofPilot v7 Release and Submission Checklist

ProofPilot must not be described as submission-ready until every required item below is complete.

## Code verification

- Run `npm run check:contract`, `npm test`, `npm run typecheck`, and `npm run build`.
- Run the GenVM linter against `contracts/proofpilot.py` with the SDK/runtime that will be used for deployment.
- Review every test failure before deploying; the repository's architecture tests do not replace a Bradbury execution test.

## Bradbury deployment

- [x] Deploy the V7 source as a new contract without overwriting historical V6 evidence.
  - Contract: [`0x3764DB868fd18Bd2987eD19B85E15Bc487Df841b`](https://explorer-bradbury.genlayer.com/address/0x3764DB868fd18Bd2987eD19B85E15Bc487Df841b)
  - Deployment: [`0xe082ba35f334a4bfa648d3150d427639fcd10e3c8181c1dab5bd3341b374373a`](https://explorer-bradbury.genlayer.com/tx/0xe082ba35f334a4bfa648d3150d427639fcd10e3c8181c1dab5bd3341b374373a)
- [x] Wait for finalization and perform a post-deployment contract read. `list_campaigns(0, 1)` returned `[]`, confirming V7 is readable and starts with clean state.
- [x] Update local `src/lib/deployment.ts` and release documentation with the finalized V7 address and deployment transaction.
- [ ] Push this release and redeploy the public frontend so `proofpilot-two.vercel.app` serves the V7-configured build.

## End-to-end evidence fixture

Create a fresh campaign with a non-default rubric whose eight weights total 100. Submit a project controlled by a second wallet with:

1. a reachable live application;
2. a public GitHub repository and README;
3. a contract explorer URL that contains the submitted contract address; and
4. a deployment explorer URL that contains the submitted transaction hash.

Run the review as the campaign owner. Save the final transaction links and the stored evidence snapshot. Confirm that the custom rubric appears in the campaign state, that contract and transaction identifier checks are `SUCCESS`, and that the report contains the accepted leader result. Do not call these checks proof that the transaction deployed the submitted contract unless a reliable public Explorer field establishes that link.

## Honest submission language

ProofPilot verifies public resource reachability and whether submitted explorer pages contain the submitted identifiers. It does not establish legal identity, ownership, security, novelty, or universal quality. Human program owners remain responsible for final grant, bounty, or selection decisions.
