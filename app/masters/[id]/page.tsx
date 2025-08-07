"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MasterBookingClient from "@/components/MasterBookingClient";
import { useRouter } from 'next/navigation';

type Subtype = { id: string; name: string; duration: number; price: number };
type TimeSlot = { id: string; start: string; end: string };
type Master = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  subtypes: Subtype[];
};

export default function MasterPage() {
  const params = useParams() as { id?: string };
  const id = params?.id;
  const [master, setMaster] = useState<Master | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const resMaster = await fetch(`/api/masters/${id}`, { cache: "no-store" });
        if (!resMaster.ok) throw new Error("Майстра не знайдено");
        const masterData: Master = await resMaster.json();
        setMaster(masterData);

        const resSlots = await fetch(`/api/masters/${id}/slots`, { cache: "no-store" });
        const slotData: TimeSlot[] = resSlots.ok ? await resSlots.json() : [];
        setTimeSlots(Array.isArray(slotData) ? slotData : []);
      } catch (e) {
        console.error("❌ Помилка при завантаженні майстра:", e);
        setMaster(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (!id || loading) return <div className="p-6 text-center">Завантаження...</div>;
  if (!master) return <div className="p-6 text-center text-red-600">Майстра не знайдено</div>;

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
        <MasterBookingClient masterId={master.id} subtypes={master.subtypes} />
      )}
 <div className="mt-4 flex justify-center">
  <button
    onClick={() => router.back()}
    className="bg-white text-blue-700 border border-blue-700 px-4 py-2 rounded hover:bg-blue-50"
  >
    ← Назад до майстрів
  </button>
</div>
    </div>
  );
}
