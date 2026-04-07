"use client";

import { useRef, useState } from "react";

type InteractiveHeroTitleProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "light";
};

export default function InteractiveHeroTitle({
  children,
  className = "",
  variant = "dark",
}: InteractiveHeroTitleProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }

  const gradient = active
    ? variant === "light"
      ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, #ffb8bc 0%, #ffd6d8 32%, #ffffff 62%)`
      : `radial-gradient(circle at ${pos.x}% ${pos.y}%, #c21a27 0%, #8a1520 32%, #1d1d1b 62%)`
    : variant === "light"
      ? "linear-gradient(90deg, #ffffff 0%, #ffffff 100%)"
      : "linear-gradient(90deg, #1d1d1b 0%, #1d1d1b 100%)";

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={`inline-block ${className}`}
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        paddingBottom: "0.2em",
        marginBottom: "-0.2em",
      }}
    >
      {children}
    </div>
  );
}
