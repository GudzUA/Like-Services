// pages/api/services.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // уніфікуй шлях

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.setHeader("Cache-Control", "no-store");

    const services = await prisma.service.findMany({
      // Якщо у HomePage ти фільтруєш по masterType, можна лишити include:
      include: {
        masters: {
          select: { masterType: true },
          // take: 1, // прибери, якщо не потрібно
        },
      },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(services); // віддаємо масив
  } catch (err) {
    console.error("GET /api/services error:", err);
    return res.status(500).json({ error: "Не вдалося отримати список сервісів" });
  }
}

