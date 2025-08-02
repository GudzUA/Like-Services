import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [dbName] = await prisma.$queryRaw<Array<{ db: string | null }>>`SELECT DATABASE() AS db`;
    const [services, users, subtypes, slots] = await Promise.all([
      prisma.service.findMany({ include: { masters: true }, take: 5 }),
      prisma.user.count(),
      prisma.subtype.count(),
      prisma.timeSlot.count(),
    ]);
    res.status(200).json({
      database: dbName?.db,
      counts: {
        services: await prisma.service.count(),
        users, subtypes, timeSlots: slots,
      },
      sampleServices: services.map(s => ({
        id: s.id, name: s.name, type: s.type, masters: s.masters.length
      })),
      // корисно побачити, який саме URL підхопився на рантаймі (без пароля)
      env: {
        DB_HOST: process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] ?? null,
      }
    });
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
}

