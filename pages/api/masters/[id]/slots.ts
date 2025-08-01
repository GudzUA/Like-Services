// /pages/api/masters/[id]/slots.ts

import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid ID" });

  try {
    const slots = await prisma.timeSlot.findMany({
      where: { masterId: id },
      orderBy: { start: "asc" },
    });

    const formatted = slots.map((s) => ({
      id: s.id,
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
}
