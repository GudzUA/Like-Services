// app/drivers/apply/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Employment = "full-time" | "part-time";
type Activity = "taxi" | "delivery" | "both";

export default function DriverApplyPage() {
  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [color, setColor] = useState("");
  const [employment, setEmployment] = useState<Employment | "">("");
  const [activity, setActivity] = useState<Activity | "">("");
  const [agreeRules, setAgreeRules] = useState(false);
  const [voteReady, setVoteReady] = useState(false);
  const [promoReady, setPromoReady] = useState(false);

  // ui
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // counter
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/drivers/count", { cache: "no-store" });
        if (!r.ok) return;
        const { count } = await r.json();
        if (typeof count === "number") setCount(count);
      } catch {}
    })();
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setTelegram("");
    setCarMake("");
    setCarModel("");
    setYear("");
    setColor("");
    setEmployment("");
    setActivity("");
    setAgreeRules(false);
    setVoteReady(false);
    setPromoReady(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("Вкажіть ім’я.");
    if (!phone.trim()) return setErr("Вкажіть телефон.");
    if (!employment) return setErr("Оберіть зайнятість.");
    if (!activity) return setErr("Оберіть діяльність.");
    if (!agreeRules) return setErr("Потрібна згода з правилами спільноти.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/drivers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          telegram: telegram.trim(),
          carMake: carMake.trim(),
          carModel: carModel.trim(),
          year: year === "" ? null : Number(year),
          color: color.trim(),
          employment,
          activity,
          agreeRules,
          voteReady,
          promoReady,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Помилка надсилання форми");
      }

      // success
      resetForm();
      // оновимо лічильник
      try {
        const r2 = await fetch("/api/drivers/count", { cache: "no-store" });
        if (r2.ok) {
          const { count } = await r2.json();
          if (typeof count === "number") setCount(count);
        }
      } catch {}
      setShowModal(true);
    } catch (e: any) {
      setErr(e.message || "Сталася помилка. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-center mb-2">
        Реєстрація в Українській спільноті водіїв у Вінніпезі
      </h1>
      <p className="text-center text-gray-600 mb-4">
        Заповніть анкету, щоб приєднатися до української спільноти водіїв і доставщиків.
      </p>

      {typeof count === "number" && (
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-1 text-green-700 border border-green-200">
            <span>🟢 Уже з нами:</span>
            <b>{count}</b>
            <span>{count === 1 ? "водій" : "водіїв"}</span>
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Ім’я</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ім’я"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 ..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Telegram <span className="text-gray-400">(необов’язково)</span>
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username або chat id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Марка</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={carMake}
              onChange={(e) => setCarMake(e.target.value)}
              placeholder="Toyota"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Модель</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="Camry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Рік</label>
            <input
              type="number"
              min={1980}
              max={2100}
              className="w-full border rounded px-3 py-2"
              value={year as number | ""}
              onChange={(e) =>
                setYear(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="2016"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Колір</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Сірий"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Зайнятість</label>
            <select
              className="w-full border rounded px-3 py-2 bg-white"
              value={employment}
              onChange={(e) => setEmployment(e.target.value as Employment)}
              required
            >
              <option value="" disabled>Оберіть варіант…</option>
              <option value="full-time">Повний робочий день</option>
              <option value="part-time">Підробіток</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Діяльність</label>
            <select
              className="w-full border rounded px-3 py-2 bg-white"
              value={activity}
              onChange={(e) => setActivity(e.target.value as Activity)}
              required
            >
              <option value="" disabled>Оберіть варіант…</option>
              <option value="taxi">Таксі</option>
              <option value="delivery">Доставка</option>
              <option value="both">І таксі, і доставка</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={agreeRules}
              onChange={(e) => setAgreeRules(e.target.checked)}
              required
            />
            <span>Я погоджуюсь з правилами спільноти</span>
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={voteReady}
              onChange={(e) => setVoteReady(e.target.checked)}
            />
            <span>Хочу брати участь у голосуваннях</span>
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={promoReady}
              onChange={(e) => setPromoReady(e.target.checked)}
            />
            <span>Готовий брати участь в акціях та ініціативах</span>
          </label>
        </div>

        {err && <div className="text-red-600 text-sm font-medium">{err}</div>}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded bg-blue-600 text-white py-2 font-semibold transition ${
            submitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {submitting ? "Надсилаємо…" : "Надіслати"}
        </button>
      </form>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white w-[90%] max-w-md rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold">Вітаємо! 🎉</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-700 mb-3">
              Вашу анкету збережено. Ви додані до списку учасників майбутньої
              української спільноти водіїв та доставщиків у Вінніпезі.
            </p>
            <p className="text-gray-700 mb-4">
              Ми на етапі формування комʼюніті та інфраструктури.
              Найближчим часом надішлемо інструкції з подальшими кроками.
              Дякуємо, що долучаєтесь! 💙💛
            </p>

      <a
        href="https://t.me/+zWOOiPwFLjs2NjUx"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex justify-center w-full rounded bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 mb-2"
      >
        Приєднатися до Telegram-спільноти
      </a>

            <button
              className="mt-2 inline-flex justify-center w-full rounded border py-2 font-semibold hover:bg-gray-50"
              onClick={() => setShowModal(false)}
            >
              Гаразд
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
