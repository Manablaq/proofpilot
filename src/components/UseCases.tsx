"use client";

import { motion } from "framer-motion";

const cases = [
  "Grants",
  "Hackathons",
  "DAO bounties",
  "Web3 submissions",
  "Open-source reviews",
  "AI agent task verification",
];

export function UseCases() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cases.map((item, index) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04, duration: 0.35 }}
          className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-white shadow-glass"
        >
          <div className="mb-5 h-1 w-12 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" />
          <p className="text-lg font-semibold">{item}</p>
        </motion.div>
      ))}
    </div>
  );
}
