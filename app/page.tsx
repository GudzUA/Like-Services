"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  masters: { masterType: "schedule" | "task" }[];
};

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error("Помилка завантаження сервісів", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const scheduleServices = services.filter((s) => s.masters[0]?.masterType !== "task");
  const taskServices = services.filter((s) => s.masters[0]?.masterType === "task");

  if (loading) return <div className="p-6 text-center">Завантаження...</div>;

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Наші послуги</h1>

      {scheduleServices.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-4 mb-2 text-center">
            💇‍♀️ Краса та сервіси
          </h2>
          <div className="flex flex-col gap-4">
            {scheduleServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="w-80 bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all px-6 py-4 text-gray-800 hover:bg-gray-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🛠</span>
                  <span className="text-xl font-medium">{service.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {taskServices.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-8 mb-2 text-center">🔧 Одноразові завдання</h2>
          <div className="flex flex-col gap-4">
            {taskServices.map((service) => (
              <Link
                key={service.id}
                href={`/task/${service.id}`}
                className="w-80 bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all px-6 py-4 text-gray-800 hover:bg-gray-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🔨</span>
                  <span className="text-xl font-medium">{service.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
