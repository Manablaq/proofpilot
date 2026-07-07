"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";

export function VideoHero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero/proofpilot-hero-poster.jpg"
      >
        <source src="/hero/proofpilot-hero-bg.webm" type="video/webm" />
        <source src="/hero/proofpilot-hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.22),transparent_34rem),radial-gradient(circle_at_80%_15%,rgba(124,58,237,0.18),transparent_28rem)]" />
      <div className="absolute inset-0 bg-grid bg-[length:56px_56px] opacity-25" />
      <div className="noise absolute inset-0 opacity-35" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-white">
            ProofPilot
          </Link>
          <div className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
            <Link href="/app" className="transition hover:text-white">
              Launch App
            </Link>
            <Link href="/app/reports" className="transition hover:text-white">
              Reports
            </Link>
            <Link href="/app/builders" className="transition hover:text-white">
              Builders
            </Link>
          </div>
        </nav>

        <div className="flex flex-1 items-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl"
          >
            <StatusPill>Bradbury live · smoke test passed</StatusPill>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
              AI consensus review for the builder economy.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
              Verify live project evidence, score submissions with transparent rubrics,
              and publish on-chain review reports for grants, hackathons, bounties,
              and Web3 builders.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app"
                className="rounded-full bg-cyan-300 px-6 py-3 text-center text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-200"
              >
                Launch App
              </Link>
              <a
                href="#deployment"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                View Deployment
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
