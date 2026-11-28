import { Copy, Languages, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { HelperBox } from "../../directions/DirectionD";
import { sourceById } from "../../directions/direction-d-content";
import { DiagIcon } from "../../glyphs";
import { layout } from "../../language/layout";
import type { Diagnostic } from "../../sample";
import { allDiagnostics, ironWardens, lineOf, place } from "./data";
import { flagsFrom, LinkedPage, type CellDraw } from "./page";
import { BackForward, Sidebar, SourceList, Win, type Mode } from "./shell";
import { PageTools } from "./toolbar";
import "./feedback.css";

/**
 * FB9 round 2 (approved by the user 2026-11-27, review page battle-augur-captures/fb9-tables/review2): profile cells
 * edited like a spreadsheet. A cell is either selected (the accent outline) or being edited (the ring and the caret),
 * with a keys line for each mode (FB9-P3b); a refused save keeps the field and ends with "Esc discards" (FB9-P5b); a long
 * value wraps in its cell when shown and while edited (FB9-P6b, "wrap"); the cell's context menu turns a value into a
 * text-pack text and back (FB9-P4b). The long-value hint (states `hint-a`, `hint-b`) is a Proposal: it suggests moving a
 * long value into the text pack. Static starting states on Warden Squad's profile, no focus on mount.
 */
export type CellsState = "selected" | "editing" | "refused" | "wrap" | "wrap-edit" | "menu" | "text" | "hint-a" | "hint-b";
export const cellsStates: CellsState[] = ["selected", "editing", "refused", "wrap", "wrap-edit", "menu", "text", "hint-a", "hint-b"];

const SQUAD = "iron-wardens:warden-squad";
const PROFILE = lineOf(ironWardens, "profile warden: fighter | 5\" | 3 | 1");
const ATTACK = 1;
const LONG = "3, or 4 while the squad holds its banner and has not moved this turn";
const Caret = () => <span className="cg-caret" aria-hidden />;
const K = ({ children }: { children: ReactNode }) => <kbd className="cg-kbd">{children}</kbd>;

/** The keys line under the table: one for a selected cell, one while editing (FB9-P3b); each key stays with its words. */
const selectedKeys = <p className="cg-cellhint"><span><K>←</K><K>→</K><K>↑</K><K>↓</K> move</span>·<span>type to replace</span>·<span><K>↵</K> edit</span>·<span><K>Esc</K> back to the row</span></p>;
const editingKeys = <p className="cg-cellhint"><span><K>Tab</K> next cell</span>·<span><K>⇧Tab</K> back</span>·<span><K>↵</K> next row</span>·<span><K>Esc</K> cancel</span>·<span>one undo step per cell</span></p>;
const refusedKeys = <p className="cg-cellhint cg-cellhint-refused"><span className="cg-edit-refused"><DiagIcon kind="error" size={12} />The statement changed while editing; try again.</span><span className="d-muted">· <K>Esc</K> discards</span></p>;

/** FB9-P4b: the cell's context menu (right-click, or ⇧F10 / the context-menu key on a selected cell). */
function CellMenu() {
  return (
    <div className="cg-cellmenu-anchor">
      <div className="cg-menu cg-cellmenu" role="menu" aria-label="Attack · Warden">
        <p className="cg-menu-label">Attack · Warden</p>
        <button type="button" role="menuitem" className="cg-menu-item"><Pencil size={14} />Edit<span className="cg-menu-key">↵</span></button>
        <div className="cg-menu-sep" role="separator" />
        <button type="button" role="menuitem" className="cg-menu-item sel" title="Write $ in the cell and put its value in iron-wardens/text/en.dkl"><Languages size={14} />Turn into text · en</button>
        <button type="button" role="menuitem" className="cg-menu-item" disabled title="The cell is a plain value already"><Languages size={14} />Turn into plain value</button>
        <div className="cg-menu-sep" role="separator" />
        <button type="button" role="menuitem" className="cg-menu-item"><Copy size={14} />Copy value<span className="cg-menu-key">⌘C</span></button>
      </div>
    </div>
  );
}

/** Proposal A: a quiet glyph in the cell's corner; its tooltip names the move, a click opens the cell's menu at Turn into text. */
const HINT_TIP = "A long value: Turn into text · en moves it to the text pack (iron-wardens/text/en.dkl), where it can be translated. Click for the cell's menu.";

function cellFor(s: CellsState): CellDraw {
  switch (s) {
    case "selected": return { cell: ATTACK, content: "3", className: "cg-cell-selected", title: "Selected: type to replace, ↵ to edit" };
    case "editing": return { cell: ATTACK, content: <>4<Caret /></> };
    case "refused": return { cell: ATTACK, content: <>4<Caret /></> };
    case "wrap": return { cell: ATTACK, content: LONG, className: "cg-cell-long" };
    case "wrap-edit": return { cell: ATTACK, content: <span className="cg-cell-wrapfield">{LONG}<Caret /></span>, className: "cg-cell-editing cg-cell-long" };
    case "menu": return { cell: ATTACK, content: "3", className: "cg-cell-selected" };
    case "text": return { cell: ATTACK, content: <><span className="cg-pack-text">3</span><span className="cg-lang-tag" title="From the text pack iron-wardens/text/en.dkl">en</span></>, className: "cg-cell-selected cg-cell-text", title: "Click to edit the en text in iron-wardens/text/en.dkl" };
    case "hint-a": return { cell: ATTACK, content: <>{LONG}<span className="cg-cell-hint" role="img" aria-label="A long value: move it to the text pack" title={HINT_TIP}><Languages size={12} /></span></>, className: "cg-cell-long cg-cell-hinted", title: HINT_TIP };
    case "hint-b": return { cell: ATTACK, content: LONG, className: "cg-cell-long" };
  }
}

function afterFor(s: CellsState): ReactNode {
  switch (s) {
    case "selected": case "text": return selectedKeys;
    case "editing": case "wrap-edit": return editingKeys;
    case "refused": return refusedKeys;
    case "menu": return <>{selectedKeys}<CellMenu /></>;
    default: return null;
  }
}

/** Proposal B: the suggestion in the helper box, with Turn into text as its fix. */
const suggestion: Diagnostic = {
  id: "fb9-long-value", kind: "suggestion", code: "long-cell-value", where: SQUAD, layer: "Base",
  message: "Warden · Attack holds a long value: words to translate belong in the text pack", fix: "Turn into text · en",
};

export function CellsScreen({ mode, state = "selected", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (cellsStates.includes(state as CellsState) ? state : "selected") as CellsState;
  const placed = allDiagnostics.map((d) => place(d)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.module === ironWardens.id));
  const flags = { ...flagsFrom(placed), ...(s === "hint-b" ? { [PROFILE]: "suggestion" as const } : {}) };
  const pageIssues = allDiagnostics.filter((d) => d.where === SQUAD || d.where.startsWith(`${SQUAD}/`));
  const issues = s === "hint-b" ? [...pageIssues, suggestion] : pageIssues;
  const after = afterFor(s);
  const columns = `${layout.sidebar}px ${layout.sourceList}px minmax(${layout.pageMin}px, 1fr) 0px`;
  return (
    <Win mode={mode} interactive={interactive}>
      <div className="d-grid cg-fb-grid" style={{ gridTemplateColumns: columns }}>
        <Sidebar width={layout.sidebar} source="iron-wardens" entry={SQUAD} updates={allDiagnostics.length} />
        <SourceList width={layout.sourceList} source={sourceById("iron-wardens")!} entry={SQUAD} />
        <main className="d-main" aria-label="Entry">
          <header className="d-top">
            <BackForward />
            <span className="d-crumbs">Iron Wardens<span>/</span>Warden Squad</span>
            <span className="d-spacer" />
            <PageTools key={s} interactive={interactive} menu={false} tip={null} source={false} />
          </header>
          <div className="d-scroll helper-floating">
            <div className="d-doc">
              <LinkedPage key={s} id={SQUAD} module={ironWardens} flags={flags}
                cellEdit={{ [PROFILE]: cellFor(s) }} after={after ? { [PROFILE]: after } : {}} />
            </div>
            <HelperBox noFixes={s !== "hint-b"} issues={issues} resolved={new Set()} elsewhere={allDiagnostics.length - pageIssues.length} checking="idle"
              onCollapse={() => undefined} onExpand={() => undefined} onFix={() => undefined} onUndo={() => undefined} onDiff={() => undefined}
              onAll={() => undefined} onChecks={() => undefined} onInsert={() => undefined} onProperties={() => undefined} />
          </div>
        </main>
        <aside className="d-panel" aria-hidden />
      </div>
    </Win>
  );
}
