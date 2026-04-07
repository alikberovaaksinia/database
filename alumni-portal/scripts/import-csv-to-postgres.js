/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Import alumni_database_revised.csv → Postgres (alumni_raw table)
 *
 * Run from the alumni-portal/ directory:
 *   node scripts/import-csv-to-postgres.js [--dry-run]
 *
 * Requires DATABASE_URL in .env (same file used by the Next.js app).
 *
 * What this script does:
 * - Reads ../alumni_database_revised.csv
 * - Maps CSV column names to Postgres column names
 * - TRUNCATEs alumni_raw then inserts all rows (full replacement)
 * - Skips rows with no full_name
 * - Prints a summary: inserted / skipped count
 */

require("dotenv").config();

const fs   = require("fs");
const path = require("path");
const { Client } = require("pg");

const DRY_RUN  = process.argv.includes("--dry-run");
const CSV_PATH = path.resolve(__dirname, "../../alumni_database_revised.csv");

// ---------------------------------------------------------------------------
// Column mapping: alumni_database_revised.csv header → Postgres column name
// ---------------------------------------------------------------------------
const COLUMN_MAP = {
  associate_id:             "db_id",
  number:                   "associate_number",
  full_name:                "full_name",
  surname:                  "surname",
  first_name:               "first_name",
  middle_name:              "middle_name",
  age_group:                "age_group",
  phone_number:             "phone_number",
  email_1:                  "email",
  email_2:                  "second_email",
  linkedin:                 "linkedin",
  current_firm:             "current_firm",
  current_role:             "current_role",
  current_role_seniority:   "current_role_seniority",
  current_city:             "current_city",
  current_country:          "current_country",
  current_industry:         "current_industry",
  notable_past_firms:       "notable_past_firms",
  notable_past_roles:       "past_role_npf",
  start_notable_past_firms: "starting_month_npf",
  end_notable_past_firms:   "ending_month_npf",
  past_role_city:           "pr_city",
  past_role_country:        "pr_country",
  past_role_industry:       "npf_industry",
  jeme_starting:            "jeme_starting_period",
  jeme_ending:              "jeme_ending_period",
  jeme_role_1:              "jeme_role",
  jeme_role_2:              "jeme_role_2",
  board:                    "board",
  head:                     "head",
};

// ---------------------------------------------------------------------------
// Country name → ISO 3166-1 alpha-2 code
// Covers every distinct value found in alumni_database_revised.csv
// ---------------------------------------------------------------------------
const COUNTRY_NAME_TO_ISO = {
  "australia":            "AU",
  "austria":              "AT",
  "belgium":              "BE",
  "belgium, czech republic": "BE",   // ambiguous — take primary country
  "brazil":               "BR",
  "campania":             "IT",      // Italian region → Italy
  "canada":               "CA",
  "colombia":             "CO",
  "finland":              "FI",
  "france":               "FR",
  "germany":              "DE",
  "illinois":             "US",      // US state → United States
  "ireland":              "IE",
  "italy":                "IT",
  "luxembourg":           "LU",
  "montenegro":           "ME",
  "netherlands":          "NL",
  "norway":               "NO",
  "portugal":             "PT",
  "romania":              "RO",
  "saudi arabia":         "SA",
  "serbia":               "RS",
  "spain":                "ES",
  "sweden":               "SE",
  "switzerland":          "CH",
  "united arab emirates": "AE",
  "united kingdom":       "GB",
  "united states":        "US",
  "zambia":               "ZM",
};

function normalizeCountry(raw) {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  // Already a 2-letter ISO code — keep as-is (uppercase)
  if (/^[a-z]{2}$/i.test(key)) return key.toUpperCase();
  return COUNTRY_NAME_TO_ISO[key] ?? null;
}

// Postgres columns with no equivalent in this CSV — always NULL
const NULL_COLS = ["source_id", "pr_city_2", "pr_city_3", "pr_country_2", "pr_country_3", "jeme_role_3"];

// All Postgres columns in the order used for INSERT
const PG_COLS = [
  "db_id", "source_id", "associate_number", "full_name", "surname",
  "first_name", "middle_name", "age_group", "phone_number", "email",
  "second_email", "linkedin", "current_firm", "current_role",
  "current_role_seniority", "current_city", "current_country",
  "current_industry", "notable_past_firms", "past_role_npf",
  "starting_month_npf", "ending_month_npf", "pr_city", "pr_city_2",
  "pr_city_3", "pr_country", "pr_country_2", "pr_country_3",
  "npf_industry", "jeme_starting_period", "jeme_ending_period",
  "jeme_role", "jeme_role_2", "jeme_role_3", "board", "head",
];

