"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type StatsChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function StatsChartCard({
  title,
  subtitle,
  children,
}: StatsChartCardProps) {
  return (
    <motion.section
      whileHover={{ y: -8, scale: 1.018 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-xl shadow-[0_22px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]"
    >
      {/* Ambient corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#C21A27]/[0.08] blur-3xl" />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

      <h2 className="relative text-2xl font-semibold tracking-tight text-white/90 transition duration-300 group-hover:text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="relative mt-2 text-sm leading-7 text-white/38">
          {subtitle}
        </p>
      )}

      <div className="relative mt-6">{children}</div>
    </motion.section>
  );
}
