import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false });
  if (req.query.secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).json({ ok:false });
  }

  try {
    const update = req.body;
    const msg = update?.message;
    const chatId = msg?.chat?.id?.toString?.();
    const text: string = msg?.text || "";

    // глибока лінка: /start <masterId>
    const startMatch = text.startsWith("/start") ? text.trim().split(" ") : null;
    const payload = startMatch && startMatch.length > 1 ? startMatch[1] : null;

    if (text.startsWith("/start")) {
      if (payload && chatId) {
        // payload = masterId
        await prisma.user.update({
          where: { id: payload },
          data: { telegramChatId: chatId },
        }).catch(() => {}); // якщо не існує, просто ігноруємо

        await reply(chatId, "✅ Телеграм підключено. Ви будете отримувати свої бронювання.");
      } else {
        await reply(chatId!, "Бот підключено. Щоб привʼязати, відкрийте персональне посилання з сайту.");
      }
    } else if (text === "/id" && chatId) {
      await reply(chatId, `Ваш chat_id: <code>${chatId}</code>`);
    }

    return res.status(200).json({ ok:true });
  } catch (e:any) {
    console.error("telegram webhook error:", e);
    return res.status(200).json({ ok:true });
  }
}

async function reply(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

