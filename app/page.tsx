export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function HomePage() {
  let services = [];

  try {
    services = await prisma.service.findMany({
      include: {
        masters: {
          select: { masterType: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("❌ Помилка отримання послуг:", error);
    return (
      <main className="p-6 text-red-600 text-center">
        <h1 className="text-2xl font-bold mb-4">Помилка завантаження</h1>
        <p>{(error as Error).message}</p>
      </main>
    );
  }

  if (!services || services.length === 0) {
    return (
      <main className="p-6 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-4">Послуги ще не додано</h1>
        <p>Модератор скоро додасть доступні послуги.</p>
      </main>
    );
  }

  const scheduleServices = services.filter(
    (s) =>
      s.masters &&
      s.masters.length > 0 &&
      s.masters[0].masterType !== "task"
  );

  const taskServices = services.filter(
    (s) =>
      s.masters &&
      s.masters.length > 0 &&
      s.masters[0].masterType === "task"
  );

  const renderServiceCard = (service: any) => {
    const masterType = service.masters[0]?.masterType || "schedule";
    const href =
      masterType === "task"
        ? `/task/${service.id}`
        : `/services/${service.id}`;

    return (
      <Link
        key={service.id}
        href={href}
        className="w-80 bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all px-6 py-4 text-gray-800 hover:bg-gray-100"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">🛠</span>
          <span className="text-xl font-medium">{service.name}</span>
        </div>
      </Link>
    );
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Наші послуги</h1>

      {scheduleServices.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-4 mb-2 text-center">
            💇‍♀️ Краса та сервіси
          </h2>
          <div className="flex flex-col gap-4">
            {scheduleServices.map(renderServiceCard)}
          </div>
        </>
      )}

      {taskServices.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-8 mb-2 text-center">
            👨‍🔧 Чоловік на годину
          </h2>
          <div className="flex flex-col gap-4">
            {taskServices.map(renderServiceCard)}
          </div>
        </>
      )}
    </main>
  );
}
