"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formFields } from "@/lib/formConfig";
import {
  toCSV,
  downloadFile,
  formatDateTime,
  toArabicDigits,
} from "@/lib/utils";
import type { ResponseDoc } from "@/lib/types";

const CONFIDENCE_ID = "attendanceConfidence";

export default function ResponsesTable() {
  const [responses, setResponses] = useState<ResponseDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "responses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setResponses(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ResponseDoc),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const createdLabel = (r: ResponseDoc) => {
    const ts = r.createdAt as Timestamp | null;
    return ts && typeof ts.toDate === "function" ? formatDateTime(ts.toDate()) : "—";
  };

  const confidenceField = formFields.find((f) => f.id === CONFIDENCE_ID);

  const breakdown = useMemo(() => {
    if (!confidenceField?.options) return null;
    const counts: Record<string, number> = {};
    for (const opt of confidenceField.options) counts[opt] = 0;
    for (const r of responses) {
      const v = String(r[CONFIDENCE_ID] ?? "");
      if (v in counts) counts[v] += 1;
    }
    return counts;
  }, [responses, confidenceField]);

  function exportCSV() {
    const rows = responses.map((r) => {
      const row: { createdAtLabel: string } & Record<string, unknown> = {
        createdAtLabel: createdLabel(r),
      };
      for (const f of formFields) row[f.id] = r[f.id];
      return row;
    });
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    downloadFile(`registrations-${stamp}.csv`, toCSV(formFields, rows));
  }

  const cell = (r: ResponseDoc, fieldId: string, isNumber: boolean) => {
    const v = r[fieldId];
    if (v == null || v === "") return "—";
    return isNumber ? toArabicDigits(String(v)) : String(v);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3">
          <span className="text-sm text-[var(--color-muted)]">إجمالي التسجيلات</span>
          <span className="ms-3 text-2xl font-black tabular-nums text-white">
            {toArabicDigits(responses.length)}
          </span>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          disabled={responses.length === 0}
          className="rounded-xl bg-[var(--color-rust)] px-5 py-3 font-bold text-white transition hover:bg-[var(--color-rust-hover)] disabled:opacity-50"
        >
          تصدير CSV
        </button>
      </div>

      {breakdown ? (
        <div className="flex flex-wrap gap-2">
          {Object.entries(breakdown).map(([opt, n]) => (
            <span
              key={opt}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-muted)]"
            >
              {opt}:{" "}
              <span className="font-bold text-white">{toArabicDigits(n)}</span>
            </span>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="text-[var(--color-muted)]">جارٍ التحميل…</p>
      ) : responses.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-6 text-center text-[var(--color-muted)]">
          لا توجد تسجيلات بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)]">
          <table className="w-full min-w-[640px] border-collapse text-right text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-strong)] text-[var(--color-muted)]">
                <th className="whitespace-nowrap px-4 py-3 font-medium">#</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">
                  تاريخ التسجيل
                </th>
                {formFields.map((f) => (
                  <th key={f.id} className="whitespace-nowrap px-4 py-3 font-medium">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-t border-[var(--color-line)] text-white"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-faint)]">
                    {toArabicDigits(i + 1)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-muted)]">
                    {createdLabel(r)}
                  </td>
                  {formFields.map((f) => (
                    <td key={f.id} className="whitespace-nowrap px-4 py-3">
                      {cell(r, f.id, f.type === "number")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
