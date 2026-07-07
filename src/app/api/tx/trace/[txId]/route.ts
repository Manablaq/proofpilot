import { NextResponse } from "next/server";
import { getGenLayerTransaction, traceGenLayerTransaction } from "@/lib/genlayer-read";
import { isHex } from "@/lib/proofpilot-schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ txId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { txId } = await context.params;

  if (!isHex(txId, 66)) {
    return NextResponse.json({ ok: false, error: "Invalid transaction id" }, { status: 400 });
  }

  try {
    const [transaction, trace] = await Promise.all([
      getGenLayerTransaction(txId),
      traceGenLayerTransaction(txId).catch((error) => ({
        unavailable: true,
        error: error instanceof Error ? error.message : "Trace unavailable",
      })),
    ]);

    return NextResponse.json({
      ok: true,
      source: "genlayer",
      data: { transaction, trace },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Transaction trace unavailable" },
      { status: 502 },
    );
  }
}
