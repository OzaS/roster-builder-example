import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Draws its child at a fixed design width and scales it down to the available width (never up), so a 1440 px
 * window fits a narrow stage without horizontal scrolling. The outer box takes the scaled height. `interactive` keeps the
 * window's controls in the accessibility tree (a region instead of an image); clicks work through the scale either way.
 */
export function ScaledFrame({ width = 1440, children, label, interactive = false }: { width?: number; children: ReactNode; label?: string; interactive?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const measure = () => {
      if (!outer.current || !inner.current) return;
      const next = Math.min(1, outer.current.clientWidth / width);
      setScale(next);
      setHeight(inner.current.offsetHeight * next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (outer.current) observer.observe(outer.current);
    if (inner.current) observer.observe(inner.current);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div className="cg-scaled" ref={outer} style={{ height }} role={interactive ? "region" : "img"} aria-label={label}>
      <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: "0 0" }}>{children}</div>
    </div>
  );
}

/** A macOS window: rounded corners, shadow, traffic lights drawn by the screen's own chrome (`TrafficLights`). */
export function MacWindow({ children, mode, height = 900, className = "" }: { children: ReactNode; mode: "light" | "dark"; height?: number; className?: string }) {
  return (
    <div className={`fc-window ${mode} ${className}`} style={{ height }}>
      {children}
    </div>
  );
}

export function TrafficLights() {
  return <span className="fc-traffic" aria-hidden><i /><i /><i /></span>;
}

/**
 * Windows' own minimise / maximise / close (Electron titleBarOverlay), as in the Battle Augur desktop app (RK-03): 46 px
 * buttons at the far right of the header row, in the theme's chrome colours. System chrome, so hidden from the accessible tree.
 * `hover` draws one button in its hover state (the Elements view).
 */
export function WinCaption({ hover }: { hover?: "min" | "max" | "close" }) {
  return (
    <span className="cg-caption" aria-hidden title="Windows window controls (system)">
      <span className={`cg-caption-min${hover === "min" ? " is-hover" : ""}`}><svg viewBox="0 0 10 10"><path d="M0 5.5h10" /></svg></span>
      <span className={`cg-caption-max${hover === "max" ? " is-hover" : ""}`}><svg viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" rx="1" /></svg></span>
      <span className={`cg-caption-close${hover === "close" ? " is-hover" : ""}`}><svg viewBox="0 0 10 10"><path d="M0.5 0.5l9 9M9.5 0.5l-9 9" /></svg></span>
    </span>
  );
}
