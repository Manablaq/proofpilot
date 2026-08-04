export const proofPilotMethods = {
  create_campaign: {
    type: "write",
    args: ["title", "description", "custom_rubric_json", "submission_requirements_json", "review_policy_json", "status"],
  },
  submit_project: {
    type: "write",
    args: [
      "campaign_id",
      "project_name",
      "summary",
      "live_app_url",
      "github_repo_url",
      "docs_url",
      "contract_address",
      "deployment_tx_hash",
      "reviewer_feedback_text",
      "fixes_explanation",
    ],
  },
  run_review: {
    type: "write",
    args: ["submission_id"],
  },
  request_recheck: {
    type: "write",
    args: ["submission_id", "fixes_explanation", "updated_live_app_url", "updated_github_repo_url", "updated_docs_url", "updated_contract_address", "updated_deployment_tx_hash"],
  },
  open_appeal: {
    type: "write",
    args: ["submission_id", "report_id", "reason", "new_evidence_json"],
  },
  resolve_appeal: {
    type: "write",
    args: ["appeal_id", "resolution_status", "resolution_notes"],
  },
  record_human_decision: {
    type: "write",
    args: ["submission_id", "report_id", "decision_status", "notes"],
  },
} as const;

export const rubricKeys = [
  "live_app_availability",
  "github_repository_availability",
  "readme_documentation_quality",
  "contract_address_consistency",
  "deployment_transaction_proof",
  "reviewer_feedback_addressed",
  "professional_presentation",
  "risk_broken_links_or_mismatch_checks",
] as const;

export type RubricKey = typeof rubricKeys[number];

export const defaultRubric: Record<RubricKey, number> = {
  live_app_availability: 15,
  github_repository_availability: 10,
  readme_documentation_quality: 15,
  contract_address_consistency: 20,
  deployment_transaction_proof: 15,
  reviewer_feedback_addressed: 15,
  professional_presentation: 5,
  risk_broken_links_or_mismatch_checks: 5,
};

export function validateRubric(value: string): string | null {
  if (!value.trim() || value.trim() === "{}") return null;
  try {
    const rubric = JSON.parse(value) as Record<string, unknown>;
    const keys = Object.keys(rubric).sort();
    if (keys.length !== rubricKeys.length || keys.some((key, index) => key !== [...rubricKeys].sort()[index])) {
      return "Use every supported rubric category exactly once.";
    }
    const total = rubricKeys.reduce((sum, key) => {
      const points = rubric[key];
      return sum + (typeof points === "number" && Number.isInteger(points) && points >= 0 && points <= 100 ? points : Number.NaN);
    }, 0);
    return total === 100 ? null : "Rubric points must be whole numbers totaling exactly 100.";
  } catch {
    return "Must be a valid rubric JSON object.";
  }
}

export type ProofPilotWriteMethod = keyof typeof proofPilotMethods;

export type ApiOk<T> = {
  ok: true;
  source: "genlayer";
  data: T;
};

export type ApiErr = {
  ok: false;
  error: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiOk<T> | ApiErr;

export type Campaign = {
  campaign_id: string;
  owner: string;
  title: string;
  description: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type Submission = {
  submission_id: string;
  campaign_id: string;
  builder: string;
  project_name: string;
  summary: string;
  live_app_url: string;
  github_repo_url: string;
  docs_url: string;
  contract_address: string;
  deployment_tx_hash: string;
  reviewer_feedback_text: string;
  fixes_explanation: string;
  status: string;
  latest_report_id: string;
  review_count: number;
  recheck_count: number;
  appeal_count: number;
  created_at?: string;
  updated_at?: string;
};

export type ReviewReport = {
  report_id: string;
  submission_id: string;
  campaign_id: string;
  builder: string;
  snapshot_id: string;
  rubric_version: string;
  scores_json: string;
  total_score: number;
  status: string;
  recommendation: string;
  risk_level: string;
  confidence: string;
  findings_json: string;
  risks_json: string;
  missing_evidence_json: string;
  fetch_failures_json: string;
  raw_review_json: string;
  created_at?: string;
};

export type EvidenceSnapshot = {
  snapshot_id: string;
  submission_id: string;
  campaign_id: string;
  builder: string;
  source_urls_json: string;
  fetch_results_json: string;
  live_app_evidence: string;
  github_evidence: string;
  docs_evidence: string;
  contract_address_evidence: string;
  deployment_tx_evidence: string;
  feedback_evidence: string;
  warnings_json: string;
  created_at?: string;
};

export type BuilderProfile = {
  builder: string;
  display_name: string;
  submission_count: number;
  review_count: number;
  approved_count: number;
  average_score: number;
  latest_report_ids_json: string;
  campaign_history_json: string;
  appeal_count: number;
  recheck_count: number;
  updated_at?: string;
};

export type Appeal = {
  appeal_id: string;
  submission_id: string;
  campaign_id: string;
  builder: string;
  report_id: string;
  reason: string;
  new_evidence_json: string;
  status: string;
  resolution_notes: string;
  resolved_by: string;
  created_at?: string;
  resolved_at?: string;
};

export type HumanDecision = {
  human_decision_id: string;
  submission_id: string;
  campaign_id: string;
  report_id: string;
  reviewer: string;
  decision_status: string;
  notes: string;
  created_at?: string;
};

export type ReportDecisionRecord = {
  report: ReviewReport;
  appeals: Appeal[];
  human_decisions: HumanDecision[];
};

export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function isHex(value: string, length?: number) {
  return /^0x[0-9a-fA-F]+$/.test(value) && (!length || value.length === length);
}

export function isUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function shortHash(value: string) {
  if (!value.startsWith("0x") || value.length < 18) {
    return value;
  }
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}
