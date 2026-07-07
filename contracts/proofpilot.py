# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import asdict, dataclass
import json


CAMPAIGN_DRAFT = "DRAFT"
CAMPAIGN_ACTIVE = "ACTIVE"
CAMPAIGN_PAUSED = "PAUSED"
CAMPAIGN_CLOSED = "CLOSED"
CAMPAIGN_STATUSES = [CAMPAIGN_DRAFT, CAMPAIGN_ACTIVE, CAMPAIGN_PAUSED, CAMPAIGN_CLOSED]

SUBMISSION_SUBMITTED = "SUBMITTED"
SUBMISSION_UNDER_REVIEW = "UNDER_REVIEW"
SUBMISSION_REVIEWED = "REVIEWED"
SUBMISSION_RECHECK_REQUESTED = "RECHECK_REQUESTED"
SUBMISSION_APPEALED = "APPEALED"
SUBMISSION_CLOSED = "CLOSED"
SUBMISSION_STATUSES = [
    SUBMISSION_SUBMITTED,
    SUBMISSION_UNDER_REVIEW,
    SUBMISSION_REVIEWED,
    SUBMISSION_RECHECK_REQUESTED,
    SUBMISSION_APPEALED,
    SUBMISSION_CLOSED,
]

REVIEW_READY_FOR_REVIEW = "READY_FOR_REVIEW"
REVIEW_NEEDS_MINOR_FIXES = "NEEDS_MINOR_FIXES"
REVIEW_NEEDS_MAJOR_FIXES = "NEEDS_MAJOR_FIXES"
REVIEW_NOT_READY = "NOT_READY"
REVIEW_STATUSES = [
    REVIEW_READY_FOR_REVIEW,
    REVIEW_NEEDS_MINOR_FIXES,
    REVIEW_NEEDS_MAJOR_FIXES,
    REVIEW_NOT_READY,
]

REC_APPROVE_FOR_HUMAN_REVIEW = "APPROVE_FOR_HUMAN_REVIEW"
REC_REQUEST_MINOR_CHANGES = "REQUEST_MINOR_CHANGES"
REC_REQUEST_MAJOR_CHANGES = "REQUEST_MAJOR_CHANGES"
REC_REJECT_OR_RESUBMIT = "REJECT_OR_RESUBMIT"
RECOMMENDATIONS = [
    REC_APPROVE_FOR_HUMAN_REVIEW,
    REC_REQUEST_MINOR_CHANGES,
    REC_REQUEST_MAJOR_CHANGES,
    REC_REJECT_OR_RESUBMIT,
]

RISK_LOW = "LOW"
RISK_MEDIUM = "MEDIUM"
RISK_HIGH = "HIGH"
RISK_CRITICAL = "CRITICAL"
RISK_LEVELS = [RISK_LOW, RISK_MEDIUM, RISK_HIGH, RISK_CRITICAL]

CONFIDENCE_LOW = "LOW"
CONFIDENCE_MEDIUM = "MEDIUM"
CONFIDENCE_HIGH = "HIGH"
CONFIDENCE_LEVELS = [CONFIDENCE_LOW, CONFIDENCE_MEDIUM, CONFIDENCE_HIGH]

HUMAN_PENDING = "PENDING"
HUMAN_APPROVED = "APPROVED"
HUMAN_CHANGES_REQUESTED = "CHANGES_REQUESTED"
HUMAN_REJECTED = "REJECTED"
HUMAN_OVERRIDDEN = "OVERRIDDEN"
HUMAN_DECISION_STATUSES = [
    HUMAN_PENDING,
    HUMAN_APPROVED,
    HUMAN_CHANGES_REQUESTED,
    HUMAN_REJECTED,
    HUMAN_OVERRIDDEN,
]

APPEAL_OPEN = "OPEN"
APPEAL_RECHECK_SCHEDULED = "RECHECK_SCHEDULED"
APPEAL_ACCEPTED = "ACCEPTED"
APPEAL_REJECTED = "REJECTED"
APPEAL_CLOSED = "CLOSED"
APPEAL_STATUSES = [
    APPEAL_OPEN,
    APPEAL_RECHECK_SCHEDULED,
    APPEAL_ACCEPTED,
    APPEAL_REJECTED,
    APPEAL_CLOSED,
]

FETCH_SUCCESS = "SUCCESS"
FETCH_FAILED = "FAILED"
FETCH_SKIPPED_MISSING_INPUT = "SKIPPED_MISSING_INPUT"
FETCH_TRUNCATED = "TRUNCATED"
FETCH_UNSUPPORTED_URL = "UNSUPPORTED_URL"
FETCH_STATUSES = [
    FETCH_SUCCESS,
    FETCH_FAILED,
    FETCH_SKIPPED_MISSING_INPUT,
    FETCH_TRUNCATED,
    FETCH_UNSUPPORTED_URL,
]

RUBRIC_VERSION_V1 = "rubric_v1"
RUBRIC_MAXIMA = {
    "live_app_availability": 15,
    "github_repository_availability": 10,
    "readme_documentation_quality": 15,
    "contract_address_consistency": 20,
    "deployment_transaction_proof": 15,
    "reviewer_feedback_addressed": 15,
    "professional_presentation": 5,
    "risk_broken_links_or_mismatch_checks": 5,
}

