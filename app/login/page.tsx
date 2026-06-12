"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      window.location.href = "/";
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      alert(data.error || "登入失敗");
      return;
    }

    setIsLoading(true);

    localStorage.setItem("token", data.token);

    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-900 relative overflow-hidden">
      {/* Header */}
      <div className="p-8">
        <h1 className="text-4xl font-bold">
          📈 Kenneth Stock Tracker
        </h1>

        <p className="text-zinc-400 mt-2">
          Personal Portfolio Management
        </p>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 pb-10">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          

          {/* 左側 */}
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 shadow-2xl">

              <div className="text-6xl mb-8">
                📈
              </div>

              <h2 className="text-4xl font-bold mb-4">
                掌握你的投資組合
              </h2>

              <p className="text-lg text-blue-100 mb-10">
                支援美股與台股，即時更新，
                輕鬆追蹤你的投資績效。
              </p>

              <div className="space-y-4 text-lg">
                <div>🛜美股 台股即時追蹤</div>
                <div>📊 投資組合分析</div>
                <div>📈 績效統計 Dashboard</div>
              </div>
            </div>
          </div>

          {/* 右側登入卡 */}
          <div className="bg-white text-black rounded-3xl shadow-2xl p-10 max-w-md mx-auto w-full">

            <h2 className="text-3xl font-bold text-center mb-8">
              登入
            </h2>

            <input
              className="w-full border border-zinc-300 p-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full border border-zinc-300 p-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isLoading && (
              <div className="mb-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>

                <div className="mt-2 text-blue-600">
                  📈 載入投資組合中...
                </div>
              </div>
            )}

            <button
              onClick={login}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? "登入中..." : "登入"}
            </button>

            <p className="mt-4 text-center">
              <a
                href="/forgot-password"
                className="text-zinc-500 hover:text-blue-600"
              >
                忘記密碼？
              </a>
            </p>

            <p className="mt-6 text-center text-zinc-600">
              還沒有帳號？

              <Link
                href="/register"
                className="ml-2 text-blue-600 hover:underline font-medium"
              >
                立即註冊
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer 
      <footer className="py-6 text-center text-sm text-zinc-500">
        Designed & Developed by Kenneth Ho
      </footer>*/}
    </div>
  );
}