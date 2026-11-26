import { Code2, Ellipsis, Focus, Layers, ListChecks, Play } from "lucide-react";
import { useState, type ReactNode } from "react";
import "./feedback.css";

/**
 * The entry page's toolbar after the user's feedback of 2026-11-26 (FB1, option A, approved). Run checks and Layer
 * changes are icon buttons (Run checks has the checklist icon, so the play icon means only Run); a thin divider; Source
 * and Run keep their labels, Run is the accent button; a ⋯ button opens a menu (the context-menu primitive) that lists
 * every toolbar command with its key, Focus mode drawn disabled, and the palette's key. Keys leave the bar and appear in
 * tooltips (`cg-tip`); Focus leaves the bar; "Read-only" stays only in the sidebar footer. Below 1030 px of window,
 * Source and Run become their icons too (the existing narrow rule).
 */

export type ToolTip = "checks" | "layers" | "source" | "run" | "more";

const tips: Record<ToolTip, { name: string; key: string }> = {
  checks: { name: "Run checks", key: "⌘⇧C" },
  layers: { name: "Layer changes", key: "⌘⌥L" },
  source: { name: "Source beside the page", key: "⌘⌥U" },
  run: { name: "Run the dataset", key: "⌘R" },
  more: { name: "More page commands", key: "" },
};

/** A drawn tooltip: the command's name, then its key in muted text. Anchored under its button. */
export function Tip({ name, keys, className = "" }: { name: ReactNode; keys?: string; className?: string }) {
  return <span className={`cg-tip ${className}`} role="tooltip">{name}{keys ? <span className="cg-tip-key">{keys}</span> : null}</span>;
}

export function PageTools({ menu: menuAt = false, tip: tipAt = null, source = false, layers = false, interactive = true, onSource }: {
  menu?: boolean; tip?: ToolTip | null; source?: boolean; layers?: boolean; interactive?: boolean; onSource?: () => void;
}) {
  const [menu, setMenu] = useState(menuAt);
  const [tip, setTip] = useState<ToolTip | null>(tipAt);
  const [layersOn, setLayersOn] = useState(layers);
  const hover = (id: ToolTip) => interactive ? {
    onPointerEnter: () => setTip(id), onPointerLeave: () => setTip(tipAt), onFocus: () => setTip(id), onBlur: () => setTip(tipAt),
  } : {};
  const at = (id: ToolTip) => (tip === id && !menu ? <Tip name={tips[id].name} keys={tips[id].key || undefined} /> : null);
  return (
    <span className="cg-tb" role="group" aria-label="Page commands" onKeyDown={(event) => { if (event.key === "Escape") setMenu(false); }}>
      <span className="cg-tb-at">
        <button type="button" className="d-icon" aria-label="Run checks (⌘⇧C)" aria-keyshortcuts="Meta+Shift+C" {...hover("checks")}><ListChecks size={16} /></button>
        {at("checks")}
      </span>
      <span className="cg-tb-at">
        <button type="button" className={`d-icon${layersOn ? " on" : ""}`} aria-pressed={layersOn} aria-label="Layer changes: mark the values that layers change on this page (⌘⌥L)" aria-keyshortcuts="Meta+Alt+L"
          onClick={() => setLayersOn((v) => !v)} {...hover("layers")}><Layers size={16} /></button>
        {at("layers")}
      </span>
      <span className="cg-tb-sep" aria-hidden />
      <span className="cg-tb-at">
        <button type="button" className={`d-ghost${source ? " on" : ""}`} aria-pressed={source} aria-keyshortcuts="Meta+Alt+U" onClick={onSource} {...hover("source")}><Code2 size={14} />Source</button>
        {at("source")}
      </span>
      <span className="cg-tb-at">
        <button type="button" className="d-ghost cg-tb-run" aria-label="Run the dataset (⌘R)" aria-keyshortcuts="Meta+R" {...hover("run")}><Play size={14} fill="currentColor" />Run</button>
        {at("run")}
      </span>
      <span className="cg-tb-at">
        <button type="button" className={`d-icon${menu ? " cg-tb-open" : ""}`} aria-label="More page commands" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)} {...hover("more")}><Ellipsis size={16} /></button>
        {at("more")}
        {menu ? (
          <div className="cg-menu cg-tb-menu" role="menu" aria-label="Page commands">
            <button type="button" role="menuitem" className="cg-menu-item"><ListChecks size={15} />Run checks<span className="cg-menu-key">⌘⇧C</span></button>
            <button type="button" role="menuitem" className="cg-menu-item"><Layers size={15} />Layer changes<span className="cg-menu-key">⌘⌥L</span></button>
            <button type="button" role="menuitem" className="cg-menu-item"><Code2 size={15} />Source beside the page<span className="cg-menu-key">⌘⌥U</span></button>
            <button type="button" role="menuitem" className="cg-menu-item"><Play size={15} fill="currentColor" />Run the dataset<span className="cg-menu-key">⌘R</span></button>
            <div className="cg-menu-sep" role="separator" />
            <button type="button" role="menuitem" className="cg-menu-item" disabled title="Focus mode isn't built yet"><Focus size={15} />Focus mode<span className="cg-menu-key">⌘.</span></button>
            <p className="cg-menu-label cg-tb-menu-foot">Every command and its key: ⌘K</p>
          </div>
        ) : null}
      </span>
    </span>
  );
}
