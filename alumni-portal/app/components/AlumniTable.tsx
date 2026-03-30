import Link from "next/link";
import { getCountryName } from "../lib/countries";

type AlumniRow = {
  db_id: number | string;
  full_name: string | null;
  current_role: string | null;
  current_firm: string | null;
  current_country: string | null;
};

type PageItem = number | "ellipsis";

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
      <div className="rounded-[28px] border border-[#E7DCDD] bg-white/92 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.05)] backdrop-blur">
        <div className="text-2xl font-semibold tracking-tight text-[#1D1D1B]">
          No alumni found
        </div>
        <p className="mt-3 max-w-xl text-base leading-8 text-[#615F59]">
          Try adjusting your filters or search query to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-[minmax(260px,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_140px_120px] gap-6 px-8 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9B6A71] lg:grid">
        <div>Name</div>
        <div>Role</div>
        <div>Company</div>
        <div>Country</div>
        <div className="text-right">Profile</div>
      </div>

      {alumni.map((person) => {
        const name = person.full_name?.trim() || "Unknown alumnus";
        const role = person.current_role?.trim() || "—";
        const company = person.current_firm?.trim() || "—";
        const country = person.current_country
          ? getCountryName(person.current_country)
          : "—";

        return (
          <div
            key={String(person.db_id)}
            className="group rounded-[26px] border border-[#E7DCDD] bg-white/92 shadow-[0_14px_30px_rgba(0,0,0,0.04)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_42px_rgba(194,26,39,0.10)]"
          >
            <div className="hidden grid-cols-[minmax(260px,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_140px_120px] items-center gap-6 px-8 py-6 lg:grid">
              <div className="min-w-0">
                <div className="truncate text-[1.35rem] font-semibold tracking-tight text-[#1D1D1B] transition-colors duration-200 group-hover:text-[#C21A27]">
                  {name}
                </div>
              </div>

              <div className="min-w-0 text-[15px] leading-7 text-[#615F59]">
                <div className="truncate">{role}</div>
              </div>

              <div className="min-w-0 text-[15px] leading-7 text-[#615F59]">
                <div className="truncate">{company}</div>
              </div>

              <div className="text-[15px] leading-7 text-[#615F59]">
                {country}
              </div>

              <div className="text-right">
                <Link
                  href={`/alumni/${person.db_id}?returnTo=${encodeURIComponent(returnTo)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E7DCDD] bg-white px-4 py-2 text-sm font-semibold text-[#C21A27] transition-all duration-200 hover:border-[#C21A27] hover:bg-[#C21A27] hover:text-white"
                >
                  Open
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6 lg:hidden">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1B] transition-colors duration-200 group-hover:text-[#C21A27]">
                  {name}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBlock label="Role" value={role} />
                <InfoBlock label="Company" value={company} />
                <InfoBlock label="Country" value={country} />
              </div>

              <div>
                <Link
                  href={`/alumni/${person.db_id}?returnTo=${encodeURIComponent(returnTo)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E7DCDD] bg-white px-4 py-2 text-sm font-semibold text-[#C21A27] transition-all duration-200 hover:border-[#C21A27] hover:bg-[#C21A27] hover:text-white"
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseHref={paginationBase}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  baseHref,
}: {
  currentPage: number;
  totalPages: number;
  baseHref: string;
}) {
  const pages = buildPages(currentPage, totalPages);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <PaginationLink
        href={withPage(baseHref, Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        ← Prev
      </PaginationLink>

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-sm font-medium text-[#8A7E7F]"
          >
            ...
          </span>
        ) : (
          <Link
            key={item}
            href={withPage(baseHref, item)}
            className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
              item === currentPage
                ? "bg-[#C21A27] text-white shadow-[0_12px_24px_rgba(194,26,39,0.18)]"
                : "border border-[#E7DCDD] bg-white text-[#615F59] hover:-translate-y-0.5 hover:border-[#C21A27] hover:text-[#C21A27]"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      <PaginationLink
        href={withPage(baseHref, Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next →
      </PaginationLink>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-11 items-center justify-center rounded-full border border-[#EFE4E5] bg-[#F8F4F4] px-4 text-sm font-semibold text-[#B8ACAD]">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-full border border-[#E7DCDD] bg-white px-4 text-sm font-semibold text-[#615F59] transition hover:-translate-y-0.5 hover:border-[#C21A27] hover:text-[#C21A27]"
    >
      {children}
    </Link>
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
    <div className="rounded-[18px] bg-[#FCFAFA] px-4 py-3 ring-1 ring-[#F1E7E8] transition-all duration-300 group-hover:-translate-y-0.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B6A71]">
        {label}
      </div>
      <div className="mt-1 text-sm leading-6 text-[#615F59]">{value}</div>
    </div>
  );
}

function withPage(baseHref: string, page: number) {
  const url = new URL(baseHref, "http://localhost");
  url.searchParams.set("page", String(page));
  return `${url.pathname}${url.search}`;
}

function buildPages(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}