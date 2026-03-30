"use client";
import { useEffect, useRef, useState } from "react";

type GroupRow = { label: string; count: number };
type Props = { data: GroupRow[]; total?: number };
type Tier = 1 | 2 | 3 | 4;

function inferTier(role: string): Tier {
  const r = role.toLowerCase().trim();
  if (
    !r.includes("vice") &&
    !r.includes("co-") &&
    (r.includes("president") ||
      r === "ceo" ||
      r === "chair" ||
      r.includes("chairman") ||
      r.includes("chief executive") ||
      r === "general manager")
  )
    return 1;
  if (
    r.includes("vice president") ||
    r.startsWith("vp ") ||
    r === "vp" ||
    r.includes("co-president") ||
    r.includes("secretary general") ||
    r.includes("general secretary") ||
    r.includes("treasurer") ||
    r.includes("board") ||
    r.includes("director general") ||
    r.includes("coo") ||
    r.includes("cfo") ||
    r.includes("administrator")
  )
    return 2;
  if (
    r.startsWith("head") ||
    (r.includes("director") && !r.includes("board")) ||
    r.includes("project manager") ||
    r === "pm" ||
    r.includes("manager") ||
    r.includes("team lead") ||
    r.includes("lead")
  )
    return 3;
  return 4;
}

const SIZE: Record<"full" | "compact", Record<Tier, { w: number; h: number }>> =
  {
    full: {
      1: { w: 200, h: 100 },
      2: { w: 172, h: 90 },
      3: { w: 152, h: 82 },
      4: { w: 136, h: 74 },
    },
    compact: {
      1: { w: 148, h: 82 },
      2: { w: 128, h: 74 },
      3: { w: 114, h: 68 },
      4: { w: 102, h: 62 },
    },
  };

const H_GAP = 10;
const V_GAP = 48;

type PositionedNode = {
  label: string;
  count: number;
  tier: Tier;
  x: number;
  y: number;
  w: number;
  h: number;
  pct: string;
};

function buildLayout(
  tiers: Map<Tier, GroupRow[]>,
  mode: "full" | "compact",
  containerWidth: number,
): { nodes: PositionedNode[]; svgHeight: number } {
  const nodes: PositionedNode[] = [];
  let y = 0;
  const tierOrder: Tier[] = [1, 2, 3];
  const total = [...tiers.values()].flat().reduce((s, r) => s + r.count, 0);

  for (const tier of tierOrder) {
    const rows = tiers.get(tier);
    if (!rows || rows.length === 0) continue;
    const { w, h } = SIZE[mode][tier];
    const rowWidth = rows.length * w + (rows.length - 1) * H_GAP;
    const startX = Math.max(0, (containerWidth - rowWidth) / 2);
    rows.forEach((row, i) => {
      const pct = total > 0 ? ((row.count / total) * 100).toFixed(1) + "%" : "–";
      nodes.push({
        label: row.label,
        count: row.count,
        tier,
        x: startX + i * (w + H_GAP),
        y,
        w,
        h,
        pct,
      });
    });
    y += h + V_GAP;
  }

  return { nodes, svgHeight: y - V_GAP };
}

function buildSvgPaths(
  tiers: Map<Tier, GroupRow[]>,
  nodes: PositionedNode[],
): string {
  const tierOrder: Tier[] = [1, 2, 3];
  const paths: string[] = [];

  for (let i = 0; i < tierOrder.length - 1; i++) {
    const fromTier = tierOrder[i];
    const toTier = tierOrder[i + 1];
    const fromNodes = nodes.filter((n) => n.tier === fromTier);
    const toNodes = nodes.filter((n) => n.tier === toTier);
    if (fromNodes.length === 0 || toNodes.length === 0) continue;

    // midpoint between the two tiers
    const fromBottom = fromNodes[0].y + fromNodes[0].h;
    const toTop = toNodes[0].y;
    const midY = fromBottom + (toTop - fromBottom) / 2;

    // vertical from each "from" node center down to midY
    for (const fn of fromNodes) {
      const cx = fn.x + fn.w / 2;
      paths.push(`M ${cx} ${fn.y + fn.h} V ${midY}`);
    }

    // horizontal line spanning from leftmost to rightmost "to" node center
    const leftX = toNodes[0].x + toNodes[0].w / 2;
    const rightX = toNodes[toNodes.length - 1].x + toNodes[toNodes.length - 1].w / 2;
    if (leftX !== rightX) {
      paths.push(`M ${leftX} ${midY} H ${rightX}`);
    }

    // vertical drop from midY to each "to" node top
    for (const tn of toNodes) {
      const cx = tn.x + tn.w / 2;
      paths.push(`M ${cx} ${midY} V ${tn.y}`);
    }
  }

  return paths.join(" ");
}

function buildBasePaths(tier3Nodes: PositionedNode[], baseY: number): string {
  const paths: string[] = [];
  for (const n of tier3Nodes) {
    paths.push(`M ${n.x + n.w / 2} ${n.y + n.h} V ${baseY}`);
  }
  return paths.join(" ");
}

