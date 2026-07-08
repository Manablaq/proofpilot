import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";
import { isHex } from "@/lib/proofpilot-schema";
import { canonicalAddress } from "@/lib/address";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ address: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { address } = await context.params;
  const builder = canonicalAddress(address);

  if (!isHex(builder, 42)) {
    return NextResponse.json({ ok: false, error: "Invalid builder address" }, { status: 400 });
  }

  try {
    const profile = await readProofPilot("get_builder_profile", [builder]);
    return NextResponse.json({ ok: true, source: "genlayer", data: profile });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Builder profile unavailable" },
      { status: 502 },
    );
  }
}
