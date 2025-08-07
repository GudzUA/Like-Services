// pages/api/cron/cleanup-slots.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const now = new Date();

    // ❗️Поріг — 24 години тому
    const safeCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const oldFreeSlots = await prisma.timeSlot.findMany({
      where: {
        end: { lt: safeCutoff },
        booking: null,
      },
      select: { id: true },
    });

    if (oldFreeSlots.length > 0) {
      await prisma.timeSlot.deleteMany({
        where: { id: { in: oldFreeSlots.map((s) => s.id) } },
      });
    }

    return res.status(200).json({ deleted: oldFreeSlots.length });
  } catch (e: any) {
    console.error("cleanup-slots error:", e);
    return res.status(500).json({ error: e.message ?? "Internal Error" });
  }
}
