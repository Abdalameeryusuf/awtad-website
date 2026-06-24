import type { Config } from "./types";

// Seed content for config/main (see build spec §4). Admin "تهيئة" writes these.
export const DEFAULT_CONFIG: Config = {
  eventName: "أوتاد",
  logoUrl: "/awtad-logo.png",
  description:
    "تقام في صالة الضيافة بمأتم الإمام علي (ع) — قرية بوري\n" +
    "هذا الاستبيان لتسجيل الأسماء وحصر الحضور\n" +
    "العرض: ليلة الجمعة ١٧ محرم — ٢٠٢٦/٧/٢ — الساعة ٨:٣٠ مساءً\n" +
    "مهم: الحضور للرجال فقط",
  postSubmitMessage:
    "تم تسجيل اسمك، شكراً لك.\n" +
    "العرض ليلة الجمعة ١٧ محرم (٢٠٢٦/٧/٢) الساعة ٨:٣٠ مساءً.\n" +
    "يُغلق باب صالة العرض قبل ١٠ دقائق من بدايته — نرجو الحضور مبكراً.",
  mode: "registration",
  registrationOpen: true,
  currentShowId: null,
};

// Default seed: 3 shows × 165 seats. Admin can add/edit/delete in the Shows tab.
export const DEFAULT_SHOWS: Array<{ name: string; order: number; capacity: number }> = [
  { name: "العرض الأول", order: 1, capacity: 165 },
  { name: "العرض الثاني", order: 2, capacity: 165 },
  { name: "العرض الثالث", order: 3, capacity: 165 },
];

// Lines in the description containing this marker are visually emphasized.
export const MEN_ONLY_MARKER = "للرجال فقط";
