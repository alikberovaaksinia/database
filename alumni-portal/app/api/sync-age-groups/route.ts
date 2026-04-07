import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { computeAgeGroup } from "../../lib/age-group";

/**
 * POST /api/sync-age-groups
 *
 * Recomputes age_group for every alumni row from their jeme_ending_period.
 * Batches updates by computed bucket — at most 7 updateMany calls total.
 *
 * Protect this with the SYNC_SECRET environment variable.
 * Call it once after deploy to backfill, then schedule yearly (e.g. via Vercel Cron).
 *
 * Example cron header:  Authorization: Bearer <SYNC_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const rows = await prisma.alumni_raw.findMany({
    select: { db_id: true, jeme_ending_period: true },
  });

  // Group db_ids by their computed age group bucket
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

  // One updateMany per bucket — max 7 queries total
  let updated = 0;
  for (const [ageGroup, ids] of buckets) {
    await prisma.alumni_raw.updateMany({
      where: { db_id: { in: ids } },
      data: { age_group: ageGroup },
    });
    updated += ids.length;
  }

  return NextResponse.json({
    ok: true,
    updated,
    skipped,
    buckets: Object.fromEntries(
      Array.from(buckets.entries()).map(([k, v]) => [k, v.length]),
    ),
  });
}
