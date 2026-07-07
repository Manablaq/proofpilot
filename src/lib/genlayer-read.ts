import "server-only";

import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { deployment } from "@/lib/deployment";

const client = createClient({
  chain: testnetBradbury,
  endpoint: deployment.rpc,
});

type ReadArg = string | number | boolean | null | ReadArg[] | { [key: string]: ReadArg };

function decodeReturn(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function readProofPilot(functionName: string, args: ReadArg[] = []) {
  await client.initializeConsensusSmartContract();

  const result = await client.readContract({
    address: deployment.contractAddress as `0x${string}`,
    functionName,
    args: args as never[],
  });

  return decodeReturn(result);
}

export async function getGenLayerTransaction(hash: string) {
  return client.getTransaction({ hash: hash as never });
}

export async function traceGenLayerTransaction(hash: string) {
  return client.debugTraceTransaction({ hash: hash as never, round: 0 });
}

export async function waitForAcceptedTransaction(hash: string) {
  return client.waitForTransactionReceipt({
    hash: hash as never,
    status: TransactionStatus.ACCEPTED,
    interval: 3000,
    retries: 20,
  });
}
