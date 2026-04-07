import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getCountryName } from "../../lib/countries";
import FilterPanel from "../../components/FilterPanel";
import AlumniTable from "../../components/AlumniTable";
import InteractiveGradientText from "../../components/InteractiveGradientText";

type SearchParams = Promise<{
  q?: string | string[];
  country?: string | string[];
  role?: string | string[];
  company?: string | string[];
  industry?: string | string[];
  ageGroup?: string | string[];
  jemeRole?: string | string[];
  board?: string | string[];
  head?: string | string[];
  pastFirm?: string | string[];
  pastRole?: string | string[];
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
  const selectedRoles = getMany(params.role);
  const selectedCompanies = getMany(params.company);
  const selectedIndustries = getMany(params.industry);
  const selectedAgeGroups = getMany(params.ageGroup);
  const selectedJemeRoles = getMany(params.jemeRole);
  const selectedBoards = getMany(params.board);
  const selectedHeads = getMany(params.head);

  const selectedPastFirms = getMany(params.pastFirm);
  const selectedPastRoles = getMany(params.pastRole);
  const selectedGradYears = getMany(params.gradYear);

  const rawPage = Number(getSingle(params.page) || "1");
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const andConditions: Record<string, unknown>[] = [];

  if (query) {
    const words = query.trim().split(/\s+/).filter(Boolean);
    for (const word of words) {
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

  if (selectedRoles.length) {
    andConditions.push({
      current_role: { in: selectedRoles },
    });
  }

  if (selectedCompanies.length) {
    andConditions.push({
      current_firm: { in: selectedCompanies },
    });
  }

  if (selectedIndustries.length) {
    andConditions.push({
      current_industry: { in: selectedIndustries },
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

  if (selectedPastRoles.length) {
    andConditions.push({
      past_role_npf: { in: selectedPastRoles },
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
    alumni,
    countriesRaw,
    rolesRaw,
    companiesRaw,
    industriesRaw,
    ageGroupsRaw,
    jemeRolesRaw,
    boardRaw,
    headRaw,
    pastFirmsRaw,
    pastRolesRaw,
    gradPeriodsRaw,
  ] = await Promise.all([
    prisma.alumni_raw.findMany({
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
      },
    }),

    prisma.alumni_raw.findMany({
      where: { current_country: { not: "" } },
      distinct: ["current_country"],
      select: { current_country: true },
    }),

    prisma.alumni_raw.findMany({
      where: { current_role: { not: "" } },
      distinct: ["current_role"],
      select: { current_role: true },
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
      where: { past_role_npf: { not: "" } },
      distinct: ["past_role_npf"],
      select: { past_role_npf: true },
    }),

    prisma.alumni_raw.findMany({
      where: { jeme_ending_period: { not: "" } },
      distinct: ["jeme_ending_period"],
      select: { jeme_ending_period: true },
    }),
  ]);

  const countryOptions: Option[] = countriesRaw
    .map((row) => row.current_country)
    .filter((value): value is string => Boolean(value))
    .map((value) => ({
      value,
      label: getCountryName(value),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const roleOptions = toOptions(rolesRaw.map((row) => row.current_role));
  const companyOptions = toOptions(companiesRaw.map((row) => row.current_firm));
  const industryOptions = toOptions(
    industriesRaw.map((row) => row.current_industry),
  );
  const ageGroupOptions = toOptions(ageGroupsRaw.map((row) => row.age_group));
  const jemeRoleOptions = toOptions(jemeRolesRaw.map((row) => row.jeme_role));
  const boardOptions = toBooleanOptions(boardRaw.map((row) => row.board));
  const headOptions = toBooleanOptions(headRaw.map((row) => row.head));
  const pastFirmOptions = toOptions(pastFirmsRaw.map((row) => row.notable_past_firms));
  const pastRoleOptions = toOptions(pastRolesRaw.map((row) => row.past_role_npf));
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
    role: selectedRoles,
    company: selectedCompanies,
    industry: selectedIndustries,
    ageGroup: selectedAgeGroups,
    jemeRole: selectedJemeRoles,
    board: selectedBoards,
    head: selectedHeads,
    pastFirm: selectedPastFirms,
    pastRole: selectedPastRoles,
    gradYear: selectedGradYears,
    page: safePage,
  });

  const paginationBase = buildPaginationBase({
    q: query,
    country: selectedCountries,
    role: selectedRoles,
    company: selectedCompanies,
    industry: selectedIndustries,
    ageGroup: selectedAgeGroups,
    jemeRole: selectedJemeRoles,
    board: selectedBoards,
    head: selectedHeads,
    pastFirm: selectedPastFirms,
    pastRole: selectedPastRoles,
    gradYear: selectedGradYears,
  });

  const startItem = totalCount === 0 ? 0 : skip + 1;
  const endItem = totalCount === 0 ? 0 : Math.min(skip + PAGE_SIZE, totalCount);

  return (
    <div className="min-h-screen overflow-hidden bg-[#FCFAFA] text-[#1D1D1B]">
      <div className="pointer-events-none fixed inset-0 bg-[#FCFAFA]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,26,39,0.08),transparent_28%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_70%,rgba(194,26,39,0.05),transparent_18%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 rounded-full border border-[#E7DCDD] bg-white px-4 py-2 text-sm font-medium text-[#C21A27] transition hover:bg-[#C21A27] hover:text-white"
          >
            ← Back to home
          </Link>
        </div>

        <div className="mb-10">
          <InteractiveGradientText className="text-5xl font-semibold tracking-tight leading-[0.95] md:text-6xl xl:text-[6rem]">
            Alumni Directory
          </InteractiveGradientText>
        </div>

        <FilterPanel
          query={query}
          selectedCountries={selectedCountries}
          selectedRoles={selectedRoles}
          selectedCompanies={selectedCompanies}
          selectedIndustries={selectedIndustries}
          selectedAgeGroups={selectedAgeGroups}
          selectedJemeRoles={selectedJemeRoles}
          selectedBoards={selectedBoards}
          selectedHeads={selectedHeads}
          selectedPastFirms={selectedPastFirms}
          selectedPastRoles={selectedPastRoles}
          selectedGradYears={selectedGradYears}
          countryOptions={countryOptions}
          roleOptions={roleOptions}
          companyOptions={companyOptions}
          industryOptions={industryOptions}
          ageGroupOptions={ageGroupOptions}
          jemeRoleOptions={jemeRoleOptions}
          boardOptions={boardOptions}
          headOptions={headOptions}
          pastFirmOptions={pastFirmOptions}
          pastRoleOptions={pastRoleOptions}
          gradYearOptions={gradYearOptions}
        />

        <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-[#9B6A71]">
              Results
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {totalCount} alumni found
            </div>
            <div className="mt-1 text-sm text-[#615F59]">
              Showing {startItem}–{endItem} of {totalCount}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="text-sm text-[#615F59]">
              Page {safePage} of {totalPages}
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
  role: string[];
  company: string[];
  industry: string[];
  ageGroup: string[];
  jemeRole: string[];
  board: string[];
  head: string[];
  pastFirm: string[];
  pastRole: string[];
  gradYear: string[];
  page: number;
}) {
  const params = new URLSearchParams();

  if (input.q) params.set("q", input.q);
  input.country.forEach((value) => params.append("country", value));
  input.role.forEach((value) => params.append("role", value));
  input.company.forEach((value) => params.append("company", value));
  input.industry.forEach((value) => params.append("industry", value));
  input.ageGroup.forEach((value) => params.append("ageGroup", value));
  input.jemeRole.forEach((value) => params.append("jemeRole", value));
  input.board.forEach((value) => params.append("board", value));
  input.head.forEach((value) => params.append("head", value));
  input.pastFirm.forEach((value) => params.append("pastFirm", value));
  input.pastRole.forEach((value) => params.append("pastRole", value));
  input.gradYear.forEach((value) => params.append("gradYear", value));
  params.set("page", String(input.page));

  const queryString = params.toString();
  return queryString ? `/directory/alumni?${queryString}` : "/directory/alumni";
}

function buildPaginationBase(input: {
  q: string;
  country: string[];
  role: string[];
  company: string[];
  industry: string[];
  ageGroup: string[];
  jemeRole: string[];
  board: string[];
  head: string[];
  pastFirm: string[];
  pastRole: string[];
  gradYear: string[];
}) {
  const params = new URLSearchParams();

  if (input.q) params.set("q", input.q);
  input.country.forEach((value) => params.append("country", value));
  input.role.forEach((value) => params.append("role", value));
  input.company.forEach((value) => params.append("company", value));
  input.industry.forEach((value) => params.append("industry", value));
  input.ageGroup.forEach((value) => params.append("ageGroup", value));
  input.jemeRole.forEach((value) => params.append("jemeRole", value));
  input.board.forEach((value) => params.append("board", value));
  input.head.forEach((value) => params.append("head", value));
  input.pastFirm.forEach((value) => params.append("pastFirm", value));
  input.pastRole.forEach((value) => params.append("pastRole", value));
  input.gradYear.forEach((value) => params.append("gradYear", value));

  const queryString = params.toString();
  return queryString ? `/directory/alumni?${queryString}` : "/directory/alumni";
}