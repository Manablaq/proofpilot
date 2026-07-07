import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { reportId } = await context.params;

  try {
    const report = await readProofPilot("get_report", [reportId]);
    return NextResponse.json({ ok: true, source: "genlayer", data: report });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Report unavailable" },
      { status: 502 },
    );
  }
}
