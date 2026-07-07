"use client";

import { useState } from "react";
import { CampaignForm } from "@/components/CampaignForm";
import { WalletPanel } from "@/components/WalletPanel";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";

export function NewCampaignFlow() {
  const [address, setAddress] = useState("");

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Campaigns", href: "/app/campaigns" }, { label: "New campaign" }]}
        eyebrow="Create"
        title="Launch a review campaign"
        description="Define the campaign identity, optional policy JSON, and transaction settings before signing with your browser wallet."
      />
      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <SectionCard className="p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info">Server prepares calldata</StatusBadge>
            <StatusBadge tone="warning">Wallet signs transaction</StatusBadge>
            <StatusBadge tone="success">Contract stores campaign</StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            ProofPilot never signs for users. The backend validates inputs and encodes the Bradbury consensus transaction;
            your wallet controls approval and gas.
          </p>
        </SectionCard>
        <WalletPanel onAddress={setAddress} />
      </div>
      <CampaignForm address={address} />
    </div>
  );
}
