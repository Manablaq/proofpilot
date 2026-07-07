import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ snapshotId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { snapshotId } = await context.params;

  try {
    const snapshot = await readProofPilot("get_evidence_snapshot", [snapshotId]);
    return NextResponse.json({ ok: true, source: "genlayer", data: snapshot });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Snapshot unavailable" },
      { status: 502 },
    );
  }
}
