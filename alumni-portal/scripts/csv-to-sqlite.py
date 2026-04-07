#!/usr/bin/env python3
"""
Import Database.csv → alumni.db (alumni_raw table).

Run from the alumni-portal/ directory:
    python3 scripts/csv-to-sqlite.py [--dry-run]

What this script does:
- Reads ../Database.csv (relative to alumni-portal/)
- Maps CSV columns by name to SQLite columns (fixes the historical off-by-one shift)
- Imports ALL rows that have a non-empty Full Name (~612 rows)
- Assigns a synthetic negative db_id to rows that have no ID in the CSV
- Skips truly blank rows (no name, no ID)
- Wipes the existing alumni_raw data and replaces it with a fresh import
- Prints a diagnostic summary: imported / skipped-blank / rows-with-synthetic-id
"""

import csv
import sqlite3
import sys
import os
import unicodedata

DRY_RUN = "--dry-run" in sys.argv

# Paths relative to the directory this script is run from (alumni-portal/)
CSV_PATH = os.path.join(os.path.dirname(__file__), "../../Database.csv")
DB_PATH  = os.path.join(os.path.dirname(__file__), "../../alumni.db")

# --- Column mapping: CSV header (exact, including trailing spaces/typos) → SQLite column ---
# Note: source_id has no corresponding CSV column and will be left NULL.
COLUMN_MAP = {
    "ID":                     "db_id",
    "Associate Number":       "associate_number",
    "Full Name":              "full_name",
    "Surname":                "surname",
    "First Name":             "first_name",
    "Middle Name":            "middle_name",
    "Age Group":              "age_group",
    "Phone number":           "phone_number",
    "Email":                  "email",
    "Second Email":           "second_email",
    "LinkedIn":               "linkedin",
    "Current Firm":           "current_firm",
    "Current Role":           "current_role",
    "Current Role Seniority": "current_role_seniority",
    "Current City":           "current_city",
    "Current Country ":       "current_country",   # trailing space in CSV
    "Curent Industry":        "current_industry",  # typo in CSV (missing r)
    "Notable Past Firms ":    "notable_past_firms", # trailing space in CSV
    "Past Role NPF":          "past_role_npf",
    "Starting month NPF":     "starting_month_npf",
    "Ending Month NPF":       "ending_month_npf",
    "PR City ":               "pr_city",           # trailing space in CSV
    "PR City 2":              "pr_city_2",
    "PR City 3":              "pr_city_3",
    "PR Country":             "pr_country",
    "PR Country 2":           "pr_country_2",
    "PR Country 3":           "pr_country_3",
    "NPF Industry":           "npf_industry",
    "JEME Starting Period":   "jeme_starting_period",
    "JEME Ending Period":     "jeme_ending_period",
    "JEME Role":              "jeme_role",
    "JEME Role 2":            "jeme_role_2",
    "JEME Role 3":            "jeme_role_3",
    "Board":                  "board",
    "Head ":                  "head",              # trailing space in CSV
}

# All SQLite columns in table order (must match PRAGMA table_info(alumni_raw))
SQLITE_COLS = [
    "db_id", "source_id", "associate_number", "full_name", "surname",
    "first_name", "middle_name", "age_group", "phone_number", "email",
    "second_email", "linkedin", "current_firm", "current_role",
    "current_role_seniority", "current_city", "current_country",
    "current_industry", "notable_past_firms", "past_role_npf",
    "starting_month_npf", "ending_month_npf", "pr_city", "pr_city_2",
    "pr_city_3", "pr_country", "pr_country_2", "pr_country_3",
    "npf_industry", "jeme_starting_period", "jeme_ending_period",
    "jeme_role", "jeme_role_2", "jeme_role_3", "board", "head",
]


def normalize(s):
    """Strip leading/trailing whitespace and normalize unicode spaces."""
    if s is None:
        return None
    s = s.strip()
    # Replace non-breaking spaces and other unicode whitespace
    s = "".join(" " if unicodedata.category(c) in ("Zs",) else c for c in s)
    s = s.strip()
    return s if s else None


def load_csv(path):
    rows = []
    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        raw_headers = reader.fieldnames or []
        for row in reader:
            rows.append(row)
    return raw_headers, rows


