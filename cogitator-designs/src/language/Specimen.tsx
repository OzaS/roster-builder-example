import { shownModes } from "../theme";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import "./tokens.css";
import "./primitives.css";
import "./gallery.css";

/** Helpers for the Design language and Elements pages: specimens drawn with the tokens, in a theme and a platform. */
export type Mode = "light" | "dark";
export type Platform = "mac" | "windows";
export const modes: Mode[] = ["light", "dark"];
export const platformLabel: Record<Platform, string> = { mac: "macOS", windows: "Windows" };

/**
 * A piece of a Field Cogitator window drawn alone: the token scope (`.fc-cg` + theme), the platform layer and
 * Direction D's primitive scope (`.fc-d`). `paper` is the background it sits on (surface for sidebar and panel pieces,
 * pane for list and page pieces, none for floating objects shown over a backdrop).
 */
export function Spec({ mode, platform = "mac", large, paper = "pane", className = "", style, children, specRef, label }: {
  mode: Mode; platform?: Platform; large?: boolean; paper?: "pane" | "surface" | "none"; className?: string; style?: CSSProperties; children: ReactNode; specRef?: RefObject<HTMLDivElement | null>; label?: string;
}) {
  return (
    <div
      ref={specRef}
      className={`fc-spec fc-cg fc-d ${mode} cg-spec paper-${paper} ${className}`}
      data-platform={platform === "windows" ? "windows" : undefined}
      data-text={large ? "large" : undefined}
      style={style}
      role={label ? "group" : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}

/**
 * One Elements entry's specimens: in the rail's theme (light and dark side by side on Both), and a row per platform where the platforms differ.
 * The children function draws the specimen for one theme and platform.
 */
export function Matrix({ platforms = ["mac"], paper = "pane", large, children, cellStyle, wide }: {
  platforms?: Platform[]; paper?: "pane" | "surface" | "none"; large?: boolean; cellStyle?: CSSProperties; wide?: boolean; children: (mode: Mode, platform: Platform) => ReactNode;
}) {
  return (
    <div className={`cg-matrix${wide ? " wide" : ""}`}>
      {platforms.map((platform) => shownModes().map((mode) => (
        <figure key={`${platform}-${mode}`} className="cg-cell">
          <figcaption>{platforms.length > 1 ? `${platformLabel[platform]} · ` : ""}{mode === "light" ? "Light" : "Dark"}</figcaption>
          <Spec mode={mode} platform={platform} paper={paper} large={large} style={cellStyle} label={`${platformLabel[platform]}, ${mode}`}>{children(mode, platform)}</Spec>
        </figure>
      )))}
    </div>
  );
}

/** A labelled state beside its siblings (default, hover, pressed, focus, disabled, selected, error). */
export function State({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`cg-state${wide ? " wide" : ""}`}>
      <span className="cg-state-label">{label}</span>
      {children}
    </div>
  );
}

/* ---------- Reading the tokens back (contrast ratios, live sizes) ---------- */

export type RGBA = [number, number, number, number];

/** Parses a computed colour: `rgb()`, `rgba()` or `color(srgb r g b / a)` (what Chrome returns for color-mix). */
export function parseColor(value: string): RGBA | undefined {
  const rgb = value.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  }
  const srgb = value.match(/color\(srgb ([^)]+)\)/);
  if (srgb) {
    const parts = srgb[1].split(/[\s/]+/).filter(Boolean).map(Number);
    return [parts[0] * 255, parts[1] * 255, parts[2] * 255, parts[3] ?? 1];
  }
  return undefined;
}

export const over = (top: RGBA, base: RGBA): RGBA => [0, 1, 2].map((i) => top[i] * top[3] + base[i] * (1 - top[3])).concat(1) as RGBA;

const channel = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = (c: RGBA) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
export function contrast(a: RGBA, b: RGBA) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export const hex = (c: RGBA) => `#${c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}${c[3] < 1 ? ` · ${Math.round(c[3] * 100)}%` : ""}`;

/**
 * Resolves colour tokens inside a specimen: each `[data-token]` element paints its token as background; after layout the
 * computed colours come back as a map. Re-reads when `deps` change.
 */
export function useTokenColors(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  const [colors, setColors] = useState<Record<string, RGBA>>({});
  useLayoutEffect(() => {
    if (!ref.current) return;
    const next: Record<string, RGBA> = {};
    ref.current.querySelectorAll<HTMLElement>("[data-token]").forEach((el) => {
      const parsed = parseColor(getComputedStyle(el).backgroundColor);
      if (parsed) next[el.dataset.token!] = parsed;
    });
    setColors(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return colors;
}

/** Reads length tokens (`--cg-row` and friends) from a specimen, in px. */
export function useTokenLengths(names: string[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, number>>({});
  useLayoutEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    setValues(Object.fromEntries(names.map((name) => [name, parseFloat(style.getPropertyValue(name))])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, values] as const;
}
