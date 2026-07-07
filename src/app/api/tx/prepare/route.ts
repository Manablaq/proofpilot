import { NextResponse } from "next/server";
import { abi as genlayerAbi } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { encodeFunctionData } from "viem";
import { deployment } from "@/lib/deployment";
import { validatePrepareInput } from "@/lib/tx-validation";

export const runtime = "nodejs";

function addTransactionInputs() {
  const fn = testnetBradbury.consensusMainContract?.abi?.find(
    (item) => {
      const candidate = item as { type?: string; name?: string };
      return candidate.type === "function" && candidate.name === "addTransaction";
    },
  );
  const candidate = fn as { inputs?: unknown[] } | undefined;
  return Array.isArray(candidate?.inputs) ? candidate.inputs.length : 0;
}

export async function POST(request: Request) {
  try {
    const parsed = validatePrepareInput(await request.json());

    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: "Invalid transaction request", details: parsed.errors }, { status: 400 });
    }

    const { method, from, args, gasLimit } = parsed.data;
    const calldataObject = genlayerAbi.calldata.makeCalldataObject(method, args, undefined);
    const methodData = genlayerAbi.calldata.encode(calldataObject);
    const txData = genlayerAbi.transactions.serialize([methodData, false]);
    const consensusAddress = testnetBradbury.consensusMainContract?.address;
    const consensusAbi = testnetBradbury.consensusMainContract?.abi;

    if (!consensusAddress || !consensusAbi) {
      return NextResponse.json({ ok: false, error: "Bradbury consensus contract unavailable" }, { status: 500 });
    }

    const baseArgs = [
      from,
      deployment.contractAddress,
      BigInt(testnetBradbury.defaultNumberOfInitialValidators),
      BigInt(testnetBradbury.defaultConsensusMaxRotations),
      txData,
    ] as const;
    const validUntil = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const encoded = encodeFunctionData({
      abi: consensusAbi,
      functionName: "addTransaction",
      args: addTransactionInputs() >= 6 ? [...baseArgs, validUntil] : [...baseArgs],
    });

    return NextResponse.json({
      ok: true,
      source: "genlayer",
      data: {
        method,
        to: consensusAddress,
        data: encoded,
        value: "0x0",
        chainId: testnetBradbury.id,
        gasLimit: gasLimit.toString(),
        recipient: deployment.contractAddress,
        validUntil: validUntil.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Could not prepare transaction" },
      { status: 500 },
    );
  }
}
