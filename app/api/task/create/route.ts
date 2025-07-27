import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, details, price, flexible, name, phone } = body;

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

    return NextResponse.json({ success: true, task: created });
  } catch (error: any) {
    console.error("❌ create-task error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
