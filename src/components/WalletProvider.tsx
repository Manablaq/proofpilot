"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { testnetBradbury } from "genlayer-js/chains";
import { connectWallet, ensureBradburyNetwork, getProvider, getWalletChainId } from "@/lib/wallet";

const disconnectKey = "proofpilot_wallet_disconnected";

type WalletContextValue = {
  address: string;
  chainId: string;
  error: string;
  busy: boolean;
  locallyDisconnected: boolean;
  wrongNetwork: boolean;
  expectedChainId: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refresh: (ignoreLocalDisconnect?: boolean) => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locallyDisconnected, setLocallyDisconnected] = useState(false);
  const expectedChainId = `0x${testnetBradbury.id.toString(16)}`;

  const refresh = useCallback(async (ignoreLocalDisconnect = false) => {
    const provider = getProvider();
    if (!provider) {
      setError("No browser wallet detected.");
      return;
    }

    const disconnected = window.localStorage.getItem(disconnectKey) === "1";
    setLocallyDisconnected(disconnected);
    const [accounts, currentChainId] = await Promise.all([
      provider.request<string[]>({ method: "eth_accounts" }),
      getWalletChainId(),
    ]);
    setAddress(disconnected && !ignoreLocalDisconnect ? "" : accounts[0] ?? "");
    setChainId(currentChainId);
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
    const provider = getProvider();
    if (!provider?.on) {
      return;
    }

    const onAccountsChanged = (accounts: unknown) => {
      if (window.localStorage.getItem(disconnectKey) === "1") {
        setAddress("");
        return;
      }
      setAddress(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "");
    };
    const onChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === "string") {
        setChainId(nextChainId);
      }
    };

    provider.on("accountsChanged", onAccountsChanged);
    provider.on("chainChanged", onChainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, [refresh]);

  const connect = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      window.localStorage.removeItem(disconnectKey);
      setLocallyDisconnected(false);
      const next = await connectWallet();
      setAddress(next);
      await refresh(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const disconnect = useCallback(() => {
    window.localStorage.setItem(disconnectKey, "1");
    setLocallyDisconnected(true);
    setAddress("");
  }, []);

  const switchNetwork = useCallback(async () => {
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
  }, [refresh]);

  const value = useMemo<WalletContextValue>(() => ({
    address,
    chainId,
    error,
    busy,
    locallyDisconnected,
    wrongNetwork: Boolean(chainId && chainId !== expectedChainId),
    expectedChainId,
    connect,
    disconnect,
    switchNetwork,
    refresh,
  }), [address, busy, chainId, connect, disconnect, error, expectedChainId, locallyDisconnected, refresh, switchNetwork]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return value;
}
