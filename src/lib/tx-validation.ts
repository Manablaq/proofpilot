import { proofPilotMethods, type ProofPilotWriteMethod, isHex, isUrl } from "@/lib/proofpilot-schema";

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
