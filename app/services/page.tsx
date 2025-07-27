export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ServicesPage() {
  const taskServices = await prisma.service.findMany({
    where: { type: "task" },
    orderBy: { name: "asc" },
  });

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Наші послуги</h1>

      <div className="flex flex-col gap-4">
        {taskServices.map((service) => (
          <Link
            key={service.id}
            href={
              service.name === "Services"
                ? "/task"
                : `/task/${service.id}`
            }
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
