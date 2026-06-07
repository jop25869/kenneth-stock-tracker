import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const data = await request.json();

  const stock =
    await prisma.stock.create({
      data,
    });

  return NextResponse.json(stock);
}