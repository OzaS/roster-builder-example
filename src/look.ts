import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from "react";

/**
 * The global design look. "current" is the approved 1.0 design (DEC-051). "next" is a proposal under review:
 * the card-free look from the design review of 2026-11-11. Nothing under "next" is approved until the user says so.
 *
 * The look is one attribute on the root element (`<html data-look="next">`), so every library, the standalone
 * tablet and desktop routes, the board and the Elements view follow it. Styles for it live in `src/styles/next/`
 * and are scoped to `:root[data-look="next"]`; markup that differs reads `useLook()`.
 * `?look=next` or `?look=current` in the URL wins for that page load (review links, headless captures).
 */
export type DesignLook = "current" | "next";

const LOOK_KEY = "roster-builder.look.v1";
const listeners = new Set<() => void>();

function isLook(value: unknown): value is DesignLook {
  return value === "current" || value === "next";
}

function initialLook(): DesignLook {
  if (typeof window === "undefined") return "current";
  const fromUrl = new URLSearchParams(window.location.search).get("look");
  if (isLook(fromUrl)) return fromUrl;
  try {
    const stored = window.localStorage.getItem(LOOK_KEY);
    if (isLook(stored)) return stored;
  } catch {
    // Storage can be unavailable; the approved look is the fallback.
  }
  return "current";
}

let look: DesignLook = initialLook();

function apply() {
  if (typeof document !== "undefined") document.documentElement.dataset.look = look;
}

apply();

export function getLook(): DesignLook {
  return look;
}

export function setLook(next: DesignLook) {
  if (next === look) return;
  look = next;
  apply();
  try {
    window.localStorage.setItem(LOOK_KEY, next);
  } catch {
    // The switch still works for this page load.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Pins the look for a subtree: archived frames keep the approved markup whatever the switch says. */
const PinnedLook = createContext<DesignLook | null>(null);

export function PinLook({ look: pinned, children }: { look: DesignLook; children: ReactNode }) {
  return createElement(PinnedLook.Provider, { value: pinned }, children);
}

export function useLook(): DesignLook {
  const global = useSyncExternalStore(subscribe, getLook, getLook);
  return useContext(PinnedLook) ?? global;
}

/** True when the proposed look is on. */
export function useNextLook(): boolean {
  return useLook() === "next";
}
