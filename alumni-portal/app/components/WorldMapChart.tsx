"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import WorldMap, {
  type CountryContext,
  type ISOCode,
} from "react-svg-worldmap";

type MapPoint = {
  country: string;
  value: number;
};

type Props = {
  data: MapPoint[];
};

export default function WorldMapChart({ data }: Props) {
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);

  const normalizedData = useMemo(
    () =>
      data
        .filter((item) => item.country && item.value > 0)
        .map((item) => ({
          country: item.country as ISOCode,
          value: item.value,
        })),
    [data],
  );

  const maxValue = Math.max(...normalizedData.map((item) => item.value), 1);

  const tooltipTextFn = useCallback(
    (context: CountryContext) =>
      `${context.countryName}: ${context.countryValue ?? 0} alumni`,
    [],
  );

  const styleFn = useCallback(
    (context: CountryContext) => {
      const value = context.countryValue ?? 0;

      if (!value) {
        return {
          fill: "#EDE5E6",
          stroke: "rgba(100,80,85,0.30)",
          strokeWidth: 0.5,
          cursor: "default",
          outline: "none",
          transition: "fill 160ms ease, filter 180ms ease",
          transformBox: "fill-box",
          transformOrigin: "center",
        };
      }

      const ratio = value / maxValue;

      let fill = "#E85A66";
      if (ratio > 0.66) {
        fill = "#8F1320";
      } else if (ratio > 0.33) {
        fill = "#C21A27";
      }

      return {
        fill,
        stroke: "rgba(255,255,255,0.20)",
        strokeWidth: 0.8,
        cursor: "pointer",
        outline: "none",
        transition: "fill 160ms ease, filter 180ms ease",
        transformBox: "fill-box",
        transformOrigin: "center",
      };
    },
    [maxValue],
  );

  useEffect(() => {
    if (!mapWrapperRef.current) return;

    const removeNativeTitles = () => {
      const titles = mapWrapperRef.current?.querySelectorAll("svg title");
      titles?.forEach((title) => title.remove());
    };

    removeNativeTitles();

    const observer = new MutationObserver(() => {
      removeNativeTitles();
    });

    observer.observe(mapWrapperRef.current, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [normalizedData]);

  return (
    <div>
      {/* ── Map with depth treatment ── */}
      <div className="relative">
        {/* Ambient crimson glow behind the SVG */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[55%] w-[55%] rounded-full bg-[#C21A27]/[9%] blur-[90px]" />

        {/* Edge vignettes — bleed into dark card background */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0C0A0D] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0C0A0D] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#0C0A0D]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[#12080E]/50 to-transparent" />

        <div
          ref={mapWrapperRef}
          className="worldmap-hover mx-auto w-full overflow-visible"
        >
        <WorldMap
          data={normalizedData}
          size="responsive"
          tooltipBgColor="#1A1014"
          tooltipTextColor="#F0EAEA"
          tooltipTextFunction={tooltipTextFn}
          styleFunction={styleFn}
        />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-6 border-t border-white/6 pt-4 pb-2">
        <LegendDot color="#E85A66" label="Light presence" />
        <LegendDot color="#C21A27" label="Medium presence" />
        <LegendDot color="#8F1320" label="High presence" />
        <span className="h-3 w-px bg-white/15" />
        <div className="inline-flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#221820] ring-1 ring-white/20" />
          <span className="text-xs font-medium text-white/30">No data</span>
        </div>
      </div>

      <style jsx global>{`
        .worldmap-hover,
        .worldmap-hover > div,
        .worldmap-hover svg {
          overflow: visible !important;
        }

        .worldmap__figure-container,
        .worldmap__figure-container figure,
        .worldmap-hover > div > div,
        .worldmap-hover svg {
          background: transparent !important;
          background-color: transparent !important;
        }

        .worldmap__figure-container {
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
        }

        .worldmap__figure-container svg {
          display: block !important;
          margin: 0 auto !important;
        }

        .worldmap-hover svg path {
          transition:
            transform 180ms ease,
            filter 180ms ease,
            fill 180ms ease;
          transform-box: fill-box;
          transform-origin: center;
        }

        .worldmap-hover svg path:hover {
          filter: drop-shadow(0 8px 14px rgba(194, 26, 39, 0.32));
        }

        .worldmap-hover [role="tooltip"],
        .worldmap-hover .tooltip,
        .worldmap-hover div[style*="position: fixed"],
        .worldmap-hover div[style*="position: absolute"] {
          border-radius: 14px !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4) !important;
        }
      `}</style>
    </div>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}99`,
        }}
      />
      <span className="text-xs font-medium text-white/52">{label}</span>
    </div>
  );
}
