import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getCountryName } from "../../lib/countries";
import { buildSeniorityOptions, rawVariantsForSeniority } from "../../lib/seniority";
import { buildIndustryOptions, rawVariantsForIndustry } from "../../lib/industry";
import FilterPanel from "../../components/FilterPanel";
import AlumniTable from "../../components/AlumniTable";
import InteractiveGradientText from "../../components/InteractiveGradientText";

type SearchParams = Promise<{
  q?: string | string[];
  country?: string | string[];
  company?: string | string[];
  industry?: string | string[];
  seniority?: string | string[];
  ageGroup?: string | string[];
  jemeRole?: string | string[];
  board?: string | string[];
  head?: string | string[];
  pastFirm?: string | string[];
  gradYear?: string | string[];
  page?: string | string[];
}>;

type Option = {
  value: string;
  label: string;
};

const PAGE_SIZE = 20;

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const query = getSingle(params.q);
  const selectedCountries = getMany(params.country);
  const selectedCompanies = getMany(params.company);
  const selectedIndustries = getMany(params.industry);
  const selectedSeniorities = getMany(params.seniority);
  const selectedAgeGroups = getMany(params.ageGroup);
  const selectedJemeRoles = getMany(params.jemeRole);
  const selectedBoards = getMany(params.board);
  const selectedHeads = getMany(params.head);

  const selectedPastFirms = getMany(params.pastFirm);
  const selectedGradYears = getMany(params.gradYear);

  const rawPage = Number(getSingle(params.page) || "1");
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const andConditions: Record<string, unknown>[] = [];

  const queryWords = query ? query.trim().split(/\s+/).filter(Boolean) : [];

  if (query) {
    for (const word of queryWords) {
      andConditions.push({
        OR: [
          { full_name: { contains: word, mode: "insensitive" } },
          { current_firm: { contains: word, mode: "insensitive" } },
          { current_role: { contains: word, mode: "insensitive" } },
        ],
      });
    }
  }

  if (selectedCountries.length) {
    andConditions.push({
      current_country: { in: selectedCountries },
    });
  }

  if (selectedCompanies.length) {
    andConditions.push({
      current_firm: { in: selectedCompanies },
    });
  }

  if (selectedIndustries.length) {
    const industryVariants = rawVariantsForIndustry(selectedIndustries);
    andConditions.push({
      OR: industryVariants.map((raw) => ({
        current_industry: { equals: raw, mode: "insensitive" },
      })),
    });
  }

  if (selectedSeniorities.length) {
    const variants = rawVariantsForSeniority(selectedSeniorities);
    andConditions.push({
      OR: variants.map((raw) => ({
        current_role_seniority: { equals: raw, mode: "insensitive" },
      })),
    });
  }

  if (selectedAgeGroups.length) {
    andConditions.push({
      age_group: { in: selectedAgeGroups },
    });
  }

  if (selectedJemeRoles.length) {
    andConditions.push({
      jeme_role: { in: selectedJemeRoles },
    });
  }

  if (selectedBoards.length) {
    andConditions.push({
      board: { in: selectedBoards },
    });
  }

  if (selectedHeads.length) {
    andConditions.push({
      head: { in: selectedHeads },
    });
  }

  if (selectedPastFirms.length) {
    andConditions.push({
      notable_past_firms: { in: selectedPastFirms },
    });
  }

  if (selectedGradYears.length) {
    andConditions.push({
      OR: selectedGradYears.map((year) => ({
        jeme_ending_period: { contains: year, mode: "insensitive" },
      })),
    });
  }

  const where = andConditions.length ? { AND: andConditions } : {};

  const totalCount = await prisma.alumni_raw.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const [
    alumniRaw,
    countriesRaw,
    companiesRaw,
    industriesRaw,
    senioritiesRaw,
    ageGroupsRaw,
    jemeRolesRaw,
    boardRaw,
    headRaw,
    pastFirmsRaw,
    gradPeriodsRaw,
  ] = await Promise.all([
    query
      // Text query present: fetch ALL matches so we can rank by field priority,
      // then paginate in JS after sorting.
      ? prisma.alumni_raw.findMany({
          where,
          select: {
            db_id: true,
            full_name: true,
            current_role: true,
            current_firm: true,
            current_country: true,
            current_industry: true,
            current_role_seniority: true,
            jeme_role: true,
            jeme_ending_period: true,
          },
        })
      // Filter-only: let the DB paginate as before.
      : prisma.alumni_raw.findMany({
          where,
          orderBy: { full_name: "asc" },
          skip,
          take: PAGE_SIZE,
          select: {
            db_id: true,
            full_name: true,
            current_role: true,
            current_firm: true,
            current_country: true,
            current_industry: true,
            current_role_seniority: true,
            jeme_role: true,
            jeme_ending_period: true,
          },
        }),

    prisma.alumni_raw.findMany({
      where: { current_country: { not: "" } },
      distinct: ["current_country"],
      select: { current_country: true },
    }),

    prisma.alumni_raw.findMany({
      where: { current_firm: { not: "" } },
      distinct: ["current_firm"],
      select: { current_firm: true },
    }),

    prisma.alumni_raw.findMany({
      where: { current_industry: { not: "" } },
      distinct: ["current_industry"],
      select: { current_industry: true },
    }),

    prisma.alumni_raw.findMany({
      where: { current_role_seniority: { not: "" } },
      distinct: ["current_role_seniority"],
      select: { current_role_seniority: true },
    }),

    prisma.alumni_raw.findMany({
      where: { age_group: { not: "" } },
      distinct: ["age_group"],
      select: { age_group: true },
    }),

    prisma.alumni_raw.findMany({
      where: { jeme_role: { not: "" } },
      distinct: ["jeme_role"],
      select: { jeme_role: true },
    }),

    prisma.alumni_raw.findMany({
      where: { board: { not: "" } },
      distinct: ["board"],
      select: { board: true },
    }),

    prisma.alumni_raw.findMany({
      where: { head: { not: "" } },
      distinct: ["head"],
      select: { head: true },
    }),

    prisma.alumni_raw.findMany({
      where: { notable_past_firms: { not: "" } },
      distinct: ["notable_past_firms"],
      select: { notable_past_firms: true },
    }),

    prisma.alumni_raw.findMany({
      where: { jeme_ending_period: { not: "" } },
      distinct: ["jeme_ending_period"],
      select: { jeme_ending_period: true },
    }),
  ]);

  // When a text query is present, rank all matches by field priority
  // (name > firm > role) and paginate in JS. Otherwise alumniRaw is
  // already the correct page from the DB.
  const alumni = query
    ? rankByRelevance(alumniRaw, queryWords).slice(skip, skip + PAGE_SIZE)
    : alumniRaw;

  const countryOptions: Option[] = countriesRaw
    .map((row) => row.current_country)
    .filter((value): value is string => Boolean(value))
    .map((value) => ({
      value,
      label: getCountryName(value),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const companyOptions = toOptions(companiesRaw.map((row) => row.current_firm));
  const industryOptions = buildIndustryOptions(
    industriesRaw.map((row) => row.current_industry),
  );
  const seniorityOptions = buildSeniorityOptions(
    senioritiesRaw.map((row) => row.current_role_seniority),
  );
  const ageGroupOptions = toOptions(ageGroupsRaw.map((row) => row.age_group));
  const jemeRoleOptions = toOptions(jemeRolesRaw.map((row) => row.jeme_role));
  const boardOptions = toBooleanOptions(boardRaw.map((row) => row.board));
  const headOptions = toBooleanOptions(headRaw.map((row) => row.head));
  const pastFirmOptions = toOptions(pastFirmsRaw.map((row) => row.notable_past_firms));
  const gradYearOptions: Option[] = [
    ...new Set(
      gradPeriodsRaw
        .map((row) => extractYear(row.jeme_ending_period))
        .filter((y): y is string => y !== null),
    ),
  ]
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({ value: year, label: year }));

  const returnTo = buildReturnTo({
    q: query,
    country: selectedCountries,
    company: selectedCompanies,
    industry: selectedIndustries,
    seniority: selectedSeniorities,
    ageGroup: selectedAgeGroups,
    jemeRole: selectedJemeRoles,
    board: selectedBoards,
    head: selectedHeads,
    pastFirm: selectedPastFirms,
    gradYear: selectedGradYears,
    page: safePage,
  });

  const paginationBase = buildPaginationBase({
    q: query,
    country: selectedCountries,
    company: selectedCompanies,
    industry: selectedIndustries,
    seniority: selectedSeniorities,
    ageGroup: selectedAgeGroups,
    jemeRole: selectedJemeRoles,
    board: selectedBoards,
    head: selectedHeads,
    pastFirm: selectedPastFirms,
    gradYear: selectedGradYears,
  });

  const startItem = totalCount === 0 ? 0 : skip + 1;
  const endItem = totalCount === 0 ? 0 : Math.min(skip + PAGE_SIZE, totalCount);

  return (
    <div className="min-h-screen overflow-hidden bg-[#E6E6E6] text-[#1A1A1A]">
      <div className="pointer-events-none fixed inset-0 bg-[#E6E6E6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(166,15,26,0.08),transparent_28%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_70%,rgba(166,15,26,0.05),transparent_18%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <Link
            href="/directory"
            className="rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm font-medium text-[#A60F1A] transition hover:bg-[#A60F1A] hover:text-white"
          >
            Back to home
          </Link>
        </div>

        <div className="mb-10">
          <InteractiveGradientText className="text-6xl font-semibold tracking-tight leading-[0.95] md:text-7xl xl:text-[8rem]">
            Alumni Directory
          </InteractiveGradientText>
        </div>

        <FilterPanel
          query={query}
          selectedCountries={selectedCountries}
          selectedCompanies={selectedCompanies}
          selectedIndustries={selectedIndustries}
          selectedSeniorities={selectedSeniorities}
          selectedAgeGroups={selectedAgeGroups}
          selectedJemeRoles={selectedJemeRoles}
          selectedBoards={selectedBoards}
          selectedHeads={selectedHeads}
          selectedPastFirms={selectedPastFirms}
          selectedGradYears={selectedGradYears}
          countryOptions={countryOptions}
          companyOptions={companyOptions}
          industryOptions={industryOptions}
          seniorityOptions={seniorityOptions}
          ageGroupOptions={ageGroupOptions}
          jemeRoleOptions={jemeRoleOptions}
          boardOptions={boardOptions}
          headOptions={headOptions}
          pastFirmOptions={pastFirmOptions}
          gradYearOptions={gradYearOptions}
        />

        <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-[#737373]">
              Results
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {totalCount} alumni found
            </div>
            <div className="mt-1 text-sm text-[#5C5A56]">
              Showing {startItem}–{endItem} of {totalCount}
            </div>
            {totalCount > 0 && (
              <a
                href={paginationBase.replace(/^\/directory\/alumni/, "/api/alumni/export")}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#D9D9D9] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C5A56] transition hover:border-[#A60F1A] hover:text-[#A60F1A]"
              >
                ↓ Export CSV
              </a>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-[#5C5A56]">
                Page {safePage} of {totalPages}
              </span>

              {safePage > 1 ? (
                <Link
                  href={navHref(paginationBase, safePage - 1)}
                  scroll={false}
                  aria-label="Previous page"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D9D9D9] bg-white text-sm text-[#5C5A56] transition hover:border-[#A60F1A] hover:text-[#A60F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A60F1A]/40"
                >
                  ←
                </Link>
              ) : (
                <span
                  aria-label="Previous page"
                  aria-disabled="true"
                  className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full border border-[#D9D9D9] bg-[#E6E6E6] text-sm text-[#BFBFBF]"
                >
                  ←
                </span>
              )}

              {safePage < totalPages ? (
                <Link
                  href={navHref(paginationBase, safePage + 1)}
                  scroll={false}
                  aria-label="Next page"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D9D9D9] bg-white text-sm text-[#5C5A56] transition hover:border-[#A60F1A] hover:text-[#A60F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A60F1A]/40"
                >
                  →
                </Link>
              ) : (
                <span
                  aria-label="Next page"
                  aria-disabled="true"
                  className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full border border-[#D9D9D9] bg-[#E6E6E6] text-sm text-[#BFBFBF]"
                >
                  →
                </span>
              )}
            </div>
          )}
        </div>

        <AlumniTable
          alumni={alumni}
          returnTo={returnTo}
          currentPage={safePage}
          totalPages={totalPages}
          paginationBase={paginationBase}
        />
      </div>
    </div>
  );
}

function navHref(base: string, page: number): string {
  const url = new URL(base, "http://localhost");
  url.searchParams.set("page", String(page));
  return `${url.pathname}${url.search}`;
}

function extractYear(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

function getSingle(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getMany(value?: string | string[]) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function toOptions(values: Array<string | null>): Option[] {
  return values
    .filter((value): value is string => Boolean(value))
    .map((value) => ({
      value,
      label: value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function toBooleanOptions(values: Array<string | null>): Option[] {
  return values
    .filter((value): value is string => Boolean(value))
    .map((value) => ({
      value,
      label: booleanLabel(value),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function booleanLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "yes") return "Yes";
  if (normalized === "false" || normalized === "no") return "No";
  return value;
}

function buildReturnTo(input: {
  q: string;
  country: string[];
  company: string[];
  industry: string[];
  seniority: string[];
  ageGroup: string[];
  jemeRole: string[];
  board: string[];
  head: string[];
  pastFirm: string[];
  gradYear: string[];
  page: number;
}) {
  const params = new URLSearchParams();

  if (input.q) params.set("q", input.q);
  input.country.forEach((value) => params.append("country", value));
  input.company.forEach((value) => params.append("company", value));
  input.industry.forEach((value) => params.append("industry", value));
  input.seniority.forEach((value) => params.append("seniority", value));
  input.ageGroup.forEach((value) => params.append("ageGroup", value));
  input.jemeRole.forEach((value) => params.append("jemeRole", value));
  input.board.forEach((value) => params.append("board", value));
  input.head.forEach((value) => params.append("head", value));
  input.pastFirm.forEach((value) => params.append("pastFirm", value));
  input.gradYear.forEach((value) => params.append("gradYear", value));
  params.set("page", String(input.page));

  const queryString = params.toString();
  return queryString ? `/directory/alumni?${queryString}` : "/directory/alumni";
}

function buildPaginationBase(input: {
  q: string;
  country: string[];
  company: string[];
  industry: string[];
  seniority: string[];
  ageGroup: string[];
  jemeRole: string[];
  board: string[];
  head: string[];
  pastFirm: string[];
  gradYear: string[];
}) {
  const params = new URLSearchParams();

  if (input.q) params.set("q", input.q);
  input.country.forEach((value) => params.append("country", value));
  input.company.forEach((value) => params.append("company", value));
  input.industry.forEach((value) => params.append("industry", value));
  input.seniority.forEach((value) => params.append("seniority", value));
  input.ageGroup.forEach((value) => params.append("ageGroup", value));
  input.jemeRole.forEach((value) => params.append("jemeRole", value));
  input.board.forEach((value) => params.append("board", value));
  input.head.forEach((value) => params.append("head", value));
  input.pastFirm.forEach((value) => params.append("pastFirm", value));
  input.gradYear.forEach((value) => params.append("gradYear", value));

  const queryString = params.toString();
  return queryString ? `/directory/alumni?${queryString}` : "/directory/alumni";
}

// ─── Relevance ranking ───────────────────────────────────────────────────────

type RankableRecord = {
  full_name: string | null;
  current_firm: string | null;
  current_role: string | null;
};

/**
 * Assigns a priority score to a record based on which field(s) the query words
 * appear in. Lower score = higher priority (name > firm > role).
 *
 * Score 0 — all query words found in full_name (exact full-name match)
 * Score 1 — some query words found in full_name (partial name match)
 * Score 2 — all query words found in current_firm (no name match)
 * Score 3 — some query words found in current_firm (no name match)
 * Score 4 — role-only match (or mixed across firm+role with no name hit)
 */
function relevanceScore(record: RankableRecord, words: string[]): number {
  const name = record.full_name?.toLowerCase() ?? "";
  const firm = record.current_firm?.toLowerCase() ?? "";

  const nameHits = words.filter((w) => name.includes(w)).length;
  if (nameHits === words.length) return 0;
  if (nameHits > 0) return 1;

  const firmHits = words.filter((w) => firm.includes(w)).length;
  if (firmHits === words.length) return 2;
  if (firmHits > 0) return 3;

  return 4;
}

/**
 * Sorts records by relevance score (name > firm > role), breaking ties
 * alphabetically by full_name.
 */
function rankByRelevance<T extends RankableRecord>(records: T[], queryWords: string[]): T[] {
  const words = queryWords.map((w) => w.toLowerCase());
  return [...records].sort((a, b) => {
    const diff = relevanceScore(a, words) - relevanceScore(b, words);
    if (diff !== 0) return diff;
    return (a.full_name ?? "").localeCompare(b.full_name ?? "");
  });
}