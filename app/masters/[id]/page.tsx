export const dynamic = "force-dynamic";
export const dynamicParams = true;

// ⛔️ тимчасово не імпортуємо prisma
// import { prisma } from "@/lib/prisma";
import MasterBookingClient from "@/components/MasterBookingClient";
// import { notFound } from "next/navigation";

export default async function MasterPage({ params }: { params: { id: string } }) {
  // ⛔️ Замість запиту до БД — мокові дані
  const master = {
    id: params.id,
    name: "Тест Майстер",
    phone: "123456",
    email: "test@example.com",
    address: "Тестова адреса",
    subtypes: [
      {
        id: "subtype1",
        name: "Стрижка",
        duration: 30,
        price: 25,
      },
    ],
  };

  const subtypes = master.subtypes;

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
        <MasterBookingClient
          masterId={master.id}
          subtypes={subtypes.map((subtype) => ({
            id: subtype.id,
            name: subtype.name,
            duration: subtype.duration,
            price: subtype.price,
          }))}
        />
      )}
    </div>
  );
}
