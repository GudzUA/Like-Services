"use client";

import TaskForm from "@/components/TaskForm";
import { useSearchParams } from "next/navigation";

export default function TaskFormPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const category = (searchParams && searchParams.get("category")) || "Завдання";

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Запит до майстра</h1>
      <TaskForm category={category} masterId={params.id} />
    </div>
  );
}
