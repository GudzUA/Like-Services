import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    console.error("❌ Failed to load services:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
