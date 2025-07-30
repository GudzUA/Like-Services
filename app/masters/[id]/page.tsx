export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import MasterBookingClient from "@/components/MasterBookingClient";
import { notFound } from "next/navigation";

export default async function MasterPage({ params }: { params: { id: string } }) {
  // Отримуємо майстра напряму з БД
  const master = await prisma.user.findFirst({
    where: { id: params.id },
    include: { subtypes: true },
  });

  if (!master) return notFound();

  // Отримуємо слоти напряму з БД
  const timeSlots = await prisma.timeSlot.findMany({
    where: { masterId: params.id },
  });

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">Майстер: {master.name ?? "—"}</h1>
      <p className="text-sm text-gray-600 mb-1">📞 {master.phone ?? "—"}</p>
      <p className="text-sm text-gray-600 mb-1">📧 {master.email ?? "—"}</p>
      <p className="text-sm text-gray-600 mb-6">📍 {master.address ?? "—"}</p>

      <h2 className="text-xl font-semibold mb-4">Підтипи послуг</h2>

      {!master.subtypes || master.subtypes.length === 0 ? (
        <p>Немає підтипів</p>
      ) : (
        <MasterBookingClient
          masterId={master.id}
          subtypes={master.subtypes.map((subtype) => ({
            id: subtype.id,
            name: subtype.name,
            duration: subtype.duration,
            price: subtype.price,
          }))}
          timeSlots={timeSlots.map((slot) => ({
            id: slot.id,
            start: slot.start.toISOString(),
            end: slot.end.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
