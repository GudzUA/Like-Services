// pages/api/drivers/count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const count = await prisma.driver.count();
    return res.status(200).json({ count });
  } catch (e: any) {
    console.error("drivers/count error:", e);
    return res.status(500).json({ message: e.message ?? "Internal Error" });
  }
}
