import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "../../../lib/prisma";
import { getCountryName } from "../../../lib/countries";
import { rawVariantsForIndustry } from "../../../lib/industry";
import { rawVariantsForSeniority, normalizeSeniority } from "../../../lib/seniority";
import { EXPORT_FIELDS, EXPORT_FIELD_KEYS } from "../../../lib/export-fields";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(","));
  return "\uFEFF" + lines.join("\r\n");
}

// ── WHERE clause builder ─────────────────────────────────────────────────────

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

// ── Field value resolver ─────────────────────────────────────────────────────

type AlumniRecord = Record<string, string | null | undefined>;

function resolveFieldValue(a: AlumniRecord, key: string): string {
  switch (key) {
    case "current_role_seniority":
      return normalizeSeniority(a.current_role_seniority) ?? "";
    case "current_country":
      return a.current_country ? getCountryName(a.current_country) : "";
    case "board":
      return normalizeBool(a.board);
    case "head":
      return normalizeBool(a.head);
    default:
      return a[key] ?? "";
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const where = buildWhere(params);

  // Resolve requested fields (default: all)
  const rawFields = params.get("fields");
  const requestedKeys = rawFields
    ? rawFields
        .split(",")
        .map((k) => k.trim())
        .filter((k) => EXPORT_FIELD_KEYS.has(k))
    : EXPORT_FIELDS.map((f) => f.key);

  // Deduplicate while preserving order
  const fieldKeys = [...new Set(requestedKeys)];

  if (fieldKeys.length === 0) {
    return new NextResponse("No valid fields selected.", { status: 400 });
  }

  // Build Prisma select — only fetch what we need
  const select = Object.fromEntries(fieldKeys.map((k) => [k, true])) as Record<
    string,
    true
  >;

  const alumni = (await prisma.alumni_raw.findMany({
    where,
    orderBy: { full_name: "asc" },
    select,
  })) as AlumniRecord[];

  // Map field keys to human-readable headers
  const fieldMap = new Map(EXPORT_FIELDS.map((f) => [f.key, f.label]));
  const headers = fieldKeys.map((k) => fieldMap.get(k) ?? k);
  const rows = alumni.map((a) => fieldKeys.map((k) => resolveFieldValue(a, k)));

  const format = params.get("format") === "xlsx" ? "xlsx" : "csv";
  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Alumni");
    const nodeBuffer: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const arrayBuffer = nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.byteLength,
    ) as ArrayBuffer;

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="alumni-export-${timestamp}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const csv = toCsv(headers, rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="alumni-export-${timestamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
