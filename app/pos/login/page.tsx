"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PosPinLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const appendDigit = (digit: string) => {
    if (pin.length >= 6) return;
    setPin(pin + digit);
    setError("");
  };

  const clearPin = () => {
    setPin("");
    setError("");
  };

  const backspace = () => {
    setPin(pin.slice(0, -1));
  };

  const login = async () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/pin-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        }
      );

      if (!res.ok) {
        setError("Invalid PIN");
        return;
      }

      const data = await res.json();

      // Save employee session
      localStorage.setItem("employee", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      router.push("/pos");
    } catch (err) {
      setError("Server error");
    }
  };

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-violet-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[340px]">
        <h1 className="text-2xl font-bold text-violet-700 text-center mb-6">
          Employee Login
        </h1>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < pin.length ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {keypad.map((num) => (
            <button
              key={num}
              onClick={() => appendDigit(num)}
              className="bg-neutral-200 hover:bg-neutral-300 text-2xl py-4 rounded-lg"
            >
              {num}
            </button>
          ))}

          {/* Clear */}
          <button
            onClick={clearPin}
            className="bg-red-300 hover:bg-red-400 text-xl py-4 rounded-lg"
          >
            Clear
          </button>

          {/* 0 */}
          <button
            onClick={() => appendDigit("0")}
            className="bg-neutral-200 hover:bg-neutral-300 text-2xl py-4 rounded-lg"
          >
            0
          </button>

          {/* Backspace */}
          <button
            onClick={backspace}
            className="bg-neutral-200 hover:bg-neutral-300 text-xl py-4 rounded-lg"
          >
            ←
          </button>
        </div>

        {/* Login button */}
        <button
          onClick={login}
          className="w-full bg-black text-white py-3 rounded-lg text-xl hover:bg-neutral-800"
        >
          Login
        </button>
      </div>
    </div>
  );
}
