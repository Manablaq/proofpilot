import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

/** Public report-linked retrieval for appeals and human decisions. */
export async function GET(_request: Request, context: RouteContext) {
  const { reportId } = await context.params;
  try {
    const record = await readProofPilot("get_report_decisions", [reportId]);
    return NextResponse.json({ ok: true, source: "genlayer", data: record });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Decision record unavailable" },
      { status: 502 },
    );
  }
}
