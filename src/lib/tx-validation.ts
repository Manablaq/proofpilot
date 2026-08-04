import { proofPilotMethods, type ProofPilotWriteMethod, isHex, isUrl, validateRubric } from "@/lib/proofpilot-schema";

export type PrepareInput = {
  method: ProofPilotWriteMethod;
  from: string;
  values: Record<string, string>;
  gasLimit?: string;
};

export type PreparedArgs = {
  method: ProofPilotWriteMethod;
  from: `0x${string}`;
  args: string[];
  gasLimit: bigint;
};

const defaultGas: Record<ProofPilotWriteMethod, bigint> = {
  create_campaign: BigInt(2_000_000),
  submit_project: BigInt(5_000_000),
  run_review: BigInt(7_000_000),
  request_recheck: BigInt(2_000_000),
  open_appeal: BigInt(2_000_000),
  resolve_appeal: BigInt(2_000_000),
  record_human_decision: BigInt(2_000_000),
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requireText(errors: Record<string, string>, values: Record<string, string>, key: string, max: number) {
  const value = clean(values[key]);
  if (!value) {
    errors[key] = "Required";
  } else if (value.length > max) {
    errors[key] = `Must be ${max} characters or less`;
  }
  return value;
}

function optionalText(errors: Record<string, string>, values: Record<string, string>, key: string, max: number) {
  const value = clean(values[key]);
  if (value.length > max) {
    errors[key] = `Must be ${max} characters or less`;
  }
  return value;
}

function jsonObject(errors: Record<string, string>, value: string, key: string) {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      errors[key] = "Must be a JSON object";
    }
  } catch {
    errors[key] = "Must be valid JSON";
  }
  return value;
}

function requireUrl(errors: Record<string, string>, values: Record<string, string>, key: string) {
  const value = requireText(errors, values, key, 500);
  if (value && !isUrl(value)) {
    errors[key] = "Must be an http(s) URL";
  }
  return value;
}

