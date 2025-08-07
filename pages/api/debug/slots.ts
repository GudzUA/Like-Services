import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const all = await prisma.timeSlot.findMany({
    select: {
      id: true,
      start: true,
      end: true,
      masterId: true,
      master: { select: { id: true, name: true } },
    },
    orderBy: { start: "asc" },
    take: 200,
  });
  return res.status(200).json({ count: all.length, items: all });
}
