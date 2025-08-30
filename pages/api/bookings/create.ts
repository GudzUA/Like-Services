// pages/api/bookings/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendTgMessage } from "@/lib/telegram";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { name, phone, slotId, subtypeId, masterId } = req.body;

    // 1. Знайти або створити користувача
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        name,
        email: `guest_${phone}@poslugy.local`,
        type: "guest",
        isMaster: false,
      },
    });

    // 2. Створити бронювання
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        subtypeId,
        timeSlotId: slotId,
      },
    });

// ... після prisma.booking.create(...)
const slot = await prisma.timeSlot.findUnique({ where: { id: slotId } });
const subtypeRow = subtypeId ? await prisma.subtype.findUnique({ where: { id: subtypeId } }) : null;

// знайдемо майстра через слот
const master = slot?.masterId
  ? await prisma.user.findUnique({ where: { id: slot.masterId } })
  : null;

if (master?.telegramChatId) {
  const startStr = slot?.start ? new Date(slot.start).toLocaleString() : "";
  const endStr   = slot?.end   ? new Date(slot.end).toLocaleString()   : "";

  await sendTgMessage(
    master.telegramChatId,
    [
      "🆕 <b>Нове бронювання</b>",
      `👤 Ім’я: <b>${name}</b>`,
      `📞 Телефон: <b>${phone}</b>`,
      subtypeRow ? `🧾 Підтип: <b>${subtypeRow.name}</b>` : null,
      slot ? `🗓 Час: <b>${startStr}</b> – <b>${endStr}</b>` : null,
      `🆔 Бронювання: <code>${booking.id}</code>`,
    ].filter(Boolean).join("\n")
  );
}

    return res.status(200).json({ success: true, booking });
  } catch (error: any) {
    console.error("❌ Booking creation error:", error);
    return res.status(500).json({ success: false, error: error.message || "Booking creation failed" });
  }
}
