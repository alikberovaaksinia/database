"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type GroupRow = {
  label: string;
  count: number;
};

type Props = {
  data: GroupRow[];
};

const COLORS = [
  "#C21A27",
  "#D94A57",
  "#8F1320",
  "#E6B8BC",
  "#B45C66",
  "#6E0D15",
];

export default function AnimatedBarList({ data }: Props) {
  const [hovered, setHovered] = useState(false);

  const max = Math.max(...data.map((item) => item.count), 1);

  if (data.length === 0) {
    return <div className="text-sm text-[#7A7474]">No data available.</div>;
  }

  return (
    <div
      onMouseEnter={() => setHovered((v) => !v)}
      className="space-y-4"
    >
      {data.map((item, index) => {
        const width = `${(item.count / max) * 100}%`;
        const color = COLORS[index % COLORS.length];

        return (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span>{item.count}</span>
            </div>

            <div className="h-3 bg-[#F3ECEC] rounded-full overflow-hidden">
              <motion.div
                key={`${hovered}-${item.label}`}
                initial={{ width: 0 }}
                animate={{ width }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}