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
      className="group relative overflow-hidden rounded-[34px] border border-[#404040] bg-[#1C1C1C] p-7 shadow-[0_22px_54px_rgba(0,0,0,0.55)]"
    >
      {/* Ambient corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#A60F1A]/[0.18] blur-3xl" />

      <h2 className="relative text-2xl font-semibold tracking-tight text-white transition duration-300">
        {title}
      </h2>

      {subtitle && (
        <p className="relative mt-2 text-sm leading-7 text-[#A6A6A6]">
          {subtitle}
        </p>
      )}

      <div className="relative mt-6">{children}</div>
    </motion.section>
  );
}
