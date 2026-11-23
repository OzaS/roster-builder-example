import type { ReactNode } from "react";

/** Theme and platform of one drawn E1 screen. */
export type E1Mode = "light" | "dark";
export type E1Platform = "mac" | "windows";

/**
 * One E1 screen (D4 step 3) in the gallery: drawn at 1440 px (or `width`), in light and dark, optionally on Windows.
 * `group` heads the screen's section on the E1 page; `item` is its `next-track.json` id (every E1 screen is a Proposal).
 * `states` are named starting states shown side by side (`?view=frame&screen=<id>&state=<state>`); the first is the default.
 */
export type E1Screen = {
  id: string;
  group: string;
  title: string;
  summary: string;
  item: string;
  width?: number;
  platforms?: E1Platform[];
  states?: { id: string; title: string }[];
  /** Interactive screens keep their controls in the accessibility tree and get a "Try it" list. */
  tryIt?: { what: string; how: string }[];
  render: (props: { mode: E1Mode; platform: E1Platform; state?: string; interactive: boolean }) => ReactNode;
};
