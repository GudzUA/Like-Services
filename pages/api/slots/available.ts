// pages/api/slots/available.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { masterId, subtypeId } = req.body;

    if (!subtypeId || typeof subtypeId !== "string") {
      return res.status(400).json({ error: "Invalid subtypeId" });
    }

    const subtype = await prisma.subtype.findUnique({ where: { id: subtypeId } });

    if (!subtype) {
      return res.status(404).json({ error: "Subtype not found" });
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
      .filter((s) => !s.booking)
      .map((s) => ({
        id: s.id,
        start: s.start,
        end: addMinutes(s.start, duration),
      }));

    return res.status(200).json({ slots: availableSlots });
  } catch (error: any) {
    console.error("❌ Failed to fetch slots:", error);
    return res.status(500).json({ error: error.message });
  }
}
