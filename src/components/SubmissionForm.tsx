"use client";

import { useMemo, useState } from "react";
import { deployment } from "@/lib/deployment";
import { isHex, isUrl } from "@/lib/proofpilot-schema";
import { GlassCard } from "@/components/GlassCard";
import { TransactionStatus } from "@/components/TransactionStatus";

const fields = [
  ["campaign_id", "Campaign ID", "text", true],
  ["project_name", "Project name", "text", true],
  ["summary", "Summary", "textarea", false],
  ["live_app_url", "Live app URL", "url", true],
  ["github_repo_url", "GitHub repo URL", "url", true],
  ["docs_url", "Docs URL", "url", true],
  ["contract_address", "Deployed contract address", "text", true],
  ["deployment_tx_hash", "Deployment transaction hash", "text", true],
  ["reviewer_feedback_text", "Reviewer feedback text", "textarea", false],
  ["fixes_explanation", "Explanation of fixes", "textarea", false],
] as const;

const helperText: Record<keyof SubmissionValues, string> = {
  campaign_id: "Campaign receiving this submission.",
  project_name: "Public project name shown in review records.",
  summary: "Short explanation of what was built and why it is ready for review.",
  live_app_url: "Public deployed frontend or demo.",
  github_repo_url: "Source repository used for review.",
  docs_url: "README, docs site, or public implementation notes.",
  contract_address: "Deployed contract being reviewed.",
  deployment_tx_hash: "Transaction proving deployment.",
  reviewer_feedback_text: "Prior reviewer comments or requested fixes.",
  fixes_explanation: "What changed since the last review or what this submission proves.",
};

type SubmissionValues = {
  campaign_id: string;
  project_name: string;
  summary: string;
  live_app_url: string;
  github_repo_url: string;
  docs_url: string;
  contract_address: string;
  deployment_tx_hash: string;
  reviewer_feedback_text: string;
  fixes_explanation: string;
};

export function SubmissionForm({ address, campaignId = deployment.campaignId }: { address: string; campaignId?: string }) {
  const [values, setValues] = useState<SubmissionValues>({
    campaign_id: campaignId,
    project_name: "",
    summary: "",
    live_app_url: "",
    github_repo_url: "",
    docs_url: "",
    contract_address: "",
    deployment_tx_hash: "",
    reviewer_feedback_text: "",
    fixes_explanation: "",
  });
  const [gasLimit, setGasLimit] = useState("5000000");

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    for (const [key,, type, required] of fields) {
      const value = values[key].trim();
      if (required && !value) {
        next[key] = "Required";
      } else if (value && type === "url" && !isUrl(value)) {
        next[key] = "Must be an http(s) URL";
      }
    }
    if (values.contract_address && !isHex(values.contract_address.trim(), 42)) {
      next.contract_address = "Must be a 0x contract address";
    }
    if (values.deployment_tx_hash && !isHex(values.deployment_tx_hash.trim(), 66)) {
      next.deployment_tx_hash = "Must be a 0x transaction hash";
    }
    return next;
  }, [values]);
  const invalid = Object.keys(errors).length > 0;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="border-b border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Web3 Project evidence</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Active on v6. The connected wallet becomes the builder address. Submitted URLs remain untrusted until reviewed by the contract.
        </p>
      </div>
      <div className="divide-y divide-white/10">
        <FormSection title="Campaign" description="Choose the campaign that will receive this submission.">
          <Field name="campaign_id" label="Campaign ID" value={values.campaign_id} error={errors.campaign_id} onChange={(value) => setValues((current) => ({ ...current, campaign_id: value }))} />
        </FormSection>

        <FormSection title="Project identity" description="Give reviewers enough context to understand the project before reading evidence.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="project_name" label="Project name" value={values.project_name} error={errors.project_name} onChange={(value) => setValues((current) => ({ ...current, project_name: value }))} />
            <Field name="summary" label="Summary" value={values.summary} textarea error={errors.summary} onChange={(value) => setValues((current) => ({ ...current, summary: value }))} className="md:col-span-2" />
          </div>
        </FormSection>

        <FormSection title="Public evidence" description="Evidence fetched by ProofPilot is bounded, treated as untrusted, and scored conservatively on failures.">
          <div className="grid gap-4 md:grid-cols-3">
            <Field name="live_app_url" label="Live app URL" value={values.live_app_url} error={errors.live_app_url} onChange={(value) => setValues((current) => ({ ...current, live_app_url: value }))} />
            <Field name="github_repo_url" label="GitHub repo URL" value={values.github_repo_url} error={errors.github_repo_url} onChange={(value) => setValues((current) => ({ ...current, github_repo_url: value }))} />
            <Field name="docs_url" label="Docs / README URL" value={values.docs_url} error={errors.docs_url} onChange={(value) => setValues((current) => ({ ...current, docs_url: value }))} />
          </div>
        </FormSection>

        <FormSection title="On-chain proof" description="The v6 contract requires Web3 deployment proof fields. Do not enter placeholders.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="contract_address" label="Contract address" value={values.contract_address} error={errors.contract_address} onChange={(value) => setValues((current) => ({ ...current, contract_address: value }))} />
            <Field name="deployment_tx_hash" label="Deployment tx hash" value={values.deployment_tx_hash} error={errors.deployment_tx_hash} onChange={(value) => setValues((current) => ({ ...current, deployment_tx_hash: value }))} />
          </div>
        </FormSection>

        <FormSection title="Reviewer context" description="Optional context helps explain what changed or what should be checked.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="reviewer_feedback_text" label="Reviewer feedback" value={values.reviewer_feedback_text} textarea error={errors.reviewer_feedback_text} onChange={(value) => setValues((current) => ({ ...current, reviewer_feedback_text: value }))} />
            <Field name="fixes_explanation" label="Fixes explanation" value={values.fixes_explanation} textarea error={errors.fixes_explanation} onChange={(value) => setValues((current) => ({ ...current, fixes_explanation: value }))} />
          </div>
        </FormSection>

        <FormSection title="Transaction settings" description="Bradbury submit_project has needed explicit gas in practice. You can adjust before signing.">
          <label className="block max-w-sm">
            <span className="text-sm font-medium text-slate-200">Gas limit</span>
            <input
              value={gasLimit}
              onChange={(event) => setGasLimit(event.target.value)}
              inputMode="numeric"
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
            />
            <span className="mt-1 block text-xs text-slate-500">Default is 5,000,000 for Bradbury submit_project.</span>
          </label>
        </FormSection>
      </div>
      <div className="border-t border-white/10 p-6 sm:p-8">
        <TransactionStatus
          address={address}
          method="submit_project"
          values={values}
          gasLimit={gasLimit}
          disabled={invalid}
          buttonLabel="Submit project"
        />
      </div>
    </GlassCard>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[240px_1fr]">
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  value,
  error,
  onChange,
  textarea = false,
  className = "",
}: {
  name: keyof SubmissionValues;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
        />
      )}
      <span className="mt-1 block text-xs leading-5 text-slate-500">{helperText[name]}</span>
      {error ? <span className="mt-1 block text-sm text-amber-200">{error}</span> : null}
    </label>
  );
}
