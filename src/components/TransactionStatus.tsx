"use client";

import { useState } from "react";
import { deployment } from "@/lib/deployment";
import { extractGenLayerTxId, sendPreparedTransaction, waitForEvmReceipt } from "@/lib/wallet";
import type { ProofPilotWriteMethod } from "@/lib/proofpilot-schema";
import { shortHash } from "@/lib/proofpilot-schema";
import { CopyButton } from "@/components/CopyButton";

type TxState = {
  phase: "idle" | "preparing" | "wallet" | "receipt" | "confirmed" | "error";
  evmTx: string;
  genlayerTx: string;
  error: string;
};

export function TransactionStatus({
  address,
  method,
  values,
  gasLimit,
  buttonLabel,
  disabled,
  onConfirmed,
}: {
  address: string;
  method: ProofPilotWriteMethod;
  values: Record<string, string>;
  gasLimit?: string;
  buttonLabel: string;
  disabled?: boolean;
  onConfirmed?: (state: { evmTx: string; genlayerTx: string }) => void;
}) {
  const [state, setState] = useState<TxState>({ phase: "idle", evmTx: "", genlayerTx: "", error: "" });

  async function submit() {
    setState({ phase: "preparing", evmTx: "", genlayerTx: "", error: "" });

    try {
      if (!address) {
        throw new Error("Connect a wallet first.");
      }

      const preparedRes = await fetch("/api/tx/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ method, from: address, values, gasLimit }),
      });
      const preparedJson = await preparedRes.json();

      if (!preparedRes.ok || !preparedJson.ok) {
        const details = preparedJson.details ? ` ${JSON.stringify(preparedJson.details)}` : "";
        throw new Error(`${preparedJson.error || "Transaction preparation failed"}${details}`);
      }

      setState((prev) => ({ ...prev, phase: "wallet" }));
      const evmTx = await sendPreparedTransaction(address, preparedJson.data);

      setState((prev) => ({ ...prev, phase: "receipt", evmTx }));
      const receipt = await waitForEvmReceipt(evmTx);
      const genlayerTx = extractGenLayerTxId(receipt) ?? "";

      setState({ phase: "confirmed", evmTx, genlayerTx, error: "" });
      try {
        const key = "proofpilot_tx_history";
        const current = JSON.parse(window.localStorage.getItem(key) || "[]") as unknown[];
        window.localStorage.setItem(key, JSON.stringify([
          { method, evmTx, genlayerTx, createdAt: new Date().toISOString() },
          ...current,
        ].slice(0, 25)));
      } catch {
      }
      onConfirmed?.({ evmTx, genlayerTx });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        phase: "error",
        error: error instanceof Error ? error.message : "Transaction failed",
      }));
    }
  }

  const busy = ["preparing", "wallet", "receipt"].includes(state.phase);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={submit}
        disabled={disabled || busy}
        className="w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? state.phase === "wallet" ? "Confirm in wallet" : state.phase === "receipt" ? "Waiting for receipt" : "Preparing transaction" : buttonLabel}
      </button>

      {state.phase !== "idle" ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
          <p className="font-semibold text-slate-100">
            {state.phase === "confirmed" ? "EVM receipt confirmed" : state.phase === "error" ? "Transaction not confirmed" : "Transaction pending"}
          </p>
          {state.evmTx ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-slate-300">
              <span>EVM tx: {shortHash(state.evmTx)}</span>
              <CopyButton value={state.evmTx} />
              <a className="text-cyan-200 hover:text-cyan-100" href={`${deployment.explorerBase}/tx/${state.evmTx}`} target="_blank" rel="noreferrer">
                Explorer
              </a>
            </div>
          ) : null}
          {state.genlayerTx ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-slate-300">
              <span>GenLayer tx: {shortHash(state.genlayerTx)}</span>
              <CopyButton value={state.genlayerTx} />
              <a className="text-cyan-200 hover:text-cyan-100" href={`${deployment.explorerBase}/tx/${state.genlayerTx}`} target="_blank" rel="noreferrer">
                Trace
              </a>
            </div>
          ) : state.phase === "confirmed" ? (
            <p className="mt-3 text-amber-100">
              EVM receipt was found, but no GenLayer transaction id was decoded from logs. Use the EVM explorer link while consensus indexing catches up.
            </p>
          ) : null}
          {state.error ? <p className="mt-3 text-amber-200">{state.error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
