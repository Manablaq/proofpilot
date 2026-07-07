# State Machine

## Purpose

This document defines the ProofPilot protocol state machines for campaigns, submissions, appeals, and human decisions. State transitions must be explicit, authorized, and auditable.

## Campaign State Machine

States:

- `DRAFT`
- `ACTIVE`
- `PAUSED`
- `CLOSED`

### Allowed Transitions

| From | To | Trigger | Method | Actor |
| --- | --- | --- | --- | --- |
| none | `DRAFT` | Create draft campaign | `create_campaign` | Campaign owner |
| none | `ACTIVE` | Create active campaign | `create_campaign` | Campaign owner |
| `DRAFT` | `ACTIVE` | Publish campaign | future `update_campaign_status` | Campaign owner |
| `ACTIVE` | `PAUSED` | Temporarily suspend campaign | future `update_campaign_status` | Campaign owner |
| `PAUSED` | `ACTIVE` | Resume campaign | future `update_campaign_status` | Campaign owner |
| `DRAFT` | `CLOSED` | Cancel draft | future `update_campaign_status` | Campaign owner |
| `ACTIVE` | `CLOSED` | End campaign | future `update_campaign_status` | Campaign owner |
| `PAUSED` | `CLOSED` | End paused campaign | future `update_campaign_status` | Campaign owner |

Phase 2 exposes `create_campaign`; status updates are a future extension unless implemented in the contract.

### Forbidden Transitions

| From | To | Reason |
| --- | --- | --- |
| `CLOSED` | `ACTIVE` | Closed campaigns are final for normal operation. |
| `CLOSED` | `PAUSED` | A closed campaign cannot be paused. |
| `CLOSED` | `DRAFT` | Historical campaign state must not be reset. |
| `ACTIVE` | `DRAFT` | Published campaigns must not return to draft after accepting public state. |
| `PAUSED` | `DRAFT` | Paused campaigns have already been public. |

### Failure Behavior

Invalid status transitions must revert or return a structured error before storage changes. Submissions and reports already created under a campaign must remain readable when the campaign is paused or closed.

### Frontend Display Notes

`DRAFT` campaigns should be hidden from public campaign discovery unless the viewer is the owner. `ACTIVE` campaigns should show submit and review actions according to permissions. `PAUSED` campaigns should show a paused banner and disable new submissions. `CLOSED` campaigns should remain browsable but not actionable for normal submission flow.

## Submission State Machine

States:

- `SUBMITTED`
- `UNDER_REVIEW`
- `REVIEWED`
- `RECHECK_REQUESTED`
- `APPEALED`
- `CLOSED`

### Allowed Transitions

| From | To | Trigger | Method | Actor |
| --- | --- | --- | --- | --- |
| none | `SUBMITTED` | Submit project | `submit_project` | Builder |
| `SUBMITTED` | `UNDER_REVIEW` | Start review | `run_review` | Authorized caller by campaign policy |
| `RECHECK_REQUESTED` | `UNDER_REVIEW` | Start re-check review | `run_review` | Authorized caller by campaign policy |
| `APPEALED` | `UNDER_REVIEW` | Appeal-triggered re-check | `run_review` | Authorized caller by campaign policy |
| `UNDER_REVIEW` | `REVIEWED` | Valid report stored | `run_review` | Contract |
| `UNDER_REVIEW` | `SUBMITTED` | Review fails before first report | `run_review` failure handling | Contract |
| `UNDER_REVIEW` | `RECHECK_REQUESTED` | Re-check review fails after re-check request | `run_review` failure handling | Contract |
| `REVIEWED` | `RECHECK_REQUESTED` | Builder requests re-check | `request_recheck` | Builder or authorized reviewer |
| `REVIEWED` | `APPEALED` | Builder opens appeal | `open_appeal` | Builder |
| `RECHECK_REQUESTED` | `APPEALED` | Builder appeals latest report while re-check is pending | `open_appeal` | Builder |
| `APPEALED` | `RECHECK_REQUESTED` | Appeal accepted for re-check | future appeal resolution method | Campaign owner or authorized reviewer |
| any non-closed | `CLOSED` | Close submission | future close method | Campaign owner or authorized reviewer |

### Forbidden Transitions

| From | To | Reason |
| --- | --- | --- |
| `SUBMITTED` | `REVIEWED` without `UNDER_REVIEW` | Reports must be produced through review execution. |
| `UNDER_REVIEW` | `APPEALED` | Appeals require a report context and should not interrupt in-flight review. |
| `CLOSED` | any active state | Closed submissions are final for normal operation. |
| `REVIEWED` | `SUBMITTED` | Historical review completion must not be erased. |
| `RECHECK_REQUESTED` | `SUBMITTED` | Re-check state must preserve that a review history exists. |

