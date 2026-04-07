"use client";

import { useState } from "react";

type GroupRow = {
  label: string;
  count: number;
};

const PALETTE = [
  "#8F1320",
  "#C21A27",
  "#D94A57",
  "#A81A28",
  "#B84C5A",
  "#6E0D15",
  "#E07080",
  "#943040",
  "#CF6878",
  "#7A1E28",
];

function toRad(deg: number) {
  return (deg - 90) * (Math.PI / 180);
}

function r3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function sectorPath(
  cx: number, cy: number,
  ro: number, ri: number,
  a0: number, a1: number,
): string {
  const large = a1 - a0 > 180 ? 1 : 0;
  const c0 = Math.cos(toRad(a0)), s0 = Math.sin(toRad(a0));
  const c1 = Math.cos(toRad(a1)), s1 = Math.sin(toRad(a1));
  return [
    `M ${r3(cx + ro * c0)} ${r3(cy + ro * s0)}`,
    `A ${ro} ${ro} 0 ${large} 1 ${r3(cx + ro * c1)} ${r3(cy + ro * s1)}`,
    `L ${r3(cx + ri * c1)} ${r3(cy + ri * s1)}`,
    `A ${ri} ${ri} 0 ${large} 0 ${r3(cx + ri * c0)} ${r3(cy + ri * s0)}`,
    "Z",
  ].join(" ");
}

export default function IndustryWheel({
  data,
  total,
}: {
  data: GroupRow[];
  total?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="text-sm text-white/40">No data available.</div>;
  }

  const items = data.slice(0, 10);
  const sum = items.reduce((s, d) => s + d.count, 0);
  const effectiveTotal = total ?? sum;

  const cx = 160, cy = 160, ro = 138, ri = 68, GAP = 1.5;

  const spans = items.map((item) => (item.count / sum) * 360);
  const offsets = spans.reduce<number[]>(
    (acc, span) => [...acc, acc[acc.length - 1] + span],
    [0],
  );
  const sectors = items.map((item, i) => {
    const span = spans[i];
    const a0 = offsets[i] + GAP / 2;
    const a1 = offsets[i] + span - GAP / 2;
    const mid = (a0 + a1) / 2;
    const midRad = toRad(mid);
    return {
      item,
      path: sectorPath(cx, cy, ro, ri, a0, a1),
      color: PALETTE[i % PALETTE.length],
      tx: r3(Math.cos(midRad) * 8),
      ty: r3(Math.sin(midRad) * 8),
    };
  });

  const active = hovered !== null ? sectors[hovered] : null;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">

      {/* ── Wheel ── */}
      <div className="mx-auto shrink-0 md:mx-0">
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="overflow-visible drop-shadow-[0_0_40px_rgba(194,26,39,0.14)]"
        >
          <defs>
            <radialGradient id="iw-center" cx="38%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#C21A27" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#0C0A0D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {sectors.map((s, i) => (
            <path
              key={s.item.label}
              d={s.path}
              fill={s.color}
              style={{
                transform: hovered === i
                  ? `translate(${s.tx}px, ${s.ty}px)`
                  : "translate(0,0)",
                transition:
                  "transform 220ms cubic-bezier(.22,1,.36,1), filter 220ms ease, opacity 220ms ease",
                filter:
                  hovered === i
                    ? `drop-shadow(0 0 12px ${s.color}90) brightness(1.18)`
                    : "none",
                opacity: hovered !== null && hovered !== i ? 0.42 : 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Center disc */}
          <circle cx={cx} cy={cy} r={ri - 3} fill="#0C0A0D" />
          <circle cx={cx} cy={cy} r={ri - 3} fill="url(#iw-center)" />

          {/* Center — default */}
          {active === null && (
            <>
              <text x={cx} y={cy - 7} textAnchor="middle"
                fill="white" fontSize="26" fontWeight="700"
                style={{ fontFamily: "inherit" }}>
                {items.length}
              </text>
              <text x={cx} y={cy + 13} textAnchor="middle"
                fill="rgba(255,255,255,0.36)" fontSize="8.5" fontWeight="600"
                letterSpacing="2" style={{ fontFamily: "inherit" }}>
                INDUSTRIES
              </text>
            </>
          )}

          {/* Center — hovered */}
          {active !== null && (
            <>
              <text x={cx} y={cy - 12} textAnchor="middle"
                fill="white" fontSize="24" fontWeight="700"
                style={{ fontFamily: "inherit" }}>
                {active.item.count}
              </text>
              <text x={cx} y={cy + 5} textAnchor="middle"
                fill="rgba(255,255,255,0.52)" fontSize="8" fontWeight="600"
                letterSpacing="1.5" style={{ fontFamily: "inherit" }}>
                {active.item.label.length > 12
                  ? active.item.label.slice(0, 11) + "…"
                  : active.item.label.toUpperCase()}
              </text>
              <text x={cx} y={cy + 22} textAnchor="middle"
                fill="rgba(255,255,255,0.28)" fontSize="9"
                style={{ fontFamily: "inherit" }}>
                {effectiveTotal > 0
                  ? `${((active.item.count / effectiveTotal) * 100).toFixed(1)}%`
                  : ""}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-1 flex-col justify-center gap-1 md:py-3">
        {sectors.map((s, i) => {
          const pct =
            effectiveTotal > 0
              ? ((s.item.count / effectiveTotal) * 100).toFixed(1)
              : "0";
          const isActive = hovered === i;
          return (
            <div
              key={s.item.label}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200"
              style={{
                background: isActive ? `${s.color}1E` : "transparent",
                opacity: hovered !== null && !isActive ? 0.42 : 1,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm transition-shadow duration-200"
                style={{
                  backgroundColor: s.color,
                  boxShadow: isActive ? `0 0 8px ${s.color}` : "none",
                }}
              />
              <span
                className="min-w-0 flex-1 truncate text-sm transition-colors duration-200"
                style={{
                  color: isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.62)",
                }}
              >
                {s.item.label}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-white/38">
                {s.item.count}
              </span>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-white/22">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