export default function JemeOrgChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setCw(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isWide = cw >= 560;
  const mode: "full" | "compact" = isWide ? "full" : "compact";

  // group into tiers, preserving order within each tier
  const tiers = new Map<Tier, GroupRow[]>();
  for (const row of data) {
    const tier = inferTier(row.label);
    if (!tiers.has(tier)) tiers.set(tier, []);
    tiers.get(tier)!.push(row);
  }

  if (isWide) {
    const { nodes, svgHeight } = buildLayout(tiers, mode, cw);
    const pathD = buildSvgPaths(tiers, nodes);

    const baseItems = tiers.get(4) ?? [];
    const baseY = baseItems.length > 0 ? svgHeight + V_GAP : svgHeight;
    const totalH = baseItems.length > 0 ? baseY + 80 : svgHeight;
    const tier3Nodes = nodes.filter((n) => n.tier === 3);
    const grandTotal = [...tiers.values()].flat().reduce((s, r) => s + r.count, 0);
    const basePathD = buildBasePaths(tier3Nodes, baseY);

    return (
      <div ref={containerRef} className="relative w-full select-none">
        <svg
          className="pointer-events-none absolute inset-0"
          width={cw}
          height={totalH}
          style={{ overflow: "visible" }}
        >
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
          )}
          {basePathD && (
            <path
              d={basePathD}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
          )}
        </svg>
        <div className="relative" style={{ height: totalH }}>
          {nodes.map((n) => (
            <div
              key={n.label}
              className="absolute"
              style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
            >
              <OrgNode
                label={n.label}
                count={n.count}
                pct={n.pct}
                tier={n.tier}
                w={n.w}
                h={n.h}
              />
            </div>
          ))}
          {baseItems.length > 0 && (
            <div className="absolute left-0" style={{ top: baseY, width: cw }}>
              <BaseBar items={baseItems} total={grandTotal} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // compact: stacked flex rows
  const tierOrder: Tier[] = [1, 2, 3];
  const total2 = data.reduce((s, r) => s + r.count, 0);
  const baseItems2 = tiers.get(4) ?? [];
  return (
    <div ref={containerRef} className="flex w-full flex-col gap-3">
      {tierOrder.map((tier, ti) => {
        const rows = tiers.get(tier);
        if (!rows || rows.length === 0) return null;
        const { w, h } = SIZE[mode][tier];
        return (
          <div key={tier}>
            {ti > 0 && (
              <div className="mx-auto mb-3 h-5 w-px bg-gradient-to-b from-white/[0.14] to-transparent" />
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {rows.map((row) => {
                const pct =
                  total2 > 0
                    ? ((row.count / total2) * 100).toFixed(1) + "%"
                    : "–";
                return (
                  <OrgNode
                    key={row.label}
                    label={row.label}
                    count={row.count}
                    pct={pct}
                    tier={tier}
                    w={w}
                    h={h}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      {baseItems2.length > 0 && (
        <>
          <div className="mx-auto h-5 w-px bg-gradient-to-b from-white/[0.14] to-transparent" />
          <BaseBar items={baseItems2} total={total2} />
        </>
      )}
    </div>
  );
}

const TIER_STYLES: Record<
  Tier,
  { border: string; bg: string; shadow: string; labelColor: string }
> = {
  1: {
    border: "border-[#C21A27]/[0.40]",
    bg: "bg-[#C21A27]/[0.10]",
    shadow:
      "shadow-[0_8px_28px_rgba(194,26,39,0.22),inset_0_1px_0_rgba(255,255,255,0.07)]",
    labelColor: "text-white/90",
  },
  2: {
    border: "border-white/[0.12]",
    bg: "bg-white/[0.055]",
    shadow:
      "shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]",
    labelColor: "text-white/80",
  },
  3: {
    border: "border-white/[0.08]",
    bg: "bg-white/[0.035]",
    shadow:
      "shadow-[0_4px_14px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)]",
    labelColor: "text-white/70",
  },
  4: {
    border: "border-white/[0.06]",
    bg: "bg-white/[0.02]",
    shadow: "shadow-[0_2px_10px_rgba(0,0,0,0.20)]",
    labelColor: "text-white/60",
  },
};

function BaseBar({ items, total }: { items: GroupRow[]; total: number }) {
  const s = TIER_STYLES[4];
  return (
    <div className="flex w-full gap-2">
      {items.map((item) => {
        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) + "%" : "–";
        return (
          <div
            key={item.label}
            className={`flex flex-1 items-center justify-between rounded-[20px] border px-6 py-4 backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 ${s.border} ${s.bg} ${s.shadow}`}
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/50">
              {item.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[1.4rem] font-bold leading-none text-white">{item.count}</span>
              <span className="text-[0.6rem] font-medium text-white/40">{pct}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrgNode({
  label,
  count,
  pct,
  tier,
  w,
  h,
}: {
  label: string;
  count: number;
  pct: string;
  tier: Tier;
  w: number;
  h: number;
}) {
  const s = TIER_STYLES[tier];
  const countSize =
    tier === 1
      ? "text-[1.35rem]"
      : tier === 2
        ? "text-[1.15rem]"
        : tier === 3
          ? "text-[1rem]"
          : "text-[0.875rem]";
  const labelSize =
    tier === 1
      ? "text-[0.7rem]"
      : tier === 2
        ? "text-[0.66rem]"
        : "text-[0.6rem]";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[16px] border backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1.5 ${s.border} ${s.bg} ${s.shadow}`}
      style={{ width: w, height: h }}
    >
      <span className={`font-bold leading-none text-white ${countSize}`}>
        {count}
      </span>
      <span className={`mt-0.5 font-medium leading-none text-white/40 text-[0.6rem]`}>
        {pct}
      </span>
      <span
        className={`mt-1.5 px-1 text-center font-medium leading-tight ${s.labelColor} ${labelSize}`}
        style={{ maxWidth: w - 8 }}
      >
        {label}
      </span>
    </div>
  );
}
