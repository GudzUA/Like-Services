import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const serviceId = (req.query.serviceId as string) || undefined;

    const where: any = {};
    if (serviceId) where.services = { some: { id: serviceId } };
    // Якщо потрібно лише майстрів з розкладом:
    // where.masterType = "schedule";

    const masters = await prisma.user.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(masters);
  } catch (e: any) {
    console.error("masters list error:", e);
    return res.status(500).json({ error: e.message ?? "Internal Error" });
  }
}
