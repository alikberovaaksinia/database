import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCountryName } from "../../../lib/countries";
import { rawVariantsForIndustry } from "../../../lib/industry";
import { rawVariantsForSeniority, normalizeSeniority } from "../../../lib/seniority";

// ── Helpers (mirrors directory page helpers) ─────────────────────────────────

function single(v: string | null): string {
  return v ?? "";
}

function many(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).filter(Boolean);
}

function normalizeBool(value: string | null | undefined): string {
  if (!value) return "";
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "yes") return "Yes";
  if (v === "false" || v === "no") return "No";
  return value.trim();
}

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value).trim();
  // RFC 4180: wrap in quotes, escape internal quotes by doubling
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map(csvCell).join(","),
  );
  // BOM ensures Excel opens the file with correct UTF-8 encoding
  return "\uFEFF" + lines.join("\r\n");
}

// ── WHERE clause builder (same logic as directory page) ──────────────────────

function buildWhere(params: URLSearchParams) {
  const query = single(params.get("q"));
  const selectedCountries = many(params, "country");
  const selectedCompanies = many(params, "company");
  const selectedIndustries = many(params, "industry");
  const selectedSeniorities = many(params, "seniority");
  const selectedAgeGroups = many(params, "ageGroup");
  const selectedJemeRoles = many(params, "jemeRole");
  const selectedBoards = many(params, "board");
  const selectedHeads = many(params, "head");
  const selectedPastFirms = many(params, "pastFirm");
  const selectedGradYears = many(params, "gradYear");

  const andConditions: Record<string, unknown>[] = [];

  if (query) {
    for (const word of query.trim().split(/\s+/).filter(Boolean)) {
      andConditions.push({
        OR: [
          { full_name: { contains: word, mode: "insensitive" } },
          { current_firm: { contains: word, mode: "insensitive" } },
          { current_role: { contains: word, mode: "insensitive" } },
        ],
      });
    }
  }

  if (selectedCountries.length)
    andConditions.push({ current_country: { in: selectedCountries } });

  if (selectedCompanies.length)
    andConditions.push({ current_firm: { in: selectedCompanies } });

  if (selectedIndustries.length) {
    const variants = rawVariantsForIndustry(selectedIndustries);
    andConditions.push({
      OR: variants.map((raw) => ({
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

  if (selectedAgeGroups.length)
    andConditions.push({ age_group: { in: selectedAgeGroups } });

  if (selectedJemeRoles.length)
    andConditions.push({ jeme_role: { in: selectedJemeRoles } });

  if (selectedBoards.length)
    andConditions.push({ board: { in: selectedBoards } });

  if (selectedHeads.length)
    andConditions.push({ head: { in: selectedHeads } });

  if (selectedPastFirms.length)
    andConditions.push({ notable_past_firms: { in: selectedPastFirms } });

  if (selectedGradYears.length) {
    andConditions.push({
      OR: selectedGradYears.map((year) => ({
        jeme_ending_period: { contains: year, mode: "insensitive" },
      })),
    });
  }

  return andConditions.length ? { AND: andConditions } : {};
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const where = buildWhere(params);

  const alumni = await prisma.alumni_raw.findMany({
    where,
    orderBy: { full_name: "asc" },
    select: {
      full_name: true,
      first_name: true,
      surname: true,
      current_role: true,
      current_role_seniority: true,
      current_firm: true,
      current_industry: true,
      current_city: true,
      current_country: true,
      age_group: true,
      jeme_role: true,
      jeme_role_2: true,
      jeme_role_3: true,
      jeme_starting_period: true,
      jeme_ending_period: true,
      board: true,
      head: true,
      email: true,
      phone_number: true,
      linkedin: true,
      notable_past_firms: true,
      npf_industry: true,
    },
  });

  const HEADERS = [
    "First Name",
    "Surname",
    "Full Name",
    "Current Role",
    "Seniority",
    "Company",
    "Industry",
    "City",
    "Country",
    "Age Group",
    "JEME Role",
    "JEME Role 2",
    "JEME Role 3",
    "JEME Start Date",
    "JEME Graduation Date",
    "Board Member",
    "Department Head",
    "Email",
    "Phone",
    "LinkedIn",
    "Past Notable Firms",
    "Past Industry",
  ];

  const rows = alumni.map((a) => [
    a.first_name ?? "",
    a.surname ?? "",
    a.full_name ?? "",
    a.current_role ?? "",
    normalizeSeniority(a.current_role_seniority) ?? "",
    a.current_firm ?? "",
    a.current_industry ?? "",
    a.current_city ?? "",
    a.current_country ? getCountryName(a.current_country) : "",
    a.age_group ?? "",
    a.jeme_role ?? "",
    a.jeme_role_2 ?? "",
    a.jeme_role_3 ?? "",
    a.jeme_starting_period ?? "",
    a.jeme_ending_period ?? "",
    normalizeBool(a.board),
    normalizeBool(a.head),
    a.email ?? "",
    a.phone_number ?? "",
    a.linkedin ?? "",
    a.notable_past_firms ?? "",
    a.npf_industry ?? "",
  ]);

  const csv = toCsv(HEADERS, rows);
  const timestamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="alumni-export-${timestamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
