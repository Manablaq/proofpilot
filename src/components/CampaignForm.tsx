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
    <GlassCard className="p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-white">Create campaign</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Campaign creation is signed by your connected wallet. No private key is sent to ProofPilot.
      </p>
      <div className="mt-6 grid gap-4">
        {[
          ["title", "Campaign title", "text"],
          ["description", "Description", "textarea"],
        ].map(([key, label, type]) => (
          <label key={key} className="block">
            <span className="text-sm font-medium text-slate-200">{label}</span>
            {type === "textarea" ? (
              <textarea
                value={values[key as "description"]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              />
            ) : (
              <input
                value={values[key as "title"]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
              />
            )}
            {errors[key as keyof typeof errors] ? <span className="mt-1 block text-sm text-amber-200">{errors[key as keyof typeof errors]}</span> : null}
          </label>
        ))}

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
      <div className="mt-6">
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
