import Link from "next/link";
import { getCountryName } from "../lib/countries";
import { normalizeIndustry } from "../lib/industry";
import { normalizeSeniority } from "../lib/seniority";
import ClientPagination from "./ClientPagination";

type AlumniRow = {
  db_id: number | string;
  full_name: string | null;
  current_role: string | null;
  current_firm: string | null;
  current_country: string | null;
  current_industry: string | null;
  current_role_seniority: string | null;
  jeme_role: string | null;
  jeme_ending_period: string | null;
};

function extractYear(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

export default function AlumniTable({
  alumni,
  returnTo,
  currentPage,
  totalPages,
  paginationBase,
}: {
  alumni: AlumniRow[];
  returnTo: string;
  currentPage: number;
  totalPages: number;
  paginationBase: string;
}) {
  if (!alumni.length) {
    return (
      <div className="rounded-[28px] border border-[#D9D9D9] bg-white/92 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.05)] backdrop-blur">
        <div className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          No alumni found
        </div>
        <p className="mt-3 max-w-xl text-base leading-8 text-[#5C5A56]">
          Try adjusting your filters or search query to see more results.
        </p>
      </div>
    );
  }

  return (
    <div id="alumni-results" className="space-y-4">
      {/* Column headers — 6-col grid: Name · Role · Company · Industry · Country · Open */}
      <div className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(130px,1fr)_minmax(130px,1fr)_minmax(110px,0.9fr)_100px_90px] gap-6 px-8 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#737373] lg:grid">
        <div>Name</div>
        <div>Role</div>
        <div>Company</div>
        <div>Industry</div>
        <div>Country</div>
        <div className="text-right">Profile</div>
      </div>

      {alumni.map((person) => {
        const name     = person.full_name?.trim() || "Unknown alumnus";
        const role     = person.current_role?.trim() || "—";
        const company  = person.current_firm?.trim() || "—";
        const country  = person.current_country ? getCountryName(person.current_country) : "—";
        const industry = normalizeIndustry(person.current_industry) || "—";
        const seniority = normalizeSeniority(person.current_role_seniority) || null;
        const jemeRole  = person.jeme_role?.trim() || null;
        const gradYear  = extractYear(person.jeme_ending_period);

        const profileHref = `/alumni/${person.db_id}?returnTo=${encodeURIComponent(returnTo)}`;

        return (
          <div
            key={String(person.db_id)}
            className="group relative rounded-[26px] border border-[#D9D9D9] bg-white/92 shadow-[0_14px_30px_rgba(0,0,0,0.04)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_42px_rgba(166,15,26,0.10)]"
          >
            {/* Stretched link — covers the whole card for mouse/touch users.
                tabIndex={-1} + aria-hidden keeps it out of keyboard/screen-reader
                flow; the "Open" button handles those instead. */}
            <Link
              href={profileHref}
              className="absolute inset-0 z-0 rounded-[26px] focus:outline-none"
              tabIndex={-1}
              aria-hidden="true"
            />

            {/* ── Desktop row ── */}
            <div className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(130px,1fr)_minmax(130px,1fr)_minmax(110px,0.9fr)_100px_90px] items-center gap-6 px-8 py-5 lg:grid">
              {/* Name */}
              <div className="min-w-0">
                <div className="truncate text-[1.2rem] font-semibold tracking-tight text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#A60F1A]">
                  {name}
                </div>
              </div>

              {/* Role + seniority sub-line */}
              <div className="min-w-0">
                <div className="truncate text-[14px] leading-6 text-[#1A1A1A]">{role}</div>
                {seniority && (
                  <div className="mt-0.5 text-[11px] font-medium text-[#737373]">{seniority}</div>
                )}
              </div>

              {/* Company */}
              <div className="min-w-0 text-[14px] leading-6 text-[#5C5A56]">
                <div className="truncate">{company}</div>
              </div>

              {/* Industry */}
              <div className="min-w-0 text-[14px] leading-6 text-[#5C5A56]">
                <div className="truncate">{industry}</div>
              </div>

              {/* Country */}
              <div className="text-[14px] leading-6 text-[#5C5A56]">
                {country}
              </div>

              {/* Open — relative z-10 lifts above the stretched background link */}
              <div className="relative z-10 text-right">
                <Link
                  href={profileHref}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm font-semibold text-[#A60F1A] transition-all duration-200 hover:border-[#A60F1A] hover:bg-[#A60F1A] hover:text-white"
                >
                  Open
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </div>

            {/* ── Mobile card ── */}
            <div className="space-y-3 px-6 py-6 lg:hidden">
              <div className="text-xl font-semibold tracking-tight text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#A60F1A]">
                {name}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <InfoBlock label="Role" value={role} />
                <InfoBlock label="Company" value={company} />
                <InfoBlock label="Industry" value={industry} />
                <InfoBlock label="Country" value={country} />
                {seniority && <InfoBlock label="Seniority" value={seniority} />}
                {jemeRole   && <InfoBlock label="JEME Role" value={jemeRole} />}
                {gradYear   && <InfoBlock label="Grad Year" value={gradYear} />}
              </div>

              <div className="relative z-10 pt-1">
                <Link
                  href={profileHref}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm font-semibold text-[#A60F1A] transition-all duration-200 hover:border-[#A60F1A] hover:bg-[#A60F1A] hover:text-white"
                >
                  Open profile
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <ClientPagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseHref={paginationBase}
        />
      )}
    </div>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] bg-[#E6E6E6] px-4 py-3 ring-1 ring-[#F4C7C9] transition-all duration-300 group-hover:-translate-y-0.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#737373]">
        {label}
      </div>
      <div className="mt-1 text-sm leading-6 text-[#5C5A56]">{value}</div>
    </div>
  );
}

