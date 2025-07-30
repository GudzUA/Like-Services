import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  try {
    const master = await prisma.user.findUnique({
      where: { id },
      include: { subtypes: true },
    });

    if (!master) {
      return NextResponse.json({ message: "Master not found" }, { status: 404 });
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: { masterId: id },
      orderBy: { start: "asc" },
    });

    // серіалізуємо дати в ISO-рядки
    const safeSlots = timeSlots.map(s => ({
      id: s.id,
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    }));

    return NextResponse.json({ master, timeSlots: safeSlots });
  } catch (err) {
    console.error("❌ /api/masters/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
