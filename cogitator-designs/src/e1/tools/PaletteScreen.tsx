import { ArrowRight, Layers, Plus, Search, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { KindIcon } from "../../glyphs";
import type { Kind } from "../../sample";
import { useWindowKeys, type Mode } from "../editor/shell";
import { EditorBehind } from "./common";

/**
 * The ⌘K palette as built in E1-5 (approved by the user 2026-11-25, A15): desktop-kit's dialog restyled to the gallery's
 * palette. Entries ranked starts-with, then word start, then contains (up to 8, then "n more"); commands that match,
 * up to 6, with their keys; then Search the dataset for "…" (⇧⌘F), which opens the dataset search with the text. Window
 * keys wait while it is open. Nothing found: what was searched, then the next steps (Search the dataset, Create entry …
 * drawn disabled, a layer that is off, Clear the search). The sidebar's Search item stays the dataset search; its
 * tooltip names ⌘K.
 */
export type PaletteState = "results" | "no-result";
export const paletteStates: PaletteState[] = ["results", "no-result"];

type Row = { kind: Kind; name: string; id: string; cost: string };
/** "ar": starts with, then a word starting with it, then containing it. */
const ranked: Row[] = [
  { kind: "model", name: "Archer", id: "iron-wardens:warden-archers/archer", cost: "9" },
  { kind: "unit", name: "Warden Archers", id: "iron-wardens:warden-archers", cost: "22" },
  { kind: "unit", name: "Warden Squad", id: "iron-wardens:warden-squad", cost: "18" },
  { kind: "unit", name: "Warden Captain", id: "iron-wardens:warden-captain", cost: "45" },
  { kind: "model", name: "Warden", id: "iron-wardens:warden-squad/warden", cost: "8" },
  { kind: "unit", name: "Shield Bearers", id: "iron-wardens:shield-bearers", cost: "30" },
  { kind: "upgrade", name: "Spear", id: "iron-wardens:spear", cost: "0" },
  { kind: "unit", name: "Ice Guard", id: "frost-wardens:ice-guard", cost: "24" },
];
const MORE = 2;

function mark(name: string, q: string): ReactNode {
  const i = name.toLowerCase().indexOf(q);
  return i < 0 ? name : <>{name.slice(0, i)}<mark>{name.slice(i, i + q.length)}</mark>{name.slice(i + q.length)}</>;
}

export function PaletteScreen({ mode, state = "results", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (paletteStates.includes(state as PaletteState) ? state : "results") as PaletteState;
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState(s === "no-result" ? "halbred" : "ar");
  const [sel, setSel] = useState(0);
  const keys = useRef({ esc: () => undefined as void, open: () => undefined as void });
  keys.current = { esc: () => setOpen(false), open: () => setOpen(true) };
  const claim = useWindowKeys(interactive, (event) => {
    if (event.key === "Escape") keys.current.esc();
    if (event.metaKey && event.key.toLowerCase() === "k") { event.preventDefault(); keys.current.open(); }
  });

  const q = query.trim().toLowerCase();
  const empty = s === "no-result" || !q;
  const rows = empty ? [] : ranked;
  const searchRow = (selected: boolean) => (
    <button type="button" className={`cg-pal-row${selected ? " selected" : ""}`} title="Open the dataset search with this text (⇧⌘F)">
      <Search size={15} /><strong>Search the dataset for “{query.trim()}”</strong><span className="cg-pal-end"><kbd>⇧⌘F</kbd></span>
    </button>
  );

  const palette = (
    <div className="cg-palette cg-ed-palette" role="dialog" aria-label="Go to an entry or run a command" onClick={(e) => e.stopPropagation()}>
      <div className="cg-pal-input"><Search size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); setSel(0); }} aria-label="Entries and commands" readOnly={!interactive} /><span className="cg-pal-scope">All</span><kbd>Esc</kbd></div>
      {empty ? (
        <div className="cg-pal-body">
          <p className="cg-pal-empty">Nothing matches “{query.trim()}”. Searched 28 entries in 4 sources and the commands; Draft points is off, so its entries weren’t searched.</p>
          <div className="cg-pal-group">Next steps</div>
          {searchRow(true)}
          <button type="button" className="cg-pal-row" disabled title="Create entry is in no slice yet"><Plus size={15} /><strong>Create entry <span className="mono">{q.replace(/\s+/g, "-")}</span>…</strong></button>
          <button type="button" className="cg-pal-row" title="Turn Draft points on and search again"><Layers size={15} /><strong>Turn Draft points on and search again</strong></button>
          <button type="button" className="cg-pal-row" onClick={() => setQuery("")}><X size={15} /><strong>Clear the search</strong></button>
        </div>
      ) : (
        <div className="cg-pal-body" role="listbox" aria-label="Results">
          <div className="cg-pal-group">Entries</div>
          {rows.map((r, i) => (
            <button type="button" role="option" aria-selected={sel === i} key={r.id} className={`cg-pal-row${sel === i ? " selected" : ""}`} onClick={() => setSel(i)}>
              <KindIcon kind={r.kind} size={15} /><strong>{mark(r.name, q)}</strong><span className="mono">{r.id}</span><span className="cg-pal-end">{r.cost}</span>
            </button>
          ))}
          <p className="cg-pal-more d-muted">{MORE} more entries: type more, or search the dataset</p>
          <div className="cg-pal-group">Commands</div>
          <button type="button" role="option" aria-selected={false} className="cg-pal-row"><ArrowRight size={15} /><strong>{mark("Forward", q)}</strong><span className="cg-pal-end"><kbd>⌘]</kbd></span></button>
          <div className="cg-pal-group">Search</div>
          {searchRow(false)}
        </div>
      )}
      <div className="cg-pal-foot"><kbd>↑</kbd><kbd>↓</kbd><span>move</span><kbd>↵</kbd><span>open or run</span><kbd>Esc</kbd><span>close</span></div>
    </div>
  );

  return (
    <EditorBehind mode={mode} interactive={interactive} onClaim={claim} modal={open}
      overlay={open ? <div className="cg-scrim" onClick={() => setOpen(false)}>{palette}</div> : null} />
  );
}
