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
3. The contract fetches evidence using GenLayer web access functions such as `gl.nondet.web.get` or `gl.nondet.web.render`.
4. Web access is executed through an equivalence principle flow such as `gl.eq_principle.strict_eq`.
5. The contract treats fetched content as untrusted evidence and evaluates it with prompt-injection defenses.
6. Validators produce a strict JSON review report.
7. The report is stored publicly and linked to the campaign, submission, and builder profile.
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
- Contract web access must use GenLayer web access functions such as `gl.nondet.web.get` or `gl.nondet.web.render`.
- Web access must be called through the equivalence principle flow, such as `gl.eq_principle.strict_eq`.
- Fetched web content must be treated as untrusted evidence.
- Review prompts must defend against prompt injection from fetched webpages, README files, docs, and app pages.
- Review output must be strict JSON.
- Fetch failures must be handled gracefully and scored conservatively.

## Bradbury Deployment

ProofPilot v1 is deployed on GenLayer Bradbury Testnet.

- Contract address: `0xEd6B2fa740D0e8130CB8b767E7084fC7257729e3`
- Deployment details: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Documentation Map

- [Product Spec](docs/PRODUCT_SPEC.md): product goals, users, workflows, data models, statuses, and launch scope.
- [Architecture](docs/ARCHITECTURE.md): system components, GenLayer contract responsibilities, evidence flow, storage model, and method design.
- [Testing](docs/TESTING.md): documentation-level test strategy for contract logic, review JSON, adversarial evidence, and integration behavior.
- [Review Strategy](docs/REVIEW_STRATEGY.md): rubric design, scoring guidance, prompt safety, consensus expectations, and appeal handling.

## Current Repository Status

This repository currently contains documentation and architecture planning only. Frontend implementation and contract implementation are intentionally out of scope for this phase.
