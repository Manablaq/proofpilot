export const dynamic = "force-static";

/**
 * Stable, compact evidence for machine verification by the ProofPilot contract.
 *
 * This is deliberately plain text: a validator only needs a short, public,
 * cache-friendly description and links to the human-facing application and code.
 */
export function GET() {
  return new Response(
    [
      "ProofPilot public evidence.",
      "ProofPilot is a GenLayer application for AI consensus review of builder project evidence.",
      "The live product lets campaign owners and builders create campaigns, submit public evidence, and inspect immutable review reports.",
      "Public app: https://proofpilot-two.vercel.app",
      "Source repository: https://github.com/Manablaq/proofpilot",
      "Documentation: https://github.com/Manablaq/proofpilot#readme",
      "Scope: public resource reachability and transparent review signals; no legal ownership or universal-quality claim.",
    ].join("\n"),
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
