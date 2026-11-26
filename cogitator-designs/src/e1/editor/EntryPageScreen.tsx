import { ArrowDownLeft, CornerDownLeft, Layers, X, Code2 } from "lucide-react";
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { KindIcon } from "../../glyphs";
import { M, pageFor, sourceById } from "../../directions/direction-d-content";
import { HelperBox } from "../../directions/DirectionD";
import { layout } from "../../language/layout";
import { allDiagnostics, blockEnd, ironWardens, lineOf, place } from "./data";
import { CodeHead, CodeStatus, CodeView } from "./code";
import { flagsFrom, LinkedPage } from "./page";
import { Pill } from "./parts";
import { BackForward, Sidebar, SourceList, Win, type Mode } from "./shell";
import { TEXT_MIN } from "./SourceScreen";
import { PageTools, Tip } from "./toolbar";
import "./feedback.css";

/**
 * The entry page after the user's feedback of 2026-11-26 (approved Proposals FB1, FB7, FB8, FB9), drawn on the E1 editor
 * shell: the page toolbar with icon buttons, Source and Run, and a ⋯ menu (FB1); the text-pack text on the page, a
 * rule's text as a Text block and the text behind `$` resolved (FB7); drag handles on the sidebar, the source list and
 * the page / text split (FB8); a profile cell edited in place (FB9). Static starting states, no focus on mount.
 */
export type EntryPageState = "toolbar" | "toolbar-menu" | "toolbar-tip" | "rule-text" | "label-text" | "resize-list" | "resize-split" | "cell-edit";
export const entryPageStates: EntryPageState[] = ["toolbar", "toolbar-menu", "toolbar-tip", "rule-text", "label-text", "resize-list", "resize-split", "cell-edit"];

const SQUAD = "iron-wardens:warden-squad";
const CAPTAIN = "iron-wardens:warden-captain";
const RULE = "demo-skirmish:shield-wall";
const PROFILE = lineOf(ironWardens, "profile warden: fighter | 5\" | 3 | 1");
const LABEL = lineOf(ironWardens, "label $");
const SQUAD_DECL = lineOf(ironWardens, "unit warden-squad");
const RULE_TEXT = "Models with this rule may lock shields. While locked, they cannot move.";
const RESIZE_HINT = "Drag to resize · double-click: back to the drawn width";

/** FB7: a text from the text pack, as a block under the properties: the label, the language, where it lives, then the text. */
export function TextBlock({ module, text, hover }: { module: string; text: string; hover?: boolean }) {
  return (
    <div className={`cg-textblock${hover ? " is-hover" : ""}`} role="button" tabIndex={0} aria-label={`Text, en, from the text pack ${module}/text/en.dkl: click to edit`} title="Edit the text in the text pack">
      <span className="cg-textblock-head"><strong>Text</strong><span className="cg-lang-tag">en</span><span>from the text pack</span><span className="mono">{module}/text/en.dkl</span><span className="cg-textblock-edit">Click to edit</span></span>
      <p>{text}</p>
    </div>
  );
}

