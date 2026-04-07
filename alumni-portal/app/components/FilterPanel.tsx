"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type FilterPanelProps = {
  query: string;
  selectedCountries: string[];
  selectedRoles: string[];
  selectedCompanies: string[];
  selectedIndustries: string[];
  selectedAgeGroups: string[];
  selectedJemeRoles: string[];
  selectedBoards: string[];
  selectedHeads: string[];
  selectedPastFirms: string[];
  selectedPastRoles: string[];
  selectedGradYears: string[];
  countryOptions: Option[];
  roleOptions: Option[];
  companyOptions: Option[];
  industryOptions: Option[];
  ageGroupOptions: Option[];
  jemeRoleOptions: Option[];
  boardOptions: Option[];
  headOptions: Option[];
  pastFirmOptions: Option[];
  pastRoleOptions: Option[];
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
  selectedRoles,
  selectedCompanies,
  selectedIndustries,
  selectedAgeGroups,
  selectedJemeRoles,
  selectedBoards,
  selectedHeads,
  selectedPastFirms,
  selectedPastRoles,
  selectedGradYears,
  countryOptions,
  roleOptions,
  companyOptions,
  industryOptions,
  ageGroupOptions,
  jemeRoleOptions,
  boardOptions,
  headOptions,
  pastFirmOptions,
  pastRoleOptions,
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
      ...mapSelected("Role", selectedRoles, roleOptions),
      ...mapSelected("Company", selectedCompanies, companyOptions),
      ...mapSelected("Industry", selectedIndustries, industryOptions),
      ...mapSelected("Age", selectedAgeGroups, ageGroupOptions),
      ...mapSelected("JEME Role", selectedJemeRoles, jemeRoleOptions),
      ...mapSelected("Board", selectedBoards, boardOptions),
      ...mapSelected("Dept. Head", selectedHeads, headOptions),
      ...mapSelected("Past Firm", selectedPastFirms, pastFirmOptions),
      ...mapSelected("Past Role", selectedPastRoles, pastRoleOptions),
      ...mapSelected("Grad Year", selectedGradYears, gradYearOptions),
    ];
  }, [
    selectedCountries,
    selectedRoles,
    selectedCompanies,
    selectedIndustries,
    selectedAgeGroups,
    selectedJemeRoles,
    selectedBoards,
    selectedHeads,
    selectedPastFirms,
    selectedPastRoles,
    selectedGradYears,
    countryOptions,
    roleOptions,
    companyOptions,
    industryOptions,
    ageGroupOptions,
    jemeRoleOptions,
    boardOptions,
    headOptions,
    pastFirmOptions,
    pastRoleOptions,
    gradYearOptions,
  ]);

  return (
    <form
      action="/directory/alumni"
      className="space-y-6 rounded-[30px] border border-[#E7DCDD] bg-white/90 p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] backdrop-blur"
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9B6A71]">
            Search & Filters
          </div>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight leading-[0.95] md:text-5xl">
            Explore Alumni
          </h2>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#615F59]">
            Search by name, firm or role
          </label>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Type a name, firm or role"
            className="w-full rounded-full border border-[#E7DCDD] bg-[#FCFAFA] px-5 py-3.5 text-base outline-none transition focus:border-[#C21A27]"
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[24px] border border-[#EFE4E5] bg-[#FCFAFA] p-5">
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
              label="Current Role"
              name="role"
              options={roleOptions}
              selectedValues={selectedRoles}
              placeholder="All roles"
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

            <DropdownMultiSelect
              label="Past Roles"
              name="pastRole"
              options={pastRoleOptions}
              selectedValues={selectedPastRoles}
              placeholder="All past roles"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[#EFE4E5] bg-[#FCFAFA] p-5">
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
              label="Board"
              name="board"
              options={boardOptions}
              selectedValues={selectedBoards}
              placeholder="All"
            />

            <DropdownMultiSelect
              label="Department Head"
              name="head"
              options={headOptions}
              selectedValues={selectedHeads}
              placeholder="All"
            />

            <DropdownMultiSelect
              label="JEME Graduation Year"
              name="gradYear"
              options={gradYearOptions}
              selectedValues={selectedGradYears}
              placeholder="All years"
            />
          </div>
        </section>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((item, index) => (
            <div
              key={`${item.label}-${item.value}-${index}`}
              className="rounded-full bg-[#F5E8EA] px-3 py-1.5 text-xs font-medium text-[#A33640]"
            >
              {item.label}: {item.value}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-[#C21A27] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9E1520] hover:shadow-[0_14px_26px_rgba(194,26,39,0.20)]"
        >
          Apply filters
        </button>

        <a
          href="/directory/alumni"
          className="rounded-full border border-[#E7DCDD] bg-white px-5 py-2.5 text-sm font-semibold text-[#615F59] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C21A27] hover:text-[#C21A27] hover:shadow-[0_12px_22px_rgba(194,26,39,0.08)]"
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
      <label className="mb-1.5 block text-sm font-medium text-[#615F59]">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-full border px-4 py-3 text-left text-sm transition-all duration-300 ${
          open
            ? "border-[#C21A27] bg-white shadow-[0_0_0_4px_rgba(194,26,39,0.08)]"
            : "border-[#E7DCDD] bg-white hover:-translate-y-0.5 hover:border-[#D9B7BB] hover:shadow-[0_10px_20px_rgba(0,0,0,0.04)]"
        }`}
      >
        <span className={selectedLabels.length ? "text-[#1D1D1B]" : "text-[#8A7E7F]"}>
          {triggerText}
        </span>
        <span
          className={`text-xs text-[#8A7E7F] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-[20px] border border-[#E7DCDD] bg-white shadow-[0_16px_36px_rgba(0,0,0,0.10)]">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#8A7E7F]">{placeholder}</div>
          ) : (
            <div className="max-h-64 overflow-y-auto p-2">
              <div className="space-y-1.5">
                {options.map((option) => {
                  const checked = localSelected.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 transition ${
                        checked ? "bg-[#F5E8EA]" : "hover:bg-[#FAF6F6]"
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
                        className="h-4 w-4 accent-[#C21A27]"
                      />
                      <span className="text-sm text-[#1D1D1B]">{option.label}</span>
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