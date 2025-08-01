"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import TaskForm from "@/components/TaskForm";

type Master = {
  id: string;
  name?: string;
};

export default function TaskFormPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);

  const category = searchParams?.get("category") ?? "Завдання";

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchMaster = async () => {
      try {
        const res = await fetch(`/api/masters/${id}`);
        if (!res.ok) {
          setMaster(null);
        } else {
          const data = await res.json();
          setMaster(data);
        }
      } catch (err) {
        console.error("Помилка завантаження майстра:", err);
        setMaster(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMaster();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Завантаження...</div>;
  if (!master) return <div className="p-6 text-center">Майстра не знайдено</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Майстер: {master.name}</h1>
      <p className="text-gray-600 mb-4">Послуга: {category}</p>
      <TaskForm category={category} masterId={master.id} />
    </div>
  );
}
