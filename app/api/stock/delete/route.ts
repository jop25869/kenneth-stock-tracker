import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const {
    symbol,
    userId,
  } = await request.json();

  const result =
    await prisma.stock.deleteMany({
      where: {
        symbol,
        userId,
      },
    });

  return NextResponse.json(result);
}