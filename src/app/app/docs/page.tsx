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
        description="Use contract reads and public explorer links to verify finalized V7 deployment facts without relying on frontend claims."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard className="p-6">
          <h2 className="text-2xl font-semibold text-white">Finalized V7 identifiers</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Contract", deployment.contractAddress],
              ["Deployment transaction", deployment.deploymentTx],
              ["V7 workflow fixture", "Pending — no campaign, submission, or report is asserted yet"],
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
              "Open the Bradbury deployment transaction and confirm FINALIZED / accepted.",
              "Read list_campaigns(0, 1) and confirm the clean V7 state before creating a fixture.",
              "Create a campaign with an exact 100-point custom rubric.",
              "After the workflow is run, inspect the stored submission, report, snapshot, and the review transaction.",
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
          <Link href="/app/campaigns/new" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">Create V7 campaign</Link>
          <a href={deployment.explorerContract} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Explorer contract</a>
          <a href={deployment.explorerTx} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Deployment transaction</a>
        </div>
      </SectionCard>
    </div>
  );
}