/** Shield Wall's page: a rule has no statements yet, so its text block stands under the properties, then the `/` hint. */
function RulePage() {
  const page = pageFor(RULE);
  return (
    <article className="d-page cg-linked-page">
      <button type="button" className="cg-from" title="Back (⌘[)"><CornerDownLeft size={13} />From Warden Squad<kbd>⌘[</kbd></button>
      <div className="d-pageicon"><KindIcon kind="rule" size={28} /></div>
      <h1>{page.name}</h1>
      <p className="d-backlinks">
        <ArrowDownLeft size={14} />
        <button type="button" className="cg-backlinks-btn" title="List every place that refers to this entry (⇧F12)">{page.backlinks.length} backlinks<kbd>⇧F12</kbd></button>
        {page.backlinks.map((link) => <M key={link.label} to={link.to}>{link.label}</M>)}
      </p>
      <dl className="d-props">
        <div><dt><KindIcon kind="rule" size={14} />Kind</dt><dd>Rule<span className="d-muted"><span className="mono">{RULE}</span></span></dd></div>
        <div><dt><Layers size={14} />Layer</dt><dd>Base</dd></div>
      </dl>
      <TextBlock module="demo-skirmish" text={RULE_TEXT} />
      <div className="d-blocks">
        <div className="d-block i0 typing"><span className="d-tog-space" /><span className="d-slashbtn"><span className="d-slash">/</span><span className="d-placeholder">Type / to insert the first statement, or start with a keyword: <code>cost</code>, <code>model</code>, <code>cat</code>, <code>use</code></span></span></div>
      </div>
    </article>
  );
}

/** FB8: a drag handle on a pane edge (Direction D's `.d-resize`): drag, ← → when focused, double-click for the drawn width. */
function Handle({ x, label, value, min, max, active, tip, onChange, onReset, onDrag }: {
  x: number; label: string; value: number; min: number; max: number; active?: boolean; tip?: boolean;
  onChange: (w: number) => void; onReset: () => void; onDrag?: (on: boolean) => void;
}) {
  const start = useRef<{ x: number; w: number } | null>(null);
  const down = (event: ReactPointerEvent<HTMLDivElement>) => { start.current = { x: event.clientX, w: value }; event.currentTarget.setPointerCapture(event.pointerId); onDrag?.(true); };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => { if (start.current) onChange(Math.min(max, Math.max(min, start.current.w + event.clientX - start.current.x))); };
  const up = () => { start.current = null; onDrag?.(false); };
  const keys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); onChange(Math.min(max, Math.max(min, value + (event.key === "ArrowLeft" ? -8 : 8)))); }
  };
  return (
    <div className={`d-resize cg-fb-handle${active ? " is-active" : ""}`} style={{ left: x - 3 }} role="separator" aria-orientation="vertical" aria-label={label}
      aria-valuenow={Math.round(value)} aria-valuemin={min} aria-valuemax={max} tabIndex={0} title={tip ? undefined : RESIZE_HINT}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={onReset} onKeyDown={keys}>
      {tip ? <Tip name={RESIZE_HINT} /> : null}
    </div>
  );
}

