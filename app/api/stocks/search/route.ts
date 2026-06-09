import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const keyword =
    req.nextUrl.searchParams.get("q") || "";

  const stocks = await prisma.$queryRawUnsafe(
    `
    SELECT
      id,
      symbol,
      name,
      market,
      country
    FROM stocks
    WHERE
      symbol ILIKE $1
      OR name ILIKE $1
    LIMIT 20
    `,
    `%${keyword}%`
  );

  return new Response(
    JSON.stringify(
      stocks,
      (_, value) =>
        typeof value === "bigint"
          ? value.toString()
          : value
    ),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}