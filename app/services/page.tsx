"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  type: string;
}

export default function ServicesPage() {
  const [taskServices, setTaskServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services-task")
      .then((res) => res.json())
      .then((data) => {
        setTaskServices(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6 text-center">Завантаження...</p>;

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Наші послуги</h1>

      <div className="flex flex-col gap-4">
        {taskServices.map((service) => (
          <Link
            key={service.id}
            href={service.name === "Services" ? "/task" : `/api/services/services-task`}
            className="w-80 bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all px-6 py-4 text-gray-800 hover:bg-gray-100"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🛠</span>
              <span className="text-xl font-medium">{service.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
