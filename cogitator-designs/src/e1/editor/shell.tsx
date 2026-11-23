import { ArrowLeft, ArrowRight, Bell, ChevronDown, ChevronRight, CircleAlert, FileText, Layers, Maximize2, Plus, Search, SlidersHorizontal, Table2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { TrafficLights } from "../../frames";
import { DiagIcon, KindIcon } from "../../glyphs";
import { diagOne } from "../../sample";
import { rowCount, sources, tables, type DSource } from "../../directions/direction-d-content";
import { layout } from "../../language/layout";
import "../../language/tokens.css";
import "../../language/primitives.css";
import "../../directions/direction-d.css";
import "./editor.css";

/**
 * The editor window of the E1 part B screens. It composes Direction D's parts and classes (`.fc-d`: sidebar, source list,
 * page toolbar, helper) instead of changing `DirectionD`, so D's own rendering stays byte-identical. Each screen passes
 * its page area (and, where it has one, a source list or a helper panel).
 */

export type Mode = "light" | "dark";

/** The window: Direction D's frame (`.fc-window.fc-d.fc-cg`) with the platform and large-text hooks of the design language. */
export function Win({ mode, width = layout.windowDesign, large, interactive = true, children, label }: { mode: Mode; width?: number; large?: boolean; interactive?: boolean; children: ReactNode; label?: string }) {
  return (
    <div className={`fc-window fc-d fc-cg cg-ed ${mode}${interactive ? "" : " static"}`} style={{ width, height: layout.windowHeight }} data-text={large ? "large" : undefined} aria-label={label}>
      {children}
    </div>
  );
}

export type SideProps = {
  /** Which top item is active (Search, Updates). */
  active?: "search" | "updates" | null;
  /** The source shown in the list (tint), the entry open on the page (bold). */
  source?: string | null;
  entry?: string | null;
  updates: number;
  /** A source that doesn't parse: an error icon instead of its entries in the tree. */
  broken?: string;
  onUpdates?: () => void;
  onSearch?: () => void;
  onSource?: (id: string) => void;
  onEntry?: (id: string) => void;
  foot?: ReactNode;
};

/** D's sidebar (B): dataset switcher, Search, Updates, Layers, the source tree, tables, text pack. */
export function Sidebar({ active, source, entry, updates, broken, onUpdates, onSearch, onSource, onEntry, foot }: SideProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set([entry?.split(":")[0] ?? "iron-wardens"]));
  return (
    <aside className="d-side" aria-label="Dataset sidebar">
      <div className="d-side-in" style={{ width: layout.sidebar }}>
        <div className="d-side-top"><TrafficLights /></div>
        <button type="button" className="d-ws" title="Switch dataset"><span className="d-ws-mark">D</span><strong>Demo Skirmish</strong><ChevronDown size={14} /></button>
        <button type="button" className={`d-item${active === "search" ? " active" : ""}`} onClick={onSearch} title="Search entries and commands (⌘K)"><Search size={15} />Search<kbd>⌘K</kbd></button>
        <button type="button" className={`d-item${active === "updates" ? " active" : ""}`} onClick={onUpdates} aria-pressed={active === "updates"} title="Open the diagnostics inbox (⌘⇧U)"><Bell size={15} />Updates{updates ? <span className="d-count">{updates}</span> : <span className="d-muted">None</span>}</button>
        <button type="button" className="d-item"><Layers size={15} />Layers<span className="d-muted">3 of 4</span></button>

        <h3>Sources</h3>
        {sources.map((s) => {
          const isOpen = expanded.has(s.id) && broken !== s.id;
          const children = s.groups.find((group) => group.label === "Units")?.rows ?? s.groups.filter((group) => group.label === "Forces" || group.label === "Rules").flatMap((group) => group.rows.slice(0, 1));
          return (
            <div key={s.id} className="d-tree-group">
              <div className={`d-item d-src-item${source === s.id ? " active" : ""}`}>
                <button type="button" className="d-tog" aria-label={`${isOpen ? "Collapse" : "Expand"} ${s.name} in the tree`} aria-expanded={isOpen} disabled={broken === s.id}
                  onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); return next; })}>
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                <button type="button" className="d-src-btn" aria-pressed={source === s.id} onClick={() => onSource?.(s.id)} title={broken === s.id ? `${s.name} doesn't parse: open its text` : `Open ${s.name} beside the page`}>
                  <KindIcon kind="system" size={15} />{s.name}
                  {broken === s.id ? <span className="d-muted cg-ed-broken" title="Doesn't parse"><CircleAlert size={13} />text only</span> : s.tag ? <span className="d-muted">{s.tag}</span> : null}
                </button>
              </div>
              {isOpen ? children.map((row) => (
                <button type="button" key={row.id} className={`d-item i1${entry === row.id ? " current" : ""}`} onClick={() => onEntry?.(row.id)}>
                  <span className="d-tog-space" /><KindIcon kind={row.kind} size={15} /><span className={row.noText ? "d-notext" : ""}>{row.name}</span>
                </button>
              )) : null}
            </div>
          );
        })}
        <button type="button" className="d-item d-add" title="New entry in the source shown in the list (⌘N)"><Plus size={14} />New entry</button>

        <h3>Tables</h3>
        {tables.map((t) => <button type="button" key={t.id} className="d-item"><Table2 size={15} />{t.name}<span className="d-muted">{rowCount(t)}</span></button>)}
        <button type="button" className="d-item"><FileText size={15} />Text pack · en</button>
        <footer className="d-side-foot">{foot ?? <><span className="d-dot" />Saved · fmt clean</>}</footer>
      </div>
    </aside>
  );
}

