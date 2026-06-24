"use client";

import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useShows } from "@/hooks/useShows";
import { toArabicDigits } from "@/lib/utils";
import type { Show } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-white outline-none transition focus:border-[var(--color-focus)]";

export default function ShowsSetup() {
  const { shows, loading } = useShows();
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");
  const [capacity, setCapacity] = useState("");
  const [adding, setAdding] = useState(false);

  const suggestedOrder = shows.length
    ? Math.max(...shows.map((s) => s.order)) + 1
    : 1;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const cap = Number(capacity);
    const ord = order.trim() === "" ? suggestedOrder : Number(order);
    if (!name.trim() || !Number.isFinite(cap) || cap <= 0 || !Number.isFinite(ord)) {
      return;
    }
    setAdding(true);
    try {
      await addDoc(collection(db, "shows"), {
        name: name.trim(),
        order: ord,
        capacity: cap,
        seatsRemaining: cap,
      });
      setName("");
      setOrder("");
      setCapacity("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={add}
        className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
      >
        <h3 className="mb-4 text-base font-bold text-white">إضافة عرض</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm text-[var(--color-muted)]">اسم العرض</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="العرض الأول"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[var(--color-muted)]">الترتيب</span>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              inputMode="numeric"
              placeholder={String(suggestedOrder)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[var(--color-muted)]">السعة</span>
            <input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              inputMode="numeric"
              placeholder="165"
              className={inputCls}
            />
          </label>
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-[var(--color-rust)] px-5 py-2.5 font-bold text-white transition hover:bg-[var(--color-rust-hover)] disabled:opacity-60"
          >
            إضافة
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-[var(--color-muted)]">جارٍ التحميل…</p>
      ) : shows.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-6 text-center text-[var(--color-muted)]">
          لا توجد عروض. أضف عرضاً للبدء.
        </p>
      ) : (
        <div className="space-y-3">
          {shows.map((show) => (
            <ShowRow key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShowRow({ show }: { show: Show }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(show.name);
  const [order, setOrder] = useState(String(show.order));
  const [capacity, setCapacity] = useState(String(show.capacity));
  const ref = doc(db, "shows", show.id);

  function openEdit() {
    setName(show.name);
    setOrder(String(show.order));
    setCapacity(String(show.capacity));
    setEditing(true);
  }

  async function save() {
    const cap = Number(capacity);
    const ord = Number(order);
    if (!name.trim() || !Number.isFinite(cap) || cap <= 0 || !Number.isFinite(ord)) {
      return;
    }
    await updateDoc(ref, {
      name: name.trim(),
      order: ord,
      capacity: cap,
      // Keep remaining within the new capacity.
      seatsRemaining: Math.min(show.seatsRemaining, cap),
    });
    setEditing(false);
  }

  async function remove() {
    if (window.confirm(`حذف «${show.name}»؟`)) await deleteDoc(ref);
  }

  async function resetSeats() {
    if (
      window.confirm(
        `إعادة ضبط مقاعد «${show.name}» إلى ${toArabicDigits(show.capacity)}؟`,
      )
    ) {
      await updateDoc(ref, { seatsRemaining: show.capacity });
    }
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-[var(--color-focus)] bg-[var(--color-surface)] p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            inputMode="numeric"
            className={inputCls}
          />
          <input
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            inputMode="numeric"
            className={inputCls}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={save}
            className="rounded-lg bg-[var(--color-rust)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-rust-hover)]"
          >
            حفظ
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:text-white"
          >
            إلغاء
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-strong)] text-sm font-bold text-[var(--color-muted)]">
          {toArabicDigits(show.order)}
        </span>
        <div>
          <p className="font-bold text-white">{show.name}</p>
          <p className="text-sm text-[var(--color-muted)]">
            المتبقّي {toArabicDigits(show.seatsRemaining)} من {toArabicDigits(show.capacity)}
          </p>
        </div>
      </div>
      <div className="flex gap-2 text-sm">
        <button
          onClick={openEdit}
          className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-muted)] transition hover:text-white"
        >
          تعديل
        </button>
        <button
          onClick={resetSeats}
          className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-muted)] transition hover:text-white"
        >
          إعادة الضبط
        </button>
        <button
          onClick={remove}
          className="rounded-lg border border-[var(--color-full)]/50 px-3 py-1.5 text-[var(--color-full)] transition hover:bg-[var(--color-full)]/10"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
