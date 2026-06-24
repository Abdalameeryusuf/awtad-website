import localFont from "next/font/local";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

// Brand font (self-hosted, converted from the Thmanyah Sans .otf brand kit).
export const thmanyah = localFont({
  src: [
    { path: "../fonts/ThmanyahSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ThmanyahSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ThmanyahSans-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/ThmanyahSans-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-thmanyah",
  display: "swap",
});

// Fallback so Arabic still renders correctly if the brand font fails to load.
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});