MAX_TITLE_LEN = 160
MAX_DESCRIPTION_LEN = 4000
MAX_PROJECT_NAME_LEN = 160
MAX_SUMMARY_LEN = 2000
MAX_URL_LEN = 500
MAX_ADDRESS_LEN = 128
MAX_TX_HASH_LEN = 128
MAX_FEEDBACK_LEN = 3000
MAX_FIXES_LEN = 3000
MAX_APPEAL_REASON_LEN = 2000
MAX_HUMAN_NOTES_LEN = 2000
MAX_JSON_FIELD_LEN = 6000
MAX_LATEST_REPORT_IDS = 20
DEFAULT_PAGE_LIMIT = 50
MAX_PAGE_LIMIT = 100

# Bradbury explorer URLs for contract v1 evidence checks.
GENLAYER_EXPLORER_CONTRACT_BASE_URL = "https://explorer-bradbury.genlayer.com/address/"
GENLAYER_EXPLORER_TX_BASE_URL = "https://explorer-bradbury.genlayer.com/tx/"

DEFAULT_SUBMISSION_REQUIREMENTS = {
    "live_app_url": True,
    "github_repo_url": True,
    "docs_url": True,
    "contract_address": True,
    "deployment_tx_hash": True,
}

DEFAULT_REVIEW_POLICY = {
    "review_trigger": "campaign_owner",
    "max_rechecks": 2,
    "max_appeals": 1,
    "human_decisions_enabled": True,
}

RUN_REVIEW_PHASE_5B_ERROR = (
    "run_review web/AI path will be implemented in Phase 5B after GenLayer syntax verification"
)


@allow_storage
@dataclass
class Campaign:
    campaign_id: str
    owner: str
    title: str
    description: str
    rubric_version: str
    custom_rubric_json: str
    submission_requirements_json: str
    review_policy_json: str
    status: str
    created_at: str
    updated_at: str


@allow_storage
@dataclass
class Submission:
    submission_id: str
    campaign_id: str
    builder: str
    project_name: str
    summary: str
    live_app_url: str
    github_repo_url: str
    docs_url: str
    contract_address: str
    deployment_tx_hash: str
    reviewer_feedback_text: str
    fixes_explanation: str
    status: str
    latest_report_id: str
    review_count: int
    recheck_count: int
    appeal_count: int
    created_at: str
    updated_at: str


@allow_storage
@dataclass
class EvidenceSnapshot:
    snapshot_id: str
    submission_id: str
    campaign_id: str
    builder: str
    source_urls_json: str
    fetch_results_json: str
    live_app_evidence: str
    github_evidence: str
    docs_evidence: str
    contract_address_evidence: str
    deployment_tx_evidence: str
    feedback_evidence: str
    warnings_json: str
    created_at: str


@allow_storage
@dataclass
class ReviewReport:
    report_id: str
    submission_id: str
    campaign_id: str
    builder: str
    snapshot_id: str
    rubric_version: str
    scores_json: str
    total_score: int
    status: str
    recommendation: str
    risk_level: str
    confidence: str
    findings_json: str
    risks_json: str
    missing_evidence_json: str
    fetch_failures_json: str
    raw_review_json: str
    human_decision_id: str
    created_at: str


@allow_storage
@dataclass
class BuilderProfile:
    builder: str
    display_name: str
    submission_count: int
    review_count: int
    approved_count: int
    average_score: int
    latest_report_ids_json: str
    campaign_history_json: str
    appeal_count: int
    recheck_count: int
    updated_at: str


@allow_storage
@dataclass
class Appeal:
    appeal_id: str
    submission_id: str
    campaign_id: str
    builder: str
    report_id: str
    reason: str
    new_evidence_json: str
    status: str
    resolution_notes: str
    created_at: str
    resolved_at: str


@allow_storage
@dataclass
class HumanDecision:
    human_decision_id: str
    submission_id: str
    campaign_id: str
    report_id: str
    reviewer: str
    decision_status: str
    notes: str
    created_at: str


