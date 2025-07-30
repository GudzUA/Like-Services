export const dynamic = "force-dynamic";
export const dynamicParams = true;

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function TaskMasterListPage({ params }: { params: { id: string } }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/task-services/${params.id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return notFound();

  const { service } = await res.json();

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">{service.name}</h1>
      <p className="mb-4 text-gray-600">Оберіть майстра для цієї послуги:</p>

      {service.masters.length === 0 ? (
        <p className="text-gray-500">Наразі немає майстрів для цієї послуги.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {service.masters.map((master: any) => (
            <Link
              key={master.id}
              href={`/task/master/${master.id}?category=${encodeURIComponent(service.name)}`}
              className="w-[360px] bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border">
                  {master.photoUrl ? (
                    <Image
                      src={master.photoUrl}
                      alt={master.name ?? "Майстер"}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-lg">{master.name}</span>
                  <span className="text-sm text-gray-500">{master.phone}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
