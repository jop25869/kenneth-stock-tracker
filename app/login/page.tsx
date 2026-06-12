"use client";
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";


export default function LoginPage() {

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      JSON.parse(atob(token.split(".")[1]));
      window.location.href = "/";
    } catch {
      localStorage.removeItem("token");
    }
  }
}, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] =useState(false);

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

        if (!res.ok) {
      alert(data.error || "帳號或密碼錯誤");
      return;
    }

    setIsLoading(true);

    localStorage.setItem("token", data.token);

    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
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

        {isLoading && (
          <div className="mb-4 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>

            <div className="mt-2 text-blue-400">
              📈 載入投資組合中...
            </div>
          </div>
        )}

        <button
          onClick={login}
          disabled={isLoading}
          className="w-full bg-blue-600 p-4 rounded disabled:opacity-50"
        >
          {isLoading ? "登入中..." : "登入"}
        </button>
        <p className="mt-2 text-center">
          <a
            href="/forgot-password"
            className="text-gray-400 hover:text-white"
          >
            忘記密碼？
          </a>
        </p>
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