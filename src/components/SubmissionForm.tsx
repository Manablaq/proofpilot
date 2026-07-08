"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deployment } from "@/lib/deployment";
import type { Campaign } from "@/lib/proofpilot-schema";
import { isHex, isUrl } from "@/lib/proofpilot-schema";
import { GlassCard } from "@/components/GlassCard";
import { TransactionStatus } from "@/components/TransactionStatus";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";

const fields = [
  ["campaign_id", "Target campaign", "text", true],
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

export function SubmissionForm({
  address,
  campaignId = deployment.campaignId,
  preserveCampaignId = false,
}: {
  address: string;
  campaignId?: string;
  preserveCampaignId?: boolean;
}) {
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

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
  const visibleErrors = useMemo(() => {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(errors)) {
      if (submitted || touched[key]) {
        next[key] = value;
      }
    }
    return next;
  }, [errors, submitted, touched]);

  function updateField(key: keyof SubmissionValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function touchField(key: keyof SubmissionValues) {
    setTouched((current) => ({ ...current, [key]: true }));
  }

  const handleCampaignChange = useCallback((value: string, markTouched = true) => {
    setValues((current) => ({ ...current, campaign_id: value }));
    if (markTouched) {
      setTouched((current) => ({ ...current, campaign_id: true }));
    }
  }, []);

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="border-b border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Web3 Project evidence</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Active on v6. The connected wallet becomes the builder address. Submitted URLs remain untrusted until reviewed by the contract.
        </p>
      </div>
      <div className="divide-y divide-white/10">
        <FormSection title="Target campaign" description="This is the campaign that will receive the submission.">
          <CampaignSelector
            value={values.campaign_id}
            preserveSelectedCampaign={preserveCampaignId}
            error={visibleErrors.campaign_id}
            onChange={handleCampaignChange}
          />
        </FormSection>

        <FormSection title="Project identity" description="Give reviewers enough context to understand the project before reading evidence.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="project_name" label="Project name" value={values.project_name} error={visibleErrors.project_name} onChange={(value) => updateField("project_name", value)} onBlur={() => touchField("project_name")} />
            <Field name="summary" label="Summary" value={values.summary} textarea error={visibleErrors.summary} onChange={(value) => updateField("summary", value)} onBlur={() => touchField("summary")} className="md:col-span-2" />
          </div>
        </FormSection>

        <FormSection title="Public evidence" description="Evidence fetched by ProofPilot is bounded, treated as untrusted, and scored conservatively on failures.">
          <div className="grid gap-4 md:grid-cols-3">
            <Field name="live_app_url" label="Live app URL" value={values.live_app_url} error={visibleErrors.live_app_url} onChange={(value) => updateField("live_app_url", value)} onBlur={() => touchField("live_app_url")} />
            <Field name="github_repo_url" label="GitHub repo URL" value={values.github_repo_url} error={visibleErrors.github_repo_url} onChange={(value) => updateField("github_repo_url", value)} onBlur={() => touchField("github_repo_url")} />
            <Field name="docs_url" label="Docs / README URL" value={values.docs_url} error={visibleErrors.docs_url} onChange={(value) => updateField("docs_url", value)} onBlur={() => touchField("docs_url")} />
          </div>
        </FormSection>

        <FormSection title="On-chain proof" description="The v6 contract requires Web3 deployment proof fields. Do not enter placeholders.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="contract_address" label="Contract address" value={values.contract_address} error={visibleErrors.contract_address} onChange={(value) => updateField("contract_address", value)} onBlur={() => touchField("contract_address")} />
            <Field name="deployment_tx_hash" label="Deployment tx hash" value={values.deployment_tx_hash} error={visibleErrors.deployment_tx_hash} onChange={(value) => updateField("deployment_tx_hash", value)} onBlur={() => touchField("deployment_tx_hash")} />
          </div>
        </FormSection>

        <FormSection title="Reviewer context" description="Optional context helps explain what changed or what should be checked.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="reviewer_feedback_text" label="Reviewer feedback" value={values.reviewer_feedback_text} textarea error={visibleErrors.reviewer_feedback_text} onChange={(value) => updateField("reviewer_feedback_text", value)} onBlur={() => touchField("reviewer_feedback_text")} />
            <Field name="fixes_explanation" label="Fixes explanation" value={values.fixes_explanation} textarea error={visibleErrors.fixes_explanation} onChange={(value) => updateField("fixes_explanation", value)} onBlur={() => touchField("fixes_explanation")} />
          </div>
        </FormSection>

        <FormSection title="Transaction settings" description="Editable signing configuration, separate from project evidence.">
          <details className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-100">
              Advanced transaction settings
            </summary>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Method</p>
                <p className="mt-2 font-mono text-sm text-slate-100">submit_project</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Network</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">Bradbury</p>
              </div>
              <label className="block rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Default gas</span>
                <input
                  value={gasLimit}
                  onChange={(event) => setGasLimit(event.target.value)}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-cyan-300"
                />
              </label>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Default chosen from previous successful Bradbury submit_project writes. Change only if a transaction fails.
            </p>
          </details>
        </FormSection>
      </div>
      <div className="border-t border-white/10 p-6 sm:p-8">
        {invalid ? (
          <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
            Complete the required Web3 evidence fields before preparing a wallet-signed transaction.
          </p>
        ) : null}
        {invalid ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Review required fields
          </button>
        ) : (
          <TransactionStatus
            address={address}
            method="submit_project"
            values={values}
            gasLimit={gasLimit}
            buttonLabel="Submit project"
          />
        )}
      </div>
    </GlassCard>
  );
}

