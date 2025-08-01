import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const services = await prisma.service.findMany({
      include: {
        masters: {
          select: { masterType: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: "Не вдалося отримати список сервісів" });
  }
}

