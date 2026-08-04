import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ appealId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { appealId } = await context.params;
  try {
    const appeal = await readProofPilot("get_appeal", [appealId]);
    return NextResponse.json({ ok: true, source: "genlayer", data: appeal });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Appeal unavailable" },
      { status: 502 },
    );
  }
}
