import { Check, Code2, CornerDownLeft, FileDiff, Focus, PictureInPicture2 } from "lucide-react";
import type { ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { diagLabel, type DiagKind, type Diagnostic } from "../../sample";
import { sourceById } from "../../directions/direction-d-content";
import { HelperBox } from "../../directions/DirectionD";
import { layout } from "../../language/layout";
import { allDiagnostics, ironWardens, placedIn } from "./data";
import { flagsFrom, LinkedPage } from "./page";
import { code, LATER_FIX } from "./parts";
import { BackForward, EditorGrid, Sidebar, SourceList, Win, type Mode } from "./shell";

/**
 * D's helper before diagnostics carry fixes (E1 as built, approved by the user 2026-11-24, P39: "make them disabled if
 * they do nothing"). The floating box's rows carry no fix buttons; in the panel the selected row shows Quick fix (or,
 * for a preservation failure, Show diff) drawn disabled: the design language's disabled button, never a live primary.
 * D's own box and panel keep their live buttons.
 */
export type HelperNoFixState = "box" | "panel-issues" | "panel-suggestions";
export const helperNoFixStates: HelperNoFixState[] = ["box", "panel-issues", "panel-suggestions"];

const ENTRY = "iron-wardens:warden-squad";
const LATER_EXPORT = "Comes with Roundtrip and Export (E1-5)";

export function HelperNoFixScreen({ mode, state = "box", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (helperNoFixStates.includes(state as HelperNoFixState) ? state : "box") as HelperNoFixState;
  const pageIssues = allDiagnostics.filter((d) => d.where === ENTRY || d.where.startsWith(`${ENTRY}/`));
  const panel = s !== "box";
  const tab = s === "panel-suggestions" ? "suggestions" : "issues";
  const selected = s === "panel-suggestions" ? "d4" : "d2";

  const row = (d: Diagnostic): ReactNode => (
    <div key={d.id} className={`d-issue edge-${d.kind}${d.id === selected ? " selected" : ""}`}>
      <p>{code(d.message)}</p>
      <p className="mono d-muted">{d.where}<span className="d-here"> · this entry</span></p>
      {d.id === selected ? (
        <span className="d-fix">
          {d.kind === "preservation"
            ? <button type="button" className="d-btn primary sm" disabled title={LATER_EXPORT}><FileDiff size={12} />Show diff</button>
            : <button type="button" className="d-btn primary sm" disabled title={LATER_FIX}><CornerDownLeft size={12} />Quick fix</button>}
        </span>
      ) : null}
    </div>
  );
  const kinds: DiagKind[] = tab === "issues" ? ["error", "preservation"] : ["suggestion"];
  const count = (k: "issues" | "suggestions") => pageIssues.filter((d) => (k === "issues" ? d.kind !== "suggestion" : d.kind === "suggestion")).length;
  const scoped = pageIssues.filter((d) => (tab === "issues" ? d.kind !== "suggestion" : d.kind === "suggestion"));

  const panelNode = panel ? (
    <aside className="d-panel" aria-label="Helper panel">
      <div className="d-resize" role="separator" aria-orientation="vertical" aria-label="Resize the helper panel" title="Drag to resize" />
      <div className="d-panel-in" style={{ width: layout.panel }}>
        <header className="d-ptabs">
          <div role="tablist" aria-label="Helper">
            {(["issues", "suggestions", "properties"] as const).map((t) => (
              <button type="button" role="tab" key={t} aria-selected={tab === t} className={tab === t ? "active" : ""}>
                {t === "issues" ? "Issues" : t === "suggestions" ? "Suggestions" : "Properties"}
                {t !== "properties" && count(t) ? <span className={`d-pcount ${t}`}>{count(t)}</span> : null}
              </button>
            ))}
          </div>
          <span className="d-spacer" />
          <button type="button" className="d-icon" aria-label="Back to the floating box" title="Back to the floating box (Esc)"><PictureInPicture2 size={15} /></button>
        </header>
        <div className="d-seg" role="radiogroup" aria-label="Scope">
          <button type="button" role="radio" aria-checked className="active">This entry <span className="d-muted">{scoped.length}</span></button>
          <button type="button" role="radio" aria-checked={false}>Dataset <span className="d-muted">{allDiagnostics.filter((d) => (tab === "issues" ? d.kind !== "suggestion" : d.kind === "suggestion")).length}</span></button>
        </div>
        <div className="d-pbody">
          {kinds.map((kind) => {
            const list = scoped.filter((d) => d.kind === kind);
            return (
              <section key={kind} className="d-igroup">
                <h3><DiagIcon kind={kind} size={13} />{diagLabel[kind]}<span className="d-muted">{list.length}</span></h3>
                {list.length ? list.map(row) : <p className="d-none"><Check size={13} />None on this entry</p>}
              </section>
            );
          })}
        </div>
        <footer className="d-pfoot"><kbd>Esc</kbd> back to the box · drag the left edge to resize</footer>
      </div>
    </aside>
  ) : undefined;

  return (
    <Win mode={mode} interactive={interactive}>
      <EditorGrid side={<Sidebar source="iron-wardens" entry={ENTRY} updates={allDiagnostics.length} />}
        list={<SourceList source={sourceById("iron-wardens")!} entry={ENTRY} />} panel={panelNode} panelWidth={layout.panel}>
        <main className="d-main" aria-label="Entry">
          <header className="d-top">
            <BackForward />
            <span className="d-crumbs">Iron Wardens<span>/</span>Warden Squad</span>
            <span className="d-spacer" />
            <button type="button" className="d-ghost" title="Focus mode: hide the sidebar (⌘.)"><Focus size={14} />Focus<kbd>⌘.</kbd></button>
            <button type="button" className="d-ghost" title="Show the DKLPO text beside the page (⌘⌥U)"><Code2 size={14} />Source<kbd>⌘⌥U</kbd></button>
          </header>
          <div className={`d-scroll helper-${panel ? "panel" : "floating"}`}>
            <div className="d-doc"><LinkedPage id={ENTRY} module={ironWardens} flags={flagsFrom(placedIn("iron-wardens"))} /></div>
            {panel ? null : (
              <HelperBox noFixes issues={pageIssues} resolved={new Set()} elsewhere={allDiagnostics.length - pageIssues.length} checking="idle" onCollapse={() => undefined} onExpand={() => undefined}
                onFix={() => undefined} onUndo={() => undefined} onDiff={() => undefined} onAll={() => undefined} onChecks={() => undefined} onInsert={() => undefined} onProperties={() => undefined} />
            )}
          </div>
        </main>
      </EditorGrid>
    </Win>
  );
}
