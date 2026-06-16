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

let finalData = {
  ...stockData,
};

if (
  stockData.market === "TW"
) {
  const twStock =
    await prisma.taiwanStock.findUnique({
      where: {
        symbol: stockData.symbol.replace(
          ".TW",
          ""
        ),
      },
    });

  if (twStock) {
    finalData = {
      ...finalData,
      name: twStock.name,
    };
  }
}

const stock =
  await prisma.stock.create({
    data: {
      ...finalData,
      sortOrder:
        (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(stock);
}