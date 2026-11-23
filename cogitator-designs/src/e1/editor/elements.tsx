import { Check, ChevronDown, Code2, FileDiff, RefreshCw, X } from "lucide-react";
import { KindIcon } from "../../glyphs";
import { code as codeText } from "./parts";
import type { ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { State, type Mode, type Platform } from "../../language/Specimen";
import { allDiagnostics, frostBroken, frostWardens, ironWardens, lineOf } from "./data";
import { CodeHead, CodeStatus, CodeView, type CodeMark } from "./code";
import { Blocks } from "./page";
import { DiagCard, FixMenu } from "./parts";
import { BacklinksPanel, Peek, Unresolved } from "./ReferencesScreen";
import { BackForward } from "./shell";
import "./editor.css";

/**
 * Elements view renderers for the part B primitives (code editor, diagnostic card, quick-fix menu, status line, linked
 * blocks, …). `ElementsPage` spreads them into its own renderer table; the entries are in `cogitator.design.json`.
 */
type Renderer = { paper?: "pane" | "surface" | "none"; wide?: boolean; render: (mode: Mode, platform: Platform) => ReactNode; after?: ReactNode };

const iron = ironWardens.lines;
const sq = lineOf(ironWardens, "unit warden-squad");
const marksIron: CodeMark[] = [
  { id: "d2", line: lineOf(ironWardens, "# review: second pass"), from: 2, to: 23, kind: "preservation" },
  { id: "d4", line: lineOf(ironWardens, "x-bs.exampleReviewState: draft"), from: 2, to: 25, kind: "suggestion" },
];
const halbred = lineOf(frostWardens, "use iron-wardens:halbred");
const marksFrost: CodeMark[] = [{ id: "d1", line: halbred, from: 10, to: 30, kind: "error" }];
const key = (platform: Platform, mac: string, win: string) => (platform === "mac" ? mac : win);

export const editorRenderers: Record<string, Renderer> = {
  "editor.code": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Selected block (synced with the page), caret, preservation and suggestion underlines" wide>
          <div className="cg-el-code"><CodeView lines={iron} start={sq} end={sq + 8} marks={marksIron} selected={[sq + 2, sq + 2]} caret={{ line: sq + 2, col: 2 }} label="Code editor specimen" compact /></div>
        </State>
        <State label="Error underline (wavy) with its gutter icon" wide>
          <div className="cg-el-code"><CodeView lines={frostWardens.lines} start={halbred - 3} end={halbred} marks={marksFrost} label="Code editor, error" compact /></div>
        </State>
        <State label="Parse error: shown under its line, with the fix" wide>
          <div className="cg-el-code"><CodeView lines={frostBroken.lines} start={halbred - 5} end={halbred - 3} marks={[{ id: "indent", line: halbred - 4, from: 0, to: 3, kind: "error" }]} caret={{ line: halbred - 4, col: 3 }} label="Code editor, parse error" compact
            inline={{ [halbred - 4]: <p><DiagIcon kind="error" size={13} /><strong>Parse error</strong><span className="mono">dklpo/indent</span><span>Indented 3 spaces: a level is exactly 2 spaces.</span><button type="button" className="d-btn sm primary">Indent to 4 spaces</button></p> }} /></div>
        </State>
      </div>
    ),
  },
  "editor.text-chrome": {
    wide: true,
    render: (_mode, platform) => (
      <div className="cg-stack cg-el-chrome">
        <State label="Text header: file, where the selection is, view buttons" wide>
          <div className="cg-el-bar"><CodeHead path="iron-wardens/module.dkl" where="Warden Squad, lines 13–27"><button type="button" className="d-ghost sm"><Code2 size={14} />Text only</button></CodeHead></div>
        </State>
        <State label="Status line: fmt clean" wide><div className="cg-el-bar"><CodeStatus caret={{ line: 15, col: 2 }} fmt="clean" counts={{ preservation: 1, suggestion: 4 }} /></div></State>
        <State label="Status line: fmt would change the file" wide><div className="cg-el-bar"><CodeStatus caret={{ line: 22, col: 10 }} fmt="changes" counts={{ error: 1 }} /></div></State>
        <State label={`Status line: the text doesn't parse (fmt waits; ${key(platform, "⌥↵", "Alt+Enter")} fixes)`} wide><div className="cg-el-bar"><CodeStatus caret={{ line: 18, col: 3 }} fmt="blocked" counts={{ error: 1 }}><span className="cg-status-err">Pages wait for a parse</span></CodeStatus></div></State>
      </div>
    ),
  },
  "editor.diag-card": {
    paper: "none",
    render: (_mode, platform) => (
      <div className="cg-row-flex">
        <State label="Hover card: one diagnostic, its fix first">
          <DiagCard list={allDiagnostics.filter((d) => d.id === "d4")} />
        </State>
        <State label="Two diagnostics on one line">
          <DiagCard list={allDiagnostics.filter((d) => d.id === "d2" || d.id === "d4")} />
        </State>
        <State label={`Quick-fix menu at the caret (${key(platform, "⌥↵", "Alt+Enter")})`}>
          <FixMenu title={<>Unknown reference <span className="mono">iron-wardens:halbred</span></>} items={[
            { label: <>Change to <span className="mono">iron-wardens:halberd</span></>, key: key(platform, "↵", "Enter") },
            { label: <>Change to <span className="mono">rime-blade</span></> },
            { label: <>Create upgrade <span className="mono">halbred</span> in Frost Wardens…</>, icon: "idea" },
          ]} />
        </State>
      </div>
    ),
  },
  "editor.linked-block": {
    render: () => (
      <div className="cg-col" style={{ width: 520 }}>
        <State label="Selected with its lines (line number shows); a flagged block keeps its status edge">
          <div className="d-blocks"><Blocks module={ironWardens} decl={sq} sel={{ line: lineOf(ironWardens, "group weapon 1 default spear"), onSelect: () => undefined }} flags={{ [sq + 2]: "preservation" }} folded={[lineOf(ironWardens, "upgrade banner ..1")]} /></div>
        </State>
      </div>
    ),
  },
  "editor.history": {
    render: (_mode, platform) => (
      <div className="cg-row-flex">
        <State label="Back available, nothing forward"><div className="d-top cg-el-top"><BackForward back="Warden Squad" /><span className="d-crumbs">Demo Skirmish<span>/</span>Shield Wall</span></div></State>
        <State label="Both available"><div className="d-top cg-el-top"><BackForward back="Warden Squad" forward="Spear" /><span className="d-crumbs">Iron Wardens<span>/</span>Halberd</span></div></State>
        <State label={`No history yet (${key(platform, "⌘[ / ⌘]", "Alt+Left / Alt+Right")})`}><div className="d-top cg-el-top"><BackForward /><span className="d-crumbs">Iron Wardens<span>/</span>Warden Squad</span></div></State>
      </div>
    ),
  },
  "editor.peek": {
    wide: true,
    render: () => (
      <div className="cg-stack" style={{ width: 640 }}>
        <State label="Page, editing in place" wide><Peek target="iron-wardens:spear" view="page" onView={() => undefined} onOpen={() => undefined} onClose={() => undefined} /></State>
        <State label="Text" wide><Peek target="iron-wardens:spear" view="text" onView={() => undefined} onOpen={() => undefined} onClose={() => undefined} /></State>
      </div>
    ),
  },
  "editor.backlinks": {
    paper: "surface",
    render: () => (
      <div className="cg-el-panel"><BacklinksPanel width={412} panelRef={{ current: null }} sel={1} onSel={() => undefined} onOpen={() => undefined} onClose={() => undefined} /></div>
    ),
  },
  "editor.unresolved": {
    paper: "none",
    render: () => <div className="cg-el-pop"><Unresolved keyText="iron-wardens:halbred" onFix={() => undefined} onClose={() => undefined} /></div>,
  },
  "inbox.row": {
    render: () => {
      const row = (kind: "error" | "preservation" | "suggestion", msg: string, entry: string, source: string, codeName: string, cls = "", layer?: string, extra?: ReactNode) => (
        <div className={`cg-ib-row edge-${kind} ${cls}`}>
          <p className="cg-ib-msg">{cls.includes("done") ? <><Check size={13} className="d-ok" />Applied: Remove line</> : codeText(msg)}</p>
          <p className="cg-ib-meta"><KindIcon kind="unit" size={13} /><span className="cg-ib-entry">{entry}</span><span className="mono">{source}</span>{layer ? <span className="d-layer">{layer}</span> : null}{extra}<span className="d-spacer" /><span className="mono cg-ib-codename">{codeName}</span></p>
        </div>
      );
      return (
        <div className="cg-col" style={{ width: 520 }}>
          <State label="Group heading, error row with a layer"><section className="cg-ib-group"><h3><DiagIcon kind="error" size={13} />Errors<span className="d-muted">2</span></h3>{row("error", "Unknown reference `halbred`", "Ice Guard", "Frost Wardens", "ref-unknown", "", "Frost Wardens")}</section></State>
          <State label="Selected (preservation)">{row("preservation", "Source comment moves below `x-bs.exampleReviewState` on export", "Warden Squad", "Iron Wardens", "order-changed", "selected")}</State>
          <State label="Hover, edited since the check">{row("suggestion", "`x-bs.exampleReviewState` is read by no rule", "Warden Squad", "Iron Wardens", "unread-key", "is-hover", undefined, <span className="cg-ib-edited">edited since the check</span>)}</State>
          <State label="Done (Undo in the detail)">{row("suggestion", "", "Spear", "Iron Wardens", "default-value", "done")}</State>
          <State label="Focus">{row("suggestion", "`cost pts 0` is the default", "Spear", "Iron Wardens", "default-value", "is-focus")}</State>
        </div>
      );
    },
  },
  "inbox.filters": {
    render: () => (
      <div className="cg-stack">
        <State label="Filter field and chips (dashed while All)" wide>
          <div className="cg-ib-filters cg-el-filters"><label className="d-filter cg-ib-search"><input placeholder="Filter messages and paths" aria-label="Filter" /></label>
            <span className="cg-chipwrap"><button type="button" className="cg-chip">Source<strong>All</strong><ChevronDown size={12} /></button></span>
            <span className="cg-chipwrap"><button type="button" className="cg-chip on">Layer<strong>Frost Wardens</strong><ChevronDown size={12} /></button><button type="button" className="cg-chip-x" aria-label="Clear the layer filter"><X size={12} /></button></span>
            <span className="cg-chipwrap"><button type="button" className="cg-chip is-hover">Code<strong>All</strong><ChevronDown size={12} /></button></span>
          </div>
        </State>
        <State label="Chip menu (a menu, so it floats)" wide>
          <div className="cg-menu" style={{ width: 240 }}>
            <button type="button" className="cg-menu-item">All codes<span className="cg-menu-key">10</span></button>
            <div className="cg-menu-sep" />
            <button type="button" className="cg-menu-item sel"><span className="mono">dklpo/default-value</span><span className="cg-menu-key">3</span></button>
            <button type="button" className="cg-menu-item"><span className="mono">dklpo/ref-unknown</span><span className="cg-menu-key">1</span></button>
          </div>
        </State>
      </div>
    ),
  },
  "inbox.diff": {
    render: () => (
      <div className="cg-stack" style={{ width: 520 }}>
        <State label="Export difference: removed, kept, added (sign and tint)" wide>
          <div className="cg-diff">
            <p className="cg-diff-head"><FileDiff size={13} />original<span>→</span>export<span className="d-spacer" />1 line moves</p>
            <p className="cg-diff-line del"><span className="cg-diff-sign">-</span><span>{"<!-- review: second pass -->"}</span></p>
            <p className="cg-diff-line"><span className="cg-diff-sign"> </span><span>{"<entry name=\"Warden Squad\" exampleReviewState=\"draft\">"}</span></p>
            <p className="cg-diff-line add"><span className="cg-diff-sign">+</span><span>{"  <!-- review: second pass -->"}</span></p>
          </div>
        </State>
        <State label="Out of date (inline note, not a card)" wide>
          <div className="cg-ib-stale" style={{ margin: 0 }}><RefreshCw size={14} /><p><strong>Out of date.</strong> 3 edits since the check at 14:06.</p><button type="button" className="d-btn sm primary">Run checks<kbd>⌘⇧C</kbd></button></div>
        </State>
      </div>
    ),
  },
  "editor.new-entry": {
    render: () => (
      <div className="cg-row-flex">
        <State label="Key valid">
          <div className="cg-col-318"><div className="cg-newrow"><p className="cg-newrow-label">New entry in Ember Guard</p><div className="cg-newrow-fields"><button type="button" className="cg-kindpick"><KindIcon kind="unit" size={14} />Unit<ChevronDown size={12} /></button><label className="cg-keyfield"><span className="mono d-muted">ember-guard:</span><input className="mono" defaultValue="ash-warden" aria-label="Key" /></label></div><p className="cg-newrow-help">The key is how references name it; the name goes in the text pack.</p><p className="cg-newrow-actions"><button type="button" className="d-btn sm primary">Create unit<kbd>↵</kbd></button><button type="button" className="d-btn sm">Cancel<kbd>Esc</kbd></button></p></div></div>
        </State>
        <State label="Key not valid (create disabled, says why)">
          <div className="cg-col-318"><div className="cg-newrow"><p className="cg-newrow-label">New entry in Ember Guard</p><div className="cg-newrow-fields"><button type="button" className="cg-kindpick"><KindIcon kind="unit" size={14} />Unit<ChevronDown size={12} /></button><label className="cg-keyfield bad"><span className="mono d-muted">ember-guard:</span><input className="mono" defaultValue="Ash Warden" aria-label="Key" /></label></div><p className="cg-newrow-help bad">A key is lower case: letters, digits and hyphens, starting with a letter.</p><p className="cg-newrow-actions"><button type="button" className="d-btn sm primary" disabled title="Fix the key first">Create unit<kbd>↵</kbd></button><button type="button" className="d-btn sm">Cancel<kbd>Esc</kbd></button></p></div></div>
        </State>
        <State label="Empty source list">
          <div className="cg-col-318"><div className="cg-listempty"><p><strong>No entries yet</strong></p><p className="d-muted">Ember Guard is an empty catalogue. Add a unit, a model or an upgrade; each becomes a page.</p><button type="button" className="d-btn sm primary">New entry<kbd>⌘N</kbd></button></div></div>
        </State>
      </div>
    ),
  },
};
