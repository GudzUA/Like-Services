import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: { masters: true },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (err) {
    console.error("❌ /api/services/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
