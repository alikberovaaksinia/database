"use client";

type GroupRow = {
  label: string;
  count: number;
};

const BAR_GRADIENTS = [
  "from-[#2C0810] via-[#6A1020] to-[#A81A30]", // 1. deep burgundy    — top bar
  "from-[#480D18] via-[#8F1825] to-[#BE2035]", // 2. dark wine
  "from-[#5C0D14] via-[#B01A24] to-[#D02D3C]", // 3. crimson
  "from-[#5A1018] via-[#A02030] to-[#C84050]", // 4. mid red
  "from-[#4A1022] via-[#88283A] to-[#B85068]", // 5. soft rose         — bottom bars
];

export default function CountryBarChart({
  data,
  total,
}: {
  data: GroupRow[];
  total?: number;
}) {
  if (data.length === 0) {
    return <div className="text-sm text-white/40">No data available.</div>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const effectiveTotal = total ?? data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="w-full select-none">
      <div className="relative flex items-end gap-[5px]" style={{ height: "224px" }}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.12]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[25%] h-px bg-white/[0.06]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[50%] h-px bg-white/[0.06]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[75%] h-px bg-white/[0.06]" />

        {data.map((item, index) => {
          const heightPct = Math.sqrt(item.count / max) * 100;
          const pct =
            effectiveTotal > 0
              ? ((item.count / effectiveTotal) * 100).toFixed(1)
              : "0";
          const gradient = BAR_GRADIENTS[
            Math.min(
              Math.round((index / Math.max(data.length - 1, 1)) * (BAR_GRADIENTS.length - 1)),
              BAR_GRADIENTS.length - 1,
            )
          ];

          return (
            <BarColumn
              key={item.label}
              count={item.count}
              pct={pct}
              heightPct={heightPct}
              gradient={gradient}
            />
          );
        })}
      </div>

      <div className="mt-2.5 flex gap-[5px]">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex-1 overflow-hidden text-center text-[8.5px] font-medium leading-none text-white/35"
            title={item.label}
          >
            {item.label.length > 8 ? item.label.slice(0, 7) + "…" : item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarColumn({
  count,
  pct,
  heightPct,
  gradient,
}: {
  count: number;
  pct: string;
  heightPct: number;
  gradient: string;
}) {
  return (
    <div
      className="group/bar relative flex flex-1 flex-col items-center justify-end"
      style={{ height: "100%" }}
    >
      {/* Tooltip — column-level, above bar, unaffected by bar scale */}
      <div
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover/bar:opacity-100"
        style={{ bottom: `calc(${heightPct * 1.14}% + 10px)` }}
      >
        <div className="whitespace-nowrap rounded-[10px] border border-white/[0.12] bg-[#160A0C]/90 px-2.5 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.60)] backdrop-blur-md">
          <span className="block text-center text-[11px] font-bold leading-none text-white">
            {count}
          </span>
          <span className="block text-center text-[9px] leading-none text-white/45 mt-0.5">
            {pct}%
          </span>
        </div>
        <div className="absolute -bottom-[5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white/[0.12] bg-[#160A0C]" />
      </div>

      {/* Bar — grows upward from base on hover */}
      <div
        className="relative w-full origin-bottom transition-[transform,filter] duration-300 ease-out group-hover/bar:scale-y-[1.12] group-hover/bar:[filter:drop-shadow(0_6px_18px_rgba(194,26,39,0.30))]"
        style={{ height: `${heightPct}%`, minHeight: "4px" }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-t-[4px]">
          <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />
          <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-black/22 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-[8%] bg-gradient-to-r from-white/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-white/28" />
          <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover/bar:bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}
