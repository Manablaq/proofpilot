"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { WalletPanel } from "@/components/WalletPanel";
import { SubmissionForm } from "@/components/SubmissionForm";

const templates = [
  {
    id: "web3",
    title: "Web3 Project",
    audience: "Smart contract apps, deployed protocols, and Web3 builder submissions.",
    status: "Active on v6",
    active: true,
    evidence: ["Project name", "Summary", "Live app URL", "GitHub repo URL", "Docs / README URL", "Contract address", "Deployment transaction hash", "Reviewer feedback", "Fixes explanation"],
  },
  {
    id: "frontend",
    title: "Frontend App",
    audience: "Product demos, websites, dashboards, and app interfaces without deployment proof.",
    status: "Coming next",
    active: false,
    evidence: ["Project name", "Summary", "Live app URL", "GitHub repo URL", "Docs / README URL", "Demo video URL optional", "Changelog / fixes explanation"],
  },
  {
    id: "ai",
    title: "AI Project",
    audience: "Agents, model integrations, AI workflows, and evaluation-heavy projects.",
    status: "Coming next",
    active: false,
    evidence: ["Project name", "Summary", "GitHub repo URL", "Demo URL", "Model/API docs URL", "Benchmark/results URL optional", "Evaluation notes"],
  },
  {
    id: "dao",
    title: "DAO Milestone",
    audience: "Grant milestones, ecosystem programs, and delivery checkpoints.",
    status: "Coming next",
    active: false,
    evidence: ["Milestone title", "Summary", "GitHub repo / PR links", "Live deployment URL", "Milestone docs URL", "Deliverables checklist"],
  },
  {
    id: "bounty",
    title: "Bug Bounty",
    audience: "Security findings, fixes, reproduction records, and verification notes.",
    status: "Coming next",
    active: false,
    evidence: ["Finding title", "Summary", "Affected repo or contract", "Reproduction steps", "Fix PR URL", "Verification notes"],
  },
] as const;

export function AppSubmitProject() {
  const search = useSearchParams();
  const [address, setAddress] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof templates)[number]["id"]>("web3");
  const campaignId = search.get("campaignId") || deployment.campaignId;
  const selected = templates.find((template) => template.id === selectedTemplate) ?? templates[0];

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

      <SectionCard className="mb-8 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Choose submission template</h2>
            <p className="mt-2 text-sm text-slate-400">
              The current v6 contract supports the Web3 Project evidence shape. Other templates need flexible evidence support.
            </p>
          </div>
          <StatusBadge tone="info">v6 evidence schema</StatusBadge>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template.id)}
              className={`rounded-lg border p-4 text-left transition ${
                selectedTemplate === template.id
                  ? "border-cyan-300/50 bg-cyan-300/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-white">{template.title}</h3>
                <StatusBadge tone={template.active ? "success" : "neutral"}>{template.status}</StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{template.audience}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Evidence</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                {template.evidence.slice(0, 5).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </button>
          ))}
        </div>
      </SectionCard>

      {selected.active ? (
        <SubmissionForm address={address} campaignId={campaignId} />
      ) : (
        <LockedTemplatePreview template={selected} onUseWeb3={() => setSelectedTemplate("web3")} />
      )}
    </div>
  );
}

function LockedTemplatePreview({
  template,
  onUseWeb3,
}: {
  template: (typeof templates)[number];
  onUseWeb3: () => void;
}) {
  return (
    <SectionCard className="p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <StatusBadge tone="neutral">Flexible evidence contract required</StatusBadge>
          <h2 className="mt-4 text-2xl font-semibold text-white">{template.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            This template needs ProofPilot flexible evidence support. The current v6 contract accepts Web3 evidence only,
            including contract address and deployment transaction proof. ProofPilot will not ask you to enter fake
            Web3 fields for this template.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {template.evidence.map((item) => (
          <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            {item}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onUseWeb3}
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
        >
          Use Web3 Project template
        </button>
        <Link href="/app/transactions" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
          View transaction architecture
        </Link>
      </div>
    </SectionCard>
  );
}
