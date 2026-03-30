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

  const gradient =
    variant === "light"
      ? active
        ? `radial-gradient(circle at ${pos.x}% ${pos.y}%,
            #ffffff 0%,
            #ffd6da 18%,
            #ff8e98 34%,
            #ffffff 72%)`
        : "linear-gradient(90deg, #ffffff 0%, #ffffff 100%)"
      : active
        ? `radial-gradient(circle at ${pos.x}% ${pos.y}%,
            #c21a27 0%,
            #d94a57 18%,
            #efb7bc 34%,
            #7a0f18 52%,
            #1d1d1b 72%)`
        : "linear-gradient(90deg, #1d1d1b 0%, #1d1d1b 100%)";

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="inline-block"
    >
      <div
        className={`inline-block bg-clip-text text-transparent transition-[background-image] duration-200 ${className}`}
        style={{
          backgroundImage: gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {children}
      </div>
    </div>
  );
}