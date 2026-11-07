import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Bot, Castle, ChevronDown, ChevronRight, Compass, Crown, Feather, Gem, Handshake, Hexagon, Package, PawPrint, ScrollText, Shield, Star, Swords, Target, Truck, Users, VenetianMask, type LucideIcon } from "lucide-react";
import { matchCategorySymbol, type SymbolFamily, type SymbolIcon } from "../../data/categorySymbols";
import "./force-layout.css";

/**
 * Force / detachment Layout (F2 sections 2–3, approved 2026-11-07), shared by the phone page and the tablet and desktop panes.
 *
 * 1. Key: a row that starts folded ("Key · 15 categories", the symbols in use, a chevron). Opened, one row per category:
 *    symbol (with its letter), full name, base range. From 150 % text the range moves under the name.
 * 2. Chart: one tray per category with its rings and no name. Required slots are heavy spiked rings, optional ones thin rings;
 *    at most six rings, then +n, and +∞ for no maximum. The letter sits on the first ring.
 * 3. Legend: Required / Optional.
 * 4. "Base limit 0" disclosure (closed by default) with "Roster conditions may change these limits.", holding every category whose
 *    base maximum is 0. Never "Unavailable".
 * Tapping a group (phone, tablet) or hovering it (desktop) shows its full name, symbol, letter and base limit, outlines the group and
 * highlights its key row. Key and Base limit 0 list use two columns, filled column by column, when the Layout is 560 pt or wider.
 *
 * Symbols come from the word families (data/categorySymbols); letters A, B, C… are per view, in key order, and only on symbols that
 * repeat among the shown categories. Unmatched names get the hexagon (and a letter when it repeats).
 */
export type LayoutSlot = { category: string; min: number; max: number };
export type ShownSlot = LayoutSlot & { family: SymbolFamily; letter: string };

/** Gallery states: open the key or the Base limit 0 list, show the detail of one group, hover instead of tap (desktop). */
export type ForceLayoutState = { keyOpen?: boolean; zeroOpen?: boolean; tip?: string; hover?: boolean };
export const ForceLayoutContext = createContext<ForceLayoutState>({});

export const symbolIcons: Record<SymbolIcon, LucideIcon> = {
  feather: Feather, target: Target, swords: Swords, package: Package, crown: Crown, users: Users, shield: Shield, star: Star, gem: Gem,
  compass: Compass, bot: Bot, truck: Truck, "paw-print": PawPrint, castle: Castle, handshake: Handshake, "venetian-mask": VenetianMask,
  "scroll-text": ScrollText, hexagon: Hexagon,
};

export const rangeLabel = (min: number, max: number) => max < 0 ? `${min}+` : min === max ? `${min}` : `${min}–${max}`;

/** "1 required", "2 required, up to 4", "optional, up to 3", "optional, no maximum". */
export function slotWords(s: LayoutSlot) {
  const base = s.min > 0 ? `${s.min} required` : "optional";
  return s.max < 0 ? `${base}, no maximum` : s.max > s.min ? `${base}, up to ${s.max}` : base;
}
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const symbolName = (s: ShownSlot) => `${s.family.symbol}${s.letter ? ` ${s.letter}` : ""}`;
/** The words of a key row (and of a group while the key is folded): "Crown A. High Command. 1 required." */
export const keyRowWords = (s: ShownSlot) => `${symbolName(s)}. ${s.category}. ${sentence(slotWords(s))}.`;

/** Splits the slots into the shown ones (with per-view letters) and the base-zero ones. */
export function layoutSlots(slots: LayoutSlot[]) {
  const withFamily = slots.map((s) => ({ ...s, family: matchCategorySymbol(s.category) }));
  const shownRaw = withFamily.filter((s) => s.max !== 0);
  const uses = new Map<string, number>();
  shownRaw.forEach((s) => uses.set(s.family.icon, (uses.get(s.family.icon) ?? 0) + 1));
  const next = new Map<string, number>();
  const shown: ShownSlot[] = shownRaw.map((s) => {
    if ((uses.get(s.family.icon) ?? 0) < 2) return { ...s, letter: "" };
    const i = next.get(s.family.icon) ?? 0; next.set(s.family.icon, i + 1);
    return { ...s, letter: String.fromCharCode(65 + i) };
  });
  return { shown, zero: withFamily.filter((s) => s.max === 0) };
}

