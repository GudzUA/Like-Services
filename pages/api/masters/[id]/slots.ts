/// pages/api/masters/[id]/slots.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type SlotInput = { start: string; end: string };

// Парсимо "YYYY-MM-DDTHH:mm" / "...:ss" / з або без "Z" як UTC-час без локального зсуву
function toUTCDate(s: string): Date {
  if (!s || typeof s !== "string") throw new Error("Invalid date string");
  // додамо секунди, якщо їх немає
  const hasSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z)?$/.test(s);
  const withSec = hasSeconds ? s : `${s}:00`;
  // прибираємо 'Z' для ручного складання UTC
  const [datePart, timePartRaw] = withSec.replace("Z", "").split("T");
  const [Y, M, D] = datePart.split("-").map(Number);
  const [h, m, sec] = timePartRaw.split(":").map(Number);
  // Створюємо дату як UTC (без локального зсуву)
  return new Date(Date.UTC(Y, M - 1, D, h, m, sec || 0));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: "id is required" });

  // ---- GET: майбутні вільні слоти майстра ----
 // ---- GET: усі слоти майстра (без фільтрів) ----
if (req.method === "GET") {
  try {
    const slots = await prisma.timeSlot.findMany({
      where: { masterId: id },                          
      select: { id: true, start: true, end: true },
      orderBy: { start: "asc" },
      take: 500,
    });
    return res.status(200).json(slots);
  } catch (e: any) {
    console.error("get-slots error:", e);
    return res.status(500).json({ error: e.message ?? "Internal Error" });
  }
}


  // ---- POST: додати слоти майстру ----
  if (req.method === "POST") {
    try {
      const body = req.body as { slots: SlotInput[] };
      if (!Array.isArray(body?.slots) || body.slots.length === 0) {
        return res.status(400).json({ success: false, message: "slots[] is required" });
      }

      // перевіряємо існування майстра
      const master = await prisma.user.findUnique({ where: { id }, select: { id: true } });
      if (!master) return res.status(404).json({ success: false, message: "Master not found" });

      // конвертуємо у UTC-дату 1:1 за введеними годинами/хвилинами
      const data = body.slots
        .map((s) => {
          const start = toUTCDate(s.start);
          const end = toUTCDate(s.end);
          return start < end ? { start, end } : null;
        })
        .filter((v): v is { start: Date; end: Date } => !!v);

      if (data.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid slots" });
      }

      const result = await prisma.timeSlot.createMany({
        data: data.map((d) => ({ ...d, masterId: id })),
        skipDuplicates: true, // працює краще з @@unique([masterId, start, end]) у моделі
      });

      return res.status(200).json({ success: true, created: result.count });
    } catch (e: any) {
      console.error("add-slots error:", e);
      return res.status(500).json({ success: false, message: e.message ?? "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}

