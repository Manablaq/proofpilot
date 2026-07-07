"use client";

import { useState } from "react";
import type { Campaign, Submission } from "@/lib/proofpilot-schema";
import { GlassCard } from "@/components/GlassCard";
import { TransactionStatus } from "@/components/TransactionStatus";

export function RunReviewPanel({
  address,
  campaign,
  submission,
}: {
  address: string;
  campaign: Campaign | null;
  submission: Submission | null;
}) {
  const [gasLimit, setGasLimit] = useState("7000000");
  const isOwner = Boolean(address && campaign?.owner && address.toLowerCase() === campaign.owner.toLowerCase());
  const canReview = Boolean(submission && ["SUBMITTED", "RECHECK_REQUESTED"].includes(submission.status));

  return (
    <GlassCard className="p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-white">Run AI review</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        V6 runs leader-side AI review over compact evidence facts and validator-side deterministic consensus checks.
      </p>
      {!isOwner ? (
        <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
          Only the campaign owner can run review. Connect the owner wallet to enable this action.
        </p>
      ) : null}
      {!canReview ? (
        <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
          This submission is not currently reviewable. Current status: {submission?.status ?? "unknown"}.
        </p>
      ) : null}
      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-200">Gas limit</span>
        <input
          value={gasLimit}
          onChange={(event) => setGasLimit(event.target.value)}
          inputMode="numeric"
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
        />
        <span className="mt-1 block text-xs text-slate-500">Default is 7,000,000 for Bradbury run_review.</span>
      </label>
      <div className="mt-6">
        <TransactionStatus
          address={address}
          method="run_review"
          values={{ submission_id: submission?.submission_id ?? "" }}
          gasLimit={gasLimit}
          disabled={!isOwner || !canReview}
          buttonLabel="Run review"
        />
      </div>
    </GlassCard>
  );
}