// ---------------------------------------------------------------------------
// Minimal RFC-4180 CSV parser (handles quoted fields with embedded commas
// and double-quote escaping; does NOT support embedded newlines in fields)
// ---------------------------------------------------------------------------
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const records = [];
  let headers = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const fields = [];
    let i = 0;

    while (i <= line.length) {
      if (i === line.length) {
        // Trailing comma produced an empty last field
        fields.push("");
        break;
      }

      if (line[i] === '"') {
        // Quoted field
        let field = "";
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (line[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            field += line[i++];
          }
        }
        fields.push(field.trim() || null);
        // skip comma after field
        if (line[i] === ",") i++;
      } else {
        // Unquoted field
        const start = i;
        while (i < line.length && line[i] !== ",") i++;
        const raw = line.slice(start, i).trim();
        fields.push(raw || null);
        if (i < line.length) i++; // skip comma
      }
    }

    if (headers === null) {
      headers = fields.map((h) => (h ? h.trim() : ""));
    } else {
      const record = {};
      headers.forEach((h, idx) => {
        record[h] = fields[idx] ?? null;
      });
      records.push(record);
    }
  }

  return { headers: headers ?? [], records };
}

// ---------------------------------------------------------------------------
// Map one CSV row → Postgres record (or null to skip)
// ---------------------------------------------------------------------------
function buildRecord(csvRow) {
  const record = Object.fromEntries(PG_COLS.map((c) => [c, null]));

  for (const [csvCol, pgCol] of Object.entries(COLUMN_MAP)) {
    const raw = csvRow[csvCol];
    record[pgCol] = raw && raw.trim() ? raw.trim() : null;
  }

  // Normalize country to ISO code so the map and getCountryName() work correctly
  record["current_country"] = normalizeCountry(record["current_country"]);

  // Normalize age_group to valid buckets
  const BELOW_50 = new Set(["20-25", "25-30", "30-35", "35-40", "40-45", "45-50"]);
  const ag = record["age_group"];
  if (ag) {
    if (ag === "#VALUE!" || ag === "140-145") {
      record["age_group"] = null;
    } else if (ag !== "50+" && !BELOW_50.has(ag)) {
      // Any age group beyond 45-50 that isn't already "50+" → map to "50+"
      record["age_group"] = "50+";
    }
  }

  for (const col of NULL_COLS) {
    record[col] = null;
  }

  // Must have a full_name to be a real row
  if (!record.full_name) return null;

  // db_id: use associate_id if present, else fall back to -number
  if (record.db_id) {
    const parsed = parseInt(record.db_id, 10);
    if (!Number.isFinite(parsed)) return null; // unparseable ID — skip
    record.db_id = parsed;
  } else {
    const assocNum = record.associate_number;
    if (!assocNum) return null; // no ID and no number — can't make stable key
    record.db_id = -parseInt(assocNum, 10);
  }

  return record;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env");
  }

  console.log(`CSV  : ${CSV_PATH}`);
  console.log(`Mode : ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE (upsert into Postgres)"}\n`);

  const text = fs.readFileSync(CSV_PATH, "utf8");
  const { headers, records: csvRecords } = parseCSV(text);

  console.log(`CSV rows read        : ${csvRecords.length}`);

  const unmapped = headers.filter((h) => h && !(h in COLUMN_MAP));
  if (unmapped.length) {
    console.log(`Unmapped CSV columns (ignored): ${unmapped.join(", ")}`);
  }

  const pgRecords = [];
  let skipped = 0;
  let synthetic = 0;
  const seenIds = new Set();

  for (const csvRow of csvRecords) {
    const record = buildRecord(csvRow);
    if (!record) { skipped++; continue; }

    if (record.db_id < 0) synthetic++;

    // Handle duplicate positive IDs — reassign to -number
    if (record.db_id > 0 && seenIds.has(record.db_id)) {
      const assoc = record.associate_number;
      if (!assoc) { skipped++; continue; }
      console.warn(`  WARN: duplicate associate_id=${record.db_id} for "${record.full_name}" → reassigned to -${assoc}`);
      record.db_id = -parseInt(assoc, 10);
      synthetic++;
    }

    seenIds.add(record.db_id);
    pgRecords.push(record);
  }

  console.log(`Rows to upsert       : ${pgRecords.length}`);
  console.log(`Rows skipped (blank) : ${skipped}`);
  console.log(`Rows with synthetic db_id: ${synthetic}`);

  if (DRY_RUN) {
    console.log("\nDry run complete. No changes made.");
    return;
  }

  // Build parameterized upsert SQL
  const colList   = PG_COLS.map((c) => `"${c}"`).join(", ");
  const placeholders = PG_COLS.map((_, i) => `$${i + 1}`).join(", ");
  const updateCols = PG_COLS.filter((c) => c !== "db_id")
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(",\n        ");

  const sql = `
    INSERT INTO alumni_raw (${colList})
    VALUES (${placeholders})
    ON CONFLICT (db_id) DO UPDATE SET
        ${updateCols}
  `;

  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await pg.connect();

  // Full replacement: clear old data first so stale rows don't accumulate
  await pg.query("TRUNCATE TABLE alumni_raw");

  let upserted = 0;
  for (const record of pgRecords) {
    const values = PG_COLS.map((c) => record[c]);
    await pg.query(sql, values);
    upserted++;
  }

  await pg.end();

  console.log(`\nInserted: ${upserted} rows into Postgres alumni_raw`);
  console.log("\nDone. Run the age-group sync to recompute age buckets:");
  console.log("  curl -X POST http://localhost:3000/api/sync-age-groups");
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