function CampaignSelector({
  value,
  preserveSelectedCampaign,
  error,
  onChange,
}: {
  value: string;
  preserveSelectedCampaign: boolean;
  error?: string;
  onChange: (value: string, markTouched?: boolean) => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCampaigns() {
      try {
        const listRes = await fetch("/api/campaigns", { cache: "no-store" });
        const listJson = await listRes.json();
        if (!listRes.ok || !listJson.ok || !Array.isArray(listJson.data)) {
          throw new Error(listJson.error || "Campaigns unavailable");
        }

        const details = await Promise.all(
          listJson.data.map(async (campaignId: string) => {
            try {
              const detailRes = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}`, { cache: "no-store" });
              const detailJson = await detailRes.json();
              return detailRes.ok && detailJson.ok ? detailJson.data as Campaign : null;
            } catch {
              return null;
            }
          }),
        );

        if (!active) {
          return;
        }

        const loaded = details.filter((campaign): campaign is Campaign => Boolean(campaign));
        setCampaigns(loaded);
        setReadError("");
      } catch (error) {
        if (active) {
          setReadError(error instanceof Error ? error.message : "Campaigns unavailable");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCampaigns();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (preserveSelectedCampaign || !campaigns.length || campaigns.some((campaign) => campaign.campaign_id === value)) {
      return;
    }

    const firstActive = campaigns.find((campaign) => campaign.status === "ACTIVE") ?? campaigns[0];
    if (firstActive) {
      onChange(firstActive.campaign_id, false);
    }
  }, [campaigns, onChange, preserveSelectedCampaign, value]);

  const selected = campaigns.find((campaign) => campaign.campaign_id === value);
  const showManual = readError || !campaigns.length || !selected;

  return (
    <div className="space-y-4">
      {campaigns.length ? (
        <div>
          <label className="text-sm font-medium text-slate-200" htmlFor="target-campaign">
            Target campaign
          </label>
          <select
            id="target-campaign"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
          >
            {!campaigns.some((campaign) => campaign.campaign_id === value) ? <option value={value}>{value}</option> : null}
            {campaigns.map((campaign) => (
              <option key={campaign.campaign_id} value={campaign.campaign_id}>
                {campaign.title || campaign.campaign_id} ({campaign.campaign_id})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {selected ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Selected campaign</p>
              <h4 className="mt-2 truncate text-lg font-semibold text-white">{selected.title || selected.campaign_id}</h4>
              <p className="mt-1 font-mono text-xs text-slate-500">{selected.campaign_id}</p>
            </div>
            <StatusBadge tone={statusTone(selected.status)}>{selected.status}</StatusBadge>
          </div>
          {selected.description ? <p className="mt-3 text-sm leading-6 text-slate-400">{selected.description}</p> : null}
        </div>
      ) : null}

      {showManual ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Manual campaign ID</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-cyan-300"
          />
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {loading ? "Loading live campaigns..." : readError ? "Live campaign list is unavailable; enter a known campaign id." : "Use this when submitting to a campaign not returned by the public list yet."}
          </span>
        </label>
      ) : null}

      <p className="text-xs leading-5 text-slate-500">This is the campaign that will receive the submission.</p>
      {error ? <span className="block text-sm text-amber-200">{error}</span> : null}
    </div>
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
  onBlur,
  textarea = false,
  className = "",
}: {
  name: keyof SubmissionValues;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
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
          onBlur={onBlur}
          rows={4}
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
        />
      )}
      <span className="mt-1 block text-xs leading-5 text-slate-500">{helperText[name]}</span>
      {error ? <span className="mt-1 block text-sm text-amber-200">{error}</span> : null}
    </label>
  );
}
