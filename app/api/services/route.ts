// app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        masters: {
          some: {
            masterType: "schedule",
          },
        },
      },
      include: {
        masters: {
          select: { masterType: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("❌ API services error:", error);
    return NextResponse.json({ message: "Помилка отримання даних" }, { status: 500 });
  }
}
