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
} as const;

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
