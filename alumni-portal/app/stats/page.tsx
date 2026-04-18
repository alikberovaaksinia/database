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
import { AGE_BUCKETS } from "../lib/age-group";
import { normalizeIndustry, statsIndustryToFilterCanonicals } from "../lib/industry";

export const dynamic = "force-dynamic";

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
  Executive: number;
  Other: number;
};

export default async function StatsPage() {
  const [
    totalAlumni,
    countriesRaw,
    industriesRaw,
    pastIndustriesRaw,
    companiesRaw,
    pastCompaniesRaw,
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
      by: ["npf_industry"],
      _count: { npf_industry: true },
      where: {
        npf_industry: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { npf_industry: "desc" },
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
      by: ["notable_past_firms"],
      _count: { notable_past_firms: true },
      where: {
        notable_past_firms: { not: "" },
        full_name: { not: "" },
      },
      orderBy: {
        _count: { notable_past_firms: "desc" },
      },
    }),

    prisma.alumni_raw.groupBy({
      by: ["current_role"],
      _count: { current_role: true },
      where: {
        current_role: { not: "" },
        full_name: { not: "" },
        NOT: { current_role: { in: ["x", "N/A", "-", "n/a"] } },
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
        NOT: { age_group: { in: ["#VALUE!", "140-145"] } },
      },
      orderBy: {
        _count: { age_group: "desc" },
      },
    }),

    prisma.alumni_raw.findMany({
      where: {
        age_group: { not: "" },
        full_name: { not: "" },
      },
      select: {
        age_group: true,
        current_role: true,
        current_role_seniority: true,
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

  const topThreeCountries = countryMapData.slice(0, 3); // CountryMapRow — includes code for links
  const topCountryCode = countryMapData[0]?.code ?? "";

  const industryTotals = new Map<string, number>();
  for (const row of industriesRaw) {
    const label = normalizeIndustry(row.current_industry);
    if (label) industryTotals.set(label, (industryTotals.get(label) ?? 0) + row._count.current_industry);
  }
  for (const row of pastIndustriesRaw) {
    const label = normalizeIndustry(row.npf_industry);
    if (label) industryTotals.set(label, (industryTotals.get(label) ?? 0) + row._count.npf_industry);
  }
  const industryData: GroupRow[] = Array.from(industryTotals.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const companyData: GroupRow[] = companiesRaw.map((row) => ({
    label: row.current_firm || "-",
    count: row._count.current_firm,
  }));

  const pastCompanyData: GroupRow[] = pastCompaniesRaw.map((row) => ({
    label: row.notable_past_firms || "-",
    count: row._count.notable_past_firms,
  }));

  const roleData: GroupRow[] = rolesRaw.map((row) => ({
    label: row.current_role || "-",
    count: row._count.current_role,
  }));

  const jemeRoleData: GroupRow[] = jemeRolesRaw.map((row) => ({
    label: row.jeme_role || "-",
    count: row._count.jeme_role,
  }));

  const BELOW_50_BUCKETS = new Set(["20-25", "25-30", "30-35", "35-40", "40-45", "45-50"]);
  const INVALID_AGE_BUCKETS = new Set(["#VALUE!", "140-145"]);

  const ageGroupData: GroupRow[] = AGE_BUCKETS
    .map((bucket) => {
      if (bucket === "50+") {
        const count = ageGroupsRaw
          .filter((r) => r.age_group && !BELOW_50_BUCKETS.has(r.age_group) && !INVALID_AGE_BUCKETS.has(r.age_group))
          .reduce((sum, r) => sum + r._count.age_group, 0);
        return { label: "50+", count };
      }
      const row = ageGroupsRaw.find((r) => r.age_group === bucket);
      return { label: bucket, count: row?._count.age_group ?? 0 };
    })
    .filter((r) => r.count > 0);

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

  // ── Pre-computed directory navigation URLs ───────────────────────────────
  const topCompanyHref = topCompany !== "-"
    ? `/directory/alumni?company=${encodeURIComponent(topCompany)}`
    : "/directory/alumni";
  const topRoleHref = topRole !== "-"
    ? `/directory/alumni?q=${encodeURIComponent(topRole)}`
    : "/directory/alumni";
  const topIndustryHref = (() => {
    if (topIndustry === "-") return "/directory/alumni";
    const cs = statsIndustryToFilterCanonicals(topIndustry);
    return `/directory/alumni?${cs.map(c => `industry=${encodeURIComponent(c)}`).join("&")}`;
  })();
  const boardYesHref = `/directory/alumni?${["true","True","yes","Yes","TRUE","YES"].map(v => `board=${encodeURIComponent(v)}`).join("&")}`;
  const boardNoHref  = `/directory/alumni?${["false","False","no","No","FALSE","NO"].map(v => `board=${encodeURIComponent(v)}`).join("&")}`;
  const headYesHref  = `/directory/alumni?${["true","True","yes","Yes","TRUE","YES"].map(v => `head=${encodeURIComponent(v)}`).join("&")}`;
  const headNoHref   = `/directory/alumni?${["false","False","no","No","FALSE","NO"].map(v => `head=${encodeURIComponent(v)}`).join("&")}`;

  return (
    <div className="min-h-screen overflow-hidden bg-[#1A1A1A] text-white">
      {/* Single very subtle vignette — no heavy glows */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_60%_at_50%_0%,rgba(166,15,26,0.06),transparent)]" />

      <div className="relative mx-auto max-w-4xl px-6 py-8 pb-24">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/directory"
            className="rounded-full border border-[#5C5A56] bg-[#1C1C1C] px-4 py-2 text-sm font-medium text-[#B3B0AA] transition hover:border-[#A6A6A6] hover:text-white"
          >
            Back to home
          </Link>
        </div>

        {/* Header */}
        <AnimatedSection>
          <div className="mb-10">
            <InteractiveHeroTitle
              className="text-5xl font-semibold tracking-tight leading-[0.95] md:text-6xl xl:text-[6rem]"
              variant="light"
            >
              Alumni Analytics
            </InteractiveHeroTitle>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#A6A6A6]">
              Explore the alumni network through geography, careers,
              companies, and JEME leadership data.
            </p>
          </div>
        </AnimatedSection>

        {/* Stat tiles */}
        <AnimatedSection delay={0.05}>
          <div className="mt-2 flex flex-col gap-4 md:gap-5">

            {/* ── Row 1: hero left (~41%), two secondaries right (~29% each) ── */}
            <div className="grid grid-cols-1 gap-4 md:gap-5 md:[grid-template-columns:1.4fr_1fr_1fr]">
              <Link href="/directory/alumni" className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Total Alumni" value={String(totalAlumni)} accent size="hero" />
              </Link>
              <Link href="/directory/alumni" className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Countries Represented" value={String(totalCountries)} accent />
              </Link>
              <Link href="/directory/alumni" className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Industries Represented" value={String(totalIndustries)} accent />
              </Link>
            </div>

            {/* ── Row 2: two secondaries left (~29% each), wide tile right (~41%) ── */}
            <div className="grid grid-cols-1 gap-4 md:gap-5 md:[grid-template-columns:1fr_1fr_1.4fr]">
              <Link href="/directory/alumni" className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Companies Represented" value={String(totalCompanies)} accent />
              </Link>
              <Link href={boardYesHref} className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Board Members" value={String(boardYesCount)} accent />
              </Link>
              <Link
                href={topCountryCode ? `/directory/alumni?country=${encodeURIComponent(topCountryCode)}` : "/directory/alumni"}
                className="block h-full cursor-pointer"
              >
                <StatTile label="Top Country" value={topCountry} />
              </Link>
            </div>

            {/* ── Row 3: four equal compact tiles ── */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              <Link href={headYesHref} className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Department Heads" value={String(headYesCount)} accent size="compact" />
              </Link>
              <Link href={topCompanyHref} className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Top Company" value={topCompany} size="compact" />
              </Link>
              <Link href={topIndustryHref} className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Top Industry" value={topIndustry} size="compact" />
              </Link>
              <Link href={topRoleHref} className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Top Role" value={topRole} size="compact" />
              </Link>
            </div>

            {/* ── Row 4: two equal tiles ── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <Link href="/directory/alumni" className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="JEME Roles Tracked" value={String(jemeRoleData.length)} accent />
              </Link>
              <Link href="/directory/alumni" className="block h-full cursor-pointer rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">
                <StatTile label="Role Categories" value={String(totalRoles)} accent />
              </Link>
            </div>

          </div>
        </AnimatedSection>

        {/* ── Geography ── */}
        <AnimatedSection delay={0.14}>
          <SectionLabel>Geography</SectionLabel>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div>
            {/* Dark centerpiece card */}
            <div className="mt-6 relative overflow-hidden rounded-[42px] border border-[#404040] bg-[#1C1C1C] shadow-[0_30px_80px_rgba(0,0,0,0.60)]">

              {/* Single red accent glow — top-right */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_90%_0%,rgba(166,15,26,0.25),transparent)]" />

              {/* ── Header ── */}
              <div className="relative px-8 pt-8 md:px-10 md:pt-10">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-semibold text-white md:text-4xl">
                      Global Alumni Footprint
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#A6A6A6]">
                      Where alumni are currently working, across {totalCountries} countries.
                    </p>
                  </div>

                </div>
              </div>

              {/* ── Two-column body: map left, top countries right ── */}
              <div className="relative mt-2 flex flex-col lg:grid lg:grid-cols-[2fr_1fr] lg:items-start">

                {/* Left: Map */}
                <div className="min-w-0 lg:border-r lg:border-[#404040]">
                  <WorldMapChart
                    data={countryMapData.map((item) => ({
                      country: item.code,
                      value: item.count,
                    }))}
                  />
                </div>

                {/* Right: Top countries */}
                <div className="border-t border-[#404040] px-8 py-6 lg:border-t-0 lg:px-8 lg:py-8">
                  <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#737373]">
                    Top countries
                  </div>
                  <div className="flex flex-col gap-3">
                    {topThreeCountries.map((country, index) => (
                      <MapTopCountryCard
                        key={country.label}
                        rank={index + 1}
                        country={country.label}
                        code={country.code}
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
              subtitle="Most represented industries across current and past roles."
            >
              <IndustryWheel data={industryData.slice(0, 10)} total={totalAlumni} />
            </StatsChartCard>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.22}>
          <div className="mt-6">
            <RoleHeroCards data={roleData.slice(0, 12)} total={totalAlumni} totalDistinct={roleData.length} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.25}>
          <div className="mt-6">
            <CompanyHeroCards data={companyData.slice(0, 12)} total={totalAlumni} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.26}>
          <div className="mt-6">
            <CompanyHeroCards
              data={pastCompanyData.slice(0, 12)}
              total={totalAlumni}
              title="Top Past Employers"
              subtitle="Companies where the highest number of alumni have previously worked."
              topBadge="Top Past Employer"
              employerLabel="Past employer"
              filterParam="pastFirm"
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.27}>
          <div className="mt-6">
            <section className="relative overflow-hidden rounded-[34px] border border-[#404040] bg-[#1C1C1C] p-7 shadow-[0_22px_54px_rgba(0,0,0,0.55)]">
              <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#A60F1A]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
              <h2 className="relative text-2xl font-semibold tracking-tight text-[#E6E6E6]">JEME Role Distribution</h2>
              <p className="relative mt-2 text-sm leading-7 text-[#A6A6A6]">How alumni were distributed across JEME organizational roles.</p>
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
            <section className="relative overflow-hidden rounded-[34px] border border-[#404040] bg-[#1C1C1C] p-7 shadow-[0_22px_54px_rgba(0,0,0,0.55)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-[#A60F1A]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
              <div className="relative flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#E6E6E6]">Board vs Non-board</h2>
                  <p className="mt-1 text-xs leading-6 text-[#A6A6A6]">Board membership across all alumni.</p>
                </div>
                <BubbleComparison
                  positiveLabel="Board"
                  positiveValue={boardYesCount}
                  negativeLabel="Non-board"
                  negativeValue={boardNoCount}
                  positiveHref={boardYesHref}
                  negativeHref={boardNoHref}
                />
                <div className="border-t border-[#404040] pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">Board</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-[#A60F1A]">{boardYesCount}</div>
                    </div>
                    <div className="mb-1 text-[10px] font-medium text-[#737373]">out of {boardYesCount + boardNoCount}</div>
                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">Non-board</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-[#A6A6A6]">{boardNoCount}</div>
                    </div>
                  </div>
                  <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-[#404040]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7A0C14] to-[#A60F1A]"
                      style={{ width: `${Math.round((boardYesCount / (boardYesCount + boardNoCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[34px] border border-[#404040] bg-[#1C1C1C] p-7 shadow-[0_22px_54px_rgba(0,0,0,0.55)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-[#A60F1A]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
              <div className="relative flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#E6E6E6]">Head vs Non-head</h2>
                  <p className="mt-1 text-xs leading-6 text-[#A6A6A6]">Department leadership across all alumni.</p>
                </div>
                <BubbleComparison
                  positiveLabel="Head"
                  positiveValue={headYesCount}
                  negativeLabel="Non-head"
                  negativeValue={headNoCount}
                  positiveHref={headYesHref}
                  negativeHref={headNoHref}
                />
                <div className="border-t border-[#404040] pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">Head</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-[#A60F1A]">{headYesCount}</div>
                    </div>
                    <div className="mb-1 text-[10px] font-medium text-[#737373]">out of {headYesCount + headNoCount}</div>
                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">Non-head</div>
                      <div className="mt-1 text-[2rem] font-bold leading-none text-[#A6A6A6]">{headNoCount}</div>
                    </div>
                  </div>
                  <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-[#404040]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7A0C14] to-[#A60F1A]"
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

function inferSeniority(role: string | null | undefined): keyof Omit<AgeBySeniorityRow, "ageGroup"> {
  if (!role) return "Other";

  const r = role.toLowerCase();

  if (
    r.includes("ceo") ||
    r.includes("chief") ||
    r.includes("president") ||
    r.includes("founder") ||
    r.includes("partner") ||
    r.includes("managing director") ||
    r.includes("general manager") ||
    r.includes("director") ||
    r.includes("head") ||
    r.includes("vice president") ||
    r.includes("vp")
  ) {
    return "Executive";
  }

  if (
    r.includes("manager") ||
    r.includes("lead") ||
    r.includes("principal") ||
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

const SENIORITY_COL_MAP: Record<string, keyof Omit<AgeBySeniorityRow, "ageGroup">> = {
  "c level":      "Executive",
  "owner":        "Executive",
  "entry level":  "Entry",
  "middle level": "Mid",
};

function resolveSeniority(
  seniority: string | null | undefined,
  role: string | null | undefined,
): keyof Omit<AgeBySeniorityRow, "ageGroup"> {
  if (seniority) {
    const mapped = SENIORITY_COL_MAP[seniority.trim().toLowerCase()];
    if (mapped) return mapped;
  }
  return inferSeniority(role) as keyof Omit<AgeBySeniorityRow, "ageGroup">;
}

const BELOW_50_AGE_BUCKETS = new Set(["20-25", "25-30", "30-35", "35-40", "40-45", "45-50"]);
const INVALID_AGE_VALUES = new Set(["#VALUE!", "140-145"]);

function normalizeAgeGroup(raw: string | null): string | null {
  if (!raw) return null;
  if (INVALID_AGE_VALUES.has(raw)) return null;
  if (!BELOW_50_AGE_BUCKETS.has(raw) && raw !== "50+") return "50+";
  return raw;
}

function buildAgeBySeniorityData(
  rows: Array<{ age_group: string | null; current_role: string | null; current_role_seniority: string | null }>,
): AgeBySeniorityRow[] {
  const preferredOrder = ["20-25", "25-30", "30-35", "35-40", "40-45", "45-50", "50+"];

  const map = new Map<string, AgeBySeniorityRow>();

  for (const age of preferredOrder) {
    map.set(age, {
      ageGroup: age,
      Entry: 0,
      Mid: 0,
      Executive: 0,
      Other: 0,
    });
  }

  for (const row of rows) {
    const ageGroup = normalizeAgeGroup(row.age_group);
    if (!ageGroup) continue;

    if (!map.has(ageGroup)) {
      map.set(ageGroup, {
        ageGroup,
        Entry: 0,
        Mid: 0,
        Executive: 0,
        Other: 0,
      });
    }

    const bucket = resolveSeniority(row.current_role_seniority, row.current_role);

    const current = map.get(ageGroup)!;
    current[bucket] += 1;
  }

  const allRows = Array.from(map.values()).filter((row) => {
    return row.Entry + row.Mid + row.Executive + row.Other > 0;
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


function MapTopCountryCard({
  rank,
  country,
  code,
  count,
  total,
  maxCount,
}: {
  rank: number;
  country: string;
  code: string;
  count: number;
  total: number;
  maxCount: number;
}) {
  const barWidth = `${(count / maxCount) * 100}%`;
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
  const medals = ["01", "02", "03"];

  return (
    <Link
      href={`/directory/alumni?country=${encodeURIComponent(code)}`}
      className="group block rounded-[22px] border border-[#404040] bg-[#1C1C1C] p-5 transition-all duration-200 hover:border-[#5C5A56] hover:bg-[#404040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A60F1A] to-[#5A0008] text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(166,15,26,0.4)]">
            {medals[rank - 1]}
          </div>
          <span className="truncate text-sm font-semibold text-[#E6E6E6] group-hover:text-white transition-colors duration-200">
            {country}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-right">
          <span className="text-xl font-bold text-[#D65A61]">{count}</span>
          <span className="text-xs text-[#737373]">{pct}%</span>
          <span className="text-[#737373] text-xs transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7A0C14] to-[#D65A61]"
          style={{ width: barWidth }}
        />
      </div>
    </Link>
  );
}

function HeroPill({ value }: { value: string; label: string }) {
  return (
    <div className="inline-flex items-center rounded-full bg-white/12 px-4 py-2 text-base font-bold text-white ring-1 ring-white/10">
      {value}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mt-12 flex items-center gap-4">
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#737373]">
        {children}
      </div>
      <div className="h-px flex-1 bg-[#1C1C1C]" />
    </div>
  );
}

function StatTile({
  label,
  value,
  accent = false,
  size = "standard",
}: {
  label: string;
  value: string;
  accent?: boolean;
  size?: "hero" | "standard" | "compact";
}) {
  const isNumeric = /^\d+$/.test(value);

  return (
    <div
      className={`h-full rounded-[22px] border border-[#404040] bg-[#1C1C1C] transition-all duration-300 hover:-translate-y-1 hover:border-[#5C5A56] ${
        size === "hero"
          ? "min-h-[164px] p-7"
          : size === "compact"
            ? "min-h-[92px] p-5"
            : "min-h-[112px] p-5"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#737373]">
          {label}
        </div>
        <div
          className={`mt-auto pt-3 font-bold leading-none tracking-tight text-white ${
            size === "hero"
              ? isNumeric
                ? "text-[4.5rem]"
                : "text-[2rem] leading-snug"
              : size === "compact"
                ? isNumeric
                  ? "text-3xl"
                  : "text-sm leading-snug text-[#E6E6E6]"
                : isNumeric
                  ? "text-[2.5rem]"
                  : "text-xl leading-snug text-[#E6E6E6]"
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function RoleHeroCards({
  data,
  total,
  totalDistinct,
}: {
  data: GroupRow[];
  total?: number;
  totalDistinct?: number;
}) {
  const effectiveTotal = total ?? data.reduce((sum, item) => sum + item.count, 0);
  const topCount = data[0]?.count ?? 1;

  if (data.length === 0) {
    return <div className="text-sm text-[#737373]">No data available.</div>;
  }

  const [rank1, rank2, rank3, ...rest] = data;
  const pct = (item: GroupRow) =>
    effectiveTotal > 0 ? ((item.count / effectiveTotal) * 100).toFixed(1) : "0";

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#404040] bg-[#1C1C1C] p-7 shadow-[0_22px_54px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#A60F1A]/[0.18] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#E6E6E6]">
            Current Role Distribution
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#A6A6A6]">
            How alumni currently identify professionally.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-[#404040] bg-[#1C1C1C] px-4 py-3 text-right">
          <div className="text-xl font-bold leading-none text-[#E6E6E6]">
            {totalDistinct ?? data.length}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
            distinct roles
          </div>
        </div>
      </div>

      {/* ── Tier 1 — #1 hero row ── */}
      {rank1 && (
        <Link
          href={`/directory/alumni?q=${encodeURIComponent(rank1.label)}`}
          className="relative mt-7 block overflow-hidden rounded-[22px] border border-[#A60F1A]/[0.28] bg-[#A60F1A]/[0.10] px-6 py-5 shadow-[0_0_36px_rgba(166,15,26,0.14)] transition-colors duration-200 hover:bg-[#A60F1A]/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A60F1A]/50"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A60F1A]/[0.55] to-transparent" />
          <div className="flex items-center gap-5">
            <span className="shrink-0 select-none text-[3.5rem] font-black leading-none tracking-tighter text-[#D65A61]/[0.55]">
              01
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xl font-semibold text-white">{rank1.label}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#737373]">
                Most common role
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[3rem] font-bold leading-none text-[#D65A61]">
                {rank1.count}
              </div>
              <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                {pct(rank1)}% of alumni
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ── Tier 2 — #2 and #3 side by side ── */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {([rank2, rank3] as Array<GroupRow | undefined>).map((item, idx) => {
          if (!item) return null;
          const rank = idx + 2;
          return (
            <Link
              key={item.label}
              href={`/directory/alumni?q=${encodeURIComponent(item.label)}`}
              className="group relative block overflow-hidden rounded-[18px] border border-[#404040] bg-[#1A1A1A] px-5 py-4 transition-colors duration-150 hover:border-[#5C5A56] hover:bg-[#1C1C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold tracking-[0.14em] text-[#D65A61]/[0.45]">
                    0{rank}
                  </span>
                  <div className="mt-1.5 truncate text-base font-semibold text-[#E6E6E6] transition-colors group-hover:text-white">
                    {item.label}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold text-[#D65A61]">{item.count}</div>
                  <div className="mt-0.5 text-[10px] text-[#737373]">{pct(item)}%</div>
                </div>
              </div>
              <div className="mt-4 h-[2px] overflow-hidden rounded-full bg-[#1C1C1C]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5A0008] to-[#A60F1A]"
                  style={{ width: `${(item.count / topCount) * 100}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Tier 3 — compact ranked list ── */}
      {rest.length > 0 && (
        <div className="mt-3 divide-y divide-white/[0.04]">
          {rest.map((item, idx) => {
            const rank = idx + 4;
            return (
              <Link
                key={item.label}
                href={`/directory/alumni?q=${encodeURIComponent(item.label)}`}
                className="group flex items-center gap-4 rounded-xl py-2.5 pl-1 pr-2 transition-colors duration-150 first:pt-3 last:pb-0 hover:bg-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                <span className="w-7 shrink-0 text-right text-[11px] font-bold tabular-nums text-[#D65A61]/[0.35] transition-colors group-hover:text-[#D65A61]/[0.65]">
                  {String(rank).padStart(2, "0")}
                </span>
                <span className="flex-1 truncate text-sm text-[#A6A6A6] transition-colors group-hover:text-[#E6E6E6]">
                  {item.label}
                </span>
                <div className="w-24 overflow-hidden rounded-full bg-[#1C1C1C]" style={{ height: 3 }}>
                  <div
                    className="h-full rounded-full bg-[#A60F1A]/[0.45] transition-all group-hover:bg-[#A60F1A]/[0.65]"
                    style={{ width: `${(item.count / topCount) * 100}%` }}
                  />
                </div>
                <div className="flex w-14 shrink-0 items-baseline justify-end gap-1">
                  <span className="text-sm font-semibold tabular-nums text-[#A6A6A6] transition-colors group-hover:text-[#A60F1A]">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-[#737373]">{pct(item)}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer — label shows this is a top-N view */}
      <div className="mt-5 border-t border-[#404040] pt-4 text-center text-[11px] text-[#737373]">
        Showing top {data.length} of {totalDistinct ?? data.length} distinct roles
      </div>
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

function CompanyHeroCards({ data, total, title, subtitle, topBadge, employerLabel, filterParam = "company" }: {
  data: GroupRow[];
  total?: number;
  title?: string;
  subtitle?: string;
  topBadge?: string;
  employerLabel?: string;
  filterParam?: "company" | "pastFirm";
}) {
  const [first, second, third, ...rest] = data;
  const effectiveTotal = total ?? data.reduce((sum, item) => sum + item.count, 0);
  const topCount = first?.count ?? 1;

  if (!first) {
    return <div className="text-sm text-[#737373]">No data available.</div>;
  }

  const pct = (item: GroupRow) =>
    effectiveTotal > 0 ? ((item.count / effectiveTotal) * 100).toFixed(1) : "0";

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#404040] bg-[#1C1C1C] p-7 shadow-[0_22px_54px_rgba(0,0,0,0.55)]">
      {/* Ambient corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#A60F1A]/[0.08] blur-3xl" />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

      <h2 className="relative text-2xl font-semibold tracking-tight text-[#E6E6E6]">
        {title ?? "Top Companies"}
      </h2>
      <p className="relative mt-2 text-sm leading-7 text-[#A6A6A6]">
        {subtitle ?? "Companies where the highest number of alumni currently work."}
      </p>

      {/* ── Asymmetric hero layout ── */}
      <div className="relative mt-6 grid gap-4 lg:grid-cols-[3fr_2fr]">

        {/* ── Featured card — #1 ── */}
        <Link
          href={`/directory/alumni?${filterParam}=${encodeURIComponent(first.label)}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A60F1A]/40 rounded-[26px]"
        >
        <div className="group relative flex flex-col overflow-hidden rounded-[26px] border border-[#A60F1A]/[0.28] bg-[#A60F1A]/[0.18] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.50),0_0_30px_rgba(166,15,26,0.12)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.012] hover:shadow-[0_30px_64px_rgba(0,0,0,0.55),0_0_52px_rgba(166,15,26,0.26)]">
          {/* Hover glow */}
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[#A60F1A]/[0.10] blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {/* Top edge glass highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />

          {/* Top row: label + rank */}
          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#A60F1A]/[0.18] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D65A61]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D65A61]" />
              {topBadge ?? "Top Employer"}
            </span>
            <span className="text-[11px] font-bold tracking-[0.10em] text-white/[0.18]">01</span>
          </div>

          {/* Company identity row */}
          <div className="relative mt-6 flex items-center gap-5">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#A60F1A] to-[#5A0008] text-2xl font-bold text-white shadow-[0_8px_24px_rgba(166,15,26,0.50),inset_0_1px_0_rgba(255,255,255,0.15)]">
              {getCompanyInitials(first.label)}
            </div>
            <div className="min-w-0">
              <div className="line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-[#E6E6E6] transition-colors duration-300 group-hover:text-white">
                {first.label}
              </div>
              <div className="mt-1 text-xs text-[#737373]">{employerLabel ?? "Current employer"}</div>
            </div>
          </div>

          {/* Count */}
          <div className="relative mt-6">
            <div className="text-[4.5rem] font-bold leading-none tracking-tight text-[#D65A61]">
              {first.count}
            </div>
            <div className="mt-1.5 text-xs font-semibold uppercase tracking-[0.20em] text-[#737373]">
              {pct(first)}% of alumni
            </div>
          </div>
        </div>
        </Link>

        {/* ── Stacked: #2 and #3 ── */}
        <div className="grid gap-4">
          {([second, third] as Array<GroupRow | undefined>).map((item, idx) => {
            if (!item) return null;
            const rank = idx + 2;
            return (
              <Link
                key={item.label}
                href={`/directory/alumni?${filterParam}=${encodeURIComponent(item.label)}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 rounded-[26px]"
              >
              <div
                className="group relative overflow-hidden rounded-[26px] border border-[#404040] bg-[#1A1A1A] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.44)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_22px_50px_rgba(0,0,0,0.50),0_0_36px_rgba(166,15,26,0.16)]"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 rounded-full bg-[#A60F1A]/[0.08] blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#5A0008] to-[#5A0008] text-sm font-bold text-[#E6E6E6] shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                    {getCompanyInitials(item.label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-[#E6E6E6] transition-colors group-hover:text-white">
                        {item.label}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold tracking-[0.10em] text-white/[0.18]">
                        0{rank}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#D65A61]">{item.count}</span>
                      <span className="text-xs text-[#737373]">{pct(item)}%</span>
                    </div>
                    <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-[#404040]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7A0C14] to-[#A60F1A]"
                        style={{ width: `${(item.count / topCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Compact secondary list (ranks 4–12) ── */}
      {rest.length > 0 && (
        <div className="relative mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((item) => (
            <Link
              key={item.label}
              href={`/directory/alumni?${filterParam}=${encodeURIComponent(item.label)}`}
              className="group flex items-center gap-3 rounded-[18px] border border-[#404040] bg-[#1A1A1A] px-4 py-3 transition-all duration-200 hover:border-[#404040] hover:bg-[#1C1C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#1C1C1C] text-[10px] font-bold text-[#A6A6A6]">
                {getCompanyInitials(item.label)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[#A6A6A6] transition-colors group-hover:text-white">
                    {item.label}
                  </span>
                  <div className="flex shrink-0 items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-[#A60F1A]">{item.count}</span>
                    <span className="text-[10px] text-[#737373]">{pct(item)}%</span>
                  </div>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#404040]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#5A0008] to-[#A60F1A]"
                    style={{ width: `${(item.count / topCount) * 100}%` }}
                  />
                </div>
              </div>
            </Link>
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
  positiveHref,
  negativeHref,
}: {
  positiveLabel: string;
  positiveValue: number;
  negativeLabel: string;
  negativeValue: number;
  positiveHref?: string;
  negativeHref?: string;
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
        {(() => {
          const bubble = (
            <div
              className={`flex flex-col items-center justify-center rounded-full border border-[#A60F1A]/[0.40] bg-[#A60F1A]/[0.22] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_32px_rgba(166,15,26,0.40)] ${positiveHref ? "cursor-pointer" : ""}`}
              style={{ width: posSize, height: posSize }}
            >
              <span className="font-bold leading-none text-white" style={{ fontSize: posSize * 0.22 }}>
                {positiveValue}
              </span>
              <span className="mt-0.5 font-medium leading-none text-[#A60F1A]/80" style={{ fontSize: posSize * 0.13 }}>
                {positivePct}%
              </span>
            </div>
          );
          return positiveHref ? <Link href={positiveHref} className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A60F1A]/40">{bubble}</Link> : bubble;
        })()}

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#404040] bg-[#1C1C1C] text-[9px] font-bold uppercase tracking-wider text-[#737373]">
          vs
        </div>

        {(() => {
          const bubble = (
            <div
              className={`flex flex-col items-center justify-center rounded-full border border-[#404040] bg-[#1C1C1C] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_24px_rgba(255,255,255,0.08)] ${negativeHref ? "cursor-pointer" : ""}`}
              style={{ width: negSize, height: negSize }}
            >
              <span className="font-bold leading-none text-[#E6E6E6]" style={{ fontSize: negSize * 0.22 }}>
                {negativeValue}
              </span>
              <span className="mt-0.5 font-medium leading-none text-[#737373]" style={{ fontSize: negSize * 0.13 }}>
                {negativePct}%
              </span>
            </div>
          );
          return negativeHref ? <Link href={negativeHref} className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25">{bubble}</Link> : bubble;
        })()}
      </div>

      <div className="mt-4 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
        <span>{positiveLabel}</span>
        <span>{negativeLabel}</span>
      </div>
    </div>
  );
}
