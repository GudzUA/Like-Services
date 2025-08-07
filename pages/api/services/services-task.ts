// pages/api/services/services-task.ts

import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const taskServices = await prisma.service.findMany({
      where: { type: "task" },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(taskServices);
  } catch (error) {
    console.error("Error loading task services:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

