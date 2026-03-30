"use client";

import { useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "light";
};

export default function InteractiveGradientText({
  children,
  className = "",
  variant = "dark",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [x, setX] = useState(50);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const nextX = ((e.clientX - rect.left) / rect.width) * 100;

    setX(nextX);
  }

  const isLight = variant === "light";

  const baseColor = isLight ? "#ffffff" : "#1d1d1b";

  const gradient = hovered
    ? `linear-gradient(90deg,
        ${baseColor} 0%,
        ${isLight ? "#ffd6da" : "#d94a57"} ${Math.max(0, x - 20)}%,
        ${isLight ? "#ff8e98" : "#c21a27"} ${x}%,
        ${isLight ? "#ffd6da" : "#d94a57"} ${Math.min(100, x + 20)}%,
        ${baseColor} 100%)`
    : `linear-gradient(90deg, ${baseColor} 0%, ${baseColor} 100%)`;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMove}
      className="inline-block"
    >
      <span
        className={`inline-block text-transparent bg-clip-text transition-all duration-200 ${className}`}
        style={{
          backgroundImage: gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {children}
      </span>
    </div>
  );
}