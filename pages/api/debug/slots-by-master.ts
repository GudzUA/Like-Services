import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = (req.query.id as string) || "";
  if (!id) return res.status(400).json({ error: "id required" });

  const now = new Date();
  const all = await prisma.timeSlot.findMany({
    where: { masterId: id },
    select: { id: true, masterId: true, start: true, end: true, booking: { select: { id: true } } },
    orderBy: { start: "asc" },
  });
  const futureFree = all.filter(s => s.end > now && !s.booking);

  return res.status(200).json({
    masterId: id,
    now: now.toISOString(),
    counts: { all: all.length, futureFree: futureFree.length },
    sampleAll: all.slice(0, 5),
    sampleFutureFree: futureFree.slice(0, 5),
  });
}
