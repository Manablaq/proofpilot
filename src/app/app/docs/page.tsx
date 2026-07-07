import Link from "next/link";
import { deployment } from "@/lib/deployment";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";

export default function ProductDocsVerifyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Docs / Verify"
        title="Verify ProofPilot output"
        description="Use contract reads, explorer links, and report pages to verify the final v6 review without relying on frontend claims."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard className="p-6">
          <h2 className="text-2xl font-semibold text-white">Live v6 identifiers</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Contract", deployment.contractAddress],
              ["Campaign", deployment.campaignId],
              ["Submission", deployment.submissionId],
              ["Report", deployment.reportId],
              ["Snapshot", deployment.snapshotId],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 break-all text-sm text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard className="p-6">
          <h2 className="text-2xl font-semibold text-white">Verification checklist</h2>
          <div className="mt-5 space-y-3">
            {[
              "Read get_submission(submission_1) and confirm REVIEWED.",
              "Read get_report(report_1) and confirm total_score 61.",
              "Read get_evidence_snapshot(snapshot_1) and confirm fetch failures are visible.",
              "Open the Bradbury run_review transaction and confirm validator agreement.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                <StatusBadge tone="success">Check</StatusBadge>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard className="mt-6 p-6">
        <h2 className="text-2xl font-semibold text-white">Open resources</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/app/reports/report_1" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">Open report</Link>
          <a href={deployment.explorerContract} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Explorer contract</a>
          <a href={`${deployment.explorerBase}/tx/${deployment.runReviewTx}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Review transaction</a>
        </div>
      </SectionCard>
    </div>
  );
}
