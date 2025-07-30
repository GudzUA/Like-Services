export const dynamic = "force-dynamic";

import Link from "next/link";

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/services`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="p-6 text-center">
        <p className="text-red-500">Не вдалося завантажити дані.</p>
      </main>
    );
  }

  const services = await res.json();

  // 🔸 Розділяємо на schedule і task
  const scheduleServices = services.filter(
    (s: any) => s.masters[0]?.masterType !== "task"
  );
  const taskServices = services.filter(
    (s: any) => s.masters[0]?.masterType === "task"
  );

  const renderServiceCard = (service: any) => {
    const masterType = service.masters[0]?.masterType || "schedule";
    const href =
      masterType === "task" ? `/task/${service.id}` : `/services/${service.id}`;

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

      {/* 🔷 Блок для послуг з розкладом */}
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
    </main>
  );
}