### Failure Behavior

If web fetches fail but AI JSON validates, the submission can become `REVIEWED` with conservative scores. If AI JSON is malformed, score validation fails, or enum validation fails, no report is stored. The submission should return to the prior reviewable state.

### Frontend Display Notes

`SUBMITTED` should show "awaiting review". `UNDER_REVIEW` should show a non-final in-progress state and hide score placeholders. `REVIEWED` should show the latest report. `RECHECK_REQUESTED` should show pending re-check and prior report history. `APPEALED` should show appeal context. `CLOSED` should remain readable with actions disabled.

## Appeal State Machine

States:

- `OPEN`
- `RECHECK_SCHEDULED`
- `ACCEPTED`
- `REJECTED`
- `CLOSED`

### Allowed Transitions

| From | To | Trigger | Method | Actor |
| --- | --- | --- | --- | --- |
| none | `OPEN` | Open appeal | `open_appeal` | Builder |
| `OPEN` | `RECHECK_SCHEDULED` | Approve appeal for re-check | future appeal resolution method | Campaign owner or authorized reviewer |
| `OPEN` | `ACCEPTED` | Accept appeal without re-check | future appeal resolution method | Campaign owner or authorized reviewer |
| `OPEN` | `REJECTED` | Reject appeal | future appeal resolution method | Campaign owner or authorized reviewer |
| `RECHECK_SCHEDULED` | `ACCEPTED` | Re-check confirms appeal issue | future appeal resolution method | Campaign owner or authorized reviewer |
| `RECHECK_SCHEDULED` | `REJECTED` | Re-check does not support appeal | future appeal resolution method | Campaign owner or authorized reviewer |
| `OPEN` | `CLOSED` | Close without action | future appeal resolution method | Campaign owner or authorized reviewer |
| `ACCEPTED` | `CLOSED` | Archive resolved appeal | future appeal resolution method | Campaign owner or authorized reviewer |
| `REJECTED` | `CLOSED` | Archive resolved appeal | future appeal resolution method | Campaign owner or authorized reviewer |

### Forbidden Transitions

| From | To | Reason |
| --- | --- | --- |
| `CLOSED` | any other state | Closed appeal records must remain final. |
| `ACCEPTED` | `REJECTED` | Resolution reversal requires a new record or explicit override extension. |
| `REJECTED` | `ACCEPTED` | Resolution reversal requires a new record or explicit override extension. |
| `RECHECK_SCHEDULED` | `OPEN` | Re-check scheduling should not be erased. |

### Failure Behavior

Invalid appeal references must reject before storage. Appeal creation must not mutate the referenced report. If a re-check triggered by appeal fails, the appeal remains `RECHECK_SCHEDULED` until resolved by authorized human action.

### Frontend Display Notes

Open appeals should be visible on submission and report pages. Accepted or rejected appeals should show resolution notes. The frontend must not hide the original report even if an appeal is accepted.

## Human Decision State Machine

States:

- `PENDING`
- `APPROVED`
- `CHANGES_REQUESTED`
- `REJECTED`
- `OVERRIDDEN`

Human decisions are append-only records. A new decision can supersede a previous decision by referencing it in notes or future schema extensions, but prior decisions are not edited.

### Allowed Transitions

| From | To | Trigger | Method | Actor |
| --- | --- | --- | --- | --- |
| none | `PENDING` | Record pending decision | `record_human_decision` | Campaign owner or authorized reviewer |
| none | `APPROVED` | Approve submission | `record_human_decision` | Campaign owner or authorized reviewer |
| none | `CHANGES_REQUESTED` | Request changes | `record_human_decision` | Campaign owner or authorized reviewer |
| none | `REJECTED` | Reject submission | `record_human_decision` | Campaign owner or authorized reviewer |
| any prior decision | `OVERRIDDEN` | Record separate override decision | `record_human_decision` | Campaign owner |

### Forbidden Transitions

| From | To | Reason |
| --- | --- | --- |
| any stored decision | mutated same record | Human decisions are append-only. |
| AI report | human status mutation | Human decisions must not mutate AI reports. |
| unauthorized actor | any state | Only campaign owner or authorized reviewer may record decisions. |

### Failure Behavior

Unauthorized decision attempts must fail before storage. Decisions referencing missing submissions or reports must fail. Invalid decision status must fail. Existing AI report content must remain unchanged.

### Frontend Display Notes

Human decisions should be displayed as a separate panel from AI review results. If a human decision overrides practical outcome, the frontend must still display the original AI score, recommendation, and risks.
