"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { TransactionStatus } from "@/components/TransactionStatus";

export function CampaignForm({ address }: { address: string }) {
  const [values, setValues] = useState({
    title: "",
    description: "",
    custom_rubric_json: "{}",
    submission_requirements_json: "{}",
    review_policy_json: "{}",
    status: "ACTIVE",
  });
  const [gasLimit, setGasLimit] = useState("2000000");

  const errors = useMemo(() => ({
    title: values.title.trim() ? "" : "Title is required.",
    description: values.description.trim() ? "" : "Description is required.",
  }), [values.title, values.description]);
  const invalid = Object.values(errors).some(Boolean);

  return (
    <GlassCard className="p-0">
      <div className="border-b border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Create campaign</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Campaign creation is signed by your connected wallet. No private key is sent to ProofPilot.
        </p>
      </div>
      <div className="grid gap-0 divide-y divide-white/10">
        <FormSection title="A. Campaign identity" description="Name the program and explain what builders are submitting for review.">
          <div className="grid gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-200">Campaign title</span>
              <input
                value={values.title}
                onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              />
              {errors.title ? <span className="mt-1 block text-sm text-amber-200">{errors.title}</span> : null}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-200">Description</span>
              <textarea
                value={values.description}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              />
              {errors.description ? <span className="mt-1 block text-sm text-amber-200">{errors.description}</span> : null}
            </label>
          </div>
        </FormSection>

        <FormSection title="B. Review rubric" description="Optional JSON object for custom rubric metadata. Leave empty object for rubric_v1 defaults.">
          <JsonArea value={values.custom_rubric_json} onChange={(value) => setValues((current) => ({ ...current, custom_rubric_json: value }))} />
        </FormSection>

        <FormSection title="C. Submission requirements" description="Optional JSON object controlling required evidence fields.">
          <JsonArea value={values.submission_requirements_json} onChange={(value) => setValues((current) => ({ ...current, submission_requirements_json: value }))} />
        </FormSection>

        <FormSection title="D. Review policy" description="Optional JSON object for limits such as max rechecks and max appeals.">
          <JsonArea value={values.review_policy_json} onChange={(value) => setValues((current) => ({ ...current, review_policy_json: value }))} />
        </FormSection>

        <FormSection title="E. Transaction settings" description="Choose initial status and review gas before wallet signing.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-200">Initial status</span>
              <select
                value={values.status}
                onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-200">Gas limit</span>
              <input
                value={gasLimit}
                onChange={(event) => setGasLimit(event.target.value)}
                inputMode="numeric"
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              />
            </label>
          </div>
        </FormSection>
      </div>
      <div className="border-t border-white/10 p-6 sm:p-8">
        <TransactionStatus
          address={address}
          method="create_campaign"
          values={values}
          gasLimit={gasLimit}
          disabled={invalid}
          buttonLabel="Create campaign"
        />
      </div>
    </GlassCard>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[260px_1fr]">
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function JsonArea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={5}
      spellCheck={false}
      className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-cyan-300"
    />
  );
}
