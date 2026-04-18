/**
 * Industry normalization utilities — single source of truth for both the
 * filter panel and the statistics page.
 *
 * Two levels of normalization live here:
 *
 * FILTER level  (`buildIndustryOptions` / `rawVariantsForIndustry`)
 *   Merges near-duplicates so the dropdown shows one canonical option per
 *   logical industry. Values not listed pass through as-is.
 *   "Research" + "Research Services" → "Research Services"
 *   "Public Policy" + "Public Sector" → "Public Sector"
 *
 * STATS level  (`normalizeIndustry`)
 *   Collapses the full long-tail of raw values into chart-friendly buckets.
 *   Used only on the statistics page.
 *   "Research" + "Research Services" → "Research Services"
 *   "Public Policy" + "Public Sector" (+ politics, etc.) → "Public Sector"
 *
 * Both levels agree on which raw values belong together.
 */

// ─── Shared types ────────────────────────────────────────────────────────────

type Option = { value: string; label: string };

// ─── Filter-level normalization ──────────────────────────────────────────────

/**
 * Maps every known lowercase+trimmed raw DB variant to a canonical filter label.
 * Only variants that need merging are listed; everything else passes through.
 * Empty string as the mapped value means "exclude from the filter UI".
 */
const FILTER_CANONICAL: Record<string, string> = {
  // Consulting
  "business & professional services":  "Consulting",
  "business consulting & services":    "Consulting",
  "advisory":                          "Consulting",
  "technology consulting":             "Consulting",
  // Financial Services
  "finance":                           "Financial Services",
  "finance & education":               "Financial Services",
  "information services":              "Financial Services",
  // Asset Management
  "investments":                       "Asset Management",
  "corporate finance":                 "Asset Management",
  "alternative investments":           "Asset Management",
  "asset management":                  "Asset Management",
  // Banking
  "digital banking":                   "Banking",
  // Investment Banking
  "investment banking":                "Investment Banking",
  // Insurance
  "credit & insurance":                "Insurance",
  "pet insurance":                     "Insurance",
  "assurance":                         "Insurance",
  // Food & Beverage
  "beverage manufacturing":            "Food & Beverage",
  // Education
  "educational resources":             "Education",
  // Human Resources
  "hr software":                       "Human Resources",
  // Research
  "research":                          "Research Services",
  "research services":                 "Research Services",
  // Public Sector
  "public policy":                     "Public Sector",
  "public sector":                     "Public Sector",
  // Private Equity
  "private equity":                    "Private Equity",
  // Pharmaceutical
  "pharmaceutical":                    "Pharmaceutical",
  "pharmaceutical manufacturing":      "Pharmaceutical",
  "pharmaceuticals":                   "Pharmaceutical",
  // E-Commerce
  "e-commerce":                        "E-Commerce",
  // Legal
  "law":                               "Legal",
  // Logistics
  "logistics":                         "Logistics & Supply Chain",
  // Software
  "software development":              "Software",
  // Luxury
  "luxury fashion":                    "Luxury",
  "luxury goods":                      "Luxury",
  "luxury retail":                     "Luxury",
  // Information Technology
  "it":                                "Information Technology",
  "it services":                       "Information Technology",
  "it consulting":                     "Information Technology",
  "it services & consulting":          "Information Technology",
  "information technology":            "Information Technology",
  // Healthcare
  "medical":                           "Healthcare",
  "medical & healthcare":              "Healthcare",
  // Media & Marketing
  "media":                             "Media & Marketing",
  "marketing":                         "Media & Marketing",
  "marketing & media":                 "Media & Marketing",
  // Other
  "n/a":                               "Other",
  "other":                             "Other",
  "not working":                       "Other",
};

/**
 * Normalizes a raw DB industry value to the canonical filter label.
 * Returns null for empty/excluded values; returns the trimmed raw value
 * (unchanged) for anything not listed in FILTER_CANONICAL.
 */
function normalizeIndustryFilter(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();
  if (lower in FILTER_CANONICAL) {
    const canonical = FILTER_CANONICAL[lower];
    return canonical || null; // empty string → exclude
  }
  return cleaned; // pass-through: keep original casing for unlisted values
}

/**
 * Builds deduplicated, sorted dropdown options from raw DB industry values.
 * Multiple raw variants that normalize to the same canonical become one option.
 * The option value stored in the URL param is the canonical label.
 */
