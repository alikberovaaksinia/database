"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type GroupRow = { label: string; count: number };

function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const t = 0.38;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function AgeWaveChart({ data }: { data: GroupRow[] }) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);

  if (!data.length) return null;

  const VW = 600;
  const VH = 168;
  const PX = 20;
  const PT = 24;
  const PB = 28;
  const waveH = VH - PT - PB;

  const maxCount = Math.max(...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  const pts = data.map((d, i) => ({
    x: PX + (i / Math.max(data.length - 1, 1)) * (VW - PX * 2),
    y: PT + waveH - (d.count / maxCount) * waveH * 0.9,
    label: d.label,
    count: d.count,
    pct: ((d.count / total) * 100).toFixed(1),
  }));

  const baseY = PT + waveH;
  const linePath = catmullRomPath(pts);
  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;

  function handleEnter(i: number) {
    setHovered(i);
    if (svgRef.current) {
      const r = svgRef.current.getBoundingClientRect();
      setTipPos({ x: (pts[i].x / VW) * r.width, y: (pts[i].y / VH) * r.height });
    }
  }

  return (
    <div className="relative select-none">
      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="awFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#A60F1A" stopOpacity="0.50" />
            <stop offset="75%"  stopColor="#A60F1A" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#A60F1A" stopOpacity="0" />
          </linearGradient>
          <filter id="awDotGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Baseline */}
        <line
          x1={PX} y1={baseY} x2={VW - PX} y2={baseY}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />

        {/* Fill */}
        <path d={fillPath} fill="url(#awFill)" />

        {/* Wave stroke */}
        <path
          d={linePath}
          fill="none"
          stroke={hovered !== null ? "rgba(166,15,26,0.90)" : "rgba(166,15,26,0.60)"}
          strokeWidth="1.5"
          style={{ transition: "stroke 0.2s" }}
        />

        {/* Vertical guide on hover */}
        {hovered !== null && (
          <line
            x1={pts[hovered].x} y1={PT / 2}
            x2={pts[hovered].x} y2={baseY}
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 4"
          />
        )}

        {/* Dots */}
        {pts.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={hovered === i ? 5 : 3}
            fill={hovered === i ? "#A60F1A" : "rgba(166,15,26,0.50)"}
            filter={hovered === i ? "url(#awDotGlow)" : undefined}
            style={{ transition: "r 0.15s, fill 0.15s" }}
          />
        ))}

        {/* X labels */}
        {pts.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={baseY + 16}
            textAnchor="middle"
            fontSize="9"
            fill={hovered === i ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.28)"}
            fontFamily="inherit"
            style={{ transition: "fill 0.15s" }}
          >
            {pt.label}
          </text>
        ))}

        {/* Hover zones */}
        {pts.map((pt, i) => {
          void pt;
          const x0 = i === 0 ? 0 : (pts[i - 1].x + pts[i].x) / 2;
          const x1 = i === pts.length - 1 ? VW : (pts[i].x + pts[i + 1].x) / 2;
          return (
            <rect
              key={i}
              x={x0} y={0} width={x1 - x0} height={VH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={() => { setHovered(null); setTipPos(null); }}
              onClick={() => router.push(`/directory/alumni?ageGroup=${encodeURIComponent(pts[i].label)}`)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered !== null && tipPos && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[14px] border border-[#404040] bg-[#1A1A1A] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.6)]"
          style={{ left: tipPos.x, top: tipPos.y - 12 }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A6A6A6]">
            {pts[hovered].label}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[1.2rem] font-bold leading-none text-[#A60F1A]">
              {pts[hovered].count}
            </span>
            <span className="text-[10px] text-[#737373]">{pts[hovered].pct}%</span>
          </div>
          <div className="mt-0.5 text-[10px] text-[#737373]">alumni</div>
        </div>
      )}
    </div>
  );
}
