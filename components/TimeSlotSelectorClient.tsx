"use client";

import { useState } from "react";
import TimeSlotSelector from "./TimeSlotSelector";

export default function TimeSlotSelectorClient({
  masterId,
  subtypeId,
}: {
  masterId: string;
  subtypeId: string;
}) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <div>
      <TimeSlotSelector
        masterId={masterId}
        subtypeId={subtypeId}
        onSelect={(slotId) => {
          setSelectedSlot(slotId);
          console.log("Обрано слот:", slotId);
          // можеш відкривати тут форму або щось показувати
        }}
      />

      {selectedSlot && (
        <div className="mt-4 p-3 border border-green-500 rounded">
          Обрано слот: {selectedSlot}
        </div>
      )}
    </div>
  );
}
