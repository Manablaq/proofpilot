import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { campaignId } = await context.params;

  try {
    const campaign = await readProofPilot("get_campaign", [campaignId]);

    return NextResponse.json({
      ok: true,
      source: "genlayer",
      data: campaign,
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
