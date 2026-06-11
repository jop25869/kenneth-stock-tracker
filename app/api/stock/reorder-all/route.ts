import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const stocks = await request.json();

  await prisma.$transaction(
    stocks.map(
      (stock: {
        id: number;
        sortOrder: number;
      }) =>
        prisma.stock.update({
          where: {
            id: stock.id,
          },
          data: {
            sortOrder:
              stock.sortOrder,
          },
        })
    )
  );

  return NextResponse.json({
    success: true,
  });
}