import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const isBrowser = typeof window !== "undefined";

// Firestore with a persistent local cache so the door volunteer keeps working on
// flaky venue Wi-Fi and writes queue while offline. Only the browser has IndexedDB,
// and initializeFirestore may run only once per app — fall back to getFirestore on
// re-evaluation (Fast Refresh) or on the server.
function makeDb(): Firestore {
  try {
    if (!isBrowser) {
      return initializeFirestore(app, {});
    }
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = makeDb();
export const auth = getAuth(app);

// Local development against the Firebase Emulator Suite.
if (process.env.NEXT_PUBLIC_USE_EMULATOR === "1" && isBrowser) {
  const g = globalThis as unknown as { __awtadEmulator?: boolean };
  if (!g.__awtadEmulator) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    g.__awtadEmulator = true;
  }
}

export { app };
