"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { matrixKeyToSeniorityCanonical } from "../lib/seniority";

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
  { max: 0.00, cls: "border-[#404040]/30 bg-[#1A1A1A]" },
  { max: 0.15, cls: "border-[#A60F1A]/[0.12] bg-[#A60F1A]/[0.07]" },
  { max: 0.30, cls: "border-[#A60F1A]/[0.20] bg-[#A60F1A]/[0.16]" },
  { max: 0.50, cls: "border-[#A60F1A]/[0.28] bg-[#A60F1A]/[0.27] shadow-[0_0_10px_rgba(166,15,26,0.18)]" },
  { max: 0.70, cls: "border-[#A60F1A]/[0.38] bg-[#A60F1A]/[0.38] shadow-[0_0_16px_rgba(166,15,26,0.28)]" },
  { max: 1.01, cls: "border-[#A60F1A]/[0.52] bg-[#A60F1A]/[0.52] shadow-[0_0_22px_rgba(166,15,26,0.42)]" },
];

function intensityCls(ratio: number): string {
  if (ratio === 0) return INTENSITY[0].cls;
  return (INTENSITY.find((l) => ratio <= l.max) ?? INTENSITY[INTENSITY.length - 1]).cls;
}

export default function AgeSeniorityMatrix({ data }: { data: AgeBySeniorityRow[] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState<{ row: string; col: SeniorityKey } | null>(null);

  if (!data.length) return <div className="text-sm text-[#737373]">No data available.</div>;

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
        {KEYS.map((k) => {
          const seniorityCanonical = matrixKeyToSeniorityCanonical(k);
          return (
            <div
              key={k}
              className={`text-center text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-150 ${
                hovered?.col === k ? "text-[#E6E6E6]" : "text-[#737373]"
              } ${seniorityCanonical ? "cursor-pointer hover:text-[#E6E6E6]" : ""}`}
              onClick={() => {
                if (seniorityCanonical) router.push(`/directory/alumni?seniority=${encodeURIComponent(seniorityCanonical)}`);
              }}
              role={seniorityCanonical ? "button" : undefined}
              tabIndex={seniorityCanonical ? 0 : undefined}
              onKeyDown={seniorityCanonical ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/directory/alumni?seniority=${encodeURIComponent(seniorityCanonical)}`); } } : undefined}
            >
              {k}
            </div>
          );
        })}
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
              className={`cursor-pointer pr-1 text-right text-[11px] font-medium transition-colors duration-150 hover:text-[#E6E6E6] ${
                hovered?.row === row.ageGroup ? "text-[#E6E6E6]" : "text-[#737373]"
              }`}
              onClick={() => router.push(`/directory/alumni?ageGroup=${encodeURIComponent(row.ageGroup)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/directory/alumni?ageGroup=${encodeURIComponent(row.ageGroup)}`); } }}
            >
              {row.ageGroup}
            </div>

            {KEYS.map((k) => {
              const val = row[k];
              const ratio = val / maxVal;
              const isHov = hovered?.row === row.ageGroup && hovered?.col === k;
              const seniorityCanonical = matrixKeyToSeniorityCanonical(k);
              return (
                <div
                  key={k}
                  className={`flex h-10 items-center justify-center rounded-[10px] border transition-all duration-150 ${intensityCls(ratio)} ${
                    isHov ? "scale-105 ring-1 ring-white/[0.18]" : ""
                  } ${val > 0 ? "cursor-pointer" : ""}`}
                  onMouseEnter={() => { if (val > 0) setHovered({ row: row.ageGroup, col: k }); }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    if (val === 0) return;
                    let href = `/directory/alumni?ageGroup=${encodeURIComponent(row.ageGroup)}`;
                    if (seniorityCanonical) href += `&seniority=${encodeURIComponent(seniorityCanonical)}`;
                    router.push(href);
                  }}
                  role={val > 0 ? "button" : undefined}
                  tabIndex={val > 0 ? 0 : undefined}
                  onKeyDown={val > 0 ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      let href = `/directory/alumni?ageGroup=${encodeURIComponent(row.ageGroup)}`;
                      if (seniorityCanonical) href += `&seniority=${encodeURIComponent(seniorityCanonical)}`;
                      router.push(href);
                    }
                  } : undefined}
                >
                  {val > 0 && (
                    <span
                      className={`text-[11px] font-bold leading-none transition-colors duration-150 ${
                        isHov ? "text-white" : ratio > 0.4 ? "text-white" : "text-[#A6A6A6]"
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
            ? "border-[#404040] bg-[#1C1C1C] opacity-100"
            : "border-transparent opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[1.25rem] font-bold text-[#A60F1A]">{hoveredVal ?? "–"}</span>
            <span className="text-[11px] text-[#737373]">alumni</span>
          </div>
          <div className="h-4 w-px bg-[#404040]" />
          <div className="text-[11px] text-[#A6A6A6]">
            <span className="font-semibold text-[#E6E6E6]">{hovered?.row}</span>
            <span className="mx-1.5 text-[#737373]">·</span>
            <span className="font-semibold text-[#E6E6E6]">{hovered?.col}</span>
            {" "}level
          </div>
        </div>
      </div>
    </div>
  );
}
