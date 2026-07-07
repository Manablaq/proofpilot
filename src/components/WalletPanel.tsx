"use client";

import { useEffect, useState } from "react";
import { testnetBradbury } from "genlayer-js/chains";
import { connectWallet, ensureBradburyNetwork, getProvider, getWalletChainId } from "@/lib/wallet";
import { shortHash } from "@/lib/proofpilot-schema";

type WalletPanelProps = {
  onAddress?: (address: string) => void;
};

export function WalletPanel({ onAddress }: WalletPanelProps) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const provider = getProvider();
    if (!provider) {
      setError("No browser wallet detected.");
      return;
    }

    const [accounts, currentChainId] = await Promise.all([
      provider.request<string[]>({ method: "eth_accounts" }),
      getWalletChainId(),
    ]);
    const nextAddress = accounts[0] ?? "";
    setAddress(nextAddress);
    setChainId(currentChainId);
    onAddress?.(nextAddress);
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const expectedChain = `0x${testnetBradbury.id.toString(16)}`;
  const wrongNetwork = Boolean(chainId && chainId !== expectedChain);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
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
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const next = await connectWallet();
                setAddress(next);
                onAddress?.(next);
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Wallet connection failed");
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
          >
            {address ? "Reconnect" : "Connect wallet"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await ensureBradburyNetwork();
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Network switch failed");
              } finally {
                setBusy(false);
              }
            }}
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
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
          No private keys required
        </span>
      </div>
      {error ? <p className="mt-3 text-sm text-amber-200">{error}</p> : null}
    </div>
  );
}
