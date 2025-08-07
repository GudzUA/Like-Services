"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

interface TimeSlot {
  id: string;
  start: string; // ISO (UTC)
  end: string;   // ISO (UTC)
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

  // ---- UTC "now" (оновлюємо кожні 15с, щоб слоти зникали/з’являлись автоматично)
  const [nowUtcMs, setNowUtcMs] = useState(
    Date.now() - new Date().getTimezoneOffset() * 60000
  );
  useEffect(() => {
    const id = setInterval(
      () => setNowUtcMs(Date.now() - new Date().getTimezoneOffset() * 60000),
      15000
    );
    return () => clearInterval(id);
  }, []);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlotId(slot.id);
    onSelect(slot.id, slot.start, slot.end);
  };

  // Порівняння календарної дати в UTC
  const isSameDate = (d1: Date, d2: Date) =>
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();

  const LEAD_MS = 20 * 60 * 1000; // 20 хв

  const filtered = timeSlots
    .filter((s) => {
      const slotStart = new Date(s.start); // UTC
      const sameDay = isSameDate(slotStart, selectedDate);
      const enoughLead = slotStart.getTime() - nowUtcMs > LEAD_MS; // порівнюємо в UTC
      const notBooked = !bookedSlotIds.includes(s.id);
      return sameDay && enoughLead && notBooked;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div>
      {/* 🔹 Перемикач днів */}
      <div className="flex items-center justify-center mb-4 gap-4">
        <button onClick={() => setSelectedDate((d) => addDays(d, -1))} className="text-lg">
          ◀️
        </button>
        <div className="font-semibold">{format(selectedDate, "dd.MM.yyyy")}</div>
        <button onClick={() => setSelectedDate((d) => addDays(d, 1))} className="text-lg">
          ▶️
        </button>
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
                {formatInTimeZone(s.start, "UTC", "HH:mm")}–
                {formatInTimeZone(s.end, "UTC", "HH:mm")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
