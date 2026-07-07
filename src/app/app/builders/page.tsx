import Link from "next/link";
import { deployment } from "@/lib/deployment";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { shortHash } from "@/lib/proofpilot-schema";

export default function ProductBuildersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Builders"
        title="Reputation profiles"
        description="Address-bound profiles for reviewed builders. The live v6 builder profile is available now; future profiles appear after submissions and reviews."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Live builder</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{shortHash(deployment.builderAddress)}</h2>
            </div>
            <StatusBadge tone="success">Reviewed</StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Builder profile created from {deployment.submissionId} and {deployment.reportId}.
          </p>
          <Link href={`/app/builders/${deployment.builderAddress}`} className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
            Open profile
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
