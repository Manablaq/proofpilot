"use client";

import { useEffect } from "react";
import Link from "next/link";
import { shortHash } from "@/lib/proofpilot-schema";
import { useWallet } from "@/components/WalletProvider";

type WalletPanelProps = {
  onAddress?: (address: string) => void;
  variant?: "compact" | "full";
};

export function WalletPanel({ onAddress, variant = "full" }: WalletPanelProps) {
  const { address, chainId, error, busy, locallyDisconnected, wrongNetwork, connect, disconnect, switchNetwork } = useWallet();

  useEffect(() => {
    onAddress?.(address);
  }, [address, onAddress]);

  if (variant === "compact") {
    return (
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className={`hidden rounded-full border px-2.5 py-1 text-xs font-semibold sm:inline-flex ${wrongNetwork ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"}`}>
          {chainId ? wrongNetwork ? "Wrong network" : "Bradbury" : "Bradbury required"}
        </span>
        {address ? (
          <>
            <Link href="/app/me" className="min-w-0 truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10">
              {shortHash(address)}
            </Link>
            <button
              type="button"
              onClick={disconnect}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={connect}
            className="rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-60"
          >
            Connect wallet
          </button>
        )}
        {error ? <span className="hidden max-w-[220px] truncate text-xs text-amber-200 md:inline">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-200">Wallet</p>
          <p className="mt-1 text-sm text-slate-400">
            {address ? `Connected ${shortHash(address)}` : "Connect an EIP-1193 browser wallet to sign transactions."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={address ? disconnect : connect}
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
          >
            {address ? "Disconnect" : "Connect wallet"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={switchNetwork}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            Switch to Bradbury
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full border px-3 py-1 ${wrongNetwork ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"}`}>
          {chainId ? wrongNetwork ? `Wrong network ${chainId}` : "Bradbury network" : "Network unknown"}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-500">
          No private keys required
        </span>
      </div>
      {locallyDisconnected ? (
        <p className="mt-3 text-xs text-slate-500">Disconnected in ProofPilot. Manage account permissions in your wallet.</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-amber-200">{error}</p> : null}
    </div>
  );
}
