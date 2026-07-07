"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";

const steps = [
  "Create campaign",
  "Submit project evidence",
  "Fetch live proof",
  "Run AI consensus review",
  "Publish report",
  "Request re-check or appeal",
];

export function HowItWorks() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: index * 0.05, duration: 0.45 }}
        >
          <GlassCard className="h-full p-6">
            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-200/10 text-sm font-semibold text-cyan-100">
              {index + 1}
            </div>
            <h3 className="text-xl font-semibold text-white">{step}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              ProofPilot keeps each step structured, auditable, and connected to
              campaign, submission, evidence, report, and builder profile records.
            </p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
