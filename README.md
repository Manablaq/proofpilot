# ProofPilot

AI consensus review for the builder economy.

ProofPilot uses GenLayer Intelligent Contracts to verify live project evidence, score submissions against transparent rubrics, and publish on-chain review reports for builders, grants, hackathons, and bounty programs.

## What ProofPilot Does

ProofPilot is a GenLayer-native review engine for programs that need credible, repeatable evaluation of builder work. A builder submits evidence for a project, including a live app URL, GitHub repository, documentation, deployed contract address, deployment transaction hash, reviewer feedback, and an explanation of fixes. A GenLayer Intelligent Contract then fetches evidence through GenLayer web access, evaluates the submission against a campaign rubric, and stores a public review report.

The goal is not to replace human program owners. The goal is to give them an auditable AI consensus layer that can check live evidence, apply transparent criteria, explain scoring, and produce consistent recommendations before a final approval, grant release, bounty acceptance, or hackathon judging decision.

## Target Use Cases

- Grant milestone reviews
- Hackathon submission screening
- Bounty completion verification
- Ecosystem app quality reviews
- Builder reputation and proof-of-work history
- Optional human review workflows backed by AI consensus reports

## MVP-Plus Scope

ProofPilot is designed as a flagship GenLayer application, not a minimal demo. The documented system includes:

- Campaigns with configurable rubrics and eligibility rules
- Builder submissions with structured evidence fields
- Evidence snapshots captured through GenLayer web access
- AI consensus review reports with strict JSON output
- Builder reputation profiles derived from review history
- Re-check and appeal flows for corrected submissions
- Optional human reviewer decision layer

## Core Workflow

1. A program owner creates a campaign with a rubric and review settings.
2. A builder submits project evidence.
3. The contract fetches compact evidence facts using GenLayer web access, currently `gl.nondet.web.get`.
4. Leader-side AI review scores the compact facts while prompt-injection defenses treat fetched content as untrusted.
5. Validator-side deterministic consensus checks independently verify compact facts, score rules, failed evidence representation, and report structure.
6. The strict JSON review report is stored publicly and linked to the campaign, submission, and builder profile.
7. Unsupported or unfetched evidence, such as metadata-only contract and transaction proof in v6, is scored conservatively.
8. The builder may request a re-check or appeal if fixes are made or evidence changes.
9. A human reviewer may optionally record a final decision.

## Rubric V1

ProofPilot's initial rubric totals 100 points:

| Category | Points |
| --- | ---: |
| Live app availability | 15 |
| GitHub repository availability | 10 |
| README/documentation quality | 15 |
| Contract address consistency | 20 |
| Deployment transaction proof | 15 |
| Reviewer feedback addressed | 15 |
| Professional presentation | 5 |
| Risk, broken links, or mismatch checks | 5 |

Review statuses:

- `READY_FOR_REVIEW`
- `NEEDS_MINOR_FIXES`
- `NEEDS_MAJOR_FIXES`
- `NOT_READY`

Recommendations:

- `APPROVE_FOR_HUMAN_REVIEW`
- `REQUEST_MINOR_CHANGES`
- `REQUEST_MAJOR_CHANGES`
- `REJECT_OR_RESUBMIT`

## GenLayer Design Constraints

ProofPilot documentation assumes these GenLayer-specific constraints:

- Raw URLs must not be placed into LLM prompts with the expectation that validators will browse them.
- Contract web access must use GenLayer web access functions. The live v6 review path uses `gl.nondet.web.get` and does not use `gl.nondet.web.render`.
- The live v6 review path uses leader-side AI review with validator-side deterministic consensus checks through `gl.vm.run_nondet_unsafe`.
- Fetched web content must be treated as untrusted evidence.
- Review prompts must defend against prompt injection from fetched webpages, README files, docs, and app pages.
- Review output must be strict JSON.
- Fetch failures must be handled gracefully and scored conservatively.

## Bradbury Deployment

ProofPilot v6 is deployed on GenLayer Bradbury Testnet.

- Contract address: `0xC11b90c7c2C1C9F7E99ef767c80a7AD7Bc3F6f87`
- Live app: https://proofpilot-two.vercel.app
- Live smoke test: passed
- First AI review report: `report_1` stored for `submission_1` with total score `61`
- Deployment details: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Public dApp Usage

ProofPilot now includes a public browser dApp for Bradbury:

- `/app`: product workspace overview.
- `/app/campaigns`: list campaigns and open campaign detail pages.
- `/app/campaigns/new`: create a campaign with wallet signing.
- `/app/campaigns/campaign_1`: inspect the live campaign and its submissions/reports.
- `/app/submit`: submit project evidence as a builder.
- `/app/submissions/submission_1`: inspect the reviewed live submission and owner-only review actions when eligible.
- `/app/reports/report_1`: inspect the first stored review report and evidence snapshot.
- `/app/builders`: inspect builder reputation profiles.
- Legacy routes such as `/dashboard`, `/campaigns`, `/reports`, and `/builders` redirect into the `/app` shell.

Users sign write transactions with an EIP-1193 browser wallet, such as MetaMask-compatible wallets. ProofPilot never asks for private keys, never stores private keys, and does not sign transactions on the backend.

## Wallet Transaction Flow

For write actions, the app:

1. Validates form input in the browser and again on the server preparation route.
2. Calls `POST /api/tx/prepare` to encode GenLayer consensus calldata for the requested contract method.
3. Sends the prepared calldata to the Bradbury consensus contract through the connected browser wallet.
4. Lets the user approve or reject the transaction in their wallet.
5. Waits for the EVM receipt and attempts to extract the GenLayer transaction ID from consensus logs.
6. Links the EVM transaction and GenLayer transaction to Bradbury Explorer when available.
7. Uses read APIs to verify final contract state. The UI does not claim contract success from wallet submission alone.

Known Bradbury gas behavior:

- `submit_project` defaults to a `5,000,000` gas limit override.
- `run_review` defaults to a `7,000,000` gas limit override.
- Users can adjust gas limits before signing if Bradbury behavior changes.

To verify reports manually, read `get_report("report_1")`, `get_submission("submission_1")`, and `get_evidence_snapshot("snapshot_1")` from the deployed contract or open the report page in the dApp.

## Documentation Map

- [Product Spec](docs/PRODUCT_SPEC.md): product goals, users, workflows, data models, statuses, and launch scope.
- [Architecture](docs/ARCHITECTURE.md): system components, GenLayer contract responsibilities, evidence flow, storage model, and method design.
- [Testing](docs/TESTING.md): documentation-level test strategy for contract logic, review JSON, adversarial evidence, and integration behavior.
- [Review Strategy](docs/REVIEW_STRATEGY.md): rubric design, scoring guidance, prompt safety, consensus expectations, and appeal handling.

## Current Repository Status

This repository contains the deployed ProofPilot contract source, protocol documentation, and a read-only frontend preview for the Bradbury deployment.
