import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const data = await request.json();

  const {
    changePercent,
    ...stockData
  } = data;

  const maxOrder =
  await prisma.stock.aggregate({
    _max: {
      sortOrder: true,
    },
  });

const stock =
  await prisma.stock.create({
    data: {
  ...stockData,
  sortOrder:
    (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(stock);
}