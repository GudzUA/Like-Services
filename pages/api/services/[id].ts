// /pages/api/services/[id].ts

import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid ID" });

  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        masters: {
          select: {
            id: true,
            name: true,
            phone: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!service) return res.status(404).json({ error: "Not found" });

    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
}
