"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  async function resetPassword() {

    if (password !== confirmPassword) {
      alert("兩次密碼不一致");
      return;
    }

    const res = await fetch(
      "/api/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {

      alert("密碼重設成功");

      window.location.href =
        "/login";

    } else {

      alert(data.error);

    }
  }

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">

      <div className="bg-zinc-900 p-10 rounded-xl w-[450px]">

        <h1 className="text-3xl font-bold mb-8">
          忘記密碼
        </h1>

        <input
          className="w-full bg-zinc-800 p-4 rounded mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="w-full bg-zinc-800 p-4 rounded mb-4"
          placeholder="新密碼"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <input
          type="password"
          className="w-full bg-zinc-800 p-4 rounded mb-4"
          placeholder="確認新密碼"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
        />

        <button
          onClick={resetPassword}
          className="w-full bg-blue-600 p-4 rounded"
        >
          重設密碼
        </button>

      </div>
    </div>
  );
}