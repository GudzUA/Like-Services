"use client";

import { useState } from "react";

export default function BookingModal({
  onClose,
  onConfirm,
  subtypeName,
  timeRange,
  price,
  duration,
}: {
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
  subtypeName: string;
  timeRange: string;
  price: number;
  duration: number;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">📋 Підтвердження запису</h2>
        <p className="mb-2">🔹 Послуга: {subtypeName}</p>
        <p className="mb-2">⏱ Тривалість: {duration} хв</p>
        <p className="mb-2">🕒 Час: {timeRange}</p>
        <p className="mb-4">💲 Ціна: {price} грн</p>

        <input
          type="text"
          placeholder="Ваше імʼя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />
        <input
          type="tel"
          placeholder="Номер телефону"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        />

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300"
          >
            Скасувати
          </button>
          <button
            onClick={() => onConfirm(name, phone)}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
}
