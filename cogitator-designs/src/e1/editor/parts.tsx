import { Check, CornerDownLeft, FileDiff, Lightbulb, Maximize2, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { diagOne, type DiagKind, type Diagnostic } from "../../sample";
import { plain } from "./data";

/** Shared small parts of the part B screens. */

export const code = (text: string) => text.split("`").map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));

/** Why a fix button that does nothing yet is drawn disabled (E1 as built, approved 2026-11-24, P30 and P39). */
export const LATER_FIX = "Quick fixes come with a later slice: diagnostics carry no fixes yet";

/** The quick-fix menu before diagnostics carry fixes (P30): the diagnostic's message and one disabled row. */
export function NoFixMenu({ message, code: name }: { message: string; code: string }) {
  return (
    <div className="cg-menu cg-fixmenu" role="menu" aria-label="Quick fixes">
      <p className="cg-menu-label">{code(message)}</p>
      <button type="button" role="menuitem" className="cg-menu-item" disabled title={LATER_FIX}><Wrench size={14} /><span>No quick fix for <span className="mono">dklpo/{name}</span> yet</span></button>
    </div>
  );
}

/** The helper collapsed to a pill (D's `.d-pill`), placed by the caller. */
export function Pill({ issues, onOpen, className = "" }: { issues: Diagnostic[]; onOpen?: () => void; className?: string }) {
  const counts = (["error", "preservation", "suggestion"] as DiagKind[]).map((kind) => ({ kind, n: issues.filter((d) => d.kind === kind).length })).filter((c) => c.n);
  const label = counts.length ? counts.map((c) => `${c.n} ${diagOne[c.kind].toLowerCase()}`).join(", ") : "no issues";
  return (
    <button type="button" className={`d-pill ${className}`} onClick={onOpen} aria-label={`Show the helper: ${label} on this page`} title="Show the helper box">
      {counts.length ? counts.map((c) => <span key={c.kind}><DiagIcon kind={c.kind} size={13} />{c.n}</span>) : <span><Check size={13} className="d-ok" />No issues</span>}
      <Maximize2 size={12} className="d-pill-open" />
    </button>
  );
}

/**
 * Hover / caret card for a diagnostic in the text: kind, code, message, the quick fix with its key (⌥↵ applies the first fix).
 * It floats, so it is raised (popover elevation).
 */
export function DiagCard({ list, onFix, onDiff, noFixes }: { list: Diagnostic[]; onFix?: (d: Diagnostic) => void; onDiff?: (d: Diagnostic) => void; noFixes?: boolean }) {
  return (
    <div className="cg-hovercard" role="tooltip">
      {list.map((d, index) => (
        <section key={d.id}>
          <p className="cg-hc-head"><DiagIcon kind={d.kind} size={13} /><strong>{diagOne[d.kind]}</strong><span className="mono">dklpo/{d.code}</span></p>
          <p className="cg-hc-msg">{code(d.message)}</p>
          <p className="cg-hc-actions">
            {noFixes ? (d.kind === "preservation"
              ? <button type="button" className="d-btn sm" disabled title="Comes with Roundtrip and Export (E1-5)"><FileDiff size={12} />Show diff</button>
              : <button type="button" className={`d-btn sm${index === 0 ? " primary" : ""}`} disabled title={LATER_FIX}><CornerDownLeft size={12} />Quick fix{index === 0 ? <kbd>⌥↵</kbd> : null}</button>)
            : d.kind === "preservation"
              ? <button type="button" className="d-btn sm" onClick={() => onDiff?.(d)}><FileDiff size={12} />Show diff</button>
              : <button type="button" className={`d-btn sm${index === 0 ? " primary" : ""}`} onClick={() => onFix?.(d)}><CornerDownLeft size={12} />{plain(d.fix ?? "")}{index === 0 ? <kbd>⌥↵</kbd> : null}</button>}
          </p>
        </section>
      ))}
      <p className="cg-hc-foot"><kbd>F8</kbd> next problem <kbd>⇧F8</kbd> previous</p>
    </div>
  );
}

/** The quick-fix menu at the caret (⌥↵): D's context menu primitive (`.cg-menu`), first fix selected. */
export function FixMenu({ title, items, onPick }: { title: ReactNode; items: { label: ReactNode; key?: string; icon?: "fix" | "idea"; hint?: string }[]; onPick?: (index: number) => void }) {
  return (
    <div className="cg-menu cg-fixmenu" role="menu" aria-label="Quick fixes">
      <p className="cg-menu-label">{title}</p>
      {items.map((item, index) => (
        <button type="button" role="menuitem" key={index} className={`cg-menu-item${index === 0 ? " sel" : ""}`} title={item.hint} onClick={() => onPick?.(index)}>
          {item.icon === "idea" ? <Lightbulb size={14} /> : <Wrench size={14} />}<span>{item.label}</span>{item.key ? <span className="cg-menu-key">{item.key}</span> : null}
        </button>
      ))}
    </div>
  );
}
