import type { FormField } from "./formConfig";

const EASTERN = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Convert Western digits in a value to Eastern-Arabic numerals (٠١٢…) for display. */
export function toArabicDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => EASTERN[Number(d)]);
}

/**
 * Convert Eastern-Arabic (٠-٩) and Persian/extended (۰-۹) numerals to Western
 * digits, so users typing on an Arabic keyboard are accepted.
 */
export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

/**
 * Bahraini mobile: 8 digits starting with 3 or 6, optional +973 / 973 prefix,
 * ignoring spaces / dashes. Accepts Arabic-Indic numerals.
 */
export function isValidBahrainMobile(raw: string): boolean {
  const cleaned = toWesternDigits(raw).replace(/[^\d+]/g, "");
  return /^(?:\+?973)?[36]\d{7}$/.test(cleaned);
}

export type SeatStatus = {
  key: "ok" | "warn" | "full";
  label: string;
  colorVar: string;
};

/** Status for a show's remaining seats. Always paired with a text label (a11y). */
export function seatStatus(remaining: number, capacity: number): SeatStatus {
  if (remaining <= 0) {
    return { key: "full", label: "مكتمل", colorVar: "var(--color-full)" };
  }
  const ratio = capacity > 0 ? remaining / capacity : 0;
  if (ratio <= 0.33) {
    return { key: "warn", label: "يقترب الامتلاء", colorVar: "var(--color-warn)" };
  }
  return { key: "ok", label: "متوفّر", colorVar: "var(--color-ok)" };
}

const dateTimeFmt = new Intl.DateTimeFormat("ar-BH-u-nu-arab", {
  dateStyle: "medium",
  timeStyle: "short",
});
const timeFmt = new Intl.DateTimeFormat("ar-BH-u-nu-arab", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function formatDateTime(date: Date | null | undefined): string {
  return date ? dateTimeFmt.format(date) : "—";
}

export function formatTimeOnly(date: Date | null | undefined): string {
  return date ? timeFmt.format(date) : "—";
}

/** CSV (with BOM for Excel Arabic) driven by formConfig + a createdAt label column. */
export function toCSV(
  fields: FormField[],
  rows: Array<{ createdAtLabel: string } & Record<string, unknown>>,
): string {
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["تاريخ التسجيل", ...fields.map((f) => f.label)];
  const lines = [header.map(escape).join(",")];
  for (const row of rows) {
    const cells = [row.createdAtLabel, ...fields.map((f) => row[f.id])];
    lines.push(cells.map(escape).join(","));
  }
  return "﻿" + lines.join("\r\n");
}

/** Trigger a browser download of text content. */
export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
