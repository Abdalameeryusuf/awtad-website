# أوتاد — Theatre Registration & Live Seating

Mobile-first, Arabic (RTL) web app for the one-night performance **أوتاد** at مأتم الإمام علي (ع), قرية بوري.

One public URL serves two modes (switched by the admin):

- **Registration** — a Google-Forms-style form to count expected attendance.
- **Live** — a real-time seat-availability board, while a door volunteer decrements the current show's seats from `/admin`.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Firebase (Firestore + Auth) with offline persistence. Deploy target: Vercel.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Public. Renders the form (registration mode) or the seat board (live mode) based on `config.mode`. |
| `/admin` | Firebase-Auth protected. Tabs: الردود (responses + CSV), العروض (shows setup), التحكم بالباب (door −1 control), وضع الموقع (mode + registration toggles). |

---

## Local development (with the Firebase Emulator Suite)

No real Firebase project needed — `.env.local` already points at a local emulator (project `demo-awtad`).

```bash
# 1. Install the Firebase CLI once (if you don't have it):
npm i -g firebase-tools        # or use: npx firebase-tools <cmd>

# 2. Start the emulators (Firestore :8080, Auth :9099, UI :4000):
npx firebase emulators:start

# 3. In another terminal, run the app:
npm run dev
```

Then:

1. Open the Emulator UI at <http://localhost:4000> → **Authentication** → **Add user** (email + password). This is your admin login.
2. Open <http://localhost:3000/admin>, sign in, and click **تهيئة الآن** to seed `config/main` + 3 shows (×165).
3. Use **وضع الموقع** to switch between registration and live; **التحكم بالباب** for the −1 control. Open `/` in another tab to see the public view update live.

> Emulator data is in-memory and resets on stop. Add `--export-on-exit ./.emu --import ./.emu` to persist between runs.

---

## Connecting a real Firebase project (production)

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Firestore Database** → create database (production mode).
3. **Build → Authentication** → enable **Email/Password**, then **Users → Add user** for each admin (accounts are created manually here — there is no public signup).
4. **Project settings → General → Your apps → Web app** → copy the config values into `.env.local` (see `.env.example`) and set `NEXT_PUBLIC_USE_EMULATOR=0`.
5. Deploy the security rules:
   ```bash
   firebase use --add          # select your real project (updates .firebaserc)
   firebase deploy --only firestore:rules
   ```
6. Run `npm run dev`, open `/admin`, sign in, and click **تهيئة الآن** to seed config + shows.

---

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel (framework auto-detected as Next.js).
2. In **Vercel → Settings → Environment Variables**, add the six `NEXT_PUBLIC_FIREBASE_*` values and `NEXT_PUBLIC_USE_EMULATOR=0`.
3. Deploy. Add the Vercel domain under **Firebase Auth → Settings → Authorized domains**.

---

## Editing the form fields

All form fields live in [`src/lib/formConfig.ts`](src/lib/formConfig.ts). Add/remove/reorder a field there and it propagates to the public form, the admin responses table, and the CSV export. No other changes needed.

The seed page content (event name, description, post-submit message, default shows) lives in [`src/lib/defaults.ts`](src/lib/defaults.ts). Design tokens are in [`src/app/globals.css`](src/app/globals.css); see `DESIGN.md`.

---

## Data model (Firestore)

- `config/main` — `eventName, logoUrl, description, postSubmitMessage, mode, registrationOpen, currentShowId`.
- `shows/{id}` — `name, order, capacity, seatsRemaining`.
- `responses/{id}` — `createdAt` + the form field values.

Seat decrement/increment uses a Firestore **transaction** (floors at 0, caps at capacity, race-safe) when online, and falls back to a queued atomic `increment` when offline.
