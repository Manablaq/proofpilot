"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { CopyButton } from "@/components/CopyButton";
import { deployment } from "@/lib/deployment";
import { shortHash } from "@/lib/proofpilot-schema";

type HistoryItem = {
  method: string;
  evmTx: string;
  genlayerTx: string;
  createdAt: string;
};

export function AppTransactions() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem("proofpilot_tx_history") || "[]");
      setHistory(Array.isArray(parsed) ? parsed as HistoryItem[] : []);
    } catch {
      setHistory([]);
    }
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Transactions"
        title="Transaction lifecycle"
        description="Follow the public write flow from prepared calldata to wallet signature, EVM receipt, GenLayer transaction id, and consensus state."
      />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["1", "Prepared", "Server validates inputs and encodes consensus calldata."],
          ["2", "Wallet signature", "The connected wallet signs and sends the EVM transaction."],
          ["3", "EVM receipt", "The app waits for the Bradbury EVM receipt."],
          ["4", "Consensus status", "The app extracts the GenLayer tx id when logs expose it."],
        ].map(([step, title, text]) => (
          <SectionCard key={step} className="p-5">
            <StatusBadge tone="info">Step {step}</StatusBadge>
            <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
          </SectionCard>
        ))}
      </div>

      <SectionCard className="mt-8 p-6">
        <h2 className="text-2xl font-semibold text-white">Local transaction history</h2>
        <p className="mt-2 text-sm text-slate-400">Stored in this browser only. It is not a backend source of truth.</p>
        <div className="mt-5 space-y-3">
          {history.length ? history.map((item) => (
            <div key={`${item.evmTx}-${item.createdAt}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-white">{item.method}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.createdAt}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  <span>EVM {shortHash(item.evmTx)}</span>
                  <CopyButton value={item.evmTx} />
                  {item.genlayerTx ? <span>GenLayer {shortHash(item.genlayerTx)}</span> : <span>GenLayer tx pending/manual</span>}
                </div>
              </div>
            </div>
          )) : (
            <EmptyState
              title="No local transaction history"
              description="When you create campaigns, submit projects, or run reviews from this browser, confirmed EVM receipts will appear here."
              action={{ label: "Submit project", href: "/app/submit" }}
            />
          )}
        </div>
      </SectionCard>

      <SectionCard className="mt-6 p-6">
        <h2 className="text-2xl font-semibold text-white">Known final v6 transactions</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            ["Deployment", deployment.deploymentTx],
            ["Campaign", deployment.smokeTestTx],
            ["Submit", deployment.submitGenlayerTx],
            ["Review", deployment.runReviewTx],
          ].map(([label, tx]) => (
            <a key={tx} href={`${deployment.explorerBase}/tx/${tx}`} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm transition hover:bg-white/[0.07]">
              <p className="text-slate-500">{label}</p>
              <p className="mt-2 break-all text-slate-100">{tx}</p>
            </a>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
