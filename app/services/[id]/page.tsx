"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';

type Master = {
  id: string;
  name?: string;
  phone?: string;
  photoUrl?: string;
};

type Service = {
  id: string;
  name: string;
  masters: Master[];
};

export default function ServiceMastersPage() {
  const { id } = useParams() as { id: string };
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) {
          setService(null);
          return;
        }
        const data = await res.json();
        setService(data);
      } catch (err) {
        console.error("Помилка при завантаженні послуги:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) return <main className="p-6 text-center">Завантаження...</main>;
  if (!service) {
    return (
      <main className="p-6 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-4">Послугу не знайдено</h1>
        <p>Можливо, її ще не додано або вона була видалена.</p>
      </main>
    );
  }

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Майстри для послуги: {service.name}</h1>

      {service.masters.length === 0 ? (
        <p className="text-gray-500">Немає майстрів для цієї послуги</p>
      ) : (
        <div className="flex flex-col gap-4">
          {service.masters.map((master) => (
            <Link
              key={master.id}
              href={`/masters/${master.id}`}
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">👤</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-lg">{master.name}</span>
                  <span className="text-sm text-gray-500">{master.phone}</span>
                </div>
              </div>
            </Link>
          ))}
 <div className="mt-4 flex justify-center">
  <button
    onClick={() => router.back()}
    className="bg-white text-blue-700 border border-blue-700 px-4 py-2 rounded hover:bg-blue-50"
  >
    ← Назад
  </button>
</div>
        </div>
      )}
    </main>
  );
}
