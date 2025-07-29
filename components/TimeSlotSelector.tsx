"use client";

import { useState } from "react";
import { format, isSameDay, addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

export default function TimeSlotSelector({
  masterId,
  subtypeId,
  timeSlots,
  bookedSlotIds = [],
  onSelect,
}: {
  masterId: string;
  subtypeId: string;
  timeSlots: TimeSlot[];
  bookedSlotIds?: string[];
  onSelect: (slotId: string, start: string, end: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlotId(slot.id);
    onSelect(slot.id, slot.start, slot.end);
  };


const isSameDate = (d1: Date, d2: Date) =>
  d1.getUTCFullYear() === d2.getUTCFullYear() &&
  d1.getUTCMonth() === d2.getUTCMonth() &&
  d1.getUTCDate() === d2.getUTCDate();

const filtered = timeSlots
  .filter((s) => {
    const slotStart = new Date(s.start); // ISO string з бази (UTC)
    const sameDay = isSameDate(slotStart, selectedDate);

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    const notPast = slotStart.getTime() - localNow.getTime() > 15 * 60 * 1000;
    const notBooked = !bookedSlotIds.includes(s.id);

    return sameDay && notPast && notBooked;
  })
  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div>
      {/* 🔹 Перемикач днів */}
      <div className="flex items-center justify-center mb-4 gap-4">
        <button onClick={() => setSelectedDate((d) => addDays(d, -1))} className="text-lg">◀️</button>
        <div className="font-semibold">{format(selectedDate, "dd.MM.yyyy")}</div>
        <button onClick={() => setSelectedDate((d) => addDays(d, 1))} className="text-lg">▶️</button>
      </div>

      {/* 🔹 Слоти */}
      {filtered.length === 0 ? (
        <div className="text-center text-sm text-gray-500">Немає вільних слотів</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((s) => {
            const isSelected = selectedSlotId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSlotClick(s)}
                className={`px-3 py-1 rounded border text-sm transition ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-400 hover:bg-blue-100"
                }`}
              >
                {formatInTimeZone(s.start, "UTC", "HH:mm")}–{formatInTimeZone(s.end, "UTC", "HH:mm")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
