import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Draws its child at a fixed design width and scales it down to the available width (never up), so a 1440 px
 * window fits a narrow stage without horizontal scrolling. The outer box takes the scaled height.
 */
export function ScaledFrame({ width = 1440, children, label }: { width?: number; children: ReactNode; label?: string }) {
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
    <div className="cg-scaled" ref={outer} style={{ height }} role="img" aria-label={label}>
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
