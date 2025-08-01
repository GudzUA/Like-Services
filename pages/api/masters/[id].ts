// /pages/api/masters/[id].ts

import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid ID" });

  try {
    const master = await prisma.user.findUnique({
      where: { id },
      include: { subtypes: true },
    });

    if (!master) return res.status(404).json({ error: "Not found" });

    res.status(200).json(master);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
}
