import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const updates = await request.json();

    for (const item of updates) {
      await prisma.stock.update({
        where: {
          id: item.id,
        },
        data: {
          sortOrder: item.sortOrder,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "排序更新失敗" },
      { status: 500 }
    );
  }
}