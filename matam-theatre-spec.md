# Build Spec — Theatre Registration & Live Seating Web App

> Hand this whole file to Claude Code. It is the build spec. The UI language is **Arabic (RTL)**; this spec is in English for clarity only.

## 1. Context & Goal

Build a mobile-first, Arabic (RTL) web app for a community theatrical performance ("العمل المسرحي") held at a matam (Husseiniya) in Bahrain. The performance runs for **one night with several back-to-back shows** (العرض الأول، الثاني، الثالث، ...), each in the same hall with a capacity of ~160–170 seats.

The app has **two modes**, controlled by an admin flag:

1. **Registration mode** (default, used from now until the day before the event): the public sees a Google-Forms-style registration form. Purpose: count expected attendance.
2. **Live mode** (used on the night of the event): the public sees a live seat-availability board showing how many seats remain in each show, so people know which show to aim for instead of all crowding in at the start. Meanwhile a volunteer at the hall door uses an admin control to decrement the current show's seat count as each person enters.

A single public URL serves both modes; the admin switches the mode. A separate protected admin area provides response viewing and all live controls.

## 2. Tech Stack (required)

- **Next.js** (latest, App Router) + **TypeScript**
- **Tailwind CSS** with full RTL support
- **Firebase**: Firestore (data store + real-time listeners) and Firebase Authentication (email/password) for the admin
- Enable **Firestore offline persistence** (persistent local cache) so the door control keeps working on flaky venue Wi-Fi and queues writes when offline
- Deploy target: **Vercel**
- UI: **Arabic only**, fully **RTL**, **mobile-first**

## 3. Data Model (Firestore)

**`config/main`** (single document):
```
{
  eventName: string,
  logoUrl: string,              // play logo, shown atop the form & board
  description: string,          // intro text above the form fields
  postSubmitMessage: string,    // instructions shown after a successful submit
  mode: "registration" | "live",
  registrationOpen: boolean,
  currentShowId: string | null  // the show currently being admitted (live mode)
}
```

**`shows`** (collection, one doc per show):
```
{
  name: string,            // e.g. "العرض الأول"
  order: number,           // 1, 2, 3 ...
  capacity: number,        // e.g. 165
  seatsRemaining: number   // starts equal to capacity
}
```

**`responses`** (collection, one doc per registration):
```
{
  createdAt: Timestamp,    // serverTimestamp()
  ...form field values (see §4)
}
```

If `config/main` or the `shows` collection do not exist on first load of the admin panel, the admin UI must let the admin create them (initialize config with defaults; add shows).

## 4. Form Configuration (fixed fields, editable in one file)

Form fields are **not** built through a UI. They live in a single typed config file `src/lib/formConfig.ts` so they can be edited in code easily. Use this default set (Arabic labels) and keep it trivially editable:

```ts
export type FormField = {
  id: string;
  label: string;
  type: "text" | "tel" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[]; // for select
  min?: number;       // for number
};

export const formFields: FormField[] = [
  { id: "fullName", label: "الاسم", type: "text", required: true },
  { id: "phone", label: "رقم الهاتف", type: "tel", required: true },
  { id: "age", label: "العمر", type: "number", required: true, min: 1 },
  { id: "area", label: "المنطقة", type: "text", required: true },
  {
    id: "attendanceConfidence",
    label: "هل أنت متأكد من حضورك؟",
    type: "select",
    required: true,
    options: ["نعم", "لست متأكد", "لا"],
  },
];
```

**All fields are required.** The form, the responses table, and the CSV export must all be driven by this config (add/remove a field here → reflected everywhere).

### Default page content (seed values for `config/main`)

```
eventName:  "أوتاد"   // play title; the LOGO image is the visual title on screen — this string is for the browser tab / SEO / logo alt text

description:
"تقام في صالة الضيافة بمأتم الإمام علي (ع) — قرية بوري
هذا الاستبيان لتسجيل الأسماء وحصر الحضور
العرض: ليلة الجمعة ١٧ محرم — ٢٠٢٦/٧/٢ — الساعة ٨:٣٠ مساءً
مهم: الحضور للرجال فقط"

postSubmitMessage:
"تم تسجيل اسمك، شكراً لك.
العرض ليلة الجمعة ١٧ محرم (٢٠٢٦/٧/٢) الساعة ٨:٣٠ مساءً.
يُغلق باب صالة العرض قبل ١٠ دقائق من بدايته — نرجو الحضور مبكراً."
```

