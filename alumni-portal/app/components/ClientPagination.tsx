"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type PageItem = number | "ellipsis";

export default function ClientPagination({
  currentPage,
  totalPages,
  baseHref,
}: {
  currentPage: number;
  totalPages: number;
  baseHref: string;
}) {
  // Track the page seen on the previous render so we only scroll when the
  // page actually changes (not on initial mount).
  const prevPage = useRef(currentPage);

  useEffect(() => {
    if (prevPage.current === currentPage) return;
    prevPage.current = currentPage;
    document
      .getElementById("alumni-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

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
            className="px-2 text-sm font-medium text-[#737373]"
          >
            ...
          </span>
        ) : (
          <Link
            key={item}
            href={withPage(baseHref, item)}
            scroll={false}
            className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
              item === currentPage
                ? "bg-[#A60F1A] text-white shadow-[0_12px_24px_rgba(166,15,26,0.18)]"
                : "border border-[#D9D9D9] bg-white text-[#5C5A56] hover:-translate-y-0.5 hover:border-[#A60F1A] hover:text-[#A60F1A]"
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
      <span className="inline-flex h-11 items-center justify-center rounded-full border border-[#D9D9D9] bg-[#E6E6E6] px-4 text-sm font-semibold text-[#B3B0AA]">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className="inline-flex h-11 items-center justify-center rounded-full border border-[#D9D9D9] bg-white px-4 text-sm font-semibold text-[#5C5A56] transition hover:-translate-y-0.5 hover:border-[#A60F1A] hover:text-[#A60F1A]"
    >
      {children}
    </Link>
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
