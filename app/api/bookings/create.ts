import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, slotId, subtypeId, masterId } = await req.json();

    // 1. Знайти або створити користувача
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        name,
        email: `guest_${phone}@poslugy.local`, 
        type: "guest",
        isMaster: false,
      },
    });

    // 2. Створити бронювання
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        subtypeId,
        timeSlotId: slotId,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    return NextResponse.json({ success: false, error: "Booking creation failed" }, { status: 500 });
  }
}
