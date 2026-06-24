"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useConfig } from "@/hooks/useConfig";

export default function ModeControl() {
  const { config, loading } = useConfig();
  const ref = doc(db, "config", "main");

  if (loading || !config) {
    return <p className="text-[var(--color-muted)]">جارٍ التحميل…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 className="text-base font-bold text-white">وضع الموقع العام</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          ما يراه الزوّار على الصفحة الرئيسية.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Toggle
            active={config.mode === "registration"}
            label="التسجيل"
            hint="نموذج التسجيل"
            onClick={() => updateDoc(ref, { mode: "registration" })}
          />
          <Toggle
            active={config.mode === "live"}
            label="العرض المباشر"
            hint="لوحة المقاعد"
            onClick={() => updateDoc(ref, { mode: "live" })}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 className="text-base font-bold text-white">حالة التسجيل</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          عند الإغلاق تظهر للزوّار رسالة انتهاء التسجيل.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Toggle
            active={config.registrationOpen}
            label="مفتوح"
            onClick={() => updateDoc(ref, { registrationOpen: true })}
          />
          <Toggle
            active={!config.registrationOpen}
            label="مغلق"
            onClick={() => updateDoc(ref, { registrationOpen: false })}
          />
        </div>
      </section>
    </div>
  );
}

function Toggle({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-4 py-3 text-center transition ${
        active
          ? "border-[var(--color-rust)] bg-[var(--color-rust)] text-white"
          : "border-[var(--color-line)] bg-transparent text-[var(--color-muted)] hover:border-[var(--color-focus)]"
      }`}
    >
      <span className="block font-bold">{label}</span>
      {hint ? (
        <span
          className={`mt-0.5 block text-xs ${active ? "text-white/80" : "text-[var(--color-faint)]"}`}
        >
          {hint}
        </span>
      ) : null}
    </button>
  );
}