Render the description above the form fields. The **"الحضور للرجال فقط"** line must be visually emphasized (e.g. bold / accent color) so it's not missed.

## 5. Pages & Routes

**Public**
- `/` — root. Reads `config.mode` in real-time:
  - `registration` → render the registration form (or a "registration closed" message if `registrationOpen` is false)
  - `live` → render the seat-availability board
- Successful submit shows a post-submission screen (inline state or `/submitted`) with `config.postSubmitMessage`.

**Admin (protected by Firebase Auth)**
- `/admin` — if not signed in, show login. Once signed in, show a dashboard with these sections (tabs or clearly separated):
  1. **الردود (Responses)** — live table of all registrations, total registrations count, CSV export.
  2. **العروض (Shows setup)** — create/edit/delete shows (name, order, capacity); reset each show's seats.
  3. **التحكم بالباب (Door control)** — the live panel (see §6.7).
  4. **وضع الموقع (Mode control)** — toggle public `mode`; open/close registration.

## 6. Feature Requirements

### 6.1 Registration form (public, registration mode)
- Google-Forms-style: a header card with the play **logo**, event name, and `description`, followed by the fields from `formConfig`, then a submit button.
- Client-side validation: **all fields required**; age is numeric; the confidence field must be one of the three options; **phone must be a valid Bahraini mobile number** — 8 digits starting with 3 or 6, optional `+973`/`973` prefix, ignoring spaces/dashes (suggested check after stripping non-digits except a leading `+`: `/^(?:\+?973)?[36]\d{7}$/`). Show a clear Arabic error message when invalid.
- On submit: write a doc to `responses` with `serverTimestamp()`, then show the post-submission screen.
- If `registrationOpen` is false, show a friendly closed message instead of the form.

### 6.2 Post-submission screen
- Clear success confirmation + render `config.postSubmitMessage` (admin-editable instructions).

### 6.3 Seat-availability board (public, live mode)
- Shows **all** shows (ordered) as glanceable cards: show name + seats remaining out of capacity.
- The **current show** (`config.currentShowId`) is clearly highlighted with a badge "العرض الحالي".
- Color-code remaining seats: green (plenty), amber (filling up), red / "اكتمل" when 0.
- Subscribes to `shows` and `config` in **real-time** — updates instantly when the door admin decrements.
- Accessible to everyone, no login. Mobile-first.

### 6.4 Admin authentication
- Firebase Auth email/password. Protect all `/admin` content behind auth. Admin accounts are created manually in the Firebase console.

### 6.5 Responses dashboard
- Real-time table of `responses` (newest first), columns driven by `formConfig`.
- Show the total registrations count (each registration is one attendee — men only, no party size). Optionally also show a breakdown of the "هل أنت متأكد من حضورك؟" answers (نعم / لست متأكد / لا) for a confidence-weighted headcount.
- CSV export of all responses.

### 6.6 Shows setup
- Create/edit/delete shows (name, order, capacity).
- Reset-seats action per show (sets `seatsRemaining = capacity`).

### 6.7 Door control panel (the core live tool)
- Selector to pick the **current show** (writes `config.currentShowId`).
- Large, prominent display of the selected show's `seatsRemaining` (real-time).
- A **big, easy-to-tap "-1" button** (volunteer taps it as each person enters). Each tap animates the count down for visual feedback.
- A smaller **"+1 / تراجع" undo button** for mistakes.
- Decrement must **floor at 0**; increment must **cap at capacity**.
- A **connection / sync indicator** and an "آخر تحديث" timestamp so the volunteer knows the count is live.
- Must remain usable offline (Firestore queues writes; UI updates optimistically).

### 6.8 Mode & registration control
- Toggle public `mode`: registration ↔ live.
- Open/close registration (`registrationOpen`).

