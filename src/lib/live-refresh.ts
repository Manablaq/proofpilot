"use client";

import { useEffect, useRef, useState } from "react";
import type { ProofPilotWriteMethod } from "@/lib/proofpilot-schema";

export const proofPilotMutationEvent = "proofpilot:mutation";
const storageKey = "proofpilot_last_mutation";
const channelName = "proofpilot_mutations";

export type ProofPilotMutationPayload = {
  method: ProofPilotWriteMethod;
  address?: string;
  from?: string;
  evmTx?: string;
  genlayerTx?: string;
  campaignId?: string;
  submissionId?: string;
  reportId?: string;
  appealId?: string;
  timestamp: number;
};

function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  return new BroadcastChannel(channelName);
}

export function notifyProofPilotMutation(payload: Omit<ProofPilotMutationPayload, "timestamp"> & { timestamp?: number }) {
  if (typeof window === "undefined") {
    return;
  }

  const fullPayload: ProofPilotMutationPayload = {
    ...payload,
    timestamp: payload.timestamp ?? Date.now(),
  };

  window.dispatchEvent(new CustomEvent<ProofPilotMutationPayload>(proofPilotMutationEvent, { detail: fullPayload }));
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(fullPayload));
  } catch {
  }

  const channel = getChannel();
  try {
    channel?.postMessage(fullPayload);
  } finally {
    channel?.close();
  }
}

export function subscribeProofPilotMutation(handler: (payload: ProofPilotMutationPayload) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onEvent = (event: Event) => {
    handler((event as CustomEvent<ProofPilotMutationPayload>).detail);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) {
      return;
    }
    try {
      handler(JSON.parse(event.newValue) as ProofPilotMutationPayload);
    } catch {
    }
  };
  const channel = getChannel();
  const onMessage = (event: MessageEvent<ProofPilotMutationPayload>) => handler(event.data);

  window.addEventListener(proofPilotMutationEvent, onEvent);
  window.addEventListener("storage", onStorage);
  channel?.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener(proofPilotMutationEvent, onEvent);
    window.removeEventListener("storage", onStorage);
    channel?.removeEventListener("message", onMessage);
    channel?.close();
  };
}

export function getProofPilotRefreshToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(storageKey) ?? "";
}

export function useProofPilotRefreshSignal() {
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(getProofPilotRefreshToken());
    return subscribeProofPilotMutation((payload) => setToken(String(payload.timestamp)));
  }, []);

  return token;
}

/**
 * Keeps read-only screens aligned with Bradbury without reloading the document.
 * Mutation events make a successful local write appear promptly; polling and
 * focus recovery cover delayed consensus and writes created in another tab.
 */
export function useProofPilotAutoRefresh(refresh: () => void | Promise<void>, intervalMs = 8_000) {
  const refreshRef = useRef(refresh);
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const queuedRef = useRef(false);

  refreshRef.current = refresh;

  useEffect(() => {
    let active = true;
    const run = () => {
      if (!active) return;
      if (runningRef.current) {
        queuedRef.current = true;
        return;
      }
      runningRef.current = true;
      Promise.resolve(refreshRef.current())
        .catch(() => undefined)
        .finally(() => {
          runningRef.current = false;
          if (active && queuedRef.current) {
            queuedRef.current = false;
            run();
          }
        });
    };
    const schedule = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(run, 250);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") schedule();
    };

    run();
    const unsubscribe = subscribeProofPilotMutation(schedule);
    const interval = window.setInterval(schedule, intervalMs);
    window.addEventListener("focus", schedule);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(interval);
      window.removeEventListener("focus", schedule);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [intervalMs]);
}
