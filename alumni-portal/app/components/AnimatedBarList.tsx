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
  "#A60F1A",
  "#D65A61",
  "#7A0C14",
  "#E89A9E",
  "#D65A61",
  "#5A0008",
];

export default function AnimatedBarList({ data }: Props) {
  const [hovered, setHovered] = useState(false);

  const max = Math.max(...data.map((item) => item.count), 1);

  if (data.length === 0) {
    return <div className="text-sm text-[#737373]">No data available.</div>;
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

            <div className="h-3 bg-[#E6E6E6] rounded-full overflow-hidden">
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