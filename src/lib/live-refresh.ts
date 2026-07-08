"use client";

import { useEffect, useState } from "react";
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
  submissionId?: string;
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
