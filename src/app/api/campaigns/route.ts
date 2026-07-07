import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

export async function GET() {
  try {
    const campaigns = await readProofPilot("list_campaigns", [0, 10]);

    return NextResponse.json({
      ok: true,
      source: "genlayer",
      data: campaigns,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown read error",
      },
      { status: 502 },
    );
  }
}
