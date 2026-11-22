import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from "react";

/**
 * The design track (DEC-074). "current" is what the app ships; "next" is everything designed but not yet built
 * (src/design-data/next-track.json), each item a Proposal or Approved. Nothing under "next" is built until it is Approved.
 *
 * The track is one attribute on the root element (`<html data-look="next">`; the attribute keeps its old name so the
 * Next styles in `src/styles/next/`, scoped to `:root[data-look="next"]`, stay as they are), so every library, the
 * standalone tablet and desktop routes, the board and the Elements view follow it; markup that differs reads `useLook()`.
 * `?track=next` or `?track=current` in the URL wins for that page load (review links, headless captures); the older
 * `?look=` is still read. Switching writes `?track=next` into the address, so a copied link opens the same track.
 */
export type DesignTrack = "current" | "next";
/** @deprecated Older name of {@link DesignTrack}. */
export type DesignLook = DesignTrack;

const TRACK_KEY = "roster-builder.look.v1";
const listeners = new Set<() => void>();

function isTrack(value: unknown): value is DesignTrack {
  return value === "current" || value === "next";
}

function initialTrack(): DesignTrack {
  if (typeof window === "undefined") return "current";
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("track") ?? params.get("look");
  if (isTrack(fromUrl)) return fromUrl;
  try {
    const stored = window.localStorage.getItem(TRACK_KEY);
    if (isTrack(stored)) return stored;
  } catch {
    // Storage can be unavailable; Current is the fallback.
  }
  return "current";
}

let track: DesignTrack = initialTrack();

function apply() {
  if (typeof document !== "undefined") document.documentElement.dataset.look = track;
}

apply();

function writeUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("look");
    if (track === "next") url.searchParams.set("track", "next");
    else url.searchParams.delete("track");
    window.history.replaceState(window.history.state, "", url);
  } catch {
    // The address stays as it was; the switch still works.
  }
}

export function getTrack(): DesignTrack {
  return track;
}

export function setTrack(next: DesignTrack) {
  if (next === track) return;
  track = next;
  apply();
  writeUrl();
  try {
    window.localStorage.setItem(TRACK_KEY, next);
  } catch {
    // The switch still works for this page load.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Pins the track for a subtree: frames the Next styles don't cover keep the Current markup whatever the switch says. */
const PinnedTrack = createContext<DesignTrack | null>(null);

export function PinLook({ look: pinned, children }: { look: DesignTrack; children: ReactNode }) {
  return createElement(PinnedTrack.Provider, { value: pinned }, children);
}

/** The global track, ignoring pins (gallery chrome: the switch, the board, screen routing). */
export function useTrack(): DesignTrack {
  return useSyncExternalStore(subscribe, getTrack, getTrack);
}

/** The track for design markup, honouring {@link PinLook}. */
export function useLook(): DesignTrack {
  const global = useTrack();
  return useContext(PinnedTrack) ?? global;
}

/** True when design markup should draw the Next look. */
export function useNextLook(): boolean {
  return useLook() === "next";
}

/** @deprecated Older names. */
export const getLook = getTrack;
export const setLook = setTrack;
