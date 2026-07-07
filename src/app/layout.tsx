import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPilot | AI consensus review for the builder economy",
  description:
    "ProofPilot verifies live project evidence, scores submissions with transparent rubrics, and publishes on-chain review reports with GenLayer Intelligent Contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
