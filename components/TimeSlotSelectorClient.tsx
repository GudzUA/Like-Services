"use client";

import { useState, useEffect } from "react";
import TimeSlotSelector from "./TimeSlotSelector";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface Booking {
  timeSlotId: string;
}

export default function TimeSlotSelectorClient({
  masterId,
  subtypeId,
}: {
  masterId: string;
  subtypeId: string;
}) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedSlotIds, setBookedSlotIds] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Завантажуємо слоти
    const fetchTimeSlots = async () => {
      const res = await fetch(`/api/timeslots?masterId=${masterId}&subtypeId=${subtypeId}`);
      const data = await res.json();
      setTimeSlots(data.slots);
    };

    // ✅ Завантажуємо заброньовані
    const fetchBookings = async () => {
      const res = await fetch(`/api/bookings/booked?masterId=${masterId}`);
      const data: Booking[] = await res.json();
      setBookedSlotIds(data.map((b) => b.timeSlotId));
    };

    fetchTimeSlots();
    fetchBookings();
  }, [masterId, subtypeId]);

  return (
    <div>
      <TimeSlotSelector
  masterId={masterId}
  subtypeId={subtypeId}
  timeSlots={timeSlots}
  bookedSlotIds={bookedSlotIds}
  onSelect={(slotId, start, end) => {
    setSelectedSlot(slotId);
    setSelectedStart(start);
    setSelectedEnd(end);
  }}
/>


      {selectedSlot && (
        <div className="mt-4 p-3 border border-green-500 rounded text-sm">
          Обрано слот: <strong>{selectedStart} – {selectedEnd}</strong>
        </div>
      )}
    </div>
  );
}
