// pages/api/bookings/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { name, phone, slotId, subtypeId, masterId } = req.body;

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

    return res.status(200).json({ success: true, booking });
  } catch (error: any) {
    console.error("❌ Booking creation error:", error);
    return res.status(500).json({ success: false, error: error.message || "Booking creation failed" });
  }
}
