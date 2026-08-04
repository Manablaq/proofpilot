"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Appeal, Campaign, ReportDecisionRecord, Submission } from "@/lib/proofpilot-schema";
import { TransactionStatus } from "@/components/TransactionStatus";
import { SectionCard } from "@/components/app/SectionCard";

export function ReviewGovernancePanel({ address, campaign, submission }: {
  address: string;
  campaign: Campaign | null;
  submission: Submission;
}) {
  const [record, setRecord] = useState<ReportDecisionRecord | null>(null);
  const [error, setError] = useState("");
  const [fixes, setFixes] = useState("");
  const [appealReason, setAppealReason] = useState("");
  const [appealEvidence, setAppealEvidence] = useState("{}");
  const [humanStatus, setHumanStatus] = useState("APPROVED");
  const [humanNotes, setHumanNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [resolutionStatus, setResolutionStatus] = useState<Record<string, string>>({});

  const reportId = submission.latest_report_id;
  const isBuilder = Boolean(address && address.toLowerCase() === submission.builder.toLowerCase());
  const isOwner = Boolean(address && campaign?.owner && address.toLowerCase() === campaign.owner.toLowerCase());

  const load = useCallback(async () => {
    if (!reportId) {
      setRecord(null);
      return;
    }
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/decisions`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Decision record unavailable");
      setRecord(json.data as ReportDecisionRecord);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision record unavailable");
    }
  }, [reportId]);

  useEffect(() => { load().catch(() => undefined); }, [load]);

  if (!reportId) return null;

  return (
    <SectionCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Governance workflow</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Re-check, appeal, and human decision</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Every action creates a new on-chain record. It never edits the existing report or its evidence snapshot.</p>
        </div>
        <button type="button" onClick={() => load().catch(() => undefined)} className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Refresh</button>
      </div>
      {error ? <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p> : null}

      {isBuilder ? (
        <div className="mt-6 space-y-5">
          <ActionBlock title="Request a re-check" description="Use after correcting the declared project evidence. A new review produces a new report; the prior report remains available.">
            <textarea value={fixes} onChange={(event) => setFixes(event.target.value)} maxLength={3000} placeholder="Describe the specific evidence correction or implementation change." className="min-h-24 w-full rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <div className="mt-3"><TransactionStatus address={address} method="request_recheck" values={{ submission_id: submission.submission_id, fixes_explanation: fixes, updated_live_app_url: "", updated_github_repo_url: "", updated_docs_url: "", updated_contract_address: "", updated_deployment_tx_hash: "" }} buttonLabel="Request re-check" onConfirmed={() => load().catch(() => undefined)} /></div>
          </ActionBlock>
          <ActionBlock title="Open an appeal" description="Appeal the report with a concise reason and optional public HTTPS evidence. Private data and arbitrary instructions are not accepted.">
            <textarea value={appealReason} onChange={(event) => setAppealReason(event.target.value)} maxLength={2000} placeholder="Explain the specific report finding you are disputing." className="min-h-24 w-full rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <textarea value={appealEvidence} onChange={(event) => setAppealEvidence(event.target.value)} maxLength={6000} aria-label="Optional public appeal evidence JSON" className="mt-3 min-h-20 w-full rounded-lg border border-white/10 bg-slate-950/70 p-3 font-mono text-xs text-white outline-none focus:border-cyan-300" />
            <p className="mt-2 text-xs text-slate-500">Optional format: {`{"public_urls":["https://…"],"notes":"…"}`}</p>
            <div className="mt-3"><TransactionStatus address={address} method="open_appeal" values={{ submission_id: submission.submission_id, report_id: reportId, reason: appealReason, new_evidence_json: appealEvidence }} buttonLabel="Open appeal" onConfirmed={() => load().catch(() => undefined)} /></div>
          </ActionBlock>
        </div>
      ) : <p className="mt-5 text-sm text-slate-500">Connect the submitting builder wallet to request a re-check or open an appeal.</p>}

      {isOwner ? (
        <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
          <ActionBlock title="Record a human decision" description="This is the campaign owner’s final governance record. It is separate from, and does not alter, the consensus report.">
            <select value={humanStatus} onChange={(event) => setHumanStatus(event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300">
              <option value="APPROVED">Approve</option><option value="CHANGES_REQUESTED">Request changes</option><option value="REJECTED">Reject</option><option value="OVERRIDDEN">Override</option>
            </select>
            <textarea value={humanNotes} onChange={(event) => setHumanNotes(event.target.value)} maxLength={2000} placeholder="Optional public decision notes." className="mt-3 min-h-20 w-full rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <div className="mt-3"><TransactionStatus address={address} method="record_human_decision" values={{ submission_id: submission.submission_id, report_id: reportId, decision_status: humanStatus, notes: humanNotes }} buttonLabel="Record human decision" onConfirmed={() => load().catch(() => undefined)} /></div>
          </ActionBlock>
          {(record?.appeals ?? []).filter((appeal) => appeal.status === "OPEN").map((appeal) => <AppealResolution key={appeal.appeal_id} appeal={appeal} status={resolutionStatus[appeal.appeal_id] ?? "RECHECK_SCHEDULED"} notes={resolutionNotes[appeal.appeal_id] ?? ""} onStatus={(value) => setResolutionStatus((current) => ({ ...current, [appeal.appeal_id]: value }))} onNotes={(value) => setResolutionNotes((current) => ({ ...current, [appeal.appeal_id]: value }))} address={address} onConfirmed={() => load().catch(() => undefined)} />)}
        </div>
      ) : <p className="mt-5 border-t border-white/10 pt-5 text-sm text-slate-500">Connect the campaign owner wallet to resolve open appeals or record a final human decision.</p>}
    </SectionCard>
  );
}

function ActionBlock({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p><div className="mt-4">{children}</div></div>;
}

function AppealResolution({ appeal, status, notes, onStatus, onNotes, address, onConfirmed }: { appeal: Appeal; status: string; notes: string; onStatus: (value: string) => void; onNotes: (value: string) => void; address: string; onConfirmed: () => void }) {
  return <ActionBlock title={`Resolve ${appeal.appeal_id}`} description="Record the campaign owner’s resolution. Accepting or scheduling a re-check opens one new review opportunity.">
    <select value={status} onChange={(event) => onStatus(event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300"><option value="RECHECK_SCHEDULED">Schedule re-check</option><option value="ACCEPTED">Accept appeal</option><option value="REJECTED">Reject appeal</option><option value="CLOSED">Close appeal</option></select>
    <textarea value={notes} onChange={(event) => onNotes(event.target.value)} maxLength={2000} placeholder="Explain this resolution for the public record." className="mt-3 min-h-20 w-full rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300" />
    <div className="mt-3"><TransactionStatus address={address} method="resolve_appeal" values={{ appeal_id: appeal.appeal_id, resolution_status: status, resolution_notes: notes }} buttonLabel="Resolve appeal" onConfirmed={onConfirmed} /></div>
  </ActionBlock>;
}
