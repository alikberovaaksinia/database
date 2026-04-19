import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function findVariants(term: string) {
  const rows = await prisma.alumni_raw.findMany({
    where: {
      OR: [
        { current_firm: { contains: term, mode: "insensitive" } },
        { notable_past_firms: { contains: term, mode: "insensitive" } },
      ],
    },
    select: {
      db_id: true,
      full_name: true,
      current_firm: true,
      notable_past_firms: true,
    },
  });
  console.table(rows);
}

const term = process.argv[2] ?? "bcg";
findVariants(term).finally(() => prisma.$disconnect());
