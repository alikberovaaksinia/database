"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type FilterPanelProps = {
  query: string;
  selectedCountries: string[];
  selectedCompanies: string[];
  selectedIndustries: string[];
  selectedSeniorities: string[];
  selectedAgeGroups: string[];
  selectedJemeRoles: string[];
  selectedBoards: string[];
  selectedHeads: string[];
  selectedPastFirms: string[];
  selectedGradYears: string[];
  countryOptions: Option[];
  companyOptions: Option[];
  industryOptions: Option[];
  seniorityOptions: Option[];
  ageGroupOptions: Option[];
  jemeRoleOptions: Option[];
  boardOptions: Option[];
  headOptions: Option[];
  pastFirmOptions: Option[];
  gradYearOptions: Option[];
};

type DropdownMultiSelectProps = {
  label: string;
  name: string;
  options: Option[];
  selectedValues: string[];
  placeholder: string;
};

export default function FilterPanel({
  query,
  selectedCountries,
  selectedCompanies,
  selectedIndustries,
  selectedSeniorities,
  selectedAgeGroups,
  selectedJemeRoles,
  selectedBoards,
  selectedHeads,
  selectedPastFirms,
  selectedGradYears,
  countryOptions,
  companyOptions,
  industryOptions,
  seniorityOptions,
  ageGroupOptions,
  jemeRoleOptions,
  boardOptions,
  headOptions,
  pastFirmOptions,
  gradYearOptions,
}: FilterPanelProps) {
  const activeFilters = useMemo(() => {
    const mapSelected = (
      label: string,
      values: string[] = [],
      options: Option[] = [],
    ) =>
      values.map((value) => ({
        label,
        value: options.find((option) => option.value === value)?.label ?? value,
      }));

    return [
      ...mapSelected("Country", selectedCountries, countryOptions),
      ...mapSelected("Company", selectedCompanies, companyOptions),
      ...mapSelected("Industry", selectedIndustries, industryOptions),
      ...mapSelected("Seniority", selectedSeniorities, seniorityOptions),
      ...mapSelected("Age", selectedAgeGroups, ageGroupOptions),
      ...mapSelected("JEME Role", selectedJemeRoles, jemeRoleOptions),
      ...mapSelected("Board", selectedBoards, boardOptions),
      ...mapSelected("Dept. Head", selectedHeads, headOptions),
      ...mapSelected("Past Firm", selectedPastFirms, pastFirmOptions),
      ...mapSelected("Grad Year", selectedGradYears, gradYearOptions),
    ];
  }, [
    selectedCountries,
    selectedCompanies,
    selectedIndustries,
    selectedSeniorities,
    selectedAgeGroups,
    selectedJemeRoles,
    selectedBoards,
    selectedHeads,
    selectedPastFirms,
    selectedGradYears,
    countryOptions,
    companyOptions,
    industryOptions,
    seniorityOptions,
    ageGroupOptions,
    jemeRoleOptions,
    boardOptions,
    headOptions,
    pastFirmOptions,
    gradYearOptions,
  ]);

  return (
    <form
      action="/directory/alumni"
      className="space-y-6 rounded-[30px] border border-[#D9D9D9] bg-white/90 p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] backdrop-blur"
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#737373]">
            Search & Filters
          </div>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight leading-[0.95] md:text-5xl">
            Explore Alumni
          </h2>
        </div>

        <div>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by any characteristic"
            aria-label="Search by any characteristic"
            className="w-full rounded-full border border-[#D9D9D9] bg-[#E6E6E6] px-5 py-3.5 text-base outline-none transition focus:border-[#A60F1A]"
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[24px] border border-[#D9D9D9] bg-[#E6E6E6] p-5">
          <h3 className="text-2xl font-semibold tracking-tight leading-tight">
            Professional
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DropdownMultiSelect
              label="Current Country"
              name="country"
              options={countryOptions}
              selectedValues={selectedCountries}
              placeholder="All countries"
            />

            <DropdownMultiSelect
              label="Current Company"
              name="company"
              options={companyOptions}
              selectedValues={selectedCompanies}
              placeholder="All companies"
            />

            <DropdownMultiSelect
              label="Current Industry"
              name="industry"
              options={industryOptions}
              selectedValues={selectedIndustries}
              placeholder="All industries"
            />

            <DropdownMultiSelect
              label="Past Firms"
              name="pastFirm"
              options={pastFirmOptions}
              selectedValues={selectedPastFirms}
              placeholder="All past firms"
            />

            <div className="md:col-span-2">
              <DropdownMultiSelect
                label="Seniority"
                name="seniority"
                options={seniorityOptions}
                selectedValues={selectedSeniorities}
                placeholder="All seniority levels"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#D9D9D9] bg-[#E6E6E6] p-5">
          <h3 className="text-2xl font-semibold tracking-tight leading-tight">
            Network
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DropdownMultiSelect
              label="Age Group"
              name="ageGroup"
              options={ageGroupOptions}
              selectedValues={selectedAgeGroups}
              placeholder="All age groups"
            />

            <DropdownMultiSelect
              label="JEME Role"
              name="jemeRole"
              options={jemeRoleOptions}
              selectedValues={selectedJemeRoles}
              placeholder="All JEME roles"
            />

            <DropdownMultiSelect
              label="Was the associate a member of the board?"
              name="board"
              options={boardOptions}
              selectedValues={selectedBoards}
              placeholder="All"
            />

            <DropdownMultiSelect
              label="Was the associate a head of a department?"
              name="head"
              options={headOptions}
              selectedValues={selectedHeads}
              placeholder="All"
            />

            <div className="md:col-span-2">
              <DropdownMultiSelect
                label="JEME Graduation Year"
                name="gradYear"
                options={gradYearOptions}
                selectedValues={selectedGradYears}
                placeholder="All years"
              />
            </div>
          </div>
        </section>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((item, index) => (
            <div
              key={`${item.label}-${item.value}-${index}`}
              className="rounded-full bg-[#F4C7C9] px-3 py-1.5 text-xs font-medium text-[#A60F1A]"
            >
              {item.label}: {item.value}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-[#A60F1A] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A60F1A] hover:shadow-[0_14px_26px_rgba(166,15,26,0.20)]"
        >
          Apply filters
        </button>

        <a
          href="/directory/alumni"
          className="rounded-full border border-[#D9D9D9] bg-white px-5 py-2.5 text-sm font-semibold text-[#5C5A56] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#A60F1A] hover:text-[#A60F1A] hover:shadow-[0_12px_22px_rgba(166,15,26,0.08)]"
        >
          Reset
        </a>
      </div>
    </form>
  );
}

function DropdownMultiSelect({
  label,
  name,
  options,
  selectedValues,
  placeholder,
}: DropdownMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedValues);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Sync local state when server-side selectedValues change (e.g. navigating
  // from stats page with a pre-applied country filter).
  const selectedKey = selectedValues.join(",");
  useEffect(() => {
    setLocalSelected(selectedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabels = options
    .filter((option) => localSelected.includes(option.value))
    .map((option) => option.label);

  let triggerText = placeholder;
  if (selectedLabels.length === 1) {
    triggerText = selectedLabels[0];
  } else if (selectedLabels.length > 1) {
    triggerText = `${selectedLabels.length} selected`;
  }

  return (
    <div ref={rootRef} className="relative">
      {localSelected.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}
      <label className="mb-1.5 block text-sm font-medium text-[#5C5A56]">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-full border px-4 py-3 text-left text-sm transition-all duration-300 ${
          open
            ? "border-[#A60F1A] bg-white shadow-[0_0_0_4px_rgba(166,15,26,0.08)]"
            : "border-[#D9D9D9] bg-white hover:-translate-y-0.5 hover:border-[#D9D9D9] hover:shadow-[0_10px_20px_rgba(0,0,0,0.04)]"
        }`}
      >
        <span className={selectedLabels.length ? "text-[#1A1A1A]" : "text-[#737373]"}>
          {triggerText}
        </span>
        <span
          className={`text-xs text-[#737373] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-[20px] border border-[#D9D9D9] bg-white shadow-[0_16px_36px_rgba(0,0,0,0.10)]">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#737373]">{placeholder}</div>
          ) : (
            <div className="max-h-64 overflow-y-auto p-2">
              <div className="space-y-1.5">
                {options.map((option) => {
                  const checked = localSelected.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 transition ${
                        checked ? "bg-[#F4C7C9]" : "hover:bg-[#E6E6E6]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={checked}
                        onChange={() =>
                          setLocalSelected((prev) =>
                            prev.includes(option.value)
                              ? prev.filter((v) => v !== option.value)
                              : [...prev, option.value],
                          )
                        }
                        className="h-4 w-4 accent-[#A60F1A]"
                      />
                      <span className="text-sm text-[#1A1A1A]">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}