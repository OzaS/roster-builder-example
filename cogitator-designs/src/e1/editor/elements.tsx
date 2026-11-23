import { Code2 } from "lucide-react";
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
};
