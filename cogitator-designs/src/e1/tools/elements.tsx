import { Check, CircleAlert, RefreshCw, Users } from "lucide-react";
import type { ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { State, type Mode, type Platform } from "../../language/Specimen";
import { c1Differences, checkResults, exportReasons } from "./data";
import { ClassRow, ContractRow, Hunk } from "./common";
import "./tools.css";

/**
 * Elements view renderers for the tool primitives (E1 part 2, worker A): the check status button, the class row, the
 * contract row, the text / path field, the diff hunk and tree difference, the exactness reason row and the move
 * classification block. `ElementsPage` looks them up after its own tables; the entries are in `cogitator.design.json`.
 */
type Renderer = { paper?: "pane" | "surface" | "none"; wide?: boolean; render: (mode: Mode, platform: Platform) => ReactNode; after?: ReactNode };

const key = (platform: Platform, mac: string, win: string) => (platform === "mac" ? mac : win);

export const toolRenderers: Record<string, Renderer> = {
  "tools.check-status": {
    render: (_mode, platform) => {
      const k = <kbd>{key(platform, "⌘⇧C", "Ctrl+Shift+C")}</kbd>;
      return (
        <div className="cg-stack">
          <State label="Complete"><button type="button" className="d-ghost cg-tl-checkbtn"><Check size={14} className="d-ok" />Complete · 14:22{k}</button></State>
          <State label="Errors"><button type="button" className="d-ghost cg-tl-checkbtn"><DiagIcon kind="error" size={14} />2 errors · 14:22{k}</button></State>
          <State label="Doesn't compile"><button type="button" className="d-ghost cg-tl-checkbtn"><CircleAlert size={14} className="cg-err" />Doesn’t compile{k}</button></State>
          <State label="Running (open)"><button type="button" className="d-ghost cg-tl-checkbtn" aria-expanded><RefreshCw size={14} />Checking · compile 3 of 5 modules{k}</button></State>
          <State label="Out of date"><button type="button" className="d-ghost cg-tl-checkbtn"><span className="d-dot cg-dot-warn" />3 edits since 14:06{k}</button></State>
        </div>
      );
    },
  },
  "tools.class-row": {
    render: () => (
      <div className="cg-stack" style={{ width: 440 }}>
        <State label="Some, with codes" wide><ClassRow kind="error" n={2} codes={checkResults.failed.counts[0].codes} /></State>
        <State label="Zero (unavailable)" wide><ClassRow kind="preservation" n={0} codes={[]} /></State>
        <State label="Codes wrap" wide><ClassRow kind="suggestion" n={6} codes={checkResults.failed.counts[2].codes} /></State>
        <State label="Out of date (muted)" wide><ClassRow kind="error" n={2} codes={checkResults.failed.counts[0].codes} muted /></State>
      </div>
    ),
  },
  "tools.contract-row": {
    wide: true,
    render: () => (
      <div className="cg-stack" style={{ width: 620 }}>
        <State label="Equal" wide><ContractRow tag="C2" title="Semantic equivalence" what="norm of the import against norm of the converted dataset" v="equal" detail="412 entities · 0 differences" /></State>
        <State label="Different, selected" wide><ContractRow tag="C1" title="Source information" what="each document’s source tree against its original" v="different" detail="3 of 5 documents equal · 3 differences" selected onClick={() => undefined} /></State>
        <State label="Not run" wide><ContractRow tag="C3" title="Identical bytes" what="the kept original files" v="not-run" detail="Originals not kept" /></State>
        <State label="Refused" wide><ContractRow tag="C2" title="Semantic equivalence" what="norm of the import against norm of the converted dataset" v="refused" detail="The import stopped: a document of another game system" /></State>
      </div>
    ),
  },
  "tools.field": {
    render: () => (
      <div className="cg-stack" style={{ width: 360 }}>
        <State label="Path, with Choose…" wide><span className="cg-tl-pathrow"><span className="cg-tl-field mono">~/Datasets/skirmish-dklpo</span><button type="button" className="d-btn">Choose…</button></span></State>
        <State label="Focus, with a prefix" wide><span className="cg-tl-field mono focus"><span className="cg-tl-prefix">iron-wardens:</span><span>short-spear</span></span></State>
        <State label="Invalid" wide><span className="cg-tl-field mono bad"><span className="cg-tl-prefix">iron-wardens:</span><span>halberd</span></span></State>
        <State label="Plain text" wide><span className="cg-tl-field">1.0.0</span></State>
      </div>
    ),
  },
  "tools.hunk": {
    wide: true,
    render: () => (
      <div className="cg-stack" style={{ width: 620 }}>
        <State label="File hunk: removed / added with old line numbers" wide>
          <Hunk title={<><span className="mono">iron-wardens/text/en.dkl</span><span className="d-muted">edited · 2 text keys</span></>} edits={[{ line: 9, before: "spear: Spear", after: "short-spear: Spear" }, { line: 10, before: "spear/spear: Spear", after: "short-spear/spear: Spear" }]} />
        </State>
        <State label="Created file (added lines only)" wide>
          <Hunk title={<><span className="mono">moves.dkl</span><span className="d-muted">created · 1 record</span></>} edits={[{ line: 1, after: "moves" }, { line: 2, after: "3.2.0 iron-wardens:spear -> iron-wardens:short-spear" }]} />
        </State>
        <State label="Tree difference: class, path, before → after" wide>
          <div className="cg-diff cg-tl-hunk">
            {c1Differences["iron-wardens.cat"].slice(0, 1).map((x) => (
              <div key={x.path}>
                <p className="cg-diff-head"><span className={`cg-tl-cls ${x.cls}`}>{x.cls}</span><span className="mono">{x.path}</span></p>
                <p className="cg-diff-line del"><span className="cg-diff-sign">-</span><span>{x.a}</span></p>
                <p className="cg-diff-line add"><span className="cg-diff-sign">+</span><span>{x.b}</span></p>
              </div>
            ))}
          </div>
        </State>
        <State label="Class chips" wide><span className="cg-row-flex">{(["missing", "added", "changed", "moved"] as const).map((c) => <span key={c} className={`cg-tl-cls ${c}`}>{c}</span>)}</span></State>
      </div>
    ),
  },
  "tools.reason": {
    render: () => (
      <div className="cg-stack" style={{ width: 520 }}>
        <State label="Exact" wide><p className="cg-tl-exact-head ok"><Check size={15} />Exact: every document comes back as it was read</p></State>
        <State label="Not exact, counts" wide><p className="cg-tl-counts"><span><strong>28</strong> current</span><span className="warn"><strong>2</strong> stale</span><span className="warn"><strong>1</strong> unbound</span><span><strong>0</strong> conflicts</span></p></State>
        <State label="Reason row (preservation)" wide>
          <div className="cg-tl-reasons"><div className="cg-tl-reason"><p><DiagIcon kind="preservation" size={13} /><strong>{exportReasons[0].entry}</strong><span className="mono">{exportReasons[0].code}</span></p><button type="button" className="cg-linkbtn">Open</button><p>{exportReasons[0].what}</p></div></div>
        </State>
        <State label="Reason row (refusal)" wide>
          <div className="cg-tl-reasons"><div className="cg-tl-reason error"><p><DiagIcon kind="error" size={13} /><strong>Warden Captain › Cost</strong><span className="mono">export/level1</span></p><p>A computed cost: XML data files store a fixed cost per entry.</p></div></div>
        </State>
      </div>
    ),
  },
  "tools.classify": {
    wide: true,
    render: () => (
      <div className="cg-stack" style={{ width: 620 }}>
        <State label="Parent-preserving" wide>
          <div className="cg-tl-classify preserving">
            <p className="cg-tl-classify-head"><span className="cg-tl-kind">Parent-preserving</span><span>Same parent: a minor change.</span><span className="d-muted">records at 3.2.0</span></p>
            <p className="cg-tl-rosters"><Users size={14} /><span><strong>Rosters follow it.</strong> On open, a selection is rewritten to the new path and listed as moved.</span></p>
          </div>
        </State>
        <State label="Structural" wide>
          <div className="cg-tl-classify structural">
            <p className="cg-tl-classify-head"><span className="cg-tl-kind">Structural</span><span>A new parent selection: a minor version can’t carry it.</span><span className="d-muted">records at 4.0.0</span></p>
            <p className="cg-tl-rosters"><Users size={14} /><span><strong>Rosters keep it for review.</strong> The selection stays unresolved with “moved to …: add it again”.</span></p>
          </div>
        </State>
      </div>
    ),
  },
};
