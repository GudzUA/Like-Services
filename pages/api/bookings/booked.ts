// pages/api/bookings/booked.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { masterId } = req.query;

  if (!masterId || typeof masterId !== "string") {
    return res.status(400).json({ success: false, message: "Missing or invalid masterId" });
  }

  try {
    // Отримуємо всі бронювання для майстра
const bookedSlots = await prisma.timeSlot.findMany({
  where: {
    masterId: masterId,
    booking: {
      isNot: null,
    },
  },
  select: {
    id: true,
  },
});

return res.status(200).json(bookedSlots.map((s) => ({ slotId: s.id })));

  } catch (error: any) {
    console.error("❌ Error loading booked slots:", error);
    return res.status(500).json({ success: false, error: error.message || "Error loading bookings" });
  }
}
