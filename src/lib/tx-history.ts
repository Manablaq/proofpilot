"use client";

import { deployment } from "@/lib/deployment";
import type { ProofPilotWriteMethod } from "@/lib/proofpilot-schema";

export type LocalTxStatus = "preparing" | "sent" | "confirmed" | "error";

export type LocalTxEntry = {
  id: string;
  method: ProofPilotWriteMethod;
  from: string;
  contract: string;
  chainId?: number;
  evmTx?: string;
  genlayerTx?: string;
  submissionId?: string;
  status: LocalTxStatus;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

const key = "proofpilot_tx_history";

function readAll() {
  if (typeof window === "undefined") {
    return [] as LocalTxEntry[];
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry === "object") as LocalTxEntry[] : [];
  } catch {
    return [];
  }
}

function writeAll(entries: LocalTxEntry[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(entries.slice(0, 50)));
}

export function createLocalTx(method: ProofPilotWriteMethod, from: string, chainId?: number) {
  const now = new Date().toISOString();
  const entry: LocalTxEntry = {
    id: `${now}-${method}-${Math.random().toString(36).slice(2, 8)}`,
    method,
    from,
    chainId,
    contract: deployment.contractAddress,
    status: "preparing",
    createdAt: now,
    updatedAt: now,
  };
  writeAll([entry, ...readAll()]);
  return entry.id;
}

export function updateLocalTx(id: string, patch: Partial<Pick<LocalTxEntry, "evmTx" | "genlayerTx" | "submissionId" | "status" | "error" | "chainId">>) {
  const now = new Date().toISOString();
  writeAll(readAll().map((entry) => entry.id === id ? { ...entry, ...patch, updatedAt: now } : entry));
}

export function getLocalTxHistory(address?: string) {
  const entries = readAll();
  if (!address) {
    return entries;
  }
  return entries.filter((entry) => typeof entry.from === "string" && entry.from.toLowerCase() === address.toLowerCase());
}