def build_sqlite_row(csv_row):
    """
    Map a CSV DictReader row → dict keyed by SQLite column names.
    Returns (record_dict, used_synthetic_id: bool) or None if row should be skipped.

    Synthetic IDs: rows without a CSV "ID" value get db_id = -associate_number.
    This is stable across re-runs (same person always gets the same synthetic ID)
    as long as their Associate Number doesn't change.
    """
    record = {col: None for col in SQLITE_COLS}

    for csv_col, sqlite_col in COLUMN_MAP.items():
        raw = csv_row.get(csv_col, "") or ""
        val = normalize(raw)
        record[sqlite_col] = val

    full_name = record.get("full_name") or ""
    if not full_name.strip():
        return None, False  # skip blank rows

    used_synthetic = False
    if not record["db_id"]:
        assoc = record.get("associate_number") or ""
        if not assoc.strip():
            # No ID and no associate number — skip (can't make a stable key)
            return None, False
        record["db_id"] = str(-int(assoc.strip()))
        used_synthetic = True

    # source_id has no CSV column — leave as NULL
    record["source_id"] = None

    return record, used_synthetic


def main():
    print(f"CSV  : {os.path.abspath(CSV_PATH)}")
    print(f"DB   : {os.path.abspath(DB_PATH)}")
    if DRY_RUN:
        print("Mode : DRY RUN (no writes)\n")
    else:
        print("Mode : LIVE (will wipe and reimport alumni_raw)\n")

    raw_headers, csv_rows = load_csv(CSV_PATH)
    print(f"Total CSV data rows (excl. header): {len(csv_rows)}")

    # Detect any CSV headers not in COLUMN_MAP (informational)
    unmapped = [h for h in raw_headers if h and h not in COLUMN_MAP]
    if unmapped:
        print(f"Unmapped CSV columns (ignored): {unmapped}")

    records = []
    skipped_blank = 0
    synthetic_count = 0
    dup_id_rows = []
    seen_ids = set()

    for csv_row in csv_rows:
        record, used_synthetic = build_sqlite_row(csv_row)
        if record is None:
            skipped_blank += 1
            continue

        # Handle duplicate real IDs: second occurrence gets synthetic -associate_number
        db_id = record["db_id"]
        if db_id and int(db_id) > 0 and db_id in seen_ids:
            assoc = record.get("associate_number") or ""
            if not assoc.strip():
                skipped_blank += 1
                continue
            original_id = db_id
            record["db_id"] = str(-int(assoc.strip()))
            used_synthetic = True
            dup_id_rows.append((original_id, record["db_id"], record["full_name"]))
        seen_ids.add(record["db_id"])

        if used_synthetic:
            synthetic_count += 1
        records.append(record)

    print(f"\nDiagnostics:")
    print(f"  Rows to import      : {len(records)}")
    print(f"  Rows skipped (blank): {skipped_blank}")
    print(f"  Rows with synthetic db_id (no ID in CSV): {synthetic_count}")
    print(f"  Rows with real db_id: {len(records) - synthetic_count}")

    if dup_id_rows:
        print(f"\n  WARNING: Duplicate IDs in spreadsheet (fix recommended):")
        for orig, new_id, name in dup_id_rows:
            print(f"    ID={orig} was duplicated — {name!r} reassigned db_id={new_id}")

    # Show a few synthetic-id rows for review
    synth_rows = [r for r in records if int(r["db_id"]) < 0]
    if synth_rows:
        print(f"\n  Sample rows getting synthetic IDs:")
        for r in synth_rows[:5]:
            print(f"    db_id={r['db_id']}  full_name={r['full_name']!r}  associate_number={r['associate_number']!r}")

    if DRY_RUN:
        print("\nDry run complete. No changes made.")
        return

    # --- Write to SQLite ---
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM alumni_raw")
    old_count = cur.fetchone()[0]
    print(f"\nExisting SQLite rows (will be replaced): {old_count}")

    cur.execute("DELETE FROM alumni_raw")

    placeholders = ", ".join(["?"] * len(SQLITE_COLS))
    cols_sql = ", ".join(SQLITE_COLS)
    insert_sql = f"INSERT INTO alumni_raw ({cols_sql}) VALUES ({placeholders})"

    inserted = 0
    for record in records:
        values = [record[col] for col in SQLITE_COLS]
        cur.execute(insert_sql, values)
        inserted += 1

    conn.commit()
    conn.close()

    print(f"Inserted: {inserted} rows into alumni_raw")
    print("\nDone. Next step: run transfer.js to push to Postgres.")
    print("  node transfer.js")


if __name__ == "__main__":
    main()