export function buildIndustryOptions(rawValues: Array<string | null>): Option[] {
  const seen = new Set<string>();
  const options: Option[] = [];

  for (const raw of rawValues) {
    const canonical = normalizeIndustryFilter(raw);
    if (!canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    options.push({ value: canonical, label: canonical });
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Expands canonical industry filter labels (from URL params) back to every
 * lowercase raw DB variant that maps to each canonical.
 *
 * Use with Prisma `{ equals: variant, mode: "insensitive" }` so one selected
 * option matches all equivalent raw values in the database.
 *
 * Examples:
 *   rawVariantsForIndustry(["Research Services"])
 *   → ["research", "research services"]
 *
 *   rawVariantsForIndustry(["Financial Services"])
 *   → ["financial services"]   (pass-through, no aliases)
 */
export function rawVariantsForIndustry(canonicals: string[]): string[] {
  const canonical_set = new Set(canonicals);
  const variants = new Set<string>();

  for (const [rawLower, canonical] of Object.entries(FILTER_CANONICAL)) {
    if (canonical && canonical_set.has(canonical)) {
      variants.add(rawLower);
    }
  }

  // Also add each canonical itself (lowercased) so pass-through values and
  // any DB rows that happen to already store the canonical form are matched.
  for (const canonical of canonicals) {
    variants.add(canonical.toLowerCase());
  }

  return [...variants];
}

/**
 * Maps a stats-page normalized industry label to the canonical filter label(s)
 * that should appear in the directory URL (?industry=...).
 *
 * Most stats labels correspond 1:1 to a filter canonical so they are returned
 * as-is. The two exceptions are stats groupings that are wider than any single
 * filter canonical:
 *   "Technology" → ["Information Technology", "Software"]
 *   "Retail"     → ["Retail", "E-Commerce"]
 */
export function statsIndustryToFilterCanonicals(statsLabel: string): string[] {
  switch (statsLabel) {
    case "Technology": return ["Information Technology", "Software"];
    case "Retail":     return ["Retail", "E-Commerce"];
    default:           return [statsLabel];
  }
}

// ─── Stats-level normalization ───────────────────────────────────────────────
// Previously defined locally in app/stats/page.tsx — centralised here so both
// files share the same source of truth for what "the same industry" means.

const INDUSTRY_NORM: Record<string, string | null> = {
  // Consulting
  "consulting":                             "Consulting",
  "consulting & professional services":     "Consulting",
  "business consulting & services":         "Consulting",
  "it consulting":                          "Consulting",
  "technology consulting":                  "Consulting",
  "business & professional services":       "Consulting",
  "software & consulting":                  "Consulting",
  "advisory":                               "Consulting",

  // Banking
  "banking":                                "Banking",
  "digital banking":                        "Banking",

  // Financial Services
  "financial services":                     "Financial Services",
  "finance":                                "Financial Services",
  "finance & education":                    "Financial Services",
  "information services":                   "Financial Services",

  // Investment Banking
  "investment banking":                     "Investment Banking",

  // Private Equity
  "private equity":                         "Private Equity",

  // Asset Management
  "asset management":                       "Asset Management",
  "investment & asset management":          "Asset Management",
  "investments":                            "Asset Management",
  "alternative investments":                "Asset Management",
  "corporate finance":                      "Asset Management",

  // Technology
  "technology":                             "Technology",
  "technology & software":                  "Technology",
  "software development":                   "Technology",
  "software":                               "Technology",
  "it":                                     "Technology",
  "it services":                            "Technology",
  "it services & consulting":               "Technology",
  "information technology":                 "Technology",
  "hr software":                            "Technology",
  "data analysis":                          "Technology",
  "internet market platform":               "Technology",
  "digital":                                "Technology",
  "fintech":                                "Technology",
  "semiconductor manufacturing":            "Technology",
  "consumer electronics":                   "Technology",
  "electronics":                            "Technology",

  // Legal
  "legal":                                  "Legal",
  "law":                                    "Legal",
  "ai for lawyers":                         "Legal",

  // Education
  "education":                              "Education",
  "educational resources":                  "Education",
  "academia":                               "Education",
  "research & science":                     "Education",
  "mentoring":                              "Education",

  // Research Services
  "research":                               "Research Services",
  "research services":                      "Research Services",

  // Healthcare
  "healthcare":                             "Healthcare",
  "medical & healthcare":                   "Healthcare",
  "medical":                                "Healthcare",
  "wellness":                               "Healthcare",

  // Pharmaceutical
  "pharmaceutical":                         "Pharmaceutical",
  "pharmaceuticals":                        "Pharmaceutical",
  "pharmaceutical manufacturing":           "Pharmaceutical",

  // Retail
  "retail":                                 "Retail",
  "e-commerce":                             "Retail",
  "retail apparel & fashion":               "Retail",
  "apparel & fashion":                      "Retail",
  "apparel":                                "Retail",
  "luxury retail":                          "Luxury",
  "wholesale":                              "Retail",
  "customer service":                       "Retail",

  // Luxury
  "fashion":                                "Luxury",
  "luxury":                                 "Luxury",
  "luxury goods":                           "Luxury",
  "luxury fashion":                         "Luxury",
  "cosmetics":                              "Luxury",
  "beauty & personal care":                 "Luxury",
  "jewellery":                              "Luxury",

  // Food & Beverage
  "food & beverage":                        "Food & Beverage",
  "beverage manufacturing":                 "Food & Beverage",

  // Energy & Sustainability
  "energy":                                 "Energy & Sustainability",
  "sustainability":                         "Energy & Sustainability",
  "environmental services":                 "Energy & Sustainability",

  // Media & Marketing
  "media":                                  "Media & Marketing",
  "media & marketing":                      "Media & Marketing",
  "marketing":                              "Media & Marketing",
  "marketing & media":                      "Media & Marketing",
  "online advertising":                     "Media & Marketing",
  "geomarketing":                           "Media & Marketing",
  "editing":                                "Media & Marketing",

  // Insurance
  "insurance":                              "Insurance",
  "credit & insurance":                     "Insurance",
  "pet insurance":                          "Insurance",
  "assurance":                              "Insurance",

  // Public Sector
  "public policy":                          "Public Sector",
  "public sector":                          "Public Sector",
  "politics":                               "Public Sector",
  "international relations":                "Public Sector",
  "international trade and development":    "Public Sector",
  "civil & social":                         "Public Sector",
  "non-profit":                             "Public Sector",
  "defense":                                "Public Sector",
  "volunteering":                           "Public Sector",

  // Manufacturing & Industrial
  "manufacturing":                          "Manufacturing & Industrial",
  "automotive":                             "Manufacturing & Industrial",
  "chemicals":                              "Manufacturing & Industrial",
  "chemistry":                              "Manufacturing & Industrial",
  "packaging":                              "Manufacturing & Industrial",
  "textile":                                "Manufacturing & Industrial",
  "textile manufacturing":                  "Manufacturing & Industrial",
  "molding":                                "Manufacturing & Industrial",
  "engineering":                            "Manufacturing & Industrial",
  "packaging and containers manufacturing": "Manufacturing & Industrial",

  // Consumer Goods
  "consumer goods":                         "Consumer Goods",
  "consumer services":                      "Consumer Goods",

  // Real Estate & Construction
  "real estate":                            "Real Estate & Construction",
  "construction":                           "Real Estate & Construction",
  "interior design":                        "Real Estate & Construction",

  // Venture Capital
  "venture capital":                        "Venture Capital",

  // Accounting
  "accounting":                             "Accounting",

  // Hospitality & Travel
  "hospitality":                            "Hospitality & Travel",
  "travel":                                 "Hospitality & Travel",
  "transport":                              "Hospitality & Travel",
  "aviation":                               "Hospitality & Travel",

  // Logistics
  "logistics & supply chain":               "Logistics & Supply Chain",
  "logistics":                              "Logistics & Supply Chain",

  // Human Resources
  "human resources":                        "Human Resources",
  "recruitment":                            "Human Resources",

  // Telecoms
  "telecommunications":                     "Telecommunications",

  // Catch-all visible bucket
  "n/a":                                    "Other",
  "other":                                  "Other",

  // Noise — exclude from stats entirely
  "not working":                            "Other",
  "associate consultant":                   null,
  "startup":                                null,
  "holding firm":                           null,
  "social networking":                      null,
  "data protection":                        null,
  "sport":                                  null,
  "art & design":                           null,
  "entertainment":                          null,
  "hubs":                                   null,
  "operations":                             null,
  "services":                               null,
  "relations services":                     null,
  "freelance":                              null,
  "sales":                                  null,
  "agriculture":                            null,
};

/**
 * Normalizes a raw DB industry value to a stats chart category label.
 * Returns null for noise/excluded entries.
 * Returns the raw value (trimmed) for anything not listed in INDUSTRY_NORM,
 * so unknown values stay visible rather than being silently dropped.
 *
 * Used by app/stats/page.tsx for aggregations, charts, and breakdowns.
 */
export function normalizeIndustry(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (key in INDUSTRY_NORM) return INDUSTRY_NORM[key];
  // Unknown label — pass through as-is
  return raw.trim();
}
