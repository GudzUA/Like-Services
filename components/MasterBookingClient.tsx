"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import TimeSlotSelector from "./TimeSlotSelector";

interface Subtype {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface SlotMap {
  [id: string]: { start: string; end: string };
}

type Slot = { id: string; start: string; end: string };

export default function MasterBookingClient({
  masterId,
  subtypes,
}: {
  masterId: string;
  subtypes: Subtype[];
}) {
  const router = useRouter();

  const [selectedSubtype, setSelectedSubtype] = useState<Subtype | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotTimes, setSlotTimes] = useState<SlotMap>({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const [bookedSlotIds, setBookedSlotIds] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // завантажити вже заброньовані слоти майстра
  useEffect(() => {
    if (!masterId) return;
    (async () => {
      try {
        const res = await fetch(`/api/bookings/booked?masterId=${masterId}`, { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data)) setBookedSlotIds(data.map((x: any) => x.slotId));
      } catch (err) {
        console.error("❌ Error loading booked slots", err);
      }
    })();
  }, [masterId]);

  // ПІСЛЯ вибору підтипу — тягнемо доступні слоти
  useEffect(() => {
    if (!masterId || !selectedSubtype?.id) {
      setAvailableSlots([]);
      return;
    }
    (async () => {
      try {
        setLoadingSlots(true);
        const res = await fetch("/api/slots/available", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ masterId, subtypeId: selectedSubtype.id }),
        });
        const data = await res.json();
        setAvailableSlots(Array.isArray(data?.slots) ? data.slots : []);
      } catch (e) {
        console.error("fetch /api/slots/available error", e);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [masterId, selectedSubtype?.id]);

  const handleSlotSelect = (slotId: string, start: string, end: string) => {
    setSelectedSlot(slotId);
    setSlotTimes((prev) => ({ ...prev, [slotId]: { start, end } }));
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        slotId: selectedSlot,
        subtypeId: selectedSubtype?.id,
        masterId,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setShowModal(false);
      setShowForm(false);
      setFormData({ name: "", phone: "" });
      setTimeout(() => router.push("/"), 2000);
    } else {
      alert("❌ Помилка при створенні запису");
    }
  };

  const selectedTime =
    selectedSlot && slotTimes[selectedSlot]
      ? {
          date: format(new Date(slotTimes[selectedSlot].start), "dd.MM.yyyy"),
          time:
            format(new Date(slotTimes[selectedSlot].start), "HH:mm") +
            "–" +
            format(new Date(slotTimes[selectedSlot].end), "HH:mm"),
        }
      : null;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Підтипи */}
      <div className="flex flex-col gap-3 mb-6">
        {subtypes.map((subtype) => (
          <button
            key={subtype.id}
            onClick={() => {
              setSelectedSubtype(subtype);
              setSelectedSlot(null);
              setShowForm(false);
              setSuccess(false);
            }}
            className={`w-full flex justify-between items-center px-4 py-3 border rounded-lg shadow-sm transition text-sm sm:text-base ${
              selectedSubtype?.id === subtype.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-blue-50"
            }`}
          >
            <span className="font-medium">{subtype.name}</span>
            <span className="flex items-center gap-4">
              <span>💰 {subtype.price} CAD</span>
              <span>⏱ {subtype.duration} хв</span>
            </span>
          </button>
        ))}
      </div>

      {/* Обраний підтип + слоти */}
      {selectedSubtype && (
        <div className="border bg-white p-4 rounded shadow">
          <p className="font-medium mb-3 text-center">
            🔹 Обрано: <b>{selectedSubtype.name}</b> — 💲{selectedSubtype.price} — ⏱ {selectedSubtype.duration} хв
          </p>

          {loadingSlots ? (
            <div className="text-center py-3">Завантаження слотів…</div>
          ) : (
            <TimeSlotSelector
              masterId={masterId}
              subtypeId={selectedSubtype.id}
              timeSlots={availableSlots}               // ← слоти з /api/slots/available
              bookedSlotIds={bookedSlotIds}
              onSelect={(slotId, start, end) => handleSlotSelect(slotId, start, end)}
            />
          )}
        </div>
      )}

      {/* Форма запису */}
      {showForm && selectedSlot && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-bold mb-3 text-center">📋 Форма запису</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowModal(true);
            }}
          >
            <input
              name="name"
              type="text"
              placeholder="Ваше ім'я"
              className="border p-2 rounded w-full mb-2"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              name="phone"
              type="tel"
              placeholder="Телефон"
              className="border p-2 rounded w-full mb-2"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Підтвердити запис
            </button>
          </form>
        </div>
      )}

      {/* Успіх */}
      {success && (
        <div className="mt-6 text-green-600 font-semibold text-center text-lg">
          ✅ Ви успішно записались! Перенаправляємо...
        </div>
      )}

      {/* Модальне підтвердження */}
      {showModal && selectedTime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Підтвердити запис?</h2>
            <p>👤 <b>{formData.name}</b></p>
            <p>📞 <b>{formData.phone}</b></p>
            <p>📅 <b>{selectedTime.date}</b></p>
            <p>🕒 <b>{selectedTime.time}</b></p>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1 bg-gray-300 rounded">
                Скасувати
              </button>
              <button onClick={handleSubmit} className="px-3 py-1 bg-blue-600 text-white rounded">
                Так, записати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
