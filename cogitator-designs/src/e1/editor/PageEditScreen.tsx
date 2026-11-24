import { ArrowDown, ArrowUp, Box, Code2, EyeOff, Eye, Focus, Plus, Trash2, X } from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DiagIcon, KindIcon } from "../../glyphs";
import { sourceById } from "../../directions/direction-d-content";
import { HelperBox } from "../../directions/DirectionD";
import { layout } from "../../language/layout";
import { allDiagnostics, blockEnd, ironWardens, lineOf, place, type ModuleText } from "./data";
import { CodeHead, CodeStatus, CodeView } from "./code";
import { flagsFrom, LinkedPage } from "./page";
import { Pill } from "./parts";
import { BackForward, EditorGrid, Sidebar, SourceList, Win, type Mode } from "./shell";
import { TEXT_MIN } from "./SourceScreen";
import "./page-edit.css";

/**
 * Editing on the page (E1-3 as built, approved by the user 2026-11-24, P1–P4, P6, P7, P9, P41). Direction D's page
 * with the E1 editor's linked blocks: a value or the title edits in place in the accent-ringed `cg-editing` cell
 * ("↵ saves"); a selected statement is the text view's linked block (the selection tint, no focus ring over it);
 * the `/` menu opens after the selected statement; a right-click opens the statement's context menu; a refusal
 * stands beside the field, or in the top bar for remove, move and insert. Static states (no focus on mount).
 */
export type PageEditState = "edit-value" | "edit-title" | "field-refusal" | "selected" | "slash-after" | "inserted" | "context-menu" | "top-refusal";
export const pageEditStates: PageEditState[] = ["edit-value", "edit-title", "field-refusal", "selected", "slash-after", "inserted", "context-menu", "top-refusal"];

const ENTRY = "iron-wardens:warden-squad";
const SOURCE_KEY = lineOf(ironWardens, "x-bs.exampleReviewState: draft");
const GROUP = lineOf(ironWardens, "group weapon 1 default spear");
const SPEAR = lineOf(ironWardens, "use spear");
const NEW_LINE = "  upgrade new-upgrade ..1";
/** The module after Insert › Upgrade below the source key: the template's text with a fresh key as its placeholder. */
const inserted: ModuleText = { ...ironWardens, lines: [...ironWardens.lines.slice(0, SOURCE_KEY), NEW_LINE, ...ironWardens.lines.slice(SOURCE_KEY)] };

/** The `/` menu's list in a unit block: the design's five first (Cost left out: the unit has its cost), then every other statement valid there. */
const slashItems: { icon: ReactNode; name: string; syntax: string }[] = [
  { icon: <KindIcon kind="upgrade" size={15} />, name: "Upgrade", syntax: "upgrade key range" },
  { icon: <KindIcon kind="group" size={15} />, name: "Group", syntax: "group key n default ref" },
  { icon: <KindIcon kind="profile-type" size={15} />, name: "Profile", syntax: "profile key: type | values" },
  { icon: <EyeOff size={15} />, name: "Hide when", syntax: "hide when condition" },
  { icon: <KindIcon kind="model" size={15} />, name: "Model", syntax: "model key range" },
  { icon: <KindIcon kind="category" size={15} />, name: "Category", syntax: "cat category" },
  { icon: <KindIcon kind="rule" size={15} />, name: "Rule", syntax: "rule key" },
  { icon: <Box size={15} />, name: "Info group", syntax: "infogroup key" },
  { icon: <Box size={15} />, name: "Max", syntax: "max value" },
  { icon: <Box size={15} />, name: "Min", syntax: "min value" },
  { icon: <Eye size={15} />, name: "Show when", syntax: "show when condition" },
  { icon: <EyeOff size={15} />, name: "Hidden", syntax: "hidden" },
];

