"use client";

import { parseEventLogs, type Hex } from "viem";
import { testnetBradbury } from "genlayer-js/chains";

type Provider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Provider;
  }
}

export type PreparedTransaction = {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  chainId: number;
  gasLimit: string;
};

export type TxReceipt = {
  transactionHash: `0x${string}`;
  status?: `0x${string}`;
  logs?: Array<{
    address: `0x${string}`;
    topics: `0x${string}`[];
    data: `0x${string}`;
  }>;
};

export function getProvider() {
  return typeof window !== "undefined" ? window.ethereum : undefined;
}

export async function connectWallet() {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No EIP-1193 wallet found. Install a browser wallet that supports Bradbury.");
  }

  const accounts = await provider.request<string[]>({ method: "eth_requestAccounts" });
  const address = accounts[0];

  if (!address) {
    throw new Error("No wallet account returned.");
  }

  return address as `0x${string}`;
}

export async function getWalletChainId() {
  const provider = getProvider();
  if (!provider) {
    return "";
  }

  return provider.request<string>({ method: "eth_chainId" });
}

export async function ensureBradburyNetwork() {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No browser wallet available.");
  }

  const chainId = `0x${testnetBradbury.id.toString(16)}`;
  const current = await provider.request<string>({ method: "eth_chainId" });

  if (current === chainId) {
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId,
        chainName: testnetBradbury.name,
        nativeCurrency: testnetBradbury.nativeCurrency,
        rpcUrls: [...testnetBradbury.rpcUrls.default.http],
        blockExplorerUrls: testnetBradbury.blockExplorers?.default?.url ? [testnetBradbury.blockExplorers.default.url] : [],
      }],
    });
  }
}

export async function sendPreparedTransaction(from: string, tx: PreparedTransaction) {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No browser wallet available.");
  }

  await ensureBradburyNetwork();

  return provider.request<`0x${string}`>({
    method: "eth_sendTransaction",
    params: [{
      from,
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gas: `0x${BigInt(tx.gasLimit).toString(16)}`,
      chainId: `0x${tx.chainId.toString(16)}`,
    }],
  });
}

export async function waitForEvmReceipt(hash: `0x${string}`, maxAttempts = 80) {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No browser wallet available.");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const receipt = await provider.request<TxReceipt | null>({
      method: "eth_getTransactionReceipt",
      params: [hash],
    });

    if (receipt) {
      return receipt;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error("Timed out waiting for EVM receipt.");
}

export function extractGenLayerTxId(receipt: TxReceipt) {
  try {
    const logs = parseEventLogs({
      abi: testnetBradbury.consensusMainContract?.abi ?? [],
      eventName: "NewTransaction",
      logs: (receipt.logs?.map((log) => ({
        address: log.address,
        topics: log.topics,
        data: log.data,
      })) ?? []) as never[],
    });

    const first = logs[0] as { args?: { txId?: unknown } } | undefined;
    const txId = first?.args?.txId ?? null;
    return typeof txId === "string" ? txId as Hex : null;
  } catch {
    return null;
  }
}
