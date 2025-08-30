// pages/api/drivers/apply.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const {
      name,
      phone,             // string, бажано уніфікувати: +14375551234
      telegram,          // @username або числовий chat id
      carMake,
      carModel,
      year,              // number
      color,
      employmentType,    // "full_time" | "part_time"
      worksIn,           // "taxi" | "delivery" | "both"
      agreeRules,        // boolean
      agreeVoting,       // boolean
      agreeActions       // boolean
    } = req.body || {};

    if (!name || (!phone && !telegram)) {
      return res.status(400).json({ error: "Name і хоча б phone або telegram обовʼязкові" });
    }

    // нормалізуємо телефон (простенько)
    const normPhone = typeof phone === "string" ? phone.replace(/\s+/g, "") : null;

    // вибираємо унікальний ключ для upsert
    const where =
      normPhone
        ? { phone: normPhone }
        : { telegram: telegram as string };

    const dataCommon = {
      name,
      phone: normPhone,
      telegram: telegram || null,
      carMake: carMake || null,
      carModel: carModel || null,
      year: year ? Number(year) : null,
      color: color || null,
      employmentType: employmentType || "part_time",
      worksIn: worksIn || "both",
      agreeRules: !!agreeRules,
      agreeVoting: !!agreeVoting,
      agreeActions: !!agreeActions,
    };

    // якщо немає запису з таким phone/telegram — створюємо; інакше оновлюємо поля
    const driver = await prisma.driver.upsert({
      where,
      create: dataCommon,
      update: dataCommon,
    });

    return res.status(200).json({ ok: true, driver });
  } catch (e: any) {
    console.error("driver apply error:", e);
    return res.status(500).json({ error: e.message ?? "Internal Error" });
  }
}