/** A field in place: the typed text, the caret, what follows the field, then "↵ saves" or the refusal in error red. */
function Field({ text, after, refused, strong = true }: { text: string; after?: ReactNode; refused?: string; strong?: boolean }) {
  return (
    <>
      {strong ? <strong className="num">{text}</strong> : <span>{text}</span>}<span className="cg-caret" aria-hidden />
      {after}
      {refused ? <span className="cg-peek-note cg-pe-refused"><DiagIcon kind="error" size={12} />{refused}</span> : <span className="d-muted">↵ saves</span>}
    </>
  );
}

export function PageEditScreen({ mode, state = "edit-value", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (pageEditStates.includes(state as PageEditState) ? state : "edit-value") as PageEditState;
  const split = s === "inserted";
  const module = split ? inserted : ironWardens;
  const lines = module.lines;
  const newLine = SOURCE_KEY + 1;
  const sel = s === "selected" ? GROUP : s === "slash-after" ? SOURCE_KEY : s === "inserted" ? newLine : s === "context-menu" || s === "top-refusal" ? SPEAR : null;
  const unsaved = s === "inserted" || s === "top-refusal";
  const placed = allDiagnostics.map((d) => place(d, lines)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.module === module.id));
  const pageIssues = allDiagnostics.filter((d) => d.where === ENTRY || d.where.startsWith(`${ENTRY}/`));

  /* The `/` menu after the selected source key; the window scrolls the page so the menu is in view. */
  const scroller = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = scroller.current;
    const at = el?.querySelector<HTMLElement>(".cg-pe-slash-at");
    if (el && at) el.scrollTop = Math.max(0, at.offsetTop - 120);
  }, [s]);

  const after: Record<number, ReactNode> = {};
  if (s === "slash-after") {
    after[SOURCE_KEY] = (
      <div className="cg-pe-slash-at">
        <div className="d-block i0 typing">
          <span className="d-tog-space" />
          <span className="d-slashbtn"><span className="d-slash">/</span><span className="d-caret" /><span className="d-placeholder">Type to filter statements</span></span>
        </div>
        <div className="d-slashmenu cg-pe-slashmenu" role="menu" aria-label="Insert a statement">
          <p>Valid in <span className="mono">unit warden-squad</span></p>
          {slashItems.map((item, index) => (
            <button type="button" role="menuitem" key={item.name} className={index === 0 ? "sel" : ""} tabIndex={interactive ? 0 : -1}>
              {item.icon}<span><strong>{item.name}</strong><small className="mono">{item.syntax}</small></span>{index === 0 ? <kbd>↵</kbd> : null}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (s === "context-menu") {
    after[SPEAR] = (
      <div className="cg-pe-menu-at">
        <div className="cg-menu cg-pe-menu" role="menu" aria-label="use spear">
          <p className="cg-menu-label mono">use spear</p>
          <button type="button" role="menuitem" className="cg-menu-item"><Plus size={15} />Insert below…<span className="cg-menu-key">/</span></button>
          <button type="button" role="menuitem" className="cg-menu-item" disabled title="Already the first statement of its block"><ArrowUp size={15} />Move up<span className="cg-menu-key">⌥↑</span></button>
          <button type="button" role="menuitem" className="cg-menu-item is-hover"><ArrowDown size={15} />Move down<span className="cg-menu-key">⌥↓</span></button>
          <div className="cg-menu-sep" role="separator" />
          <button type="button" role="menuitem" className="cg-menu-item danger"><Trash2 size={15} />Remove statement<span className="cg-menu-key">⌫</span></button>
        </div>
      </div>
    );
  }

  const propEdit: Record<string, ReactNode> = {};
  if (s === "edit-value") propEdit.Cost = <Field text="16" after={<span>pts</span>} />;
  if (s === "field-refusal") propEdit.Cost = <Field text="16 | 2" after={<span>pts</span>} refused="With this value the line would be another statement, not this setting" />;
  const titleEdit = s === "edit-title" ? <><span className="cg-pe-title-text">Warden Patrol</span><span className="cg-caret" aria-hidden /><span className="d-muted">↵ saves</span></> : undefined;

  const page = (
    <LinkedPage key={s} id={ENTRY} module={module} flags={flagsFrom(placed)} folded={split ? [lineOf(ironWardens, "upgrade banner ..1")] : []}
      sel={{ line: sel, onSelect: () => undefined }} after={after} propEdit={propEdit} titleEdit={titleEdit} noTail={split} />
  );

  const text = split ? (
    <div className="cg-split-text" aria-label="Source text">
      <CodeHead path={module.path} where={`Warden Squad, lines ${lineOf(ironWardens, "unit warden-squad")}–${blockEnd(lines, lineOf(ironWardens, "unit warden-squad"))}`}>
        <button type="button" className="d-ghost sm" title="Show the text alone (⌘⌥⇧U)"><Code2 size={14} />Text only</button>
        <button type="button" className="d-icon sm" aria-label="Close the text" title="Close the text: page only (⌘⌥U)"><X size={14} /></button>
      </CodeHead>
      <CodeView lines={lines} marks={placed.map((p) => ({ id: p.id, line: p.line, from: p.from, to: p.to, kind: p.kind }))} selected={[newLine, newLine]}
        caret={{ line: newLine, col: NEW_LINE.indexOf("new-upgrade") + "new-upgrade".length }} pick={{ line: newLine, from: NEW_LINE.indexOf("new-upgrade"), to: NEW_LINE.indexOf("new-upgrade") + "new-upgrade".length }}
        label={`${module.path}, DKLPO text`} scrollTo={newLine} />
      <CodeStatus caret={{ line: newLine, col: NEW_LINE.indexOf("new-upgrade") + "new-upgrade".length }} fmt="clean" counts={{ preservation: 1, suggestion: 2 }} />
    </div>
  ) : null;

  const status = s === "top-refusal"
    ? <span className="cg-pe-status" role="status"><DiagIcon kind="error" size={12} />It is the first statement of its block</span>
    : unsaved ? <span className="d-muted">Edited just now</span> : null;

  return (
    <Win mode={mode} interactive={interactive}>
      <EditorGrid
        side={<Sidebar source={split ? null : "iron-wardens"} entry={ENTRY} updates={allDiagnostics.length}
          foot={unsaved ? <><span className="d-dot cg-dot-warn" />Unsaved · 1 file</> : undefined} />}
        list={split ? undefined : <SourceList source={sourceById("iron-wardens")!} entry={ENTRY} />}>
        <main className="d-main" aria-label="Entry">
          <header className="d-top">
            <BackForward />
            <span className="d-crumbs">Iron Wardens<span>/</span>Warden Squad</span>
            <span className="d-spacer" />
            {status}
            <button type="button" className="d-ghost" title="Focus mode: hide the sidebar (⌘.)"><Focus size={14} />Focus<kbd>⌘.</kbd></button>
            <button type="button" className={`d-ghost${split ? " on" : ""}`} aria-pressed={split} title={split ? "Hide the text (⌘⌥U)" : "Show the DKLPO text beside the page (⌘⌥U)"}><Code2 size={14} />Source<kbd>⌘⌥U</kbd></button>
          </header>
          {split ? (
            <div className="cg-split" style={{ gridTemplateColumns: `minmax(${layout.pageMin}px, 1fr) minmax(${TEXT_MIN}px, 1.1fr)` }}>
              <div className="cg-split-page" aria-label="Page">
                <Pill issues={pageIssues} className="cg-split-pill" />
                <div className="d-doc">{page}</div>
              </div>
              {text}
            </div>
          ) : (
            <div className="d-scroll helper-floating" ref={scroller}>
              <div className="d-doc">{page}</div>
              <HelperBox noFixes issues={pageIssues} resolved={new Set()} elsewhere={allDiagnostics.length - pageIssues.length} checking="idle" onCollapse={() => undefined} onExpand={() => undefined}
                onFix={() => undefined} onUndo={() => undefined} onDiff={() => undefined} onAll={() => undefined} onChecks={() => undefined} onInsert={() => undefined} onProperties={() => undefined} />
            </div>
          )}
        </main>
      </EditorGrid>
    </Win>
  );
}
