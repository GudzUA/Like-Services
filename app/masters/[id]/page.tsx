import { prisma } from "@/lib/prisma";
import MasterBookingClient from "@/components/MasterBookingClient";

export default async function MasterPage({ params }: { params: { id: string } }) {
  const master = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subtypes: true,
    },
  });

  if (!master) return <div className="p-4">❌ Майстра не знайдено</div>;

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">Майстер: {master.name}</h1>
      <p className="text-sm text-gray-600 mb-1">📞 {master.phone}</p>
      <p className="text-sm text-gray-600 mb-1">📧 {master.email}</p>
      <p className="text-sm text-gray-600 mb-6">📍 {master.address}</p>

      <h2 className="text-xl font-semibold mb-4">Підтипи послуг</h2>
      {master.subtypes.length === 0 && <p>Немає підтипів</p>}

      <MasterBookingClient
        masterId={master.id}
        subtypes={master.subtypes.map(subtype => ({
          id: subtype.id,
          name: subtype.name,
          duration: subtype.duration,
          price: subtype.price,
        }))}
      />
    </div>
  );
}