export function EntryPageScreen({ mode, state = "toolbar", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (entryPageStates.includes(state as EntryPageState) ? state : "toolbar") as EntryPageState;
  const entry = s === "rule-text" ? RULE : s === "label-text" ? CAPTAIN : SQUAD;
  const split = s === "resize-split";
  const resizing = s === "resize-list";

  /* FB8: the sidebar and the list keep their drawn widths until dragged; the page keeps at least 480 px. */
  const [side, setSide] = useState<number>(layout.sidebar);
  const [list, setList] = useState<number>(resizing ? layout.sourceList + 34 : layout.sourceList);
  /* Which handle is held (the resize-list state starts mid-drag on the list's handle; resize-split shows the split's handle hovered). */
  const [drag, setDrag] = useState<"side" | "list" | "split" | null>(resizing ? "list" : split ? "split" : null);
  const [touched, setTouched] = useState(false);
  const hold = (id: "side" | "list" | "split") => (on: boolean) => { setDrag(on ? id : null); if (!on) setTouched(true); };
  const pageRoom = (other: number) => layout.windowDesign - other - layout.pageMin;
  const [pageW, setPageW] = useState(560);

  const pageIssues = allDiagnostics.filter((d) => d.where === entry || d.where.startsWith(`${entry}/`));
  const placed = allDiagnostics.map((d) => place(d)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.module === ironWardens.id));
  const listSource = s === "rule-text" ? sourceById("demo-skirmish")! : sourceById("iron-wardens")!;

  /* FB9: Attack on Warden Squad's profile table, in place; the keys under the table. */
  const cellEdit = s === "cell-edit" ? { [PROFILE]: { cell: 1, content: <>4<span className="cg-caret" aria-hidden /></> } } : undefined;
  const after: Record<number, ReactNode> = s === "cell-edit" ? {
    [PROFILE]: <p className="cg-cellhint"><kbd className="cg-kbd">Tab</kbd>next cell ·<kbd className="cg-kbd">⇧Tab</kbd>back ·<kbd className="cg-kbd">↵</kbd>save ·<kbd className="cg-kbd">Esc</kbd>cancel · one undo step per cell</p>,
  } : {};
  /* FB7: the text behind `$` shown resolved, with its language. */
  const texts = s === "label-text" ? { [LABEL]: "Squad leader" } : undefined;

  const page = s === "rule-text" ? <RulePage /> : (
    <LinkedPage key={s} id={entry} module={ironWardens} flags={flagsFrom(placed)} sel={split ? { line: SQUAD_DECL + 2, onSelect: () => undefined } : undefined}
      after={after} cellEdit={cellEdit} texts={texts} noTail={split} />
  );
  const helper = (
    <HelperBox noFixes issues={pageIssues} resolved={new Set()} elsewhere={allDiagnostics.length - pageIssues.length} checking="idle" onCollapse={() => undefined} onExpand={() => undefined}
      onFix={() => undefined} onUndo={() => undefined} onDiff={() => undefined} onAll={() => undefined} onChecks={() => undefined} onInsert={() => undefined} onProperties={() => undefined} />
  );

  const crumbs = s === "rule-text" ? <>Demo Skirmish<span>/</span>Shield Wall</> : s === "label-text" ? <>Iron Wardens<span>/</span>Warden Captain</> : <>Iron Wardens<span>/</span>Warden Squad</>;
  const main = (
    <main className="d-main" aria-label="Entry">
      <header className="d-top">
        <BackForward back={s === "rule-text" ? "Warden Squad" : undefined} />
        <span className="d-crumbs">{crumbs}</span>
        <span className="d-spacer" />
        <PageTools key={s} interactive={interactive} menu={s === "toolbar-menu"} tip={s === "toolbar-tip" ? "checks" : null} source={split} />
      </header>
      {split ? (
        <div className="cg-split cg-fb-split" style={{ gridTemplateColumns: `${pageW}px minmax(${TEXT_MIN}px, 1fr)` }}>
          <div className="cg-split-page" aria-label="Page">
            <Pill issues={pageIssues} className="cg-split-pill" />
            <div className="d-doc">{page}</div>
          </div>
          <div className="cg-split-text" aria-label="Source text">
            <CodeHead path={ironWardens.path} where={`Warden Squad, lines ${SQUAD_DECL}–${blockEnd(ironWardens.lines, SQUAD_DECL)}`}>
              <button type="button" className="d-ghost sm" title="Show the text alone (⌘⌥⇧U)"><Code2 size={14} />Text only</button>
              <button type="button" className="d-icon sm" aria-label="Close the text" title="Close the text: page only (⌘⌥U)"><X size={14} /></button>
            </CodeHead>
            <CodeView lines={ironWardens.lines} marks={placed.map((p) => ({ id: p.id, line: p.line, from: p.from, to: p.to, kind: p.kind }))} selected={[SQUAD_DECL + 2, SQUAD_DECL + 2]}
              label={`${ironWardens.path}, DKLPO text`} scrollTo={SQUAD_DECL} />
            <CodeStatus caret={{ line: SQUAD_DECL + 2, col: 2 }} fmt="clean" counts={{ preservation: 1, suggestion: 2 }} />
          </div>
          <Handle x={pageW} label="Resize the page and the text" value={pageW} min={layout.pageMin} max={layout.windowDesign - side - TEXT_MIN} active={drag === "split"}
            onChange={setPageW} onReset={() => { setPageW(560); setDrag(null); }} onDrag={hold("split")} />
        </div>
      ) : (
        <div className="d-scroll helper-floating">
          <div className="d-doc">{page}</div>
          {helper}
        </div>
      )}
    </main>
  );

  const columns = `${side}px ${split ? 0 : list}px minmax(${layout.pageMin}px, 1fr) 0px`;
  return (
    <Win mode={mode} interactive={interactive}>
      <div className={`d-grid cg-fb-grid${drag === "side" || drag === "list" ? " dragging" : ""}`} style={{ gridTemplateColumns: columns }}
        onPointerDownCapture={(event) => { if (drag && !(event.target as HTMLElement).closest(".cg-fb-handle")) { setDrag(null); setTouched(true); } }}>
        <Sidebar width={side} source={split ? null : listSource.id} entry={entry} updates={allDiagnostics.length} />
        {split ? <section className="d-src" aria-hidden /> : <SourceList width={list} source={listSource} entry={entry} />}
        {main}
        <aside className="d-panel" aria-hidden />
        <Handle x={side} label="Resize the sidebar" value={side} min={layout.sidebarMin} max={pageRoom(split ? 0 : list)} active={drag === "side"}
          onChange={setSide} onReset={() => { setSide(layout.sidebar); setDrag(null); }} onDrag={hold("side")} />
        {split ? null : (
          <Handle x={side + list} label="Resize the source list" value={list} min={layout.sourceListMin} max={pageRoom(side)} active={drag === "list"} tip={drag === "list" && !touched}
            onChange={setList} onReset={() => { setList(layout.sourceList); setDrag(null); setTouched(true); }} onDrag={hold("list")} />
        )}
      </div>
    </Win>
  );
}
