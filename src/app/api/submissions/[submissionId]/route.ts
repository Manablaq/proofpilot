import { NextResponse } from "next/server";
import { readProofPilot } from "@/lib/genlayer-read";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ submissionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { submissionId } = await context.params;

  try {
    const submission = await readProofPilot("get_submission", [submissionId]);
    return NextResponse.json({ ok: true, source: "genlayer", data: submission });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Submission unavailable" },
      { status: 502 },
    );
  }
}