class ProofPilot(gl.Contract):
    campaigns: TreeMap[str, str]
    submissions: TreeMap[str, str]
    evidence_snapshots: TreeMap[str, str]
    reports: TreeMap[str, str]
    builder_profiles: TreeMap[str, str]
    appeals: TreeMap[str, str]
    human_decisions: TreeMap[str, str]
    latest_report_by_submission: TreeMap[str, str]
    submission_ids_by_campaign: TreeMap[str, str]
    submission_ids_by_builder: TreeMap[str, str]
    report_ids_by_submission: TreeMap[str, str]
    report_ids_by_campaign: TreeMap[str, str]
    appeal_ids_by_submission: TreeMap[str, str]
    human_decision_ids_by_submission: TreeMap[str, str]
    campaign_ids: DynArray[str]
    submission_ids: DynArray[str]
    report_ids: DynArray[str]
    snapshot_ids: DynArray[str]
    appeal_ids: DynArray[str]
    human_decision_ids: DynArray[str]
    campaign_counter: str
    submission_counter: str
    snapshot_counter: str
    report_counter: str
    appeal_counter: str
    human_decision_counter: str

    def __init__(self) -> None:
        self.campaign_counter = "0"
        self.submission_counter = "0"
        self.snapshot_counter = "0"
        self.report_counter = "0"
        self.appeal_counter = "0"
        self.human_decision_counter = "0"

    # Serialization helpers

    def _to_json(self, value) -> str:
        return json.dumps(value, sort_keys=True)

    def _from_json(self, raw: str) -> dict:
        return json.loads(raw)

    def _dataclass_to_json(self, instance) -> str:
        return json.dumps(asdict(instance), sort_keys=True)

    def _campaign_from_json(self, raw: str) -> Campaign:
        d = json.loads(raw)
        return Campaign(
            campaign_id=str(d["campaign_id"]),
            owner=str(d["owner"]),
            title=str(d["title"]),
            description=str(d.get("description", "")),
            rubric_version=str(d.get("rubric_version", RUBRIC_VERSION_V1)),
            custom_rubric_json=str(d.get("custom_rubric_json", "{}")),
            submission_requirements_json=str(d.get("submission_requirements_json", "{}")),
            review_policy_json=str(d.get("review_policy_json", "{}")),
            status=str(d["status"]),
            created_at=str(d.get("created_at", "0")),
            updated_at=str(d.get("updated_at", "0")),
        )

    def _submission_from_json(self, raw: str) -> Submission:
        d = json.loads(raw)
        return Submission(
            submission_id=str(d["submission_id"]),
            campaign_id=str(d["campaign_id"]),
            builder=str(d["builder"]),
            project_name=str(d["project_name"]),
            summary=str(d.get("summary", "")),
            live_app_url=str(d.get("live_app_url", "")),
            github_repo_url=str(d.get("github_repo_url", "")),
            docs_url=str(d.get("docs_url", "")),
            contract_address=str(d.get("contract_address", "")),
            deployment_tx_hash=str(d.get("deployment_tx_hash", "")),
            reviewer_feedback_text=str(d.get("reviewer_feedback_text", "")),
            fixes_explanation=str(d.get("fixes_explanation", "")),
            status=str(d["status"]),
            latest_report_id=str(d.get("latest_report_id", "")),
            review_count=int(d.get("review_count", 0)),
            recheck_count=int(d.get("recheck_count", 0)),
            appeal_count=int(d.get("appeal_count", 0)),
            created_at=str(d.get("created_at", "0")),
            updated_at=str(d.get("updated_at", "0")),
        )

    def _snapshot_from_json(self, raw: str) -> EvidenceSnapshot:
        d = json.loads(raw)
        return EvidenceSnapshot(
            snapshot_id=str(d["snapshot_id"]),
            submission_id=str(d["submission_id"]),
            campaign_id=str(d["campaign_id"]),
            builder=str(d["builder"]),
            source_urls_json=str(d.get("source_urls_json", "{}")),
            fetch_results_json=str(d.get("fetch_results_json", "{}")),
            live_app_evidence=str(d.get("live_app_evidence", "")),
            github_evidence=str(d.get("github_evidence", "")),
            docs_evidence=str(d.get("docs_evidence", "")),
            contract_address_evidence=str(d.get("contract_address_evidence", "")),
            deployment_tx_evidence=str(d.get("deployment_tx_evidence", "")),
            feedback_evidence=str(d.get("feedback_evidence", "")),
            warnings_json=str(d.get("warnings_json", "[]")),
            created_at=str(d.get("created_at", "0")),
        )

    def _report_from_json(self, raw: str) -> ReviewReport:
        d = json.loads(raw)
        return ReviewReport(
            report_id=str(d["report_id"]),
            submission_id=str(d["submission_id"]),
            campaign_id=str(d["campaign_id"]),
            builder=str(d["builder"]),
            snapshot_id=str(d["snapshot_id"]),
            rubric_version=str(d.get("rubric_version", RUBRIC_VERSION_V1)),
            scores_json=str(d.get("scores_json", "{}")),
            total_score=int(d.get("total_score", 0)),
            status=str(d["status"]),
            recommendation=str(d["recommendation"]),
            risk_level=str(d["risk_level"]),
            confidence=str(d["confidence"]),
            findings_json=str(d.get("findings_json", "[]")),
            risks_json=str(d.get("risks_json", "[]")),
            missing_evidence_json=str(d.get("missing_evidence_json", "[]")),
            fetch_failures_json=str(d.get("fetch_failures_json", "[]")),
            raw_review_json=str(d.get("raw_review_json", "{}")),
            human_decision_id=str(d.get("human_decision_id", "")),
            created_at=str(d.get("created_at", "0")),
        )

    def _profile_from_json(self, raw: str) -> BuilderProfile:
        d = json.loads(raw)
        return BuilderProfile(
            builder=str(d["builder"]),
            display_name=str(d.get("display_name", "")),
            submission_count=int(d.get("submission_count", 0)),
            review_count=int(d.get("review_count", 0)),
            approved_count=int(d.get("approved_count", 0)),
            average_score=int(d.get("average_score", 0)),
            latest_report_ids_json=str(d.get("latest_report_ids_json", "[]")),
            campaign_history_json=str(d.get("campaign_history_json", "[]")),
            appeal_count=int(d.get("appeal_count", 0)),
            recheck_count=int(d.get("recheck_count", 0)),
            updated_at=str(d.get("updated_at", "0")),
        )

    def _appeal_from_json(self, raw: str) -> Appeal:
        d = json.loads(raw)
        return Appeal(
            appeal_id=str(d["appeal_id"]),
            submission_id=str(d["submission_id"]),
            campaign_id=str(d["campaign_id"]),
            builder=str(d["builder"]),
            report_id=str(d["report_id"]),
            reason=str(d["reason"]),
            new_evidence_json=str(d.get("new_evidence_json", "{}")),
            status=str(d.get("status", APPEAL_OPEN)),
            resolution_notes=str(d.get("resolution_notes", "")),
            created_at=str(d.get("created_at", "0")),
            resolved_at=str(d.get("resolved_at", "")),
        )

    def _human_decision_from_json(self, raw: str) -> HumanDecision:
        d = json.loads(raw)
        return HumanDecision(
            human_decision_id=str(d["human_decision_id"]),
            submission_id=str(d["submission_id"]),
            campaign_id=str(d["campaign_id"]),
            report_id=str(d["report_id"]),
            reviewer=str(d["reviewer"]),
            decision_status=str(d["decision_status"]),
            notes=str(d.get("notes", "")),
            created_at=str(d.get("created_at", "0")),
        )

    def _json_array_append(self, raw: str, value: str, max_items: int = 0) -> str:
        arr = json.loads(raw) if raw else []
        if value not in arr:
            arr.append(value)
        if max_items > 0 and len(arr) > max_items:
            arr = arr[-max_items:]
        return json.dumps(arr, sort_keys=True)

    def _json_array_paginate(self, raw: str, offset: int, limit: int) -> str:
        self._validate_pagination(offset, limit)
        arr = json.loads(raw) if raw else []
        return json.dumps(arr[offset:offset + limit], sort_keys=True)

    # Validation helpers

    def _require_non_empty(self, value: str, field: str) -> None:
        if not value or not value.strip():
            raise Exception(field + " is required")

    def _require_max_len(self, value: str, max_len: int, field: str) -> None:
        if len(value) > max_len:
            raise Exception(field + " exceeds max length")

    def _validate_json_object(self, raw: str, field: str) -> str:
        text = raw if raw and raw.strip() else "{}"
        self._require_max_len(text, MAX_JSON_FIELD_LEN, field)
        try:
            parsed = json.loads(text)
        except Exception:
            raise Exception(field + " must be valid JSON")
        if not isinstance(parsed, dict):
            raise Exception(field + " must be a JSON object")
        return json.dumps(parsed, sort_keys=True)

    def _validate_json_array(self, raw: str, field: str) -> str:
        text = raw if raw and raw.strip() else "[]"
        self._require_max_len(text, MAX_JSON_FIELD_LEN, field)
        try:
            parsed = json.loads(text)
        except Exception:
            raise Exception(field + " must be valid JSON")
        if not isinstance(parsed, list):
            raise Exception(field + " must be a JSON array")
        return json.dumps(parsed, sort_keys=True)

    def _validate_enum(self, value: str, allowed: list, field: str) -> None:
        if value not in allowed:
            raise Exception(field + " has unsupported value")

    def _validate_campaign_status(self, status: str) -> None:
        self._validate_enum(status, CAMPAIGN_STATUSES, "campaign status")

    def _validate_submission_status(self, status: str) -> None:
        self._validate_enum(status, SUBMISSION_STATUSES, "submission status")

    def _validate_review_status(self, status: str) -> None:
        self._validate_enum(status, REVIEW_STATUSES, "review status")

    def _validate_recommendation(self, recommendation: str) -> None:
        self._validate_enum(recommendation, RECOMMENDATIONS, "recommendation")

    def _validate_risk_level(self, risk_level: str) -> None:
        self._validate_enum(risk_level, RISK_LEVELS, "risk level")

    def _validate_confidence(self, confidence: str) -> None:
        self._validate_enum(confidence, CONFIDENCE_LEVELS, "confidence")

    def _validate_human_decision_status(self, status: str) -> None:
        self._validate_enum(status, HUMAN_DECISION_STATUSES, "human decision status")

    def _validate_appeal_status(self, status: str) -> None:
        self._validate_enum(status, APPEAL_STATUSES, "appeal status")

    def _validate_basic_url(self, value: str, field: str, required: bool) -> None:
        if not value:
            if required:
                raise Exception(field + " is required")
            return
        self._require_max_len(value, MAX_URL_LEN, field)
        lowered = value.lower()
        if not (lowered.startswith("https://") or lowered.startswith("http://")):
            raise Exception(field + " must start with http:// or https://")
        if " " in value:
            raise Exception(field + " must not contain spaces")

    def _validate_contract_address(self, value: str, required: bool) -> None:
        if not value:
            if required:
                raise Exception("contract_address is required")
            return
        self._require_max_len(value, MAX_ADDRESS_LEN, "contract_address")
        if " " in value:
            raise Exception("contract_address must not contain spaces")

    def _validate_tx_hash(self, value: str, required: bool) -> None:
        if not value:
            if required:
                raise Exception("deployment_tx_hash is required")
            return
        self._require_max_len(value, MAX_TX_HASH_LEN, "deployment_tx_hash")
        if " " in value:
            raise Exception("deployment_tx_hash must not contain spaces")

    def _validate_pagination(self, offset: int, limit: int) -> None:
        if offset < 0:
            raise Exception("offset must be non-negative")
        if limit <= 0:
            raise Exception("limit must be positive")
        if limit > MAX_PAGE_LIMIT:
            raise Exception("limit exceeds maximum")

    def _validate_review_policy(self, raw_policy_json: str) -> str:
        policy_json = self._validate_json_object(raw_policy_json, "review_policy_json")
        policy = json.loads(policy_json)
        if "max_rechecks" in policy and int(policy["max_rechecks"]) < 0:
            raise Exception("max_rechecks must be non-negative")
        if "max_appeals" in policy and int(policy["max_appeals"]) < 0:
            raise Exception("max_appeals must be non-negative")
        return json.dumps(policy, sort_keys=True)

    def _validate_submission_requirements(self, campaign: Campaign, fields: dict) -> None:
        requirements = json.loads(campaign.submission_requirements_json)
        self._validate_basic_url(
            str(fields.get("live_app_url", "")),
            "live_app_url",
            bool(requirements.get("live_app_url", False)),
        )
        self._validate_basic_url(
            str(fields.get("github_repo_url", "")),
            "github_repo_url",
            bool(requirements.get("github_repo_url", False)),
        )
        self._validate_basic_url(
            str(fields.get("docs_url", "")),
            "docs_url",
            bool(requirements.get("docs_url", False)),
        )
        self._validate_contract_address(
            str(fields.get("contract_address", "")),
            bool(requirements.get("contract_address", False)),
        )
        self._validate_tx_hash(
            str(fields.get("deployment_tx_hash", "")),
            bool(requirements.get("deployment_tx_hash", False)),
        )

    # ID and profile helpers

    def _next_campaign_id(self) -> str:
        n = int(self.campaign_counter) + 1
        self.campaign_counter = str(n)
        return "campaign_" + str(n)

    def _next_submission_id(self) -> str:
        n = int(self.submission_counter) + 1
        self.submission_counter = str(n)
        return "submission_" + str(n)

    def _next_snapshot_id(self) -> str:
        n = int(self.snapshot_counter) + 1
        self.snapshot_counter = str(n)
        return "snapshot_" + str(n)

    def _next_report_id(self) -> str:
        n = int(self.report_counter) + 1
        self.report_counter = str(n)
        return "report_" + str(n)

    def _next_appeal_id(self) -> str:
        n = int(self.appeal_counter) + 1
        self.appeal_counter = str(n)
        return "appeal_" + str(n)

    def _next_human_decision_id(self) -> str:
        n = int(self.human_decision_counter) + 1
        self.human_decision_counter = str(n)
        return "human_decision_" + str(n)

    def _sequence_time(self) -> str:
        total = (
            int(self.campaign_counter)
            + int(self.submission_counter)
            + int(self.snapshot_counter)
            + int(self.report_counter)
            + int(self.appeal_counter)
            + int(self.human_decision_counter)
        )
        return str(total)

    def _get_or_create_builder_profile(self, builder: str) -> BuilderProfile:
        raw = self.builder_profiles.get(builder, None)
        if raw is not None:
            return self._profile_from_json(raw)
        return BuilderProfile(
            builder=builder,
            display_name="",
            submission_count=0,
            review_count=0,
            approved_count=0,
            average_score=0,
            latest_report_ids_json="[]",
            campaign_history_json="[]",
            appeal_count=0,
            recheck_count=0,
            updated_at=self._sequence_time(),
        )

    def _save_builder_profile(self, profile: BuilderProfile) -> None:
        self.builder_profiles[profile.builder] = self._dataclass_to_json(profile)

    def _add_campaign_to_profile(self, profile: BuilderProfile, campaign_id: str) -> BuilderProfile:
        profile.campaign_history_json = self._json_array_append(
            profile.campaign_history_json,
            campaign_id,
        )
        profile.updated_at = self._sequence_time()
        return profile

    def _get_campaign_or_fail(self, campaign_id: str) -> Campaign:
        raw = self.campaigns.get(campaign_id, None)
        if raw is None:
            raise Exception("Campaign not found")
        return self._campaign_from_json(raw)

    def _get_submission_or_fail(self, submission_id: str) -> Submission:
        raw = self.submissions.get(submission_id, None)
        if raw is None:
            raise Exception("Submission not found")
        return self._submission_from_json(raw)

    def _get_report_or_fail(self, report_id: str) -> ReviewReport:
        raw = self.reports.get(report_id, None)
        if raw is None:
            raise Exception("Report not found")
        return self._report_from_json(raw)

    def _policy_int(self, campaign: Campaign, key: str, default_value: int) -> int:
        try:
            policy = json.loads(campaign.review_policy_json)
            if key in policy:
                return int(policy[key])
        except Exception:
            return default_value
        return default_value

    # Write methods

    @gl.public.write
    def create_campaign(
        self,
        title: str,
        description: str,
        custom_rubric_json: str = "{}",
        submission_requirements_json: str = "{}",
        review_policy_json: str = "{}",
        status: str = CAMPAIGN_ACTIVE,
    ) -> str:
        caller = str(gl.message.sender_address)
        self._require_non_empty(title, "title")
        self._require_max_len(title, MAX_TITLE_LEN, "title")
        self._require_max_len(description, MAX_DESCRIPTION_LEN, "description")
        self._validate_campaign_status(status)
        custom_rubric_json = self._validate_json_object(custom_rubric_json, "custom_rubric_json")

        requirements = (
            json.dumps(DEFAULT_SUBMISSION_REQUIREMENTS, sort_keys=True)
            if not submission_requirements_json or submission_requirements_json.strip() == "{}"
            else self._validate_json_object(submission_requirements_json, "submission_requirements_json")
        )
        policy = (
            json.dumps(DEFAULT_REVIEW_POLICY, sort_keys=True)
            if not review_policy_json or review_policy_json.strip() == "{}"
            else self._validate_review_policy(review_policy_json)
        )

        campaign_id = self._next_campaign_id()
        timestamp = self._sequence_time()
        campaign = Campaign(
            campaign_id=campaign_id,
            owner=caller,
            title=title,
            description=description,
            rubric_version=RUBRIC_VERSION_V1,
            custom_rubric_json=custom_rubric_json,
            submission_requirements_json=requirements,
            review_policy_json=policy,
            status=status,
            created_at=timestamp,
            updated_at=timestamp,
        )
        self.campaigns[campaign_id] = self._dataclass_to_json(campaign)
        self.campaign_ids.append(campaign_id)
        self.submission_ids_by_campaign[campaign_id] = "[]"
        self.report_ids_by_campaign[campaign_id] = "[]"
        return campaign_id

    @gl.public.write
    def submit_project(
        self,
        campaign_id: str,
        project_name: str,
        summary: str,
        live_app_url: str,
        github_repo_url: str,
        docs_url: str,
        contract_address: str,
        deployment_tx_hash: str,
        reviewer_feedback_text: str = "",
        fixes_explanation: str = "",
    ) -> str:
        caller = str(gl.message.sender_address)
        campaign = self._get_campaign_or_fail(campaign_id)
        if campaign.status != CAMPAIGN_ACTIVE:
            raise Exception("Campaign is not active")
        self._require_non_empty(project_name, "project_name")
        self._require_max_len(project_name, MAX_PROJECT_NAME_LEN, "project_name")
        self._require_max_len(summary, MAX_SUMMARY_LEN, "summary")
        self._require_max_len(reviewer_feedback_text, MAX_FEEDBACK_LEN, "reviewer_feedback_text")
        self._require_max_len(fixes_explanation, MAX_FIXES_LEN, "fixes_explanation")
        self._validate_submission_requirements(campaign, {
            "live_app_url": live_app_url,
            "github_repo_url": github_repo_url,
            "docs_url": docs_url,
            "contract_address": contract_address,
            "deployment_tx_hash": deployment_tx_hash,
        })

        submission_id = self._next_submission_id()
        timestamp = self._sequence_time()
        submission = Submission(
            submission_id=submission_id,
            campaign_id=campaign_id,
            builder=caller,
            project_name=project_name,
            summary=summary,
            live_app_url=live_app_url,
            github_repo_url=github_repo_url,
            docs_url=docs_url,
            contract_address=contract_address,
            deployment_tx_hash=deployment_tx_hash,
            reviewer_feedback_text=reviewer_feedback_text,
            fixes_explanation=fixes_explanation,
            status=SUBMISSION_SUBMITTED,
            latest_report_id="",
            review_count=0,
            recheck_count=0,
            appeal_count=0,
            created_at=timestamp,
            updated_at=timestamp,
        )
        self.submissions[submission_id] = self._dataclass_to_json(submission)
        self.submission_ids.append(submission_id)
        self.submission_ids_by_campaign[campaign_id] = self._json_array_append(
            self.submission_ids_by_campaign.get(campaign_id, "[]"),
            submission_id,
        )
        self.submission_ids_by_builder[caller] = self._json_array_append(
            self.submission_ids_by_builder.get(caller, "[]"),
            submission_id,
        )
        self.report_ids_by_submission[submission_id] = "[]"
        self.appeal_ids_by_submission[submission_id] = "[]"
        self.human_decision_ids_by_submission[submission_id] = "[]"

        profile = self._get_or_create_builder_profile(caller)
        profile.submission_count += 1
        profile = self._add_campaign_to_profile(profile, campaign_id)
        self._save_builder_profile(profile)
        return submission_id

    @gl.public.write
    def run_review(self, submission_id: str) -> str:
        self._get_submission_or_fail(submission_id)
        raise Exception(RUN_REVIEW_PHASE_5B_ERROR)

    @gl.public.write
    def request_recheck(
        self,
        submission_id: str,
        fixes_explanation: str,
        updated_live_app_url: str = "",
        updated_github_repo_url: str = "",
        updated_docs_url: str = "",
        updated_contract_address: str = "",
        updated_deployment_tx_hash: str = "",
    ) -> str:
        caller = str(gl.message.sender_address)
        submission = self._get_submission_or_fail(submission_id)
        campaign = self._get_campaign_or_fail(submission.campaign_id)
        if caller != submission.builder and caller != campaign.owner:
            raise Exception("Only the builder or campaign owner can request re-check")
        if submission.status == SUBMISSION_CLOSED:
            raise Exception("Submission is closed")
        max_rechecks = self._policy_int(campaign, "max_rechecks", 2)
        if submission.recheck_count >= max_rechecks:
            raise Exception("Re-check limit exceeded")
        self._require_non_empty(fixes_explanation, "fixes_explanation")
        self._require_max_len(fixes_explanation, MAX_FIXES_LEN, "fixes_explanation")

        next_live_app_url = updated_live_app_url if updated_live_app_url else submission.live_app_url
        next_github_repo_url = updated_github_repo_url if updated_github_repo_url else submission.github_repo_url
        next_docs_url = updated_docs_url if updated_docs_url else submission.docs_url
        next_contract_address = updated_contract_address if updated_contract_address else submission.contract_address
        next_deployment_tx_hash = updated_deployment_tx_hash if updated_deployment_tx_hash else submission.deployment_tx_hash

        self._validate_submission_requirements(campaign, {
            "live_app_url": next_live_app_url,
            "github_repo_url": next_github_repo_url,
            "docs_url": next_docs_url,
            "contract_address": next_contract_address,
            "deployment_tx_hash": next_deployment_tx_hash,
        })

        submission.live_app_url = next_live_app_url
        submission.github_repo_url = next_github_repo_url
        submission.docs_url = next_docs_url
        submission.contract_address = next_contract_address
        submission.deployment_tx_hash = next_deployment_tx_hash
        submission.fixes_explanation = fixes_explanation
        submission.recheck_count += 1
        submission.status = SUBMISSION_RECHECK_REQUESTED
        submission.updated_at = self._sequence_time()
        self.submissions[submission_id] = self._dataclass_to_json(submission)

        profile = self._get_or_create_builder_profile(submission.builder)
        profile.recheck_count += 1
        profile.updated_at = self._sequence_time()
        self._save_builder_profile(profile)
        return submission_id

    @gl.public.write
    def open_appeal(
        self,
        submission_id: str,
        report_id: str,
        reason: str,
        new_evidence_json: str = "{}",
    ) -> str:
        caller = str(gl.message.sender_address)
        submission = self._get_submission_or_fail(submission_id)
        campaign = self._get_campaign_or_fail(submission.campaign_id)
        report = self._get_report_or_fail(report_id)
        if report.submission_id != submission_id:
            raise Exception("Report does not belong to submission")
        if caller != submission.builder:
            raise Exception("Only the builder can open an appeal")
        max_appeals = self._policy_int(campaign, "max_appeals", 1)
        if submission.appeal_count >= max_appeals:
            raise Exception("Appeal limit exceeded")
        self._require_non_empty(reason, "reason")
        self._require_max_len(reason, MAX_APPEAL_REASON_LEN, "reason")
        new_evidence_json = self._validate_json_object(new_evidence_json, "new_evidence_json")

        appeal_id = self._next_appeal_id()
        timestamp = self._sequence_time()
        appeal = Appeal(
            appeal_id=appeal_id,
            submission_id=submission_id,
            campaign_id=submission.campaign_id,
            builder=submission.builder,
            report_id=report_id,
            reason=reason,
            new_evidence_json=new_evidence_json,
            status=APPEAL_OPEN,
            resolution_notes="",
            created_at=timestamp,
            resolved_at="",
        )
        self.appeals[appeal_id] = self._dataclass_to_json(appeal)
        self.appeal_ids.append(appeal_id)
        self.appeal_ids_by_submission[submission_id] = self._json_array_append(
            self.appeal_ids_by_submission.get(submission_id, "[]"),
            appeal_id,
        )

        submission.appeal_count += 1
        submission.status = SUBMISSION_APPEALED
        submission.updated_at = timestamp
        self.submissions[submission_id] = self._dataclass_to_json(submission)

        profile = self._get_or_create_builder_profile(submission.builder)
        profile.appeal_count += 1
        profile.updated_at = self._sequence_time()
        self._save_builder_profile(profile)
        return appeal_id

    @gl.public.write
    def record_human_decision(
        self,
        submission_id: str,
        report_id: str,
        decision_status: str,
        notes: str = "",
    ) -> str:
        caller = str(gl.message.sender_address)
        submission = self._get_submission_or_fail(submission_id)
        campaign = self._get_campaign_or_fail(submission.campaign_id)
        report = self._get_report_or_fail(report_id)
        if report.submission_id != submission_id:
            raise Exception("Report does not belong to submission")
        if caller != campaign.owner:
            raise Exception("Only the campaign owner can record human decisions")
        self._validate_human_decision_status(decision_status)
        self._require_max_len(notes, MAX_HUMAN_NOTES_LEN, "notes")

        human_decision_id = self._next_human_decision_id()
        decision = HumanDecision(
            human_decision_id=human_decision_id,
            submission_id=submission_id,
            campaign_id=submission.campaign_id,
            report_id=report_id,
            reviewer=caller,
            decision_status=decision_status,
            notes=notes,
            created_at=self._sequence_time(),
        )
        self.human_decisions[human_decision_id] = self._dataclass_to_json(decision)
        self.human_decision_ids.append(human_decision_id)
        self.human_decision_ids_by_submission[submission_id] = self._json_array_append(
            self.human_decision_ids_by_submission.get(submission_id, "[]"),
            human_decision_id,
        )
        return human_decision_id

    # Read methods

    @gl.public.view
    def get_campaign(self, campaign_id: str) -> str:
        raw = self.campaigns.get(campaign_id, None)
        return raw if raw is not None else json.dumps({"error": "Campaign not found"}, sort_keys=True)

    @gl.public.view
    def get_submission(self, submission_id: str) -> str:
        raw = self.submissions.get(submission_id, None)
        return raw if raw is not None else json.dumps({"error": "Submission not found"}, sort_keys=True)

    @gl.public.view
    def get_evidence_snapshot(self, snapshot_id: str) -> str:
        raw = self.evidence_snapshots.get(snapshot_id, None)
        return raw if raw is not None else json.dumps({"error": "Evidence snapshot not found"}, sort_keys=True)

    @gl.public.view
    def get_report(self, report_id: str) -> str:
        raw = self.reports.get(report_id, None)
        return raw if raw is not None else json.dumps({"error": "Report not found"}, sort_keys=True)

    @gl.public.view
    def get_latest_report(self, submission_id: str) -> str:
        raw_submission = self.submissions.get(submission_id, None)
        if raw_submission is None:
            return json.dumps({"error": "Submission not found"}, sort_keys=True)
        report_id = self.latest_report_by_submission.get(submission_id, "")
        if not report_id:
            return json.dumps({"error": "No report yet"}, sort_keys=True)
        return self.get_report(report_id)

    @gl.public.view
    def get_builder_profile(self, builder: str) -> str:
        raw = self.builder_profiles.get(builder, None)
        if raw is not None:
            return raw
        profile = BuilderProfile(
            builder=builder,
            display_name="",
            submission_count=0,
            review_count=0,
            approved_count=0,
            average_score=0,
            latest_report_ids_json="[]",
            campaign_history_json="[]",
            appeal_count=0,
            recheck_count=0,
            updated_at="0",
        )
        return self._dataclass_to_json(profile)

    @gl.public.view
    def get_appeal(self, appeal_id: str) -> str:
        raw = self.appeals.get(appeal_id, None)
        return raw if raw is not None else json.dumps({"error": "Appeal not found"}, sort_keys=True)

    @gl.public.view
    def list_campaigns(self, offset: int = 0, limit: int = DEFAULT_PAGE_LIMIT) -> str:
        self._validate_pagination(offset, limit)
        result = []
        for campaign_id in self.campaign_ids:
            result.append(campaign_id)
        return json.dumps(result[offset:offset + limit], sort_keys=True)

    @gl.public.view
    def list_submissions(
        self,
        campaign_id: str = "",
        builder: str = "",
        offset: int = 0,
        limit: int = DEFAULT_PAGE_LIMIT,
    ) -> str:
        self._validate_pagination(offset, limit)
        if campaign_id:
            return self._json_array_paginate(
                self.submission_ids_by_campaign.get(campaign_id, "[]"),
                offset,
                limit,
            )
        if builder:
            return self._json_array_paginate(
                self.submission_ids_by_builder.get(builder, "[]"),
                offset,
                limit,
            )
        result = []
        for submission_id in self.submission_ids:
            result.append(submission_id)
        return json.dumps(result[offset:offset + limit], sort_keys=True)

    @gl.public.view
    def list_reports(
        self,
        campaign_id: str = "",
        submission_id: str = "",
        offset: int = 0,
        limit: int = DEFAULT_PAGE_LIMIT,
    ) -> str:
        self._validate_pagination(offset, limit)
        if submission_id:
            return self._json_array_paginate(
                self.report_ids_by_submission.get(submission_id, "[]"),
                offset,
                limit,
            )
        if campaign_id:
            return self._json_array_paginate(
                self.report_ids_by_campaign.get(campaign_id, "[]"),
                offset,
                limit,
            )
        result = []
        for report_id in self.report_ids:
            result.append(report_id)
        return json.dumps(result[offset:offset + limit], sort_keys=True)