/** D's source column (A's dense grouped list with status edges and the cost column). */
export function SourceList({ source, entry, onEntry, onClose }: { source: DSource; entry?: string | null; onEntry?: (id: string) => void; onClose?: () => void }) {
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());
  return (
    <section className="d-src" aria-label={`${source.name} entries`}>
      <div className="d-src-in" style={{ width: layout.sourceList }}>
        <header className="d-src-head">
          {source.table ? <Table2 size={15} /> : <KindIcon kind="system" size={15} />}
          <strong>{source.name}</strong>
          <span className="d-muted">{rowCount(source)}</span>
          {source.tag ? <span className="d-layer">{source.tag}</span> : null}
          <span className="d-spacer" />
          <button type="button" className="d-icon" aria-label="Focus mode: hide the sidebar" title="Focus mode: hide the sidebar (⌘.)"><Maximize2 size={14} /></button>
          <button type="button" className="d-icon" onClick={onClose} aria-label={`Close ${source.name}`} title="Close the source list"><X size={15} /></button>
        </header>
        <div className="d-src-tools">
          <label className="d-filter"><Search size={13} /><input placeholder={`Filter ${source.name}`} aria-label={`Filter ${source.name}`} /></label>
          <button type="button" className="d-icon sm" aria-label="Display options" title="Display options"><SlidersHorizontal size={14} /></button>
        </div>
        <div className="d-colheads" aria-hidden><span>Name</span><span title="Changed by a layer">Layer</span><span>pts</span><span /></div>
        <div className="d-rows">
          {source.groups.map((group) => {
            const isFolded = folded.has(group.label);
            return (
              <div key={group.label} role="group" aria-label={group.label}>
                <button type="button" className="d-group" aria-expanded={!isFolded} onClick={() => setFolded((current) => { const next = new Set(current); if (next.has(group.label)) next.delete(group.label); else next.add(group.label); return next; })}>
                  {isFolded ? <ChevronRight size={13} /> : <ChevronDown size={13} />}{group.label}<span>{group.rows.length}</span>
                </button>
                {isFolded ? null : group.rows.map((row) => (
                  <button type="button" key={row.id} className={`d-row${row.id === entry ? " selected" : ""}${row.diag ? ` edge-${row.diag}` : ""}`} aria-current={row.id === entry ? "true" : undefined} onClick={() => onEntry?.(row.id)}>
                    <KindIcon kind={row.kind} size={14} />
                    <span className={`d-name${row.noText ? " d-notext" : ""}`}>{row.name}</span>
                    <span className={`d-changed${row.changed ? "" : " off"}`} title={row.changed ? `Changed by ${row.changed}` : undefined} />
                    <span className="d-cost num">{row.was !== undefined ? <s>{row.was}</s> : null}{row.cost ?? "–"}</span>
                    <span className="d-diag" title={row.diag ? diagOne[row.diag] : undefined}>{row.diag ? <DiagIcon kind={row.diag} size={13} /> : null}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <footer className="d-src-foot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>⌘.</kbd> focus <span className="d-spacer" />{source.tag ? `${source.tag} layer · by kind` : "Grouped by kind"}</footer>
      </div>
    </section>
  );
}

/** Back / Forward (⌘[ / ⌘]): history of the entries opened in this window. Disabled says why. */
export function BackForward({ back, forward, onBack, onForward }: { back?: string; forward?: string; onBack?: () => void; onForward?: () => void }) {
  return (
    <span className="cg-history" role="group" aria-label="History">
      <button type="button" className="d-icon" disabled={!back} onClick={onBack} aria-label={back ? `Back to ${back}` : "Back: nothing to go back to"} title={back ? `Back to ${back} (⌘[)` : "Nothing to go back to (⌘[)"}><ArrowLeft size={15} /></button>
      <button type="button" className="d-icon" disabled={!forward} onClick={onForward} aria-label={forward ? `Forward to ${forward}` : "Forward: nothing to go forward to"} title={forward ? `Forward to ${forward} (⌘])` : "Nothing to go forward to (⌘])"}><ArrowRight size={15} /></button>
    </span>
  );
}

/** The editor grid: sidebar, optional source list, the page area, optional helper panel (D's columns). */
export function EditorGrid({ side, list, panelWidth = 0, children, panel, hideSide }: { side: ReactNode; list?: ReactNode; panelWidth?: number; children: ReactNode; panel?: ReactNode; hideSide?: boolean }) {
  const columns = `${hideSide ? 0 : layout.sidebar}px ${list ? layout.sourceList : 0}px minmax(0, 1fr) ${panel ? panelWidth : 0}px`;
  return (
    <div className="d-grid" style={{ gridTemplateColumns: columns }}>
      {hideSide ? <aside className="d-side" aria-hidden /> : side}
      {list ?? <section className="d-src" aria-hidden />}
      {children}
      {panel ?? <aside className="d-panel" aria-hidden />}
    </div>
  );
}
