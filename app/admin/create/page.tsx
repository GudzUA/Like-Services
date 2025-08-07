"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceLite = { id: string; name: string };
type MasterType = "schedule" | "task";
type Subtype = { name: string; duration: number; price: number };
type TimeSlot = { start: string; end: string };

export default function AdminCreatePage() {
  // UI / network states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ❶ СТАН ДЛЯ МАЙСТРІВ — у тебе вже є:
  const [masters, setMasters] = useState<{ id: string; name: string }[]>([]);
  const [mastersLoading, setMastersLoading] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState("");

  // Services list
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Form state
  const [masterType, setMasterType] = useState<MasterType>("schedule");

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceName, setServiceName] = useState("");

  const [master, setMaster] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [subtypes, setSubtypes] = useState<Subtype[]>([
    { name: "", duration: 30, price: 0 },
  ]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { start: "", end: "" },
  ]);

  // Fetch services
  useEffect(() => {
    const load = async () => {
      try {
        setServicesLoading(true);
        const res = await fetch("/api/services", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ServiceLite[] = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("Помилка завантаження сервісів:", e);
        setErrorMsg("Не вдалось завантажити список послуг.");
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    load();
  }, []);

  // Підтягувати майстрів при виборі послуги — у тебе вже є:
  useEffect(() => {
    if (!selectedServiceId) {
      setMasters([]);
      setSelectedMasterId("");
      return;
    }
    (async () => {
      try {
        setMastersLoading(true);
        const res = await fetch(`/api/masters?serviceId=${selectedServiceId}`, { cache: "no-store" });
        const data = await res.json();
        setMasters(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Помилка завантаження майстрів:", e);
        setMasters([]);
      } finally {
        setMastersLoading(false);
      }
    })();
  }, [selectedServiceId]);

  // Derived flags
  const canSubmit = useMemo(() => {
    const hasService = !!selectedServiceId || serviceName.trim().length > 0;
    const hasMasterName = master.name.trim().length > 0;
    const hasScheduleData =
      masterType === "task" ||
      (subtypes.length > 0 &&
        subtypes.every((s) => s.name.trim() && s.duration > 0 && s.price >= 0));
    return hasService && hasMasterName && hasScheduleData && !loading;
  }, [selectedServiceId, serviceName, master, subtypes, masterType, loading]);

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      console.warn("Відсутній NEXT_PUBLIC_IMGBB_API_KEY – пропускаю завантаження фото.");
      return null;
    }
    const formData = new FormData();
    formData.append("image", photoFile);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data?.success) {
      console.error("Помилка завантаження фото imgbb:", data);
      throw new Error("Не вдалося завантажити фото");
    }
    return data.data?.url ?? null;
  };

  // ➋ ДОДАЙ ОБРОБНИК ДЛЯ ДОДАВАННЯ СЛОТІВ ІСНУЮЧОМУ МАЙСТРУ — РЯДОМ ІЗ handleSubmit (вище або нижче, неважливо)
  const handleAddSlotsToExisting = async () => {
    if (!selectedMasterId) {
      setErrorMsg("Оберіть майстра.");
      return;
    }
    if (timeSlots.length === 0) {
      setErrorMsg("Додайте хоча б один тайм-слот.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);
    try {
      const payload = {
        slots: timeSlots
          .filter((t) => t.start && t.end)
          .map((t) => ({ start: t.start, end: t.end })),
      };

      const res = await fetch(`/api/masters/${selectedMasterId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || `Помилка збереження (HTTP ${res.status})`);
      }
      setSuccess(true);
    } catch (e: any) {
      setErrorMsg(e.message || "Сталася помилка під час додавання слотів.");
    } finally {
      setLoading(false);
    }
  };

  // ➌ МОДИФІКУЙ handleSubmit: якщо вибраний існуючий майстер — не створюємо нового, а просто додаємо слоти
  const handleSubmit = async () => {
    setErrorMsg(null);

    // Якщо обрано існуючого майстра і це розклад — додаємо слоти та виходимо
    if (selectedMasterId && masterType === "schedule") {
      await handleAddSlotsToExisting();
      return;
    }

    // ——— нижче лишається твоя поточна логіка створення нової послуги/майстра ———
    if (!selectedServiceId && !serviceName.trim()) {
      setErrorMsg("Вкажіть або виберіть послугу.");
      return;
    }
    if (!master.name.trim()) {
      setErrorMsg("Вкажіть імʼя майстра.");
      return;
    }
    if (masterType === "schedule") {
      if (
        subtypes.length === 0 ||
        !subtypes.every((s) => s.name.trim() && s.duration > 0 && s.price >= 0)
      ) {
        setErrorMsg("Перевірте підтипи: назва/тривалість/ціна.");
        return;
      }
    }

    setLoading(true);
    setSuccess(false);

    try {
      const photoUrl = await uploadPhoto().catch((e) => {
        console.warn(e);
        return null;
      });

      const payload: any = {
        service: selectedServiceId
          ? { id: selectedServiceId }
          : { name: serviceName.trim(), type: masterType },
        master,
        masterType,
        photoUrl,
      };

      if (masterType === "schedule") {
        payload.subtypes = subtypes;
        payload.timeSlots = timeSlots;
      }

      const res = await fetch("/api/admin/create-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || `Помилка збереження (HTTP ${res.status})`);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Сталася помилка під час збереження.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f3] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Створити майстра</h1>

        {/* Послуга */}
        <div className="space-y-2">
          <label className="block font-medium">✂️ Послуга</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">
              {servicesLoading ? "Завантаження..." : "➕ Нова послуга"}
            </option>
            {!servicesLoading &&
              services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>

          {!selectedServiceId && (
            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Назва нової послуги"
              className="w-full border rounded px-3 py-2"
            />
          )}
        </div>

        {/* ➍ ВСТАВ СЕЛЕКТОР ІСНУЮЧОГО МАЙСТРА — ОДРАЗУ ПІСЛЯ БЛОКУ «Послуга» */}
        {selectedServiceId && (
          <div className="space-y-2">
            <label className="block font-medium">👥 Існуючі майстри цієї послуги</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedMasterId}
              onChange={(e) => setSelectedMasterId(e.target.value)}
            >
              <option value="">
                {mastersLoading ? "Завантаження..." : "— Оберіть майстра —"}
              </option>
              {!mastersLoading &&
                masters.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
            </select>
            {selectedMasterId && (
              <p className="text-sm text-gray-600">
                Обрано існуючого майстра — можна просто додати йому слоти.
              </p>
            )}
          </div>
        )}

        {/* Тип майстра */}
        <div className="space-y-2">
          <label className="block font-medium">🔧 Тип майстра</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={masterType}
            onChange={(e) => setMasterType(e.target.value as MasterType)}
          >
            <option value="schedule">З розкладом</option>
            <option value="task">На завдання (одноразові)</option>
          </select>
        </div>

        {/* Майстер */}
        <div className="space-y-2">
          <label className="block font-medium">👤 Майстер</label>
          <input
            value={master.name}
            onChange={(e) => setMaster({ ...master, name: e.target.value })}
            placeholder="Імʼя *"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            value={master.address}
            onChange={(e) => setMaster({ ...master, address: e.target.value })}
            placeholder="Адреса"
            className="w-full border rounded px-3 py-2"
          />
          <input
            value={master.email}
            onChange={(e) => setMaster({ ...master, email: e.target.value })}
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
          />
          <input
            value={master.phone}
            onChange={(e) => setMaster({ ...master, phone: e.target.value })}
            placeholder="Телефон"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Підтипи (тільки для schedule) */}
        {masterType === "schedule" && (
          <div className="space-y-4">
            <label className="block font-medium">🧾 Підтипи послуг</label>
            {subtypes.map((s, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  placeholder="Назва"
                  value={s.name}
                  onChange={(e) =>
                    setSubtypes(
                      subtypes.map((el, idx) =>
                        idx === i ? { ...el, name: e.target.value } : el
                      )
                    )
                  }
                  className="border rounded px-2 py-1"
                />
                <input
                  type="number"
                  placeholder="Тривалість (хв)"
                  value={s.duration}
                  onChange={(e) =>
                    setSubtypes(
                      subtypes.map((el, idx) =>
                        idx === i ? { ...el, duration: +e.target.value } : el
                      )
                    )
                  }
                  className="border rounded px-2 py-1"
                  min={1}
                />
                <input
                  type="number"
                  placeholder="Ціна"
                  value={s.price}
                  onChange={(e) =>
                    setSubtypes(
                      subtypes.map((el, idx) =>
                        idx === i ? { ...el, price: +e.target.value } : el
                      )
                    )
                  }
                  className="border rounded px-2 py-1"
                  min={0}
                />
              </div>
            ))}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() =>
                  setSubtypes([...subtypes, { name: "", duration: 30, price: 0 }])
                }
                className="text-blue-600 hover:underline"
              >
                ➕ Додати підтип
              </button>
              {subtypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSubtypes(subtypes.slice(0, -1))}
                  className="text-red-600 hover:underline"
                >
                  ➖ Видалити останній
                </button>
              )}
            </div>
          </div>
        )}

        {/* Таймслоти (тільки для schedule) */}
        {masterType === "schedule" && (
          <div className="space-y-4">
            <label className="block font-medium">🕒 Таймслоти</label>
            {timeSlots.map((t, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={t.start}
                  onChange={(e) =>
                    setTimeSlots(
                      timeSlots.map((el, idx) =>
                        idx === i ? { ...el, start: e.target.value } : el
                      )
                    )
                  }
                  className="border rounded px-2 py-1"
                />
                <input
                  type="datetime-local"
                  value={t.end}
                  onChange={(e) =>
                    setTimeSlots(
                      timeSlots.map((el, idx) =>
                        idx === i ? { ...el, end: e.target.value } : el
                      )
                    )
                  }
                  className="border rounded px-2 py-1"
                />
              </div>
            ))}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTimeSlots([...timeSlots, { start: "", end: "" }])}
                className="text-blue-600 hover:underline"
              >
                ➕ Додати слот
              </button>
              {timeSlots.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTimeSlots(timeSlots.slice(0, -1))}
                  className="text-red-600 hover:underline"
                >
                  ➖ Видалити останній
                </button>
              )}
            </div>

            {/* КНОПКА ДОДАТИ СЛОТИ ІСНУЮЧОМУ МАЙСТРУ — ПІД БЛОКОМ ТАЙМСЛОТІВ */}
            {selectedMasterId && (
              <button
                type="button"
                onClick={handleAddSlotsToExisting}
                className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
                disabled={loading}
              >
                ➕ Додати слоти вибраному майстру
              </button>
            )}
          </div>
        )}

        {/* Помилки / Статуси */}
        {errorMsg && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
            {errorMsg}
          </div>
        )}
        {success && (
          <p className="text-green-600 font-medium text-center">
            ✅ Успішно виконано!
          </p>
        )}

        {/* Кнопка створення (новий майстер) */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full text-white py-2 rounded transition ${
            canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Зберігаємо..." : "✅ Створити"}
        </button>
      </div>
    </div>
  );
}
