import { useSyncExternalStore } from "react";

/**
 * Gallery routing in the query string, so a copied link opens the same page:
 * `?page=board|a|b|c` (the mood board or a direction), `?theme=light|dark` (gallery theme; default follows the OS),
 * `?view=frame&direction=a&mode=dark` (one direction's window alone at its 1440 px design width, for captures).
 */
export type Page = "board" | "a" | "b" | "c";
const pages: Page[] = ["board", "a", "b", "c"];

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
  return pages.includes(value as Page) ? (value as Page) : "board";
}

export function hrefFor(page: Page) {
  const url = new URL(window.location.href);
  if (page === "board") url.searchParams.delete("page");
  else url.searchParams.set("page", page);
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
