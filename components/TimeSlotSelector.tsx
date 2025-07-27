"use client";

import { useEffect, useState } from "react";
import { format, isSameDay, addDays } from "date-fns";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

export default function TimeSlotSelector({
  masterId,
  subtypeId,
  onSelect,
}: {
  masterId: string;
  subtypeId: string;
  onSelect: (slotId: string, start: string, end: string) => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/slots/available", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId, subtypeId }),
      });
      const data = await res.json();
      setSlots(data.slots);
    };
    load();
  }, [masterId, subtypeId]);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlotId(slot.id);
    onSelect(slot.id, slot.start, slot.end);
  };

  const filtered = slots.filter((s) => {
    const localSlotDate = new Date(
      new Date(s.start).toLocaleString("en-US", { timeZone: "America/Toronto" })
    );
    const localSelectedDate = new Date(
      selectedDate.toLocaleString("en-US", { timeZone: "America/Toronto" })
    );
    return isSameDay(localSlotDate, localSelectedDate);
  });

  return (
    <div>
      <div className="flex items-center justify-center mb-2 gap-4">
        <button
          onClick={() => setSelectedDate((d) => addDays(d, -1))}
          className="text-lg"
        >
          ◀️
        </button>
        <div className="font-semibold">{format(selectedDate, "dd.MM.yyyy")}</div>
        <button
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          className="text-lg"
        >
          ▶️
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {filtered.length === 0 && <div>Немає вільних слотів</div>}
        {filtered.map((s) => {
          const isSelected = selectedSlotId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleSlotClick(s)}
              className={`px-3 py-1 rounded border transition
                ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border-gray-400 hover:bg-blue-100"}
              `}
            >
              {format(new Date(s.start), "HH:mm")}–{format(new Date(s.end), "HH:mm")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
