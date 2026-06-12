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
    try {
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
    } catch {
      alert("登入失敗，請稍後再試");
    }
  }

  return (
    <div className="min-h-screen bg-[#F7ECE7] flex flex-col relative overflow-hidden">

      {/* 背景裝飾 */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#EFD2C6]" />

      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#F0D8CC]" />

      {/* Header */}
      <div className="relative z-10 px-8 py-6">
        <h1 className="text-3xl font-bold text-zinc-900">
          📈 Kenneth Stock Tracker
        </h1>

        <p className="text-zinc-600 mt-1">
          Personal Portfolio Management
        </p>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-10">

        <div className="w-full max-w-7xl grid lg:grid-cols-[1.5fr_1fr] gap-12 items-center">

          {/* 左側品牌區 */}
          <div className="hidden lg:block">

            <div className="max-w-xl">

              <div className="inline-flex items-center rounded-full bg-white px-4 py-2 shadow-sm mb-8">
                <span className="text-sm font-medium text-zinc-700">
                  Built for Investors
                </span>
              </div>

              <h2 className="text-6xl font-bold leading-tight text-zinc-900">
                Track.
                <br />
                Analyze.
                <br />
                Grow.
              </h2>

              <p className="mt-8 text-xl text-zinc-600 leading-relaxed">
                Manage your US and Taiwan portfolios with
                real-time updates, performance analytics,
                and a dashboard designed for investors.
              </p>

              <div className="mt-12 grid grid-cols-2 gap-5">

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-3xl mb-2">
                   <img src="/flags/us.png" alt="US Flag" className="w-12 h-8 rounded mb-2"/>
                  </div>

                  <div className="font-semibold text-zinc-900">
                    US Stocks
                  </div>

                  <div className="text-sm text-zinc-500 mt-1">
                    Real-time tracking
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-3xl mb-2">
                    <img src="/flags/tw.png" alt="US Flag" className="w-12 h-8 rounded mb-2"/>
                  </div>

                  <div className="font-semibold text-zinc-900">
                    Taiwan Stocks
                  </div>

                  <div className="text-sm text-zinc-500 mt-1">
                    Name search support
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-3xl mb-2">
                    📊
                  </div>

                  <div className="font-semibold text-zinc-900">
                    Dashboard
                  </div>

                  <div className="text-sm text-zinc-500 mt-1">
                    Portfolio insights
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-3xl mb-2">
                    📈
                  </div>

                  <div className="font-semibold text-zinc-900">
                    Analytics
                  </div>

                  <div className="text-sm text-zinc-500 mt-1">
                    Track performance
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 右側登入卡 */}
          <div className="w-full max-w-md mx-auto">

            <div className="bg-white rounded-[32px] shadow-2xl p-10">

              <h2 className="text-4xl font-bold text-center text-zinc-900 mb-2">
                Login
              </h2>

              <p className="text-center text-zinc-500 mb-10">
                Welcome back to your portfolio
              </p>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-zinc-300 rounded-2xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border border-zinc-300 rounded-2xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />

              {isLoading && (
                <div className="mb-5 text-center">

                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent" />

                  <div className="mt-3 text-zinc-600">
                    📈 載入投資組合中...
                  </div>

                </div>
              )}

              <button
                onClick={login}
                disabled={isLoading}
                className="w-full bg-zinc-900 text-white p-4 rounded-2xl hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading
                  ? "登入中..."
                  : "登入"}
              </button>

              <div className="mt-6 text-center">

                <a
                  href="/forgot-password"
                  className="text-zinc-500 hover:text-zinc-900"
                >
                  忘記密碼？
                </a>

              </div>

              <div className="mt-6 text-center text-zinc-600">

                還沒有帳號？

                <Link
                  href="/register"
                  className="ml-2 font-semibold text-zinc-900 hover:underline"
                >
                  立即註冊
                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-zinc-500">
        © 2026 Kenneth Stock Tracker • Designed & Developed by Kenneth Ho
      </footer>

    </div>
  );
}