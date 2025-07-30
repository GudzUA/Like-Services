import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({ success: true, services });
  } catch (error: any) {
    console.error("❌ Failed to load services:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
