"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

   if (data.success) {
  localStorage.removeItem("token");

  alert("註冊成功，請登入");

  window.location.href = "/login";
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-xl w-[400px]">
        <h1 className="text-3xl font-bold mb-6">
          建立帳號
        </h1>

        <input
          className="w-full bg-zinc-800 p-3 rounded mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="w-full bg-zinc-800 p-3 rounded mb-4"
          placeholder="密碼"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={register}
          className="w-full bg-green-600 p-3 rounded"
        >
          註冊
        </button>
          <p className="mt-4 text-center">
          已經有帳號？

          <Link
            href="/login"
            className="ml-1 text-blue-500 hover:underline"
          >
            返回登入
          </Link>
        </p>
      </div>
    </main>
  );
}