"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import InteractiveHeroTitle from "../components/InteractiveHeroTitle";

export default function DirectoryPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#E6E6E6] text-[#1A1A1A]">
      <div className="pointer-events-none fixed inset-0 bg-[#E6E6E6]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(166,15,26,0.15),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_80%,rgba(155,18,28,0.11),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(210,55,70,0.07),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_88%_92%,rgba(166,15,26,0.07),transparent_28%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="mb-10 border-t border-[#D9D9D9] pt-6">
          <div className="mb-6">
            <div className="inline-flex items-center rounded-full border border-[#D9D9D9] bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#A60F1A]">
              Directory
            </div>
          </div>

          <div>
            <InteractiveHeroTitle
              className="text-5xl font-semibold tracking-tight leading-[0.9] md:text-6xl xl:text-[6rem]"
            >
              Explore the Alumni
              <br />
              Network
            </InteractiveHeroTitle>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#5C5A56]">
              Search alumni, discover career paths, and explore insights
              across countries, industries, firms, and JEME roles.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <FeatureCard
                href="/directory/alumni"
                icon="A"
                title="Alumni Explorer"
                description="Search, filter, and explore alumni across the network."
                cta="Explore alumni"
              />

              <FeatureCard
                href="/stats"
                icon="S"
                title="Statistics & Insights"
                description="Discover trends and insights about alumni careers."
                cta="Open statistics"
              />
            </div>

            <div className="mt-16 flex justify-center">
              <div className="relative flex items-center justify-center gap-12 md:gap-16">
                <FloatingStat value="600+" label="Alumni" />
                <FloatingStat value="25+" label="Countries" />
                <FloatingStat value="15+" label="Industries" />

                <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-[#A60F1A]/[15%] blur-3xl" />
                <div className="pointer-events-none absolute -right-8 -top-4 h-60 w-60 rounded-full bg-[#D9D9D9]/[85%] blur-3xl" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  cta: string;
}) {
  const wrapperRef = useRef<HTMLAnchorElement | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function handleMove(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  }

  const softGradient = active
    ? `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(166,15,26,0.07) 0%, rgba(214,90,97,0.05) 18%, rgba(244,199,201,0.035) 34%, rgba(255,255,255,0.0) 62%)`
    : "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0))";

  return (
    <Link
      ref={wrapperRef}
      href={href}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="group relative flex flex-col overflow-hidden rounded-[34px] border border-[#D9D9D9] bg-white/92 p-7 shadow-[0_18px_40px_rgba(0,0,0,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D9D9D9] hover:shadow-[0_24px_50px_rgba(166,15,26,0.10)]"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-[background-image] duration-200"
        style={{ backgroundImage: softGradient }}
      />

      <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#F4C7C9] text-2xl font-semibold text-[#A60F1A] transition-all duration-300 group-hover:bg-[#A60F1A] group-hover:text-white">
        {icon}
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-8">
        <div>
          <GradientCardTitle>{title}</GradientCardTitle>
          <p className="mt-4 text-lg leading-8 text-[#5C5A56]">
            {description}
          </p>
        </div>

        <div className="text-lg font-semibold text-[#A60F1A]">
          {cta}
        </div>
      </div>
    </Link>
  );
}

function GradientCardTitle({ children }: { children: string }) {
  return (
    <h2 className="text-4xl font-semibold leading-tight text-[#1A1A1A]">
      {children}
    </h2>
  );
}

function FloatingStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  }

  const softGradient = active
    ? `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(166,15,26,0.08) 0%, rgba(214,90,97,0.05) 20%, rgba(244,199,201,0.03) 38%, rgba(255,255,255,0) 64%)`
    : "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0))";

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="relative z-10 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-[#D9D9D9] bg-white/88 shadow-[0_18px_34px_rgba(0,0,0,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_24px_44px_rgba(166,15,26,0.10)] md:h-44 md:w-44"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-[background-image] duration-200"
        style={{ backgroundImage: softGradient }}
      />

      <div className="relative z-10 text-center">
        <GradientStatValue>{value}</GradientStatValue>
        <div className="mt-2 text-sm font-medium text-[#737373] md:text-base">
          {label}
        </div>
      </div>
    </div>
  );
}

function GradientStatValue({ children }: { children: string }) {
  return (
    <div className="text-4xl font-semibold tracking-tight text-[#1A1A1A] md:text-5xl">
      {children}
    </div>
  );
}