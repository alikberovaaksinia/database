"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import InteractiveHeroTitle from "../components/InteractiveHeroTitle";

export default function DirectoryPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#FAF1F1] text-[#1D1D1B]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(194,26,39,0.15),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_80%,rgba(155,18,28,0.11),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(210,55,70,0.07),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_88%_92%,rgba(194,26,39,0.07),transparent_28%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="mb-10 border-t border-[#E9CACC] pt-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="inline-flex items-center rounded-full border border-[#E7C7CA] bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#C21A27]">
              Directory
            </div>

            <div className="hidden rounded-full border border-[#E7C7CA] bg-white/80 px-5 py-2 text-sm font-medium text-[#8E6C70] md:block">
              Directory Hub
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

            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#615F59]">
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
                description="Discover trends, distributions, and insights about alumni careers."
                cta="Open statistics"
              />
            </div>

            <div className="mt-16 flex justify-center">
              <div className="relative flex items-center justify-center gap-12 md:gap-16">
                <FloatingStat value="600+" label="Alumni" />
                <FloatingStat value="25+" label="Countries" />
                <FloatingStat value="15+" label="Industries" />

                <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-[#C21A27]/[15%] blur-3xl" />
                <div className="pointer-events-none absolute -right-8 -top-4 h-60 w-60 rounded-full bg-[#EAC9CC]/[85%] blur-3xl" />
              </div>
            </div>

            <div className="mt-10 h-1.5 w-72 rounded-full bg-gradient-to-r from-[#C9A07F] via-[#D16B72] to-[#C21A27]" />
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
    ? `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(194,26,39,0.07) 0%, rgba(217,108,115,0.05) 18%, rgba(232,185,189,0.035) 34%, rgba(255,255,255,0.0) 62%)`
    : "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0))";

  return (
    <Link
      ref={wrapperRef}
      href={href}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="group relative block overflow-hidden rounded-[34px] border border-[#E7DCDD] bg-white/92 p-7 shadow-[0_18px_40px_rgba(0,0,0,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D9B7BB] hover:shadow-[0_24px_50px_rgba(194,26,39,0.10)]"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-[background-image] duration-200"
        style={{ backgroundImage: softGradient }}
      />

      <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#F5E8EA] text-2xl font-semibold text-[#B21F2B] transition-all duration-300 group-hover:bg-[#C21A27] group-hover:text-white">
        {icon}
      </div>

      <div className="relative z-10">
        <GradientCardTitle>{title}</GradientCardTitle>
      </div>

      <p className="relative z-10 mt-4 text-lg leading-8 text-[#615F59]">
        {description}
      </p>

      <div className="relative z-10 mt-8 inline-flex items-center gap-2 text-lg font-semibold text-[#C21A27]">
        <span>{cta}</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

function GradientCardTitle({ children }: { children: string }) {
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

  const gradient = active
    ? `radial-gradient(circle at ${position.x}% ${position.y}%, #C21A27 0%, #D96C73 20%, #E8B9BD 40%, #1D1D1B 72%)`
    : "linear-gradient(90deg, #1D1D1B 0%, #1D1D1B 100%)";

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="inline-block"
    >
      <h2
        className="text-4xl font-semibold leading-tight text-transparent bg-clip-text transition-[background-image] duration-200"
        style={{ backgroundImage: gradient }}
      >
        {children}
      </h2>
    </div>
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
    ? `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(194,26,39,0.08) 0%, rgba(217,108,115,0.05) 20%, rgba(232,185,189,0.03) 38%, rgba(255,255,255,0) 64%)`
    : "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0))";

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="relative z-10 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-[#E7DCDD] bg-white/88 shadow-[0_18px_34px_rgba(0,0,0,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_24px_44px_rgba(194,26,39,0.10)] md:h-44 md:w-44"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-[background-image] duration-200"
        style={{ backgroundImage: softGradient }}
      />

      <div className="relative z-10 text-center">
        <GradientStatValue>{value}</GradientStatValue>
        <div className="mt-2 text-sm font-medium text-[#7F7677] md:text-base">
          {label}
        </div>
      </div>
    </div>
  );
}

function GradientStatValue({ children }: { children: string }) {
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

  const gradient = active
    ? `radial-gradient(circle at ${position.x}% ${position.y}%, #C21A27 0%, #D96C73 20%, #E8B9BD 42%, #1D1D1B 72%)`
    : "linear-gradient(90deg, #1D1D1B 0%, #1D1D1B 100%)";

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="inline-block"
    >
      <div
        className="text-4xl font-semibold tracking-tight text-transparent bg-clip-text transition-[background-image] duration-200 md:text-5xl"
        style={{ backgroundImage: gradient }}
      >
        {children}
      </div>
    </div>
  );
}