"use client";
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";


export default function LoginPage() {

  useEffect(() => {
  const token =
    localStorage.getItem("token");

  if (token) {
    window.location.href = "/";
  }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const res = await fetch("/api/login", {
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

    if (data.token) {
      localStorage.setItem("token", data.token);

      alert("登入成功");

      window.location.href = "/";
    } else {
      alert(data.error);
    }
  }

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="bg-zinc-900 p-10 rounded-xl w-[450px]">
        <h1 className="text-4xl font-bold mb-8">
          登入
        </h1>

        <input
          className="w-full bg-zinc-800 p-4 rounded mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full bg-zinc-800 p-4 rounded mb-4"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 p-4 rounded"
        >
          登入
        </button>
          <p className="mt-4 text-center">
            還沒有帳號？

            <Link
              href="/register"
              className="ml-1 text-blue-500 hover:underline"
            >
              立即註冊
            </Link>
          </p>
        
      </div>
    </div>
  );
}