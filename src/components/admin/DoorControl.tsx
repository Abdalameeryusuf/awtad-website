"use client";

import { useEffect, useState } from "react";
import { doc, increment, runTransaction, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useShows } from "@/hooks/useShows";
import { useConfig } from "@/hooks/useConfig";
import { toArabicDigits, formatTimeOnly } from "@/lib/utils";
import type { Show } from "@/lib/types";

export default function DoorControl() {
  const { shows, loading, lastUpdated, fromCache, hasPendingWrites } = useShows();
  const { config } = useConfig();
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const currentId = config?.currentShowId ?? null;
  const selected = shows.find((s) => s.id === currentId) ?? null;

  async function selectShow(id: string) {
    await updateDoc(doc(db, "config", "main"), { currentShowId: id });
  }

  async function adjust(delta: 1 | -1) {
    if (!selected) return;
    // Bound with the latest known value (also guards offline overshoot).
    const projected = selected.seatsRemaining + delta;
    if (projected < 0 || projected > selected.capacity) return;
    const ref = doc(db, "shows", selected.id);

    if (navigator.onLine) {
      try {
        // Atomic + race-safe: re-reads on the server and only writes within bounds.
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          if (!snap.exists()) return;
          const data = snap.data() as Show;
          const next = data.seatsRemaining + delta;
          if (next < 0 || next > data.capacity) return;
          tx.update(ref, { seatsRemaining: next });
        });
        return;
      } catch {
        // Connection dropped mid-write — fall through to a queued write.
      }
    }
    // Offline / fallback: atomic increment that the persistent cache applies now
    // and syncs when back online. Not awaited (resolves only after sync).
    void updateDoc(ref, { seatsRemaining: increment(delta) }).catch(() => {});
  }

  const status = !online || fromCache
    ? { dot: "bg-[var(--color-warn)]", text: "text-[var(--color-warn)]", label: "غير متصل — يُحفظ محلياً" }
    : hasPendingWrites
      ? { dot: "bg-[var(--color-warn)]", text: "text-[var(--color-warn)]", label: "جارٍ المزامنة…" }
      : { dot: "bg-[var(--color-ok)]", text: "text-[var(--color-ok)]", label: "متصل" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${status.dot}`} />
          <span className={status.text}>{status.label}</span>
        </div>
        <span className="text-[var(--color-faint)]">
          آخر تحديث {formatTimeOnly(lastUpdated)}
        </span>
      </div>

      <div>
        <p className="mb-2 text-sm text-[var(--color-muted)]">اختر العرض الحالي</p>
        {loading ? (
          <p className="text-[var(--color-muted)]">جارٍ التحميل…</p>
        ) : shows.length === 0 ? (
          <p className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 text-center text-[var(--color-muted)]">
            أضف عرضاً أولاً من تبويب «العروض».
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {shows.map((s) => (
              <button
                key={s.id}
                onClick={() => selectShow(s.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  s.id === currentId
                    ? "border-[var(--color-rust)] bg-[var(--color-rust)] text-white"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-focus)]"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-center">
          <p className="text-[var(--color-muted)]">{selected.name}</p>
          <div className="my-5">
            <span
              key={selected.seatsRemaining}
              className="animate-count-pop inline-block text-7xl font-black tabular-nums leading-none text-white sm:text-8xl"
            >
              {toArabicDigits(selected.seatsRemaining)}
            </span>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              من {toArabicDigits(selected.capacity)} مقعد
            </p>
          </div>

          <button
            onClick={() => adjust(-1)}
            disabled={selected.seatsRemaining <= 0}
            className="w-full rounded-2xl bg-[var(--color-rust)] py-8 text-white transition hover:bg-[var(--color-rust-hover)] active:scale-[0.98] disabled:opacity-50"
          >
            <span className="block text-5xl font-black leading-none">−١</span>
            <span className="mt-2 block text-base font-bold">دخول شخص</span>
          </button>

          <button
            onClick={() => adjust(1)}
            disabled={selected.seatsRemaining >= selected.capacity}
            className="mt-3 w-full rounded-xl border border-[var(--color-line)] py-3 font-bold text-[var(--color-muted)] transition hover:text-white disabled:opacity-50"
          >
            +١ تراجع
          </button>

          {selected.seatsRemaining <= 0 ? (
            <p className="mt-3 font-bold text-[var(--color-full)]">اكتمل العدد</p>
          ) : null}
        </div>
      ) : shows.length > 0 ? (
        <p className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-6 text-center text-[var(--color-muted)]">
          اختر العرض الحالي للبدء.
        </p>
      ) : null}
    </div>
  );
}
