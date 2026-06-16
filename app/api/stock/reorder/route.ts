import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  console.time("json");

  const {
    currentId,
    targetId,
  } = await request.json();

  console.timeEnd("json");

  console.time("findCurrent");

  const current =
    await prisma.stock.findUnique({
      where: {
        id: currentId,
      },
    });

  console.timeEnd("findCurrent");

  console.time("findTarget");

  const target =
    await prisma.stock.findUnique({
      where: {
        id: targetId,
      },
    });

  console.timeEnd("findTarget");

  if (!current || !target) {
    return NextResponse.json(
      { error: "找不到股票" },
      { status: 404 }
    );
  }

  console.time("update1");

  await prisma.stock.update({
    where: {
      id: current.id,
    },
    data: {
      sortOrder: target.sortOrder,
    },
  });

  console.timeEnd("update1");

  console.time("update2");

  await prisma.stock.update({
    where: {
      id: target.id,
    },
    data: {
      sortOrder: current.sortOrder,
    },
  });

  console.timeEnd("update2");

  return NextResponse.json({
    success: true,
  });
}