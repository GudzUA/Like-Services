import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { service, master, subtypes, timeSlots, masterType, photoUrl } = body;

    // 🔍 Визначення існуючої або нової послуги
    let existingService = null;

    if (service.id) {
      existingService = await prisma.service.findUnique({
        where: { id: service.id },
      });
    } else {
      existingService = await prisma.service.findFirst({
        where: { name: service.name },
      });

      if (!existingService) {
      existingService = await prisma.service.create({
      data: { name: service.name, type: service.type },
      });
      }
    }

// 🔍 Перевірка чи такий користувач вже існує
let createdMaster = await prisma.user.findUnique({
  where: { email: master.email }, // або phone: master.phone — залежно від твоєї логіки
});

// 🔹 Якщо не існує — створити нового
if (!createdMaster) {
  createdMaster = await prisma.user.create({
    data: {
      name: master.name,
      email: master.email,
      phone: master.phone,
      address: master.address,
      type: "admin",
      masterType,
      photoUrl,
      services: {
        connect: { id: existingService.id },
      },
    },
  });
} else {
  // Якщо існує — привʼязати до послуги, якщо ще не привʼязаний
  await prisma.user.update({
  where: { id: createdMaster.id },
  data: {
    masterType, // 🆕
    services: {
      connect: { id: existingService.id },
    },
  },
});
}

   // 🔹 Створення підтипів
const createdSubtypes = await Promise.all(
  subtypes.map((subtype: any) =>
    prisma.subtype.create({
      data: {
        name: subtype.name,
        duration: subtype.duration,
        price: subtype.price,
        serviceId: existingService!.id,
        masterId: createdMaster.id, // 🆕 Прив’язка до майстра
      },
    })
  )
);


    // 🔹 Створення таймслотів
    const createdTimeSlots = await Promise.all(
      timeSlots.map((slot: any) =>
        prisma.timeSlot.create({
          data: {
            start: new Date(slot.start + ":00"),
            end: new Date(slot.end + ":00"),
            masterId: createdMaster.id,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      service: existingService,
      master: createdMaster,
      subtypes: createdSubtypes,
      timeSlots: createdTimeSlots,
    });
  } catch (error: any) {
    console.error("❌ create-all error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
