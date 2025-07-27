"use client";

import { useEffect, useState } from "react";

export default function AdminCreatePage() {
  const [loading, setLoading] = useState(false);
  const [masterType, setMasterType] = useState<"schedule" | "task">("schedule");
  const [success, setSuccess] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [master, setMaster] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [subtypes, setSubtypes] = useState([{ name: "", duration: 30, price: 0 }]);
  const [timeSlots, setTimeSlots] = useState([{ start: "", end: "" }]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServices(data.services);
        }
      });
  }, []);

  const handleSubmit = async () => {
    if (!selectedServiceId && !serviceName.trim()) {
      alert("❗ Вкажіть або виберіть послугу");
      return;
    }
let photoUrl = null;

if (photoFile) {
  const formData = new FormData();
  formData.append("image", photoFile);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=YOUR_API_KEY`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.success) {
    photoUrl = data.data.url;
  }
}

    setLoading(true);
    setSuccess(false);

    const res = await fetch("/api/admin/create-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  service: selectedServiceId
    ? { id: selectedServiceId }
    : { name: serviceName, type: masterType },
  master,
  subtypes,
  timeSlots,
  masterType,
  photoUrl,
}),
    });

    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      alert("❌ Error: " + data.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f3] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Створити майстра</h1>

        {/* 🔹 Вибір або створення послуги */}
        <div className="space-y-2">
          <label className="block font-medium">✂️ Послуга</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">➕ Нова послуга</option>
            {services.map((s) => (
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
 
{/* 🔸 Вибір типу майстра */}
<div className="space-y-2">
  <label className="block font-medium">🔧 Тип майстра</label>
  <select
    className="w-full border rounded px-3 py-2"
    value={masterType}
    onChange={(e) => setMasterType(e.target.value as "schedule" | "task")}
  >
    <option value="schedule">З розкладом</option>
    <option value="task">На завдання (одноразові)</option>
  </select>
</div>

        {/* 🔹 Дані майстра */}
        <div className="space-y-2">
          <label className="block font-medium">👤 Майстер</label>
          <input
            value={master.name}
            onChange={(e) => setMaster({ ...master, name: e.target.value })}
            placeholder="Імʼя"
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

         {masterType === "schedule" && (
           <>
        {/* 🔹 Підтипи */}
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
              />
            </div>
          ))}
          <button
            onClick={() =>
              setSubtypes([...subtypes, { name: "", duration: 30, price: 0 }])
            }
            className="text-blue-600 hover:underline"
          >
            ➕ Додати підтип
          </button>
        </div>
          </>
         )}

          {masterType === "schedule" && (
            <>
    {/* 🔹 Таймслоти */}
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
      <button
        onClick={() =>
          setTimeSlots([...timeSlots, { start: "", end: "" }])
        }
        className="text-blue-600 hover:underline"
      >
        ➕ Додати слот
      </button>
    </div>
  </>
)}

        {/* 🔹 Кнопка збереження */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Зберігаємо..." : "✅ Створити"}
        </button>

        {success && (
          <p className="text-green-600 font-medium text-center">
            ✅ Успішно створено!
          </p>
        )}
      </div>
    </div>
  );
}