/** Rings for one group: required, optional (six at most), and the +n / +∞ pill. */
function rings(s: LayoutSlot) {
  const optional = s.max < 0 ? 1 : Math.max(0, s.max - s.min);
  const req = Math.min(s.min, 6);
  const opt = Math.min(optional, 6 - req);
  const left = s.min - req + optional - opt;
  return { req, opt, more: s.max < 0 ? "+∞" : left > 0 ? `+${left}` : null };
}

export function SymbolRing({ slot, size = "sym", required = false, letter = true }: { slot: ShownSlot; size?: "sym" | "chart"; required?: boolean; letter?: boolean }) {
  const Icon = symbolIcons[slot.family.icon];
  return <span className={`ux-lk-ring ux-fl-ring ${size === "sym" ? "sym" : ""} ${required ? "req" : ""}`}><Icon size={size === "sym" ? 15 : 18} />{letter && slot.letter ? <b className="ux-fl-letter">{slot.letter}</b> : null}</span>;
}

/** Two columns from 560 pt: the rows per column, and which item starts the second column. */
const columns = (n: number) => ({ style: { "--fl-rows": Math.ceil(n / 2) } as CSSProperties, second: Math.ceil(n / 2) });

export function ForceLayout({ slots, state, large = false }: { slots: LayoutSlot[]; state?: ForceLayoutState; /** Elements view: the 150 % key rows without zooming the page. */ large?: boolean }) {
  const demo = { ...useContext(ForceLayoutContext), ...state };
  const { shown, zero } = layoutSlots(slots);
  const [keyOpen, setKeyOpen] = useState(!!demo.keyOpen);
  const [zeroOpen, setZeroOpen] = useState(!!demo.zeroOpen);
  const [tip, setTip] = useState<string | null>(demo.tip ?? null);
  const [tipEnd, setTipEnd] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<string, HTMLElement>());
  const zeroNote = useId();
  // The detail opens toward the side with room: aligned to the group's start, or to its end in the right half of the chart.
  useLayoutEffect(() => {
    const el = tip ? groupRefs.current.get(tip) : undefined; const chart = chartRef.current;
    if (!el || !chart) return;
    const g = el.getBoundingClientRect(), c = chart.getBoundingClientRect();
    setTipEnd(g.left - c.left + 250 > c.width && g.left - c.left > c.width / 2);
  }, [tip]);
  // A tap outside the chart or Escape closes the detail.
  useEffect(() => {
    if (!tip || demo.hover) return;
    const down = (e: PointerEvent) => { if (!chartRef.current?.contains(e.target as Node)) setTip(null); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setTip(null); };
    document.addEventListener("pointerdown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [tip, demo.hover]);
  const icons = [...new Set(shown.map((s) => s.family.icon))];
  const keyCols = columns(shown.length), zeroCols = columns(zero.length);
  return <div className={`ux-fl ${large ? "large" : ""}`}>
    <div className="ux-5a-card ux-fl-card">
      {/* 1. Key: folded by default; the fold row is a button with its expanded state. */}
      <button type="button" className="ux-fl-keyhead" aria-expanded={keyOpen} aria-label={`Key, ${shown.length} ${shown.length === 1 ? "category" : "categories"}`} onClick={() => setKeyOpen((v) => !v)}>
        <strong>Key</strong><span className="ux-fl-count">{shown.length} {shown.length === 1 ? "category" : "categories"}</span>
        <span className="ux-fl-syms" aria-hidden>{icons.map((i) => { const Icon = symbolIcons[i as SymbolIcon]; return <Icon key={i} size={15} />; })}</span>
        <span className="ux-fl-chev" aria-hidden>{keyOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
      </button>
      {keyOpen ? <ul className="ux-fl-key" style={keyCols.style} aria-label="Key">
        {shown.map((s, i) => <li key={s.category} className={`ux-fl-krow ${tip === s.category ? "hl" : ""} ${i === keyCols.second ? "col2" : ""}`} aria-label={keyRowWords(s)}>
          <SymbolRing slot={s} /><span className="ux-fl-name" aria-hidden>{s.category}</span><span className="ux-fl-range" aria-hidden>{rangeLabel(s.min, s.max)}</span>
        </li>)}
      </ul> : null}
      {/* 2. Chart: hidden from screen readers while the key is open (the key says the same); folded, each group is one element. */}
      <div ref={chartRef} className="ux-fl-chart" role={keyOpen ? undefined : "list"} aria-label={keyOpen ? undefined : "Layout"} aria-hidden={keyOpen || undefined}>
        {shown.map((s) => {
          const r = rings(s); const open = tip === s.category;
          const all = [...Array.from({ length: r.req }, () => true), ...Array.from({ length: r.opt }, () => false)];
          return <div role={keyOpen ? undefined : "listitem"} key={s.category} className="ux-fl-cell">
            <button type="button" ref={(el) => { if (el) groupRefs.current.set(s.category, el); else groupRefs.current.delete(s.category); }}
              className={`ux-fl-group ${open ? "tap" : ""}`} tabIndex={keyOpen ? -1 : undefined} aria-label={keyRowWords(s)} aria-expanded={open}
              onClick={() => setTip(open && !demo.hover ? null : s.category)}
              onMouseEnter={demo.hover ? () => setTip(s.category) : undefined} onMouseLeave={demo.hover ? () => setTip(null) : undefined}
              onFocus={demo.hover ? () => setTip(s.category) : undefined} onBlur={demo.hover ? () => setTip(null) : undefined}>
              {all.map((req, i) => <SymbolRing key={i} slot={s} size="chart" required={req} letter={i === 0} />)}
              {r.more ? <span className="ux-lk-more">{r.more}</span> : null}
            </button>
            {open ? <span className={`ux-fl-tip ${tipEnd ? "end" : ""}`} role="tooltip">
              <b>{s.category}</b><span>{symbolName(s)} · {slotWords(s)}</span><small>Base limit {rangeLabel(s.min, s.max)}</small>
            </span> : null}
          </div>;
        })}
      </div>
      {/* 3. Legend. */}
      <div className="ux-lk-legend ux-fl-legend" aria-hidden><span><i className="ux-lk-ring req mini" />Required</span><span><i className="ux-lk-ring mini" />Optional</span></div>
      {/* 4. Base limit 0: every category whose base maximum is 0; roster conditions can raise it. */}
      {zero.length ? <>
        <button type="button" className="ux-fl-zero" aria-expanded={zeroOpen} aria-label={`Base limit 0, ${zero.length} ${zero.length === 1 ? "category" : "categories"}`} aria-describedby={zeroNote} onClick={() => setZeroOpen((v) => !v)}>
          <span className="ux-fl-zero-text"><strong>Base limit 0</strong><small id={zeroNote}>Roster conditions may change these limits.</small></span>
          <span className="ux-fl-badge" aria-hidden>{zero.length}</span>
          <span className="ux-fl-chev" aria-hidden>{zeroOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
        </button>
        {zeroOpen ? <ul className="ux-fl-zlist" style={zeroCols.style} aria-label="Base limit 0">
          {zero.map((s, i) => { const Icon = symbolIcons[s.family.icon]; return <li key={s.category} className={i === zeroCols.second ? "col2" : ""}><Icon size={15} aria-hidden />{s.category}</li>; })}
        </ul> : null}
      </> : null}
    </div>
  </div>;
}

/** One-line summary of a force's slots for link rows: the shown categories and how many sit at base limit 0. */
export function slotSummary(slots: LayoutSlot[]) {
  const shown = slots.filter((s) => s.max !== 0); const zero = slots.length - shown.length;
  const parts = shown.length > 5 ? [...shown.slice(0, 4).map((s) => `${s.category} ${rangeLabel(s.min, s.max)}`), `${shown.length - 4} more`] : shown.map((s) => `${s.category} ${rangeLabel(s.min, s.max)}`);
  return [...parts, ...(zero ? [`${zero} at base limit 0`] : [])].join(" · ");
}
