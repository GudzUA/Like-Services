"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TaskForm({ category, masterId }: { category: string; masterId: string }) {

  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [flexible, setFlexible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!details || !name || !phone || (!flexible && !price)) {
      alert("Будь ласка, заповніть усі поля.");
      return;
    }

    const response = await axios.post("/api/task/create", {
      category,
      masterId,
      details,
      price: flexible ? null : parseInt(price),
      flexible,
      name,
      phone,
    });

    if (response.data.success) {
      setSubmitted(true);
      setTimeout(() => {
        router.push("/services");
      }, 2000);
    } else {
      alert("Помилка при створенні завдання");
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-600">✅ Завдання прийнято!</h1>
        <p className="text-gray-700">Майстер звʼяжеться з вами найближчим часом.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🧰 Створення завдання</h1>

      <label className="block mb-2 font-semibold">Опишіть завдання</label>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
        rows={4}
      />

      <label className="block mb-2 font-semibold">Бажана ціна (CAD)</label>
      <input
        type="number"
        value={price}
        disabled={flexible}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <label className="inline-flex items-center mb-4">
        <input
          type="checkbox"
          checked={flexible}
          onChange={() => setFlexible(!flexible)}
          className="mr-2"
        />
        Нехай майстер сам призначить ціну
      </label>

      <label className="block mb-2 font-semibold">Ваше імʼя</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <label className="block mb-2 font-semibold">Ваш телефон</label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-6"
      />

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 w-full"
      >
        📩 Надіслати завдання
      </button>

      {/* Модальне підтвердження */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Підтвердити завдання?</h2>
            <p>🛠️ <b>{category}</b></p>
            <p>📝 <b>{details}</b></p>
            <p>💰 <b>{flexible ? "Майстер призначить" : `${price} CAD`}</b></p>
            <p>👤 <b>{name}</b></p>
            <p>📞 <b>{phone}</b></p>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Скасувати
              </button>
              <button
                onClick={handleSubmit}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Так, підтвердити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
