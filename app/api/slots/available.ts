// /app/api/slots/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";

export async function POST(req: NextRequest) {
  const { masterId, subtypeId } = await req.json();

  if (!subtypeId || typeof subtypeId !== "string") {
    return NextResponse.json({ error: "Invalid subtypeId" }, { status: 400 });
  }

  const subtype = await prisma.subtype.findUnique({ where: { id: subtypeId } });

  if (!subtype) {
    return NextResponse.json({ error: "Subtype not found" }, { status: 404 });
  }

  const duration = subtype.duration;

  const now = new Date();
  const endDate = addMinutes(now, 60 * 24 * 7); // 7 днів наперед

  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      masterId,
      start: { gte: now, lte: endDate },
    },
    include: {
      booking: true,
    },
    orderBy: { start: "asc" },
  });

  const availableSlots = timeSlots
    .filter((s) => !s.booking) // 🔥 показує лише ті, де ще нема booking
    .map((s) => ({
      id: s.id,
      start: s.start,
      end: addMinutes(s.start, duration),
    }));

  return NextResponse.json({ slots: availableSlots });
}
