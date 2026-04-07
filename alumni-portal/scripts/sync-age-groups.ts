/**
 * One-time backfill and yearly refresh script.
 *
 * Usage:
 *   npx tsx scripts/sync-age-groups.ts
 *
 * Reads jeme_ending_period for every alumni row, computes the current age
 * group bucket, and writes it back to age_group in the DB.
 * Rows with no parseable graduation year are left untouched.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { computeAgeGroup } from "../app/lib/age-group";

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("Fetching alumni rows...");
  const rows = await prisma.alumni_raw.findMany({
    select: { db_id: true, jeme_ending_period: true },
  });
  console.log(`  Found ${rows.length} rows.`);

  // Group db_ids by computed age group
  const buckets = new Map<string, number[]>();
  let skipped = 0;

  for (const row of rows) {
    const group = computeAgeGroup(row.jeme_ending_period);
    if (group === null) {
      skipped++;
      continue;
    }
    const existing = buckets.get(group);
    if (existing) {
      existing.push(row.db_id);
    } else {
      buckets.set(group, [row.db_id]);
    }
  }

  console.log("\nComputed buckets:");
  for (const [bucket, ids] of buckets) {
    console.log(`  ${bucket}: ${ids.length} alumni`);
  }
  console.log(`  (no grad year — skipped): ${skipped}`);

  console.log("\nWriting to DB...");
  let updated = 0;
  for (const [ageGroup, ids] of buckets) {
    await prisma.alumni_raw.updateMany({
      where: { db_id: { in: ids } },
      data: { age_group: ageGroup },
    });
    updated += ids.length;
    console.log(`  Updated ${ids.length} rows → "${ageGroup}"`);
  }

  console.log(`\nDone. Updated: ${updated}  Skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
