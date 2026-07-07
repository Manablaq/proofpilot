import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId") ?? "";
  const builder = searchParams.get("builder") ?? "";
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "25");

  if (offset < 0 || limit <= 0 || limit > 100) {
    return NextResponse.json({ ok: false, error: "Invalid pagination" }, { status: 400 });
  }

  try {
    const submissions = await readProofPilot("list_submissions", [campaignId, builder, offset, limit]);
    return NextResponse.json({ ok: true, source: "genlayer", data: submissions });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Submission list unavailable" },
      { status: 502 },
    );
  }
}
