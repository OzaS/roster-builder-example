import { useSyncExternalStore } from "react";

/**
 * The gallery's one theme switch (rail: Light, Dark, Both). Light or Dark sets the gallery chrome's theme and draws every
 * screen, Direction D window and element specimen in that theme only, so a review goes through each design once; Both
 * draws them side by side as before (the chrome then follows the OS). The Design language page keeps its light and dark
 * columns: comparing the two themes' tokens is what it is for.
 *
 * Read from `?theme=light|dark|both`, else the last choice (localStorage), else the OS setting. A change updates `?theme=`
 * in place, so a copied link opens the same view. Frame links (`?view=frame&mode=…`) keep their own `mode`.
 */
export type GalleryTheme = "light" | "dark" | "both";
export type ShownMode = "light" | "dark";

const KEY = "cogitator-gallery-theme";
const themes: GalleryTheme[] = ["light", "dark", "both"];
const listeners = new Set<() => void>();

const isTheme = (value: unknown): value is GalleryTheme => themes.includes(value as GalleryTheme);

function initial(): GalleryTheme {
  if (typeof window === "undefined") return "light";
  const param = new URLSearchParams(window.location.search).get("theme");
  if (isTheme(param)) return param;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (isTheme(saved)) return saved;
  } catch { /* storage off: fall through to the OS */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let current: GalleryTheme = initial();

/** Sets `data-theme` on <html> for the chrome (CSS in styles.css); Both leaves it to the OS. */
export function applyTheme() {
  if (current === "both") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = current;
}

export function setGalleryTheme(theme: GalleryTheme) {
  if (theme === current) return;
  current = theme;
  try { window.localStorage.setItem(KEY, theme); } catch { /* storage off: the choice lasts this visit */ }
  const url = new URL(window.location.href);
  url.searchParams.set("theme", theme);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  applyTheme();
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const read = () => current;

export function useGalleryTheme() {
  return useSyncExternalStore(subscribe, read, read);
}

/** The themes the pages draw now: one, or both side by side. */
export function shownModes(theme: GalleryTheme = current): ShownMode[] {
  return theme === "both" ? ["light", "dark"] : [theme];
}
