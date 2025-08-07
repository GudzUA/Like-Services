import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const master = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        masterType: true,
        subtypes: { select: { id: true, name: true, duration: true, price: true }, orderBy: { name: "asc" } },
      },
    });

    if (!master) return res.status(404).json({ error: "Master not found" });
    return res.status(200).json(master);
  } catch (e: any) {
    console.error("master details error:", e);
    return res.status(500).json({ error: e.message ?? "Internal Error" });
  }
}
