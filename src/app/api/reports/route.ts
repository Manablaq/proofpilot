import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId") ?? "";
  const submissionId = searchParams.get("submissionId") ?? "";
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "25");

  if (offset < 0 || limit <= 0 || limit > 100) {
    return NextResponse.json({ ok: false, error: "Invalid pagination" }, { status: 400 });
  }

  try {
    const reports = await readProofPilot("list_reports", [campaignId, submissionId, offset, limit]);
    return NextResponse.json({ ok: true, source: "genlayer", data: reports });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Report list unavailable" },
      { status: 502 },
    );
  }
}
