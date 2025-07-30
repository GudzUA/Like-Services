export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import TaskForm from "@/components/TaskForm";

export default async function TaskFormPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { category?: string };
}) {
  const master = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!master) return notFound();

  const category = searchParams.category ?? "Завдання";

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Майстер: {master.name}</h1>
      <p className="text-gray-600 mb-4">Послуга: {category}</p>
      <TaskForm category={category} masterId={master.id} />
    </div>
  );
}
