import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const {
    currentId,
    targetId,
  } = await request.json();

  const current =
    await prisma.stock.findUnique({
      where: {
        id: currentId,
      },
    });

  const target =
    await prisma.stock.findUnique({
      where: {
        id: targetId,
      },
    });

  if (!current || !target) {
    return NextResponse.json(
      { error: "找不到股票" },
      { status: 404 }
    );
  }

  await prisma.stock.update({
    where: {
      id: current.id,
    },
    data: {
      sortOrder: target.sortOrder,
    },
  });

  await prisma.stock.update({
    where: {
      id: target.id,
    },
    data: {
      sortOrder: current.sortOrder,
    },
  });

  return NextResponse.json({
    success: true,
  });
}