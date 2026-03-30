const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

export function getCountryName(code?: string | null): string {
  if (!code) return "-";

  const normalized = code.trim().toUpperCase();

  if (!normalized) return "-";

  try {
    const result = displayNames.of(normalized);
    return result || normalized;
  } catch {
    return normalized;
  }
}

export function mapCountryOptions(codes: string[]): string[] {
  return codes
    .map((code) => getCountryName(code))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}