/**
 * GitHub Pages serves the app under /<repo> (e.g. /awtad-website). This Next
 * version does NOT prepend `basePath` to a `next/image` `src` automatically
 * (see the basePath docs → "Images"), so we add it manually for public assets.
 *
 * Inlined at build time from NEXT_PUBLIC_BASE_PATH (set by the deploy workflow).
 * Empty for local dev and root-domain deploys.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public-folder path (e.g. "/awtad-logo.png") with the base path. */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
