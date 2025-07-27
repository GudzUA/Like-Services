// pages/api/task/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { category, details, price, flexible, name, phone } = req.body;

    const created = await prisma.task.create({
      data: {
        category,
        details,
        price: flexible ? null : price,
        flexible,
        name,
        phone,
      },
    });

    // 🔔 Повідомлення в Telegram (опціонально)
    // await sendToTelegram(`🧰 Нове завдання: ${category} — ${details}`);

    return res.status(200).json({ success: true, task: created });
  } catch (error: any) {
    console.error("❌ create-task error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