## 7. Real-time & Concurrency
- Public board and door panel both use Firestore real-time snapshots.
- Seat decrement/increment must be **atomic and safe**: use a Firestore **transaction** that reads `seatsRemaining` and only decrements when > 0 (and only increments when < capacity), to avoid race conditions and negative/overflow values.
- Enable Firestore persistent local cache for offline resilience.

## 8. Firestore Security Rules
Provide a `firestore.rules` file:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /shows/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /responses/{doc} {
      allow create: if true;             // public form submission
      allow read, update, delete: if request.auth != null;
    }
  }
}
```
(Optional hardening: Firebase App Check to reduce form spam. Keep `create` open for v1.)

## 9. UI / Design Guidelines
**The full visual system is in `DESIGN.md` — follow it.** Summary:
- The whole app is **dark and cinematic** (brand "أوتاد"): a dark-green gradient base (`#0F2524` → `#071112`), deep-red accents (`#501D11` / `#30110D`), white text. This is **not** a light/white Google-Forms look — keep the clean Google-Forms *structure*, but dark themed.
- Fully **RTL** (`<html lang="ar" dir="rtl">`). Font: **Thmanyah Sans** (self-hosted), fallback **IBM Plex Sans Arabic**. Use Eastern Arabic numerals (٠١٢…) for displayed dates/times/seat counts.
- **Mobile-first** and responsive — most users and the door volunteer are on phones.
- Form: single-column, card-based structure, dark themed; logo (`/awtad-logo.png`) at the top; submit button in rust; "الحضور للرجال فقط" emphasized.
- Board: large seat numbers, status colors (see DESIGN.md), current-show highlighted with a rust badge.
- Door panel: oversized −1 button (rust) for one-handed thumb use; the live count is the visual centerpiece in large white numerals.

## 10. Project Setup
- Initialize a Next.js (App Router, TypeScript, Tailwind) project.
- Add Firebase config via env vars in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
- Centralize Firebase init (with persistent local cache) in `src/lib/firebase.ts`.
- Add brand assets per `DESIGN.md`: place `awtad-logo.png` in `public/`, self-host the Thmanyah Sans `.woff2` font via `@font-face` (with IBM Plex Sans Arabic as fallback from Google Fonts), and define the color tokens from DESIGN.md as CSS variables / Tailwind theme.

## 11. Suggested File Structure
```
src/
  app/
    layout.tsx          # lang=ar dir=rtl, font, providers
    page.tsx            # root: switch on config.mode
    submitted/page.tsx  # (optional) post-submit screen
    admin/page.tsx      # login + dashboard
    globals.css
  components/
    RegistrationForm.tsx
    PostSubmit.tsx
    SeatBoard.tsx
    admin/
      AdminLogin.tsx
      ResponsesTable.tsx
      ShowsSetup.tsx
      DoorControl.tsx
      ModeControl.tsx
  lib/
    firebase.ts
    formConfig.ts       # EDIT HERE to change form fields
    types.ts
  hooks/
    useConfig.ts        # realtime config/main
    useShows.ts         # realtime shows
firestore.rules
```

## 12. Acceptance Criteria
- [ ] Public root shows the form in registration mode and the seat board in live mode, switched by the admin.
- [ ] Form has logo + description + fields + submit, fully RTL Arabic, mobile-friendly; data saved to `responses`; success screen with admin message.
- [ ] Registration can be closed (shows a closed message).
- [ ] Admin login via Firebase Auth; `/admin` fully protected.
- [ ] Responses tab: live table + total registrations count + CSV export, driven by `formConfig`.
- [ ] Shows setup: add/edit/delete shows with capacity + reset seats.
- [ ] Door control: select current show; big real-time seat count; -1 and +1 buttons; floors at 0 and caps at capacity (transaction); offline-resilient; connection + last-updated indicator.
- [ ] Seat board: all shows with remaining seats, color-coded, real-time, current show highlighted.
- [ ] Mode control: switch registration ↔ live; open/close registration.
- [ ] `firestore.rules` implemented as specified.
- [ ] Admin can initialize config + shows on first run.

## 13. Out of Scope (v1)
- Visual form-builder (fields live in `formConfig.ts`).
- Payments, ticket printing, or per-seat selection (seat **counts** only).
- Multiple nights (single night, multiple shows only).
- SMS/email notifications.
