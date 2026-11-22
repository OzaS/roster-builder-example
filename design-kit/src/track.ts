import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from "react";

/**
 * The design track (DEC-074 in the Battle Augur docs). "current" is what the product ships; "next" is everything designed
 * but not yet built, each item a Proposal or Approved (see `next.ts`).
 *
 * The track is one attribute on the root element (`<html data-look="next">`), so Next styles are scoped to
 * `:root[data-look="next"]` and every view follows the switch; markup that differs reads `useLook()`.
 * `?track=next|current` in the URL wins for that page load (the older `?look=` is still read). Switching writes `?track=next`
 * into the address, so a copied link opens the same track. Galleries on one origin pass their own storage key.
 */
export type DesignTrack = "current" | "next";

export type TrackStore = {
  getTrack: () => DesignTrack;
  setTrack: (next: DesignTrack) => void;
  /** The global track, ignoring pins (gallery chrome: the switch, the board, screen routing). */
  useTrack: () => DesignTrack;
  /** The track for design markup, honouring `PinLook`. */
  useLook: () => DesignTrack;
  /** True when design markup should draw the Next look. */
  useNextLook: () => boolean;
  /** Pins the track for a subtree: frames the Next styles don't cover keep the Current markup whatever the switch says. */
  PinLook: (props: { look: DesignTrack; children: ReactNode }) => ReturnType<typeof createElement>;
};

const isTrack = (value: unknown): value is DesignTrack => value === "current" || value === "next";

export function createTrack(storageKey: string): TrackStore {
  const listeners = new Set<() => void>();

  const initial = (): DesignTrack => {
    if (typeof window === "undefined") return "current";
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("track") ?? params.get("look");
    if (isTrack(fromUrl)) return fromUrl;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (isTrack(stored)) return stored;
    } catch {
      // Storage can be unavailable; Current is the fallback.
    }
    return "current";
  };

  let track = initial();
  const apply = () => {
    if (typeof document !== "undefined") document.documentElement.dataset.look = track;
  };
  apply();

  const writeUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("look");
      if (track === "next") url.searchParams.set("track", "next");
      else url.searchParams.delete("track");
      window.history.replaceState(window.history.state, "", url);
    } catch {
      // The address stays as it was; the switch still works.
    }
  };

  const getTrack = () => track;
  const setTrack = (next: DesignTrack) => {
    if (next === track) return;
    track = next;
    apply();
    writeUrl();
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // The switch still works for this page load.
    }
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const Pinned = createContext<DesignTrack | null>(null);
  const useTrack = () => useSyncExternalStore(subscribe, getTrack, getTrack);
  const useLook = () => {
    const global = useTrack();
    return useContext(Pinned) ?? global;
  };
  const useNextLook = () => useLook() === "next";
  const PinLook = ({ look, children }: { look: DesignTrack; children: ReactNode }) => createElement(Pinned.Provider, { value: look }, children);

  return { getTrack, setTrack, useTrack, useLook, useNextLook, PinLook };
}
