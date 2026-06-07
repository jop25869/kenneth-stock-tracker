import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const {
    symbol,
    shares,
    cost,
    currentPrice,
    userId,
  } = await request.json();

  const stock =
    await prisma.stock.updateMany({
      where: {
        symbol,
        userId,
      },
      data: {
        shares,
        cost,
        currentPrice,
      },
    });

  return NextResponse.json(stock);
}