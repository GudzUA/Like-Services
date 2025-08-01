import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const taskServices = await prisma.service.findMany({
    where: { type: "task" },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(taskServices);
}
