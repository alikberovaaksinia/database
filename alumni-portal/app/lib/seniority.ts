/**
 * Seniority normalization utilities.
 *
 * The database stores `current_role_seniority` with inconsistent casing and
 * punctuation ("Entry level", "Entry Level", "C Level", "c-level", …).
 *
 * This module is the single place that knows about those variants.
 * Everything else — options building, filter queries — goes through here.
 */

type Option = { value: string; label: string };

/**
 * Maps every known lowercase+trimmed raw DB variant to a canonical display label.
 * Unknown values fall back to title-case of the trimmed raw string.
 * Empty string as the mapped value means "exclude from UI" (e.g. N/A entries).
 */
const SENIORITY_CANONICAL: Record<string, string> = {
  "entry level":   "Entry Level",
  "entry-level":   "Entry Level",
  "middle level":  "Middle Level",
  "middle-level":  "Middle Level",
  "mid level":     "Middle Level",
  "mid-level":     "Middle Level",
  "c level":       "C-Level",
  "c-level":       "C-Level",
  "owner":         "Owner",
  // Intentionally excluded — these are not meaningful filter values
  // "x" is a data-entry marker meaning "not indicated"; treat it as blank
  "x":             "",
  "n/a":           "",
  "na":            "",
  "-":             "",
  "":              "",
};

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Normalizes a raw DB seniority value to a canonical display label.
 * Returns null for empty/N/A values that should be excluded from the UI.
 */
export function normalizeSeniority(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();
  if (lower in SENIORITY_CANONICAL) {
    const canonical = SENIORITY_CANONICAL[lower];
    return canonical || null; // empty string → exclude
  }
  // Unexpected value: display as title-case so it at least looks consistent
  return toTitleCase(cleaned);
}

/**
 * Builds deduplicated, sorted dropdown options from raw DB seniority values.
 * Multiple raw variants that normalize to the same canonical become one option.
 * The option value is the canonical label (what goes in the URL param).
 */
export function buildSeniorityOptions(rawValues: Array<string | null>): Option[] {
  const seen = new Set<string>();
  const options: Option[] = [];

  for (const raw of rawValues) {
    const canonical = normalizeSeniority(raw);
    if (!canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    options.push({ value: canonical, label: canonical });
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Expands canonical seniority labels (stored in URL params) back to every
 * lowercase raw variant that maps to those canonicals.
 *
 * Use with Prisma `{ equals: variant, mode: "insensitive" }` so that
 * one selected canonical matches all casing/punctuation variants in the DB.
 *
 * Example:
 *   rawVariantsForSeniority(["Entry Level"])
 *   → ["entry level", "entry-level"]
 *
 *   rawVariantsForSeniority(["C-Level"])
 *   → ["c level", "c-level"]
 */
/**
 * Maps the seniority key used in the Age×Seniority matrix to the canonical
 * filter label expected by the directory's seniority filter.
 * Returns null for "Other" (no matching filter canonical exists).
 */
export function matrixKeyToSeniorityCanonical(key: string): string | null {
  switch (key) {
    case "Entry":     return "Entry Level";
    case "Mid":       return "Middle Level";
    case "Executive": return "C-Level";
    default:          return null;
  }
}

export function rawVariantsForSeniority(canonicals: string[]): string[] {
  const canonical_set = new Set(canonicals);
  const variants = new Set<string>();

  for (const [rawLower, canonical] of Object.entries(SENIORITY_CANONICAL)) {
    if (canonical && canonical_set.has(canonical)) {
      variants.add(rawLower);
    }
  }

  // Also add the canonical values themselves lowercased — catches any DB rows
  // that happen to already store the canonical string with unexpected casing.
  for (const canonical of canonicals) {
    variants.add(canonical.toLowerCase());
  }

  return [...variants];
}
