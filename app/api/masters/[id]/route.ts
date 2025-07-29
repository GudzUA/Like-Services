// /app/api/masters/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const master = await prisma.user.findFirst({
      where: { id: params.id },
      include: { subtypes: true },
    });

    if (!master) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: { masterId: params.id },
    });

    return NextResponse.json({ master, timeSlots });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
