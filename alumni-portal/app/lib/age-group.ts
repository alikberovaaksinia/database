/**
 * Extracts a 4-digit year from a period string like "September 2022" or "2022".
 */
export function extractGradYear(period: string | null | undefined): number | null {
  if (!period) return null;
  const match = period.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Computes the age group bucket from a JEME ending period string.
 *
 * Formula: estimated_age = current_year - graduation_year + 20
 * Buckets:  20-25 | 25-30 | 30-35 | 35-40 | 40-45 | 45-50 | 50+
 *
 * Returns null when no graduation year can be parsed.
 */
export function computeAgeGroup(
  jemeEndingPeriod: string | null | undefined,
  referenceYear?: number,
): string | null {
  const gradYear = extractGradYear(jemeEndingPeriod);
  if (gradYear === null) return null;

  const currentYear = referenceYear ?? new Date().getFullYear();
  const age = currentYear - gradYear + 20;

  if (age < 25) return "20-25";
  if (age < 30) return "25-30";
  if (age < 35) return "30-35";
  if (age < 40) return "35-40";
  if (age < 45) return "40-45";
  if (age < 50) return "45-50";
  return "50+";
}

export const AGE_BUCKETS = [
  "20-25",
  "25-30",
  "30-35",
  "35-40",
  "40-45",
  "45-50",
  "50+",
] as const;
