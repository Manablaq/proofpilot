"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deployment } from "@/lib/deployment";
import { extractGenLayerTxId, sendPreparedTransaction, waitForEvmReceipt } from "@/lib/wallet";
import type { ProofPilotWriteMethod } from "@/lib/proofpilot-schema";
import { shortHash } from "@/lib/proofpilot-schema";
import { createLocalTx, updateLocalTx } from "@/lib/tx-history";
import { notifyProofPilotMutation } from "@/lib/live-refresh";
import { CopyButton } from "@/components/CopyButton";
import { useWallet } from "@/components/WalletProvider";

type TxState = {
  phase: "idle" | "preparing" | "wallet" | "sent" | "receipt" | "syncing" | "applied" | "error";
  evmTx: string;
  genlayerTx: string;
  submissionId: string;
  stillSyncing: boolean;
  error: string;
};

const initialState: TxState = {
  phase: "idle",
  evmTx: "",
  genlayerTx: "",
  submissionId: "",
  stillSyncing: false,
  error: "",
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
  onConfirmed?: (state: { evmTx: string; genlayerTx: string; submissionId?: string }) => void;
}) {
  const wallet = useWallet();
  const [state, setState] = useState<TxState>(initialState);
  const [formVersion, setFormVersion] = useState(0);
  const lastValues = useRef("");
  const localTxIdRef = useRef("");
  const beforeSubmissionIdsRef = useRef<string[]>([]);
  const confirmedTxRef = useRef({ evmTx: "", genlayerTx: "" });
  const valueSignature = useMemo(() => JSON.stringify({ method, values, gasLimit }), [gasLimit, method, values]);

  useEffect(() => {
    if (!lastValues.current) {
      lastValues.current = valueSignature;
      return;
    }
    if (lastValues.current !== valueSignature) {
      lastValues.current = valueSignature;
      setFormVersion((version) => version + 1);
      if (state.phase === "applied") {
        setState(initialState);
      }
    }
  }, [state.phase, valueSignature]);

  async function readBuilderSubmissionIds(builder: string) {
    const res = await fetch(`/api/submissions?builder=${encodeURIComponent(builder)}&offset=0&limit=20`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.ok || !Array.isArray(json.data)) {
      return [] as string[];
    }
    return json.data.filter((item: unknown): item is string => typeof item === "string");
  }

  function newestSubmissionId(ids: string[], before: Set<string>) {
    const fresh = ids.filter((id) => !before.has(id));
    if (!fresh.length) {
      return "";
    }
    return fresh.sort((a, b) => Number((b.match(/\d+$/) ?? ["0"])[0]) - Number((a.match(/\d+$/) ?? ["0"])[0]))[0];
  }

  async function waitForSubmissionId(builder: string, beforeIds: string[]) {
    const before = new Set(beforeIds);
    // Contract reads are the source of truth. Keep polling while this component
    // is open instead of telling a user to refresh after an accepted transaction.
    for (let attempt = 0; attempt < 150; attempt += 1) {
      const ids = await readBuilderSubmissionIds(builder);
      const detected = newestSubmissionId(ids, before);
      if (detected) {
        return detected;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt < 20 ? 3000 : 8000));
    }
    return "";
  }

  async function checkDelayedSubmission() {
    if (!address || method !== "submit_project" || !state.stillSyncing) {
      return;
    }
    const submissionId = await waitForSubmissionId(address, beforeSubmissionIdsRef.current);
    if (!submissionId) {
      return;
    }
    if (localTxIdRef.current) {
      updateLocalTx(localTxIdRef.current, { submissionId });
    }
    setState((current) => ({ ...current, phase: "applied", submissionId, stillSyncing: false }));
    notifyProofPilotMutation({
      method,
      address,
      from: address,
      evmTx: confirmedTxRef.current.evmTx,
      genlayerTx: confirmedTxRef.current.genlayerTx,
      submissionId,
    });
    onConfirmed?.({ evmTx: confirmedTxRef.current.evmTx, genlayerTx: confirmedTxRef.current.genlayerTx, submissionId });
  }

  useEffect(() => {
    if (!state.stillSyncing) {
      return;
    }
    const onFocus = () => {
      checkDelayedSubmission().catch(() => undefined);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkDelayedSubmission().catch(() => undefined);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [state.stillSyncing]);

  async function submit() {
    if (["preparing", "wallet", "sent", "receipt", "syncing"].includes(state.phase) || state.phase === "applied") {
      return;
    }

    setState(initialState);
    setState((current) => ({ ...current, phase: "preparing" }));
    let localTxId = "";

    try {
      if (!address) {
        throw new Error("Connect a wallet first.");
      }
      if (wallet.wrongNetwork) {
        throw new Error("Switch to Bradbury before signing.");
      }
      localTxId = createLocalTx(method, address);
      localTxIdRef.current = localTxId;
      const beforeSubmissionIds = method === "submit_project" ? await readBuilderSubmissionIds(address) : [];
      beforeSubmissionIdsRef.current = beforeSubmissionIds;

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
      updateLocalTx(localTxId, { chainId: preparedJson.data.chainId, status: "preparing" });

      setState((prev) => ({ ...prev, phase: "wallet" }));
      const evmTx = await sendPreparedTransaction(address, preparedJson.data);
      setState((prev) => ({ ...prev, phase: "sent", evmTx }));
      updateLocalTx(localTxId, { evmTx, status: "sent" });

      setState((prev) => ({ ...prev, phase: "receipt", evmTx }));
      const receipt = await waitForEvmReceipt(evmTx);
      const genlayerTx = extractGenLayerTxId(receipt) ?? "";
      confirmedTxRef.current = { evmTx, genlayerTx };
      updateLocalTx(localTxId, { evmTx, genlayerTx, status: "evm_confirmed" });

      setState((prev) => ({ ...prev, phase: "syncing", evmTx, genlayerTx }));
      const submissionId = method === "submit_project" ? await waitForSubmissionId(address, beforeSubmissionIds) : "";
      if (submissionId) {
        updateLocalTx(localTxId, { submissionId, status: "state_applied" });
      } else if (method === "submit_project") {
        updateLocalTx(localTxId, { status: "state_pending" });
      }

      const stateApplied = method !== "submit_project" || Boolean(submissionId);
      setState({ phase: stateApplied ? "applied" : "syncing", evmTx, genlayerTx, submissionId, stillSyncing: method === "submit_project" && !submissionId, error: "" });
      notifyProofPilotMutation({ method, address, from: address, evmTx, genlayerTx, submissionId });
      if (stateApplied) {
        onConfirmed?.({ evmTx, genlayerTx, submissionId });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed";
      const readable = /reject|denied|user rejected|user denied|4001/i.test(message) ? "Wallet signature was rejected or cancelled." : message;
      if (localTxId) {
        updateLocalTx(localTxId, {
          status: "error",
          error: readable,
        });
      }
      setState((prev) => ({
        ...prev,
        phase: "error",
        error: readable,
      }));
    }
  }

  const busy = ["preparing", "wallet", "sent", "receipt", "syncing"].includes(state.phase);
  const locked = busy || state.phase === "applied";
  const appliedLabel = method === "submit_project" ? "Submission recorded on-chain" : "Transaction recorded on-chain";
  const phaseText = {
    idle: buttonLabel,
    preparing: "Preparing wallet transaction",
    wallet: "Waiting for wallet signature",
    sent: "Transaction sent",
    receipt: "Waiting for Bradbury confirmation",
    syncing: "Waiting for on-chain state",
    applied: appliedLabel,
    error: "Retry transaction",
  }[state.phase];
  const canReset = state.phase === "applied";

  return (
    <div className="space-y-4">
      {!address ? (
        <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">Connect a wallet before preparing this transaction.</p>
      ) : wallet.wrongNetwork ? (
        <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">Bradbury network is required before signing.</p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={disabled || locked || !address || wallet.wrongNetwork}
        className="w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {phaseText}
      </button>

      {state.phase !== "idle" ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
          <p className="font-semibold text-slate-100">
            {state.phase === "applied" ? appliedLabel : state.phase === "error" ? "Transaction failed" : phaseText}
          </p>
          {state.phase === "preparing" ? <p className="mt-2 text-slate-400">Encoding GenLayer calldata. Your wallet will not open if preparation fails.</p> : null}
          {state.phase === "wallet" ? <p className="mt-2 text-slate-400">Review the request in your wallet. Rejecting it will not send a transaction.</p> : null}
          {state.phase === "receipt" ? <p className="mt-2 text-slate-400">The EVM transaction was sent. Waiting for Bradbury receipt and contract reads.</p> : null}
          {state.phase === "syncing" ? <p className="mt-2 text-slate-400">The wallet transaction has an EVM receipt. ProofPilot is checking the contract automatically until the new record is readable.</p> : null}
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
          ) : state.phase === "applied" || state.phase === "syncing" ? (
            <p className="mt-3 text-amber-100">
              An EVM receipt was found, but no GenLayer transaction ID was decoded from its logs. The app will continue reconciling the on-chain record automatically.
            </p>
          ) : null}
          {state.submissionId ? (
            <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="font-semibold text-emerald-100">New submission detected: {state.submissionId}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100" href={`/app/submissions/${state.submissionId}`}>View submission</a>
                <a className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10" href="/app/me">Open workspace</a>
              </div>
            </div>
          ) : null}
          {state.error ? <p className="mt-3 text-amber-200">{state.error}</p> : null}
        </div>
      ) : null}
      {canReset ? (
        <button
          type="button"
          onClick={() => {
            setState(initialState);
            setFormVersion((version) => version + 1);
          }}
          className="w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          {method === "submit_project" ? "Submit another project" : "Prepare another transaction"}
        </button>
      ) : null}
      <span className="sr-only">Transaction form version {formVersion}</span>
    </div>
  );
}
