"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { deployment } from "@/lib/deployment";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { WalletPanel } from "@/components/WalletPanel";
import { SubmissionForm } from "@/components/SubmissionForm";

export function AppSubmitProject() {
  const search = useSearchParams();
  const [address, setAddress] = useState("");
  const campaignId = search.get("campaignId") || deployment.campaignId;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Campaigns", href: "/app/campaigns" }, { label: "Submit project" }]}
        eyebrow="Builder submission"
        title="Submit project evidence"
        description="Choose a campaign, provide live evidence, and sign the submission from your builder wallet."
      />
      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <SectionCard className="p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info">Builder signs</StatusBadge>
            <StatusBadge tone="warning">Evidence remains untrusted</StatusBadge>
            <StatusBadge tone="success">Append-only submission</StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            The connected wallet becomes the builder address. ProofPilot validates basic evidence shape,
            then the contract stores the submission for later review.
          </p>
        </SectionCard>
        <WalletPanel onAddress={setAddress} />
      </div>
      <SubmissionForm address={address} campaignId={campaignId} />
    </div>
  );
}
