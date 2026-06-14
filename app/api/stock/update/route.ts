import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("UPDATE BODY:", body);

  const {
    symbol,
    shares,
    cost,
    currentPrice,
    changePercent,
    userId,
  } = body;

  const stock = await prisma.stock.updateMany({
    where: {
      symbol,
      userId,
    },
    data: {
      shares,
      cost,
      currentPrice,
      changePercent,
    },
  });

  return NextResponse.json(stock);
}