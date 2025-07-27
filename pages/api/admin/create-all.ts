import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { Service } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { service, master, subtypes, timeSlots, masterType, photoUrl } = req.body;

let existingService: Service | null = null;

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

if (!existingService) {
  return res.status(500).json({ success: false, message: "Service is null after creation." });
}

    let createdMaster = await prisma.user.findUnique({
      where: { email: master.email },
    });

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
      await prisma.user.update({
        where: { id: createdMaster.id },
        data: {
          masterType,
          services: {
            connect: { id: existingService.id },
          },
        },
      });
    }

    const createdSubtypes = await Promise.all(
      subtypes.map((subtype: any) =>
        prisma.subtype.create({
          data: {
            name: subtype.name,
            duration: subtype.duration,
            price: subtype.price,
            serviceId: existingService!.id,
            masterId: createdMaster.id,
          },
        })
      )
    );

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

    return res.status(200).json({
      success: true,
      service: existingService,
      master: createdMaster,
      subtypes: createdSubtypes,
      timeSlots: createdTimeSlots,
    });
  } catch (error: any) {
    console.error("❌ create-all error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
