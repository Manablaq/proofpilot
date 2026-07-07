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

export function SubmissionForm({ address, campaignId = deployment.campaignId }: { address: string; campaignId?: string }) {
  const [values, setValues] = useState({
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
    <GlassCard className="p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-white">Submit project evidence</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        The connected wallet becomes the builder address. Submitted URLs are evidence inputs and remain untrusted until reviewed by the contract.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {fields.map(([key, label, type]) => (
          <label key={key} className={type === "textarea" ? "block md:col-span-2" : "block"}>
            <span className="text-sm font-medium text-slate-200">{label}</span>
            {type === "textarea" ? (
              <textarea
                value={values[key]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              />
            ) : (
              <input
                value={values[key]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              />
            )}
            {errors[key] ? <span className="mt-1 block text-sm text-amber-200">{errors[key]}</span> : null}
          </label>
        ))}
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Gas limit</span>
          <input
            value={gasLimit}
            onChange={(event) => setGasLimit(event.target.value)}
            inputMode="numeric"
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
          />
          <span className="mt-1 block text-xs text-slate-500">Default is 5,000,000 for Bradbury submit_project.</span>
        </label>
      </div>
      <div className="mt-6">
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
