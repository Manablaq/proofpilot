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
  campaignId: string;
  submissionId: string;
  reportId: string;
  stillSyncing: boolean;
  error: string;
};

const initialState: TxState = {
  phase: "idle",
  evmTx: "",
  genlayerTx: "",
  campaignId: "",
  submissionId: "",
  reportId: "",
  stillSyncing: false,
  error: "",
};

type AppliedRecord = {
  campaignId?: string;
  submissionId?: string;
  reportId?: string;
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
  onConfirmed?: (state: { evmTx: string; genlayerTx: string; campaignId?: string; submissionId?: string; reportId?: string }) => void;
}) {
  const wallet = useWallet();
  const [state, setState] = useState<TxState>(initialState);
  const [formVersion, setFormVersion] = useState(0);
  const lastValues = useRef("");
  const localTxIdRef = useRef("");
  const beforeCampaignIdsRef = useRef<string[]>([]);
  const beforeSubmissionIdsRef = useRef<string[]>([]);
  const beforeReportIdRef = useRef("");
  const confirmedTxRef = useRef({ evmTx: "", genlayerTx: "" });
  const reconciliationInFlightRef = useRef(false);
  const retryTimerRef = useRef<number | null>(null);
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

  async function readCampaignIds() {
    const res = await fetch("/api/campaigns", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.ok || !Array.isArray(json.data)) {
      return [] as string[];
    }
    return json.data.filter((item: unknown): item is string => typeof item === "string");
  }

  async function readSubmission(submissionId: string) {
    const res = await fetch(`/api/submissions/${encodeURIComponent(submissionId)}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.ok || !json.data || typeof json.data !== "object") {
      return null;
    }
    return json.data as { latest_report_id?: unknown; status?: unknown };
  }

  function newestSubmissionId(ids: string[], before: Set<string>) {
    const fresh = ids.filter((id) => !before.has(id));
    if (!fresh.length) {
      return "";
    }
    return fresh.sort((a, b) => Number((b.match(/\d+$/) ?? ["0"])[0]) - Number((a.match(/\d+$/) ?? ["0"])[0]))[0];
  }

  async function waitForAppliedRecord(builder: string, beforeCampaignIds: string[], beforeSubmissionIds: string[], beforeReportId: string): Promise<AppliedRecord> {
    const beforeCampaigns = new Set(beforeCampaignIds);
    const beforeSubmissions = new Set(beforeSubmissionIds);
    // A wallet receipt only proves the write was submitted. The UI advances only
    // after the relevant record is readable from the contract, so it never asks
    // people to refresh or clear a form after an accepted transaction.
    for (let attempt = 0; attempt < 150; attempt += 1) {
      try {
        if (method === "create_campaign") {
          const campaignId = newestSubmissionId(await readCampaignIds(), beforeCampaigns);
          if (campaignId) {
            return { campaignId };
          }
        }
        if (method === "submit_project") {
          const submissionId = newestSubmissionId(await readBuilderSubmissionIds(builder), beforeSubmissions);
          if (submissionId) {
            return { submissionId };
          }
        }
        if (method === "run_review") {
          const submissionId = values.submission_id?.trim();
          if (submissionId) {
            const submission = await readSubmission(submissionId);
            const reportId = typeof submission?.latest_report_id === "string" ? submission.latest_report_id : "";
            if (reportId && reportId !== beforeReportId) {
              return { submissionId, reportId };
            }
          }
        }
      } catch {
        // Bradbury reads can temporarily lag consensus; keep reconciling.
      }
      await new Promise((resolve) => setTimeout(resolve, attempt < 20 ? 3000 : 8000));
    }
    return {};
  }

  function applyRecord(record: AppliedRecord) {
    if (!Object.keys(record).length) {
      return;
    }
    if (localTxIdRef.current) {
      updateLocalTx(localTxIdRef.current, { ...record, status: "state_applied" });
    }
    setState((current) => ({ ...current, phase: "applied", ...record, stillSyncing: false }));
    notifyProofPilotMutation({
      method,
      address,
      from: address,
      evmTx: confirmedTxRef.current.evmTx,
      genlayerTx: confirmedTxRef.current.genlayerTx,
      ...record,
    });
    onConfirmed?.({ evmTx: confirmedTxRef.current.evmTx, genlayerTx: confirmedTxRef.current.genlayerTx, ...record });
  }

  async function checkDelayedRecord() {
    if (!address || !state.stillSyncing || reconciliationInFlightRef.current) {
      return;
    }
    reconciliationInFlightRef.current = true;
    try {
      const record = await waitForAppliedRecord(address, beforeCampaignIdsRef.current, beforeSubmissionIdsRef.current, beforeReportIdRef.current);
      applyRecord(record);
      if (!Object.keys(record).length && state.stillSyncing) {
        retryTimerRef.current = window.setTimeout(() => {
          checkDelayedRecord().catch(() => undefined);
        }, 10_000);
      }
    } finally {
      reconciliationInFlightRef.current = false;
    }
  }

  useEffect(() => {
    if (!state.stillSyncing) {
      return;
    }
    const onFocus = () => {
      checkDelayedRecord().catch(() => undefined);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkDelayedRecord().catch(() => undefined);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
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
      const beforeCampaignIds = method === "create_campaign" ? await readCampaignIds() : [];
      const beforeSubmissionIds = method === "submit_project" ? await readBuilderSubmissionIds(address) : [];
      const beforeSubmission = method === "run_review" && values.submission_id ? await readSubmission(values.submission_id) : null;
      const beforeReportId = typeof beforeSubmission?.latest_report_id === "string" ? beforeSubmission.latest_report_id : "";
      beforeCampaignIdsRef.current = beforeCampaignIds;
      beforeSubmissionIdsRef.current = beforeSubmissionIds;
      beforeReportIdRef.current = beforeReportId;

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
      updateLocalTx(localTxId, { status: "state_pending" });
      notifyProofPilotMutation({ method, address, from: address, evmTx, genlayerTx });
      reconciliationInFlightRef.current = true;
      const record = await waitForAppliedRecord(address, beforeCampaignIds, beforeSubmissionIds, beforeReportId);
      reconciliationInFlightRef.current = false;
      if (Object.keys(record).length) {
        updateLocalTx(localTxId, { ...record, status: "state_applied" });
      }
      setState({
        phase: Object.keys(record).length ? "applied" : "syncing",
        evmTx,
        genlayerTx,
        campaignId: record.campaignId ?? "",
        submissionId: record.submissionId ?? "",
        reportId: record.reportId ?? "",
        stillSyncing: !Object.keys(record).length,
        error: "",
      });
      if (Object.keys(record).length) {
        notifyProofPilotMutation({ method, address, from: address, evmTx, genlayerTx, ...record });
        onConfirmed?.({ evmTx, genlayerTx, ...record });
      } else {
        retryTimerRef.current = window.setTimeout(() => {
          checkDelayedRecord().catch(() => undefined);
        }, 10_000);
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
  const appliedLabel = method === "create_campaign" ? "Campaign recorded on-chain" : method === "run_review" ? "Review report recorded on-chain" : "Submission recorded on-chain";
  const phaseText = {
    idle: buttonLabel,
    preparing: "Preparing wallet transaction",
    wallet: "Waiting for wallet signature",
    sent: "Transaction sent",
    receipt: "Waiting for Bradbury confirmation",
    syncing: "Waiting for readable on-chain state",
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
          {state.phase === "syncing" ? <p className="mt-2 text-slate-400">The wallet transaction has an EVM receipt. ProofPilot is automatically checking Bradbury until the exact campaign, submission, or review report is readable.</p> : null}
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
          {state.campaignId ? (
            <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="font-semibold text-emerald-100">New campaign detected: {state.campaignId}</p>
              <a className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100" href={`/app/campaigns/${state.campaignId}`}>Open campaign</a>
            </div>
          ) : null}
          {state.reportId ? (
            <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="font-semibold text-emerald-100">New review report detected: {state.reportId}</p>
              <a className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100" href={`/app/reports/${state.reportId}`}>Open report</a>
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
