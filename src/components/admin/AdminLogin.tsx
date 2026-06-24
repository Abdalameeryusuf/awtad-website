"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { BrandHeader } from "../BrandHeader";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged in the parent swaps to the dashboard.
    } catch {
      setError("تعذّر تسجيل الدخول. تحقّق من البريد وكلمة المرور.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-white outline-none transition focus:border-[var(--color-focus)]";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <BrandHeader subtitle="لوحة الإدارة" />
      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
      >
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-[var(--color-muted)]">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputCls} text-left`}
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-[var(--color-muted)]">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} text-left`}
            autoComplete="current-password"
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-[var(--color-full)]/15 px-3 py-2 text-center text-sm text-[var(--color-full)]">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-rust)] py-3.5 font-bold text-white transition hover:bg-[var(--color-rust-hover)] disabled:opacity-60"
        >
          {loading ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
    </main>
  );
}
