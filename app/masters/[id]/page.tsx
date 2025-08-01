"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MasterBookingClient from "@/components/MasterBookingClient";

type Subtype = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

type TimeSlot = {
  id: string;
  start: string;
  end: string;
};

type Master = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  subtypes: Subtype[];
};

export default function MasterPage() {
  const { id } = useParams() as { id: string };
  const [master, setMaster] = useState<Master | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const resMaster = await fetch(`/api/masters/${id}`);
        if (!resMaster.ok) {
          setMaster(null);
          setLoading(false);
          return;
        }
        const masterData = await resMaster.json();
        setMaster(masterData);

        const resSlots = await fetch(`/api/masters/${id}/slots`);
        const slotData = await resSlots.json();
        setTimeSlots(slotData);
      } catch (error) {
        console.error("❌ Помилка при завантаженні майстра:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Завантаження...</div>;
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
        <MasterBookingClient
          masterId={master.id}
          subtypes={master.subtypes}
          timeSlots={timeSlots}
        />
      )}
    </div>
  );
}
