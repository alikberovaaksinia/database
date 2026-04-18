"use client";

import { useRef, useState } from "react";
import {
  DEFAULT_EXPORT_FIELDS,
  EXPORT_FIELDS,
  FIELD_GROUPS,
} from "../lib/export-fields";

type Props = {
  filterParams: string;
  totalCount: number;
};

export default function ExportModal({ filterParams, totalCount }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(DEFAULT_EXPORT_FIELDS),
  );
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  function toggleField(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleGroup(group: string) {
    const groupKeys = EXPORT_FIELDS.filter((f) => f.group === group).map(
      (f) => f.key,
    );
    const allSelected = groupKeys.every((k) => selected.has(k));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupKeys.forEach((k) => next.delete(k));
      } else {
        groupKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(EXPORT_FIELDS.map((f) => f.key)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function handleExport() {
    if (selected.size === 0 || loading) return;
    setLoading(true);

    const params = new URLSearchParams(filterParams);
    params.set("format", format);
    params.set("fields", [...selected].join(","));

    const url = `/api/alumni/export?${params.toString()}`;

    if (anchorRef.current) {
      anchorRef.current.href = url;
      anchorRef.current.click();
    }

    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D9D9] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C5A56] transition hover:border-[#A60F1A] hover:text-[#A60F1A]"
      >
        ↓ Export
      </button>

      {/* hidden download anchor */}
      <a ref={anchorRef} className="hidden" download />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          {/* modal card */}
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            {/* header */}
            <div className="border-b border-[#E6E6E6] px-6 pb-4 pt-6">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#737373]">
                Export
              </div>
              <div className="mt-1 text-xl font-semibold text-[#1A1A1A]">
                Export filtered alumni
              </div>
              <div className="mt-1 text-sm text-[#5C5A56]">
                Choose the fields and format for the export.
              </div>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* count summary */}
              <div className="mb-5 rounded-[14px] bg-[#E6E6E6] px-4 py-3">
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {totalCount.toLocaleString()} alumni
                </span>
                <span className="text-sm text-[#5C5A56]">
                  {" "}will be included in the export.
                </span>
              </div>

              {/* format selector */}
              <div className="mb-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#737373]">
                  Format
                </div>
                <div className="flex gap-3">
                  {(["csv", "xlsx"] as const).map((f) => (
                    <label
                      key={f}
                      className={`flex cursor-pointer items-center gap-2 rounded-[12px] border px-4 py-2.5 text-sm font-medium transition ${
                        format === f
                          ? "border-[#A60F1A] bg-[#A60F1A]/5 text-[#A60F1A]"
                          : "border-[#D9D9D9] bg-white text-[#5C5A56] hover:border-[#A60F1A]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="export-format"
                        value={f}
                        checked={format === f}
                        onChange={() => setFormat(f)}
                        className="hidden"
                      />
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full border-2 ${
                          format === f
                            ? "border-[#A60F1A] bg-[#A60F1A]"
                            : "border-[#D9D9D9] bg-white"
                        }`}
                      />
                      {f.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              {/* field selection */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#737373]">
                    Fields{" "}
                    <span className="font-normal normal-case tracking-normal text-[#BFBFBF]">
                      ({selected.size} selected)
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={selectAll}
                      className="text-xs text-[#A60F1A] hover:underline"
                    >
                      Select all
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-[#737373] hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {FIELD_GROUPS.map((group) => {
                    const groupFields = EXPORT_FIELDS.filter(
                      (f) => f.group === group,
                    );
                    const allGroupSelected = groupFields.every((f) =>
                      selected.has(f.key),
                    );
                    const someGroupSelected = groupFields.some((f) =>
                      selected.has(f.key),
                    );

                    return (
                      <div key={group}>
                        <div className="mb-1.5 flex items-center gap-2">
                          <button
                            onClick={() => toggleGroup(group)}
                            className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#5C5A56] hover:text-[#A60F1A]"
                          >
                            <span
                              className={`inline-block h-3 w-3 rounded-[3px] border transition ${
                                allGroupSelected
                                  ? "border-[#A60F1A] bg-[#A60F1A]"
                                  : someGroupSelected
                                    ? "border-[#A60F1A] bg-[#F4C7C9]"
                                    : "border-[#D9D9D9] bg-white"
                              }`}
                            />
                            {group}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-1">
                          {groupFields.map((field) => (
                            <label
                              key={field.key}
                              className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1 transition hover:bg-[#E6E6E6]"
                            >
                              <span
                                className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border transition ${
                                  selected.has(field.key)
                                    ? "border-[#A60F1A] bg-[#A60F1A]"
                                    : "border-[#D9D9D9] bg-white"
                                }`}
                              >
                                {selected.has(field.key) && (
                                  <svg
                                    className="h-2.5 w-2.5 text-white"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                  >
                                    <path
                                      d="M2 5l2.5 2.5L8 3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </span>
                              <input
                                type="checkbox"
                                checked={selected.has(field.key)}
                                onChange={() => toggleField(field.key)}
                                className="hidden"
                              />
                              <span className="text-sm text-[#1A1A1A]">
                                {field.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-[#E6E6E6] px-6 py-4">
              {selected.size === 0 && (
                <span className="text-xs text-[#A60F1A]">
                  Select at least one field to export.
                </span>
              )}
              {selected.size > 0 && <span />}

              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm font-medium text-[#5C5A56] transition hover:border-[#A60F1A] hover:text-[#A60F1A] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleExport}
                  disabled={selected.size === 0 || loading}
                  className="rounded-full bg-[#A60F1A] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#8B0D16] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-3.5 w-3.5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Exporting…
                    </span>
                  ) : (
                    "Export"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