export function validatePrepareInput(input: unknown): { ok: true; data: PreparedArgs } | { ok: false; errors: Record<string, string> } {
  const raw = input && typeof input === "object" ? input as PrepareInput : null;
  const errors: Record<string, string> = {};

  if (!raw || !(raw.method in proofPilotMethods)) {
    return { ok: false, errors: { method: "Unsupported method" } };
  }

  const method = raw.method;
  const from = clean(raw.from);
  if (!isHex(from, 42)) {
    errors.from = "Connected wallet address is required";
  }

  const values = raw.values && typeof raw.values === "object" ? raw.values : {};
  let args: string[] = [];

  if (method === "create_campaign") {
    const customRubric = optionalText(errors, values, "custom_rubric_json", 6000) || "{}";
    const requirements = optionalText(errors, values, "submission_requirements_json", 6000) || "{}";
    const policy = optionalText(errors, values, "review_policy_json", 6000) || "{}";
    jsonObject(errors, customRubric, "custom_rubric_json");
    const rubricError = validateRubric(customRubric);
    if (rubricError) errors.custom_rubric_json = rubricError;
    jsonObject(errors, requirements, "submission_requirements_json");
    jsonObject(errors, policy, "review_policy_json");
    args = [
      requireText(errors, values, "title", 160),
      requireText(errors, values, "description", 4000),
      customRubric,
      requirements,
      policy,
      clean(values.status) || "ACTIVE",
    ];
    if (!["DRAFT", "ACTIVE"].includes(args[5])) {
      errors.status = "Must be DRAFT or ACTIVE";
    }
  }

  if (method === "submit_project") {
    args = [
      requireText(errors, values, "campaign_id", 80),
      requireText(errors, values, "project_name", 160),
      optionalText(errors, values, "summary", 2000),
      requireUrl(errors, values, "live_app_url"),
      requireUrl(errors, values, "github_repo_url"),
      requireUrl(errors, values, "docs_url"),
      requireText(errors, values, "contract_address", 128),
      requireText(errors, values, "deployment_tx_hash", 128),
      optionalText(errors, values, "reviewer_feedback_text", 3000),
      optionalText(errors, values, "fixes_explanation", 3000),
    ];
    if (args[6] && !isHex(args[6], 42)) {
      errors.contract_address = "Must be a 0x contract address";
    }
    if (args[7] && !isHex(args[7], 66)) {
      errors.deployment_tx_hash = "Must be a 0x transaction hash";
    }
  }

  if (method === "run_review") {
    args = [requireText(errors, values, "submission_id", 80)];
  }

  if (method === "request_recheck") {
    const liveApp = optionalText(errors, values, "updated_live_app_url", 500);
    const github = optionalText(errors, values, "updated_github_repo_url", 500);
    const docs = optionalText(errors, values, "updated_docs_url", 500);
    if (liveApp && !isUrl(liveApp)) errors.updated_live_app_url = "Must be an http(s) URL";
    if (github && !isUrl(github)) errors.updated_github_repo_url = "Must be an http(s) URL";
    if (docs && !isUrl(docs)) errors.updated_docs_url = "Must be an http(s) URL";
    const contractAddress = optionalText(errors, values, "updated_contract_address", 128);
    const deploymentTx = optionalText(errors, values, "updated_deployment_tx_hash", 128);
    if (contractAddress && !isHex(contractAddress, 42)) errors.updated_contract_address = "Must be a 0x contract address";
    if (deploymentTx && !isHex(deploymentTx, 66)) errors.updated_deployment_tx_hash = "Must be a 0x transaction hash";
    args = [
      requireText(errors, values, "submission_id", 80),
      requireText(errors, values, "fixes_explanation", 3000),
      liveApp,
      github,
      docs,
      contractAddress,
      deploymentTx,
    ];
  }

  if (method === "open_appeal") {
    const evidence = optionalText(errors, values, "new_evidence_json", 6000) || "{}";
    jsonObject(errors, evidence, "new_evidence_json");
    try {
      const parsed = JSON.parse(evidence) as { public_urls?: unknown; notes?: unknown };
      const permitted = new Set(["public_urls", "notes"]);
      if (Object.keys(parsed).some((key) => !permitted.has(key))) {
        errors.new_evidence_json = "Only public_urls and notes are allowed.";
      } else if (parsed.public_urls !== undefined && (!Array.isArray(parsed.public_urls) || parsed.public_urls.length > 5 || parsed.public_urls.some((url) => typeof url !== "string" || !url.startsWith("https://")))) {
        errors.new_evidence_json = "public_urls must contain at most five HTTPS URLs.";
      } else if (parsed.notes !== undefined && (typeof parsed.notes !== "string" || parsed.notes.length > 2000)) {
        errors.new_evidence_json = "notes must be text up to 2000 characters.";
      }
    } catch {
      // jsonObject already reports malformed input.
    }
    args = [
      requireText(errors, values, "submission_id", 80),
      requireText(errors, values, "report_id", 80),
      requireText(errors, values, "reason", 2000),
      evidence,
    ];
  }

  if (method === "resolve_appeal") {
    const resolution = requireText(errors, values, "resolution_status", 80);
    if (!["RECHECK_SCHEDULED", "ACCEPTED", "REJECTED", "CLOSED"].includes(resolution)) {
      errors.resolution_status = "Choose a supported appeal resolution.";
    }
    args = [
      requireText(errors, values, "appeal_id", 80),
      resolution,
      requireText(errors, values, "resolution_notes", 2000),
    ];
  }

  if (method === "record_human_decision") {
    const decision = requireText(errors, values, "decision_status", 80);
    if (!["APPROVED", "CHANGES_REQUESTED", "REJECTED", "OVERRIDDEN"].includes(decision)) {
      errors.decision_status = "Choose a final human decision.";
    }
    args = [
      requireText(errors, values, "submission_id", 80),
      requireText(errors, values, "report_id", 80),
      decision,
      optionalText(errors, values, "notes", 2000),
    ];
  }

  let gasLimit = defaultGas[method];
  const gasOverride = clean(raw.gasLimit);
  if (gasOverride) {
    try {
      gasLimit = BigInt(gasOverride);
      if (gasLimit < BigInt(200_000) || gasLimit > BigInt(20_000_000)) {
        errors.gasLimit = "Gas limit must be between 200000 and 20000000";
      }
    } catch {
      errors.gasLimit = "Gas limit must be a whole number";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { method, from: from as `0x${string}`, args, gasLimit } };
}
