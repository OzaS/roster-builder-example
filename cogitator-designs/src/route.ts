import { useSyncExternalStore } from "react";

/**
 * Gallery routing in the query string, so a copied link opens the same page:
 * `?page=d|language|elements|e1` (Direction D, the design language, the Elements view or the E1 screens, `&screen=<id>` for one; the removed `board`, `a`, `b`, `c` open D), `?theme=light|dark` (gallery theme; default follows the OS),
 * `?view=frame&direction=d&mode=dark` (Direction D's window alone at its 1440 px design width, for captures).
 * Direction D is interactive; `&state=default|collapsed|panel|focus|focus-panel` sets its starting layout in the frame view.
 * `?view=frame&screen=<id>&mode=dark&state=<state>&platform=windows`: one E1 screen alone at its design width.
 */
export type Page = "d" | "language" | "elements" | "e1";
const pages: Page[] = ["d", "language", "elements", "e1"];

const listeners = new Set<() => void>();
const read = () => (typeof window === "undefined" ? "" : window.location.search);
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
};

export function useSearch() {
  return new URLSearchParams(useSyncExternalStore(subscribe, read, read));
}

export function pageOf(params: URLSearchParams): Page {
  const value = params.get("page");
  return pages.includes(value as Page) ? (value as Page) : "d";
}

export function hrefFor(page: Page) {
  const url = new URL(window.location.href);
  if (page === "d") url.searchParams.delete("page");
  else url.searchParams.set("page", page);
  url.searchParams.delete("screen");
  url.hash = "";
  return url.pathname + url.search;
}

export function go(page: Page, anchor?: string) {
  window.history.pushState(window.history.state, "", hrefFor(page) + (anchor ? `#${anchor}` : ""));
  listeners.forEach((listener) => listener());
  if (anchor) document.getElementById(anchor)?.scrollIntoView();
  else window.scrollTo(0, 0);
}

/** Applies `?theme=` to the root element (CSS reads `data-theme`; without it the OS setting applies). */
export function applyTheme() {
  const theme = new URLSearchParams(window.location.search).get("theme");
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
}
