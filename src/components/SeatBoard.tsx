"use client";

import { useShows } from "@/hooks/useShows";
import { seatStatus, toArabicDigits, formatTimeOnly } from "@/lib/utils";
import type { Config } from "@/lib/types";
import { BrandHeader } from "./BrandHeader";

const STATUS_TEXT: Record<string, string> = {
  ok: "text-[var(--color-ok)]",
  warn: "text-[var(--color-warn)]",
  full: "text-[var(--color-full)]",
};
const STATUS_BG: Record<string, string> = {
  ok: "bg-[var(--color-ok)]",
  warn: "bg-[var(--color-warn)]",
  full: "bg-[var(--color-full)]",
};

export default function SeatBoard({ config }: { config: Config }) {
  const { shows, loading, lastUpdated, fromCache } = useShows();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8">
      <BrandHeader subtitle="المقاعد المتبقّية لكل عرض" />

      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[var(--color-faint)]">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            fromCache ? "bg-[var(--color-warn)]" : "bg-[var(--color-ok)]"
          }`}
        />
        <span>
          {fromCache ? "غير متصل — آخر تحديث" : "مباشر — آخر تحديث"}{" "}
          {formatTimeOnly(lastUpdated)}
        </span>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-[var(--color-muted)]">جارٍ التحميل…</p>
      ) : shows.length === 0 ? (
        <p className="mt-10 text-center text-[var(--color-muted)]">
          لا توجد عروض متاحة حالياً.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shows.map((show) => {
            const st = seatStatus(show.seatsRemaining, show.capacity);
            const pct =
              show.capacity > 0
                ? Math.max(0, Math.min(100, (show.seatsRemaining / show.capacity) * 100))
                : 0;
            const isCurrent = config.currentShowId === show.id;
            return (
              <div
                key={show.id}
                className={`relative rounded-2xl border bg-[var(--color-surface)] p-5 ${
                  isCurrent
                    ? "border-[var(--color-rust)] ring-1 ring-[var(--color-rust)]"
                    : "border-[var(--color-line)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white">{show.name}</h3>
                  {isCurrent ? (
                    <span className="shrink-0 rounded-full bg-[var(--color-rust)] px-3 py-1 text-xs font-bold text-white">
                      العرض الحالي
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span
                    className={`text-5xl font-black tabular-nums ${STATUS_TEXT[st.key]}`}
                  >
                    {toArabicDigits(show.seatsRemaining)}
                  </span>
                  <span className="text-sm text-[var(--color-muted)]">
                    من {toArabicDigits(show.capacity)} مقعد
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STATUS_BG[st.key]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className={`mt-2 text-sm font-semibold ${STATUS_TEXT[st.key]}`}>
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
