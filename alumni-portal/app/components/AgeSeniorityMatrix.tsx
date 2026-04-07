"use client";
import { useState } from "react";

type AgeBySeniorityRow = {
  ageGroup: string;
  Entry: number;
  Mid: number;
  Executive: number;
  Other: number;
};

type SeniorityKey = keyof Omit<AgeBySeniorityRow, "ageGroup">;

const KEYS: SeniorityKey[] = ["Entry", "Mid", "Executive", "Other"];

// Complete literal strings so Tailwind v4 scanner picks them up
const INTENSITY: { max: number; cls: string }[] = [
  { max: 0.00, cls: "border-white/[0.05] bg-white/[0.03]" },
  { max: 0.15, cls: "border-[#C21A27]/[0.12] bg-[#C21A27]/[0.07]" },
  { max: 0.30, cls: "border-[#C21A27]/[0.20] bg-[#C21A27]/[0.16]" },
  { max: 0.50, cls: "border-[#C21A27]/[0.28] bg-[#C21A27]/[0.27] shadow-[0_0_10px_rgba(194,26,39,0.18)]" },
  { max: 0.70, cls: "border-[#C21A27]/[0.38] bg-[#C21A27]/[0.38] shadow-[0_0_16px_rgba(194,26,39,0.28)]" },
  { max: 1.01, cls: "border-[#C21A27]/[0.52] bg-[#C21A27]/[0.52] shadow-[0_0_22px_rgba(194,26,39,0.42)]" },
];

function intensityCls(ratio: number): string {
  if (ratio === 0) return INTENSITY[0].cls;
  return (INTENSITY.find((l) => ratio <= l.max) ?? INTENSITY[INTENSITY.length - 1]).cls;
}

export default function AgeSeniorityMatrix({ data }: { data: AgeBySeniorityRow[] }) {
  const [hovered, setHovered] = useState<{ row: string; col: SeniorityKey } | null>(null);

  if (!data.length) return <div className="text-sm text-white/40">No data available.</div>;

  const maxVal = Math.max(...data.flatMap((row) => KEYS.map((k) => row[k])), 1);
  const hoveredVal =
    hovered != null
      ? (data.find((r) => r.ageGroup === hovered.row)?.[hovered.col] ?? 0)
      : null;

  return (
    <div className="select-none">
      {/* Column headers */}
      <div
        className="mb-3 grid gap-2"
        style={{ gridTemplateColumns: `68px repeat(${KEYS.length}, minmax(0, 1fr))` }}
      >
        <div />
        {KEYS.map((k) => (
          <div
            key={k}
            className={`text-center text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-150 ${
              hovered?.col === k ? "text-white/80" : "text-white/30"
            }`}
          >
            {k}
          </div>
        ))}
      </div>

      {/* Matrix rows */}
      <div className="space-y-2">
        {data.map((row) => (
          <div
            key={row.ageGroup}
            className="grid items-center gap-2"
            style={{ gridTemplateColumns: `68px repeat(${KEYS.length}, minmax(0, 1fr))` }}
          >
            <div
              className={`pr-1 text-right text-[11px] font-medium transition-colors duration-150 ${
                hovered?.row === row.ageGroup ? "text-white/80" : "text-white/35"
              }`}
            >
              {row.ageGroup}
            </div>

            {KEYS.map((k) => {
              const val = row[k];
              const ratio = val / maxVal;
              const isHov = hovered?.row === row.ageGroup && hovered?.col === k;
              return (
                <div
                  key={k}
                  className={`flex h-10 items-center justify-center rounded-[10px] border backdrop-blur-sm transition-all duration-150 ${intensityCls(ratio)} ${
                    isHov ? "scale-105 ring-1 ring-white/[0.18]" : ""
                  }`}
                  onMouseEnter={() => {
                    if (val > 0) setHovered({ row: row.ageGroup, col: k });
                  }}
                  onMouseLeave={() => setHovered(null)}
                >
                  {val > 0 && (
                    <span
                      className={`text-[11px] font-bold leading-none transition-colors duration-150 ${
                        isHov ? "text-white" : ratio > 0.4 ? "text-white/82" : "text-white/48"
                      }`}
                    >
                      {val}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Info strip — reserves space always, fades in on hover */}
      <div
        className={`mt-5 rounded-[16px] border px-4 py-3 transition-all duration-200 ${
          hovered && hoveredVal
            ? "border-white/[0.08] bg-white/[0.04] opacity-100"
            : "border-transparent opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[1.25rem] font-bold text-[#C21A27]">{hoveredVal ?? "–"}</span>
            <span className="text-[11px] text-white/35">alumni</span>
          </div>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="text-[11px] text-white/50">
            <span className="font-semibold text-white/75">{hovered?.row}</span>
            <span className="mx-1.5 text-white/22">·</span>
            <span className="font-semibold text-white/75">{hovered?.col}</span>
            {" "}level
          </div>
        </div>
      </div>
    </div>
  );
}
