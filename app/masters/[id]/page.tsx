export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import MasterBookingClient from "@/components/MasterBookingClient";
import { notFound } from "next/navigation";

export default async function MasterPage({ params }: { params: { id: string } }) {
  try {
    const master = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        subtypes: true,
      },
    });

    if (!master) return notFound();

    const subtypes = master.subtypes ?? [];

    return (
      <div className="p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">Майстер: {master.name ?? "—"}</h1>
        <p className="text-sm text-gray-600 mb-1">📞 {master.phone ?? "—"}</p>
        <p className="text-sm text-gray-600 mb-1">📧 {master.email ?? "—"}</p>
        <p className="text-sm text-gray-600 mb-6">📍 {master.address ?? "—"}</p>

        <h2 className="text-xl font-semibold mb-4">Підтипи послуг</h2>

        {subtypes.length === 0 ? (
          <p>Немає підтипів</p>
        ) : (
          {/*
<MasterBookingClient
  masterId={master.id}
  subtypes={subtypes.map((subtype) => ({
    id: subtype.id,
    name: subtype.name,
    duration: subtype.duration,
    price: subtype.price,
  }))}
/>
*/}

        )}
      </div>
    );
  } catch (err: any) {
    console.error("❌ Помилка генерації сторінки майстра:", err);
    return (
      <div className="p-4 text-red-600">
        ❌ Помилка генерації сторінки майстра:
        <pre className="text-xs whitespace-pre-wrap">{err.message}</pre>
      </div>
    );
  }
}
