import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } =
    new URL(request.url);

  const userId = Number(
    searchParams.get("userId")
  );

  const stocks = await prisma.stock.findMany({
    where: {
      userId,
    },
    orderBy: {
    sortOrder: "asc",
}
  });

  return NextResponse.json(stocks);
}