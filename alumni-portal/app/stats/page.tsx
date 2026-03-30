import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getCountryName } from "../lib/countries";
import WorldMapChart from "../components/WorldMapChartWrapper";
import AnimatedSection from "../components/AnimatedSection";
import StatsChartCard from "../components/StatsChartCard";
import InteractiveHeroTitle from "../components/InteractiveHeroTitle";
import IndustryWheel from "../components/IndustryWheel";
import JemeOrgChart from "../components/JemeOrgChart";
import AgeWaveChart from "../components/AgeWaveChart";
import AgeSeniorityMatrix from "../components/AgeSeniorityMatrix";

export const metadata: Metadata = {
  title: "Alumni Analytics | JEME",
  description:
    "Explore the JEME alumni network through geography, careers, companies, and leadership data.",
};

type GroupRow = {
  label: string;
  count: number;
};

type CountryMapRow = {
  code: string;
  label: string;
  count: number;
};

type AgeBySeniorityRow = {
  ageGroup: string;
  Entry: number;
  Mid: number;
  Manager: number;
  Director: number;
  Executive: number;
  Other: number;
};

export default async function StatsPage() {
  const [
    totalAlumni,
    countriesRaw,
    industriesRaw,
    companiesRaw,
    rolesRaw,
    boardYesCount,
    headYesCount,
    jemeRolesRaw,
    ageGroupsRaw,
    ageRoleRaw,
  ] = await Promise.all([
    prisma.alumni_raw.count({
      where: { full_name: { not: "" } },
    }),

    prisma.alumni_raw.groupBy({
      by: ["current_country"],
      _count: { current_country: true },
      where: {
        current_country: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { current_country: "desc" },
      },
    }),

    prisma.alumni_raw.groupBy({
      by: ["current_industry"],
      _count: { current_industry: true },
      where: {
        current_industry: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { current_industry: "desc" },
      },
    }),

    prisma.alumni_raw.groupBy({
      by: ["current_firm"],
      _count: { current_firm: true },
      where: {
        current_firm: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { current_firm: "desc" },
      },
    }),

    prisma.alumni_raw.groupBy({
      by: ["current_role"],
      _count: { current_role: true },
      where: {
        current_role: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { current_role: "desc" },
      },
    }),

    prisma.alumni_raw.count({
      where: {
        full_name: { not: "" },
        board: { in: ["true", "True", "yes", "Yes", "TRUE", "YES"] },
      },
    }),

    prisma.alumni_raw.count({
      where: {
        full_name: { not: "" },
        head: { in: ["true", "True", "yes", "Yes", "TRUE", "YES"] },
      },
    }),

    prisma.alumni_raw.groupBy({
      by: ["jeme_role"],
      _count: { jeme_role: true },
      where: {
        jeme_role: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { jeme_role: "desc" },
      },
    }),

    prisma.alumni_raw.groupBy({
      by: ["age_group"],
      _count: { age_group: true },
      where: {
        age_group: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { age_group: "desc" },
      },
    }),

    prisma.alumni_raw.findMany({
      where: {
        age_group: { not: "" },
        current_role: { not: "" },
        full_name: { not: "" },
      },
      select: {
        age_group: true,
        current_role: true,
      },
    }),
  ]);

  const countryMapData: CountryMapRow[] = countriesRaw
    .filter((row) => row.current_country)
    .map((row) => ({
      code: row.current_country as string,
      label: getCountryName(row.current_country),
      count: row._count.current_country,
    }));

  const countryData: GroupRow[] = countryMapData.map((row) => ({
    label: row.label,
    count: row.count,
  }));

  const topThreeCountries = countryData.slice(0, 3);

  const industryData: GroupRow[] = industriesRaw.map((row) => ({
    label: row.current_industry || "-",
    count: row._count.current_industry,
  }));

  const companyData: GroupRow[] = companiesRaw.map((row) => ({
    label: row.current_firm || "-",
    count: row._count.current_firm,
  }));

  const roleData: GroupRow[] = rolesRaw.map((row) => ({
    label: row.current_role || "-",
    count: row._count.current_role,
  }));

  const jemeRoleData: GroupRow[] = jemeRolesRaw.map((row) => ({
    label: row.jeme_role || "-",
    count: row._count.jeme_role,
  }));

  const ageGroupData: GroupRow[] = ageGroupsRaw.map((row) => ({
    label: row.age_group || "-",
    count: row._count.age_group,
  }));

  const ageBySeniorityData = buildAgeBySeniorityData(ageRoleRaw);

  const boardNoCount = totalAlumni - boardYesCount;
  const headNoCount = totalAlumni - headYesCount;

  const totalCountries = countryData.length;
  const totalIndustries = industryData.length;
  const totalCompanies = companyData.length;
  const totalRoles = roleData.length;

  const topCountry = countryData[0]?.label || "-";
  const topIndustry = industryData[0]?.label || "-";
  const topCompany = companyData[0]?.label || "-";
  const topRole = roleData[0]?.label || "-";

  return (
    <div className="min-h-screen overflow-hidden bg-[#08090B] text-[#1D1D1B]">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(194,26,39,0.28),transparent_24%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_10%,rgba(194,26,39,0.18),transparent_20%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_85%,rgba(255,255,255,0.05),transparent_18%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_76%,rgba(194,26,39,0.14),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.22))]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10 pb-24">
        {/* Back button */}
        <Link
          href="/directory"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/92 px-5 py-2.5 text-sm font-semibold text-[#1D1D1B] shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C21A27] hover:text-white"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Back to home
        </Link>

        {/* Hero */}
        <AnimatedSection>
          <div className="overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,#A9101D_0%,#C21A27_52%,#760E16_100%)] text-white shadow-[0_30px_90px_rgba(0,0,0,0.36)]">
            <div className="relative px-8 py-10 md:px-12 md:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_24%)]" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    Statistics & Insights
                  </div>

                  <InteractiveHeroTitle
                    className="text-5xl font-semibold leading-none tracking-tight md:text-6xl"
                    variant="light"
                  >
                    Alumni Analytics
                  </InteractiveHeroTitle>

                  <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
                    Explore the alumni network through geography, careers,
                    companies, and JEME leadership data.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:max-w-[36%] lg:justify-end">
                  <HeroPill value={String(totalAlumni)} label="alumni" />
                  <HeroPill value={String(totalCountries)} label="countries" />
                  <HeroPill value={String(totalIndustries)} label="industries" />
                  <HeroPill value={String(totalCompanies)} label="companies" />
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Stat cards — organic floating layout */}
        <AnimatedSection delay={0.05}>
          <div className="relative mt-8 py-4">
            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#C21A27]/[0.07] blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-1/4 h-60 w-60 rounded-full bg-[#C21A27]/[0.05] blur-3xl" />

            {/* Row 1: KPI counts */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:flex-nowrap md:justify-between md:gap-0">
              <div className="translate-y-0 scale-110">
                <StatCard label="Total Alumni" value={String(totalAlumni)} accent />
              </div>
              <div className="-translate-y-3 scale-100">
                <StatCard label="Countries Represented" value={String(totalCountries)} accent />
              </div>
              <div className="translate-y-2 scale-[0.92]">
                <StatCard label="Industries Represented" value={String(totalIndustries)} accent />
              </div>
              <div className="-translate-y-2 scale-100">
                <StatCard label="Companies Represented" value={String(totalCompanies)} accent />
              </div>
            </div>

            {/* Row 2: Leadership + top labels */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:flex-nowrap md:justify-between md:gap-0">
              <div className="translate-y-3 scale-100">
                <StatCard label="Board Members" value={String(boardYesCount)} accent />
              </div>
              <div className="-translate-y-4 scale-[0.92]">
                <StatCard label="Department Heads" value={String(headYesCount)} accent />
              </div>
              <div className="translate-y-1 scale-110">
                <StatCard label="Top Country" value={topCountry} />
              </div>
              <div className="-translate-y-2 scale-100">
                <StatCard label="Top Company" value={topCompany} />
              </div>
            </div>

            {/* Row 3: Top labels + role counts */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:flex-nowrap md:justify-between md:gap-0">
              <div className="-translate-y-2 scale-100">
                <StatCard label="Top Industry" value={topIndustry} />
              </div>
              <div className="translate-y-4 scale-[0.92]">
                <StatCard label="Top Role" value={topRole} />
              </div>
              <div className="-translate-y-3 scale-100">
                <StatCard label="JEME Roles Tracked" value={String(jemeRoleData.length)} accent />
              </div>
              <div className="translate-y-0 scale-110">
                <StatCard label="Role Categories" value={String(totalRoles)} accent />
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Geography ── */}
        <AnimatedSection delay={0.14}>
          <SectionLabel>Geography</SectionLabel>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="-mx-6 xl:-mx-[calc((100vw-80rem)/2+1.5rem)]">
            {/* Dark centerpiece card */}
            <div className="mt-6 relative overflow-hidden rounded-[42px] border border-white/12 shadow-[0_50px_120px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.07)]">

              {/* Base dark gradient */}
              <div className="absolute inset-0 bg-[linear-gradient(150deg,#160E0F_0%,#0C0A0D_50%,#12080E_100%)]" />

              {/* Dot-grid texture */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                  opacity: 0.4,
                }}
              />

              {/* Red glow — top-right hero */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_85%_-10%,rgba(194,26,39,0.30),transparent)]" />
              {/* Red glow — bottom-left ambient */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_8%_95%,rgba(194,26,39,0.13),transparent)]" />

              {/* ── Header ── */}
              <div className="relative px-8 pt-8 md:px-10 md:pt-10">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-semibold text-white md:text-4xl">
                      Global Alumni Footprint
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/38">
                      Where alumni are currently working, across {totalCountries} countries.
                    </p>
                  </div>

                  {/* Mini-stat row */}
                  <div className="hidden shrink-0 items-center gap-5 sm:flex">
                    <MapMiniStat value={String(totalAlumni)} label="Alumni" />
                    <div className="h-7 w-px bg-white/12" />
                    <MapMiniStat value={String(totalCountries)} label="Countries" />
                    <div className="h-7 w-px bg-white/12" />
                    <MapMiniStat value={topCountry} label="Top Hub" />
                  </div>
                </div>
              </div>

              {/* ── Two-column body: map left, top countries right ── */}
              <div className="relative mt-2 flex flex-col lg:grid lg:grid-cols-[2fr_1fr] lg:items-start">

                {/* Left: Map */}
                <div className="min-w-0 lg:border-r lg:border-white/8">
                  <WorldMapChart
                    data={countryMapData.map((item) => ({
                      country: item.code,
                      value: item.count,
                    }))}
                  />
                </div>

                {/* Right: Top countries */}
                <div className="border-t border-white/8 px-8 py-6 lg:border-t-0 lg:px-8 lg:py-8">
                  <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/28">
                    Top countries
                  </div>
                  <div className="flex flex-col gap-3">
                    {topThreeCountries.map((country, index) => (
                      <MapTopCountryCard
                        key={country.label}
                        rank={index + 1}
                        country={country.label}
                        count={country.count}
                        total={totalAlumni}
                        maxCount={topThreeCountries[0]?.count ?? 1}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </AnimatedSection>

        {/* ── Careers & Companies ── */}
        <AnimatedSection delay={0.18}>
          <SectionLabel>Careers & Companies</SectionLabel>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="mt-6">
            <StatsChartCard
              title="Industry Breakdown"
              subtitle="Most represented current industries."
            >
              <IndustryWheel data={industryData.slice(0, 10)} total={totalAlumni} />
            </StatsChartCard>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.22}>
          <div className="mt-6">
            <RoleHeroCards data={roleData.slice(0, 12)} total={totalAlumni} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.25}>
          <div className="mt-6">
            <CompanyHeroCards data={companyData.slice(0, 12)} total={totalAlumni} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.27}>
          <div className="mt-6">
            <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-xl shadow-[0_22px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#C21A27]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
              <h2 className="relative text-2xl font-semibold tracking-tight text-white/90">JEME Role Distribution</h2>
              <p className="relative mt-2 text-sm leading-7 text-white/38">How alumni were distributed across JEME organizational roles.</p>
              <div className="relative mt-6">
                <JemeOrgChart data={jemeRoleData.slice(0, 12)} total={totalAlumni} />
              </div>
            </section>
          </div>
        </AnimatedSection>

        {/* ── Leadership & Demographics ── */}
        <AnimatedSection delay={0.28}>
          <SectionLabel>Leadership & Demographics</SectionLabel>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-xl shadow-[0_22px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-[#C21A27]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
              <div className="relative flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white/90">Board vs Non-board</h2>
                  <p className="mt-1 text-xs leading-6 text-white/38">Board membership across all alumni.</p>
                </div>
                <BubbleComparison
                  positiveLabel="Board"
                  positiveValue={boardYesCount}
                  negativeLabel="Non-board"
                  negativeValue={boardNoCount}
                />
                <div className="border-t border-white/[0.06] pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Board</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-[#C21A27]">{boardYesCount}</div>
                    </div>
                    <div className="mb-1 text-[10px] font-medium text-white/20">out of {boardYesCount + boardNoCount}</div>
                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Non-board</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-white/45">{boardNoCount}</div>
                    </div>
                  </div>
                  <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8F1320] to-[#C21A27]"
                      style={{ width: `${Math.round((boardYesCount / (boardYesCount + boardNoCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-xl shadow-[0_22px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-[#C21A27]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
              <div className="relative flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white/90">Head vs Non-head</h2>
                  <p className="mt-1 text-xs leading-6 text-white/38">Department leadership across all alumni.</p>
                </div>
                <BubbleComparison
                  positiveLabel="Head"
                  positiveValue={headYesCount}
                  negativeLabel="Non-head"
                  negativeValue={headNoCount}
                />
                <div className="border-t border-white/[0.06] pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Head</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-[#C21A27]">{headYesCount}</div>
                    </div>
                    <div className="mb-1 text-[10px] font-medium text-white/20">out of {headYesCount + headNoCount}</div>
                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Non-head</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-white/45">{headNoCount}</div>
                    </div>
                  </div>
                  <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8F1320] to-[#C21A27]"
                      style={{ width: `${Math.round((headYesCount / (headYesCount + headNoCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.33}>
          <div className="mt-6">
            <StatsChartCard
              title="Age Group Distribution"
              subtitle="Age-group composition of the alumni base."
            >
              <AgeWaveChart data={ageGroupData} />
            </StatsChartCard>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.35}>
          <div className="mt-6">
            <StatsChartCard
              title="Age Groups by Seniority"
              subtitle="How seniority levels are distributed inside each age group."
            >
              <AgeSeniorityMatrix data={ageBySeniorityData} />
            </StatsChartCard>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function inferSeniority(role: string | null | undefined) {
  if (!role) return "Other";

  const r = role.toLowerCase();

  if (
    r.includes("ceo") ||
    r.includes("chief") ||
    r.includes("president") ||
    r.includes("founder") ||
    r.includes("partner") ||
    r.includes("managing director") ||
    r.includes("general manager")
  ) {
    return "Executive";
  }

  if (
    r.includes("director") ||
    r.includes("head") ||
    r.includes("vice president") ||
    r.includes("vp")
  ) {
    return "Director";
  }

  if (
    r.includes("manager") ||
    r.includes("lead") ||
    r.includes("principal")
  ) {
    return "Manager";
  }

  if (
    r.includes("senior") ||
    r.includes("specialist") ||
    r.includes("consultant") ||
    r.includes("associate")
  ) {
    return "Mid";
  }

  if (
    r.includes("analyst") ||
    r.includes("intern") ||
    r.includes("assistant") ||
    r.includes("trainee") ||
    r.includes("junior")
  ) {
    return "Entry";
  }

  return "Other";
}

function buildAgeBySeniorityData(
  rows: Array<{ age_group: string | null; current_role: string | null }>,
): AgeBySeniorityRow[] {
  const preferredOrder = ["20-25", "25-30", "30-35", "35-40", "40-45", "45-50", "50+"];

  const map = new Map<string, AgeBySeniorityRow>();

  for (const age of preferredOrder) {
    map.set(age, {
      ageGroup: age,
      Entry: 0,
      Mid: 0,
      Manager: 0,
      Director: 0,
      Executive: 0,
      Other: 0,
    });
  }

  for (const row of rows) {
    if (!row.age_group) continue;

    if (!map.has(row.age_group)) {
      map.set(row.age_group, {
        ageGroup: row.age_group,
        Entry: 0,
        Mid: 0,
        Manager: 0,
        Director: 0,
        Executive: 0,
        Other: 0,
      });
    }

    const bucket = inferSeniority(row.current_role) as keyof Omit<
      AgeBySeniorityRow,
      "ageGroup"
    >;

    const current = map.get(row.age_group)!;
    current[bucket] += 1;
  }

  const allRows = Array.from(map.values()).filter((row) => {
    return (
      row.Entry +
        row.Mid +
        row.Manager +
        row.Director +
        row.Executive +
        row.Other >
      0
    );
  });

  const ordered = [
    ...preferredOrder
      .map((label) => allRows.find((row) => row.ageGroup === label))
      .filter((row): row is AgeBySeniorityRow => Boolean(row)),
    ...allRows.filter((row) => !preferredOrder.includes(row.ageGroup)),
  ];

  return ordered;
}

// ─── UI Components ──────────────────────────────────────────────────────────

function MapMiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-right">
      <div className="text-xl font-bold leading-none text-white">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">
        {label}
      </div>
    </div>
  );
}

function MapTopCountryCard({
  rank,
  country,
  count,
  total,
  maxCount,
}: {
  rank: number;
  country: string;
  count: number;
  total: number;
  maxCount: number;
}) {
  const barWidth = `${(count / maxCount) * 100}%`;
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
  const medals = ["01", "02", "03"];

  return (
    <div className="rounded-[22px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm transition-colors duration-200 hover:bg-white/11">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C21A27] to-[#7A0E19] text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(194,26,39,0.4)]">
            {medals[rank - 1]}
          </div>
          <span className="truncate text-sm font-semibold text-white/90">{country}</span>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-xl font-bold text-[#E85A66]">{count}</span>
          <span className="ml-1.5 text-xs text-white/35">{pct}%</span>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8F1320] to-[#E85A66]"
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}

function HeroPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm ring-1 ring-white/10">
      <span className="text-base font-bold">{value}</span>
      <span className="text-white/65 font-normal">{label}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mt-12 flex items-center gap-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50 backdrop-blur-sm">
        {children}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  const isNumeric = /^\d+$/.test(value);

  return (
    <div className="flex justify-center">
      <div
        className={`group relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04] ${
          accent
            ? "border border-[rgba(194,26,39,0.28)] bg-[rgba(194,26,39,0.06)] shadow-[0_18px_44px_rgba(0,0,0,0.45),0_0_28px_rgba(194,26,39,0.10)] hover:shadow-[0_28px_58px_rgba(0,0,0,0.52),0_0_44px_rgba(194,26,39,0.26)]"
            : "border border-white/[0.10] bg-white/[0.05] shadow-[0_18px_44px_rgba(0,0,0,0.40)] hover:shadow-[0_28px_58px_rgba(0,0,0,0.46),0_0_36px_rgba(194,26,39,0.16)]"
        }`}
      >
        {/* Hover red glow */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_70%,rgba(194,26,39,0.22),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Inner top highlight (glass sheen) */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_18%,rgba(255,255,255,0.09),transparent_50%)]" />

        <div className="relative z-10 px-5 text-center">
          <div
            className={`font-bold leading-none tracking-tight transition-colors duration-300 ${
              isNumeric
                ? "text-3xl text-white"
                : "text-lg text-white/80 group-hover:text-white"
            }`}
          >
            {value}
          </div>
          <div className="mt-2.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleHeroCards({ data, total }: { data: GroupRow[]; total?: number }) {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const effectiveTotal = total ?? data.reduce((sum, item) => sum + item.count, 0);

  if (data.length === 0) {
    return <div className="text-sm text-white/40">No data available.</div>;
  }

  const ranks = ["01", "02", "03"];

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-xl shadow-[0_22px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
      {/* Ambient corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#C21A27]/[0.08] blur-3xl" />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

      <h2 className="relative text-2xl font-semibold tracking-tight text-white/90">
        Current Role Distribution
      </h2>
      <p className="relative mt-2 text-sm leading-7 text-white/38">
        Most common current roles across alumni.
      </p>

      {/* ── Hero cards — top 3 ── */}
      <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
        {top3.map((item, i) => {
          const pct =
            effectiveTotal > 0
              ? ((item.count / effectiveTotal) * 100).toFixed(1)
              : "0";
          const isTop = i === 0;
          return (
            <div
              key={item.label}
              className={`group relative overflow-hidden rounded-[26px] border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.018] ${
                isTop
                  ? "border-[#C21A27]/[0.32] bg-[#C21A27]/[0.08] shadow-[0_20px_48px_rgba(0,0,0,0.50),0_0_30px_rgba(194,26,39,0.14)] hover:shadow-[0_30px_64px_rgba(0,0,0,0.56),0_0_50px_rgba(194,26,39,0.28)]"
                  : "border-white/[0.08] bg-white/[0.035] shadow-[0_16px_40px_rgba(0,0,0,0.44)] hover:shadow-[0_26px_56px_rgba(0,0,0,0.50),0_0_36px_rgba(194,26,39,0.18)]"
              }`}
            >
              {/* Rank badge */}
              <div
                className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-[0_3px_10px_rgba(0,0,0,0.35)] ${
                  isTop
                    ? "bg-gradient-to-br from-[#C21A27] to-[#7A0E19]"
                    : "bg-gradient-to-br from-[#6E0D15] to-[#3D0609]"
                }`}
              >
                {ranks[i]}
              </div>

              {/* Hover red glow */}
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-[#C21A27]/[0.10] blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Glass top edge */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />

              {/* Count */}
              <div
                className={`mt-1 text-[3.2rem] font-bold leading-none tracking-tight ${
                  isTop ? "text-[#E85A66]" : "text-[#D04A56]"
                }`}
              >
                {item.count}
              </div>

              {/* Percentage */}
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/32">
                {pct}% of alumni
              </div>

              {/* Role name */}
              <div className="mt-3 text-[1.05rem] font-semibold leading-snug text-white/80 transition-colors duration-300 group-hover:text-white/95">
                {item.label}
              </div>

              {/* Accent progress bar */}
              <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8F1320] via-[#C21A27] to-[#E85A66]"
                  style={{ width: `${(item.count / (top3[0]?.count ?? 1)) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Secondary roles — compact grid ── */}
      {rest.length > 0 && (
        <div className="relative mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((item) => {
            const pct =
              effectiveTotal > 0
                ? ((item.count / effectiveTotal) * 100).toFixed(1)
                : "0";
            const barWidth = `${(item.count / (top3[0]?.count ?? 1)) * 100}%`;
            return (
              <div
                key={item.label}
                className="group flex items-center rounded-[18px] border border-white/[0.06] bg-white/[0.025] px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.10] hover:bg-white/[0.05]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-white/62 transition-colors group-hover:text-white/82">
                      {item.label}
                    </span>
                    <div className="flex shrink-0 items-baseline gap-1.5">
                      <span className="text-sm font-semibold text-[#C21A27]">{item.count}</span>
                      <span className="text-[10px] text-white/28">{pct}%</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7A1018] to-[#C21A27]"
                      style={{ width: barWidth }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function getCompanyInitials(name: string): string {
  const words = name
    .trim()
    .split(/[\s&]+/)
    .filter(
      (w) =>
        w.length > 1 &&
        !["and", "the", "of", "a", "an", "for", "in"].includes(w.toLowerCase()),
    );
  if (words.length === 0) return name.trim().slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function CompanyHeroCards({ data, total }: { data: GroupRow[]; total?: number }) {
  const [first, second, third, ...rest] = data;
  const effectiveTotal = total ?? data.reduce((sum, item) => sum + item.count, 0);
  const topCount = first?.count ?? 1;

  if (!first) {
    return <div className="text-sm text-white/40">No data available.</div>;
  }

  const pct = (item: GroupRow) =>
    effectiveTotal > 0 ? ((item.count / effectiveTotal) * 100).toFixed(1) : "0";

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-xl shadow-[0_22px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
      {/* Ambient corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#C21A27]/[0.08] blur-3xl" />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

      <h2 className="relative text-2xl font-semibold tracking-tight text-white/90">
        Top Companies
      </h2>
      <p className="relative mt-2 text-sm leading-7 text-white/38">
        Companies where the highest number of alumni currently work.
      </p>

      {/* ── Asymmetric hero layout ── */}
      <div className="relative mt-6 grid gap-4 lg:grid-cols-[3fr_2fr]">

        {/* ── Featured card — #1 ── */}
        <div className="group relative flex flex-col overflow-hidden rounded-[26px] border border-[#C21A27]/[0.28] bg-[#C21A27]/[0.07] p-7 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.50),0_0_30px_rgba(194,26,39,0.12)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.012] hover:shadow-[0_30px_64px_rgba(0,0,0,0.55),0_0_52px_rgba(194,26,39,0.26)]">
          {/* Hover glow */}
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[#C21A27]/[0.10] blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {/* Top edge glass highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />

          {/* Top row: label + rank */}
          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C21A27]/[0.18] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E85A66]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E85A66]" />
              Top Employer
            </span>
            <span className="text-[11px] font-bold tracking-[0.10em] text-white/[0.18]">01</span>
          </div>

          {/* Company identity row */}
          <div className="relative mt-6 flex items-center gap-5">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#C21A27] to-[#7A0E19] text-2xl font-bold text-white shadow-[0_8px_24px_rgba(194,26,39,0.50),inset_0_1px_0_rgba(255,255,255,0.15)]">
              {getCompanyInitials(first.label)}
            </div>
            <div className="min-w-0">
              <div className="line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-white/90 transition-colors duration-300 group-hover:text-white">
                {first.label}
              </div>
              <div className="mt-1 text-xs text-white/35">Current employer</div>
            </div>
          </div>

          {/* Count */}
          <div className="relative mt-6">
            <div className="text-[4.5rem] font-bold leading-none tracking-tight text-[#E85A66]">
              {first.count}
            </div>
            <div className="mt-1.5 text-xs font-semibold uppercase tracking-[0.20em] text-white/30">
              {pct(first)}% of alumni
            </div>
          </div>
        </div>

        {/* ── Stacked: #2 and #3 ── */}
        <div className="grid gap-4">
          {([second, third] as Array<GroupRow | undefined>).map((item, idx) => {
            if (!item) return null;
            const rank = idx + 2;
            return (
              <div
                key={item.label}
                className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-sm shadow-[0_14px_36px_rgba(0,0,0,0.44)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_22px_50px_rgba(0,0,0,0.50),0_0_36px_rgba(194,26,39,0.16)]"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 rounded-full bg-[#C21A27]/[0.08] blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#5A0A12] to-[#2E0507] text-sm font-bold text-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                    {getCompanyInitials(item.label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-white/85 transition-colors group-hover:text-white">
                        {item.label}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold tracking-[0.10em] text-white/[0.18]">
                        0{rank}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#D04A56]">{item.count}</span>
                      <span className="text-xs text-white/28">{pct(item)}%</span>
                    </div>
                    <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8F1320] to-[#C21A27]"
                        style={{ width: `${(item.count / topCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Compact secondary list (ranks 4–12) ── */}
      {rest.length > 0 && (
        <div className="relative mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((item) => (
            <div
              key={item.label}
              className="group flex items-center gap-3 rounded-[18px] border border-white/[0.06] bg-white/[0.025] px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.10] hover:bg-white/[0.05]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white/[0.06] text-[10px] font-bold text-white/45">
                {getCompanyInitials(item.label)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-white/62 transition-colors group-hover:text-white/82">
                    {item.label}
                  </span>
                  <div className="flex shrink-0 items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-[#C21A27]">{item.count}</span>
                    <span className="text-[10px] text-white/28">{pct(item)}%</span>
                  </div>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7A1018] to-[#C21A27]"
                    style={{ width: `${(item.count / topCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function BubbleComparison({
  positiveLabel,
  positiveValue,
  negativeLabel,
  negativeValue,
}: {
  positiveLabel: string;
  positiveValue: number;
  negativeLabel: string;
  negativeValue: number;
}) {
  const total = positiveValue + negativeValue || 1;
  const positivePct = Math.round((positiveValue / total) * 100);
  const negativePct = 100 - positivePct;

  const MAX = 110;
  const MIN = 60;
  const larger = Math.max(positiveValue, negativeValue);
  const posSize = Math.max(MIN, Math.round((positiveValue / larger) * MAX));
  const negSize = Math.max(MIN, Math.round((negativeValue / larger) * MAX));

  return (
    <div>
      <div className="flex items-center justify-center gap-6">
        <div
          className="flex flex-col items-center justify-center rounded-full border border-[#C21A27]/[0.40] bg-[#C21A27]/[0.12] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-[0_0_32px_rgba(194,26,39,0.40)]"
          style={{ width: posSize, height: posSize }}
        >
          <span className="font-bold leading-none text-white" style={{ fontSize: posSize * 0.22 }}>
            {positiveValue}
          </span>
          <span className="mt-0.5 font-medium leading-none text-[#C21A27]/80" style={{ fontSize: posSize * 0.13 }}>
            {positivePct}%
          </span>
        </div>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-[9px] font-bold uppercase tracking-wider text-white/30">
          vs
        </div>

        <div
          className="flex flex-col items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-[0_0_24px_rgba(255,255,255,0.08)]"
          style={{ width: negSize, height: negSize }}
        >
          <span className="font-bold leading-none text-white/80" style={{ fontSize: negSize * 0.22 }}>
            {negativeValue}
          </span>
          <span className="mt-0.5 font-medium leading-none text-white/35" style={{ fontSize: negSize * 0.13 }}>
            {negativePct}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
        <span>{positiveLabel}</span>
        <span>{negativeLabel}</span>
      </div>
    </div>
  );
}
