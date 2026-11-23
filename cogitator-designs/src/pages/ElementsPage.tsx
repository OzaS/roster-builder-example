import { TrackChip } from "@designs/kit";
import {
  ArrowDownLeft, Bell, Check, ChevronDown, ChevronRight, Code2, Copy, CornerDownLeft, CopyPlus, EyeOff, Focus, Layers, Maximize2, Minimize2, PanelRightOpen,
  PencilLine, PictureInPicture2, Play, Plus, Search, SlidersHorizontal, Table2, Trash2, Undo2, X, ClipboardPaste,
} from "lucide-react";
import type { ReactNode } from "react";
import design from "../design-data/cogitator.design.json";
import { TrafficLights, WinCaption } from "../frames";
import { DiagIcon, KindIcon } from "../glyphs";
import { Blk, M, TableBlk, issuesFor, pageFor } from "../directions/direction-d-content";
import { HelperBox } from "../directions/DirectionD";
import { Matrix, State, type Mode, type Platform } from "../language/Specimen";
import { diagOne, entry, type DiagKind, type Kind } from "../sample";
import { editorRenderers } from "../e1/editor/elements";

/* ---------- Small helpers ---------- */

const key = (platform: Platform, mac: string, win: string) => (platform === "mac" ? mac : win);
const noop = () => undefined;

type RowProps = { kind: Kind; name: string; cost?: number; was?: number; diag?: DiagKind; changed?: string; noText?: boolean; cls?: string };
function SrcRow({ kind, name, cost, was, diag, changed, noText, cls = "" }: RowProps) {
  return (
    <button type="button" className={`d-row${diag ? ` edge-${diag}` : ""} ${cls}`}>
      <KindIcon kind={kind} size={14} />
      <span className={`d-name${noText ? " d-notext" : ""}`}>{name}</span>
      <span className={`d-changed${changed ? "" : " off"}`} title={changed ? `Changed by ${changed}` : undefined} />
      <span className="d-cost num">{was !== undefined ? <s>{was}</s> : null}{cost ?? "–"}</span>
      <span className="d-diag" title={diag ? diagOne[diag] : undefined}>{diag ? <DiagIcon kind={diag} size={13} /> : null}</span>
    </button>
  );
}
const ColHeads = () => <div className="d-colheads" aria-hidden style={{ padding: "0 10px 0 12px" }}><span>Name</span><span>Layer</span><span>pts</span><span /></div>;

function PropRows({ cls }: { cls?: string }) {
  const page = pageFor(entry.full);
  return (
    <dl className="d-props">
      {page.props.slice(0, 3).map((prop, index) => <div key={prop.label}><dt>{prop.icon}{prop.label}</dt><dd className={index === 2 ? cls : undefined}>{prop.value}</dd></div>)}
      <div className="d-more"><dt><button type="button"><Plus size={14} />3 more properties</button></dt><dd /></div>
    </dl>
  );
}

/* ---------- Renderers, one per design-data entry ---------- */

type Renderer = { paper?: "pane" | "surface" | "none"; wide?: boolean; render: (mode: Mode, platform: Platform) => ReactNode; after?: ReactNode };

const renderers: Record<string, Renderer> = {
  "window.frame": {
    wide: true, paper: "none",
    render: (_mode, platform) => (
      <div className="cg-win" style={{ height: 200 }}>
        <div className="cg-win-body">
          <div className="cg-win-side">
            <div className="cg-win-side-top">
              {platform === "mac" ? <TrafficLights /> : <button type="button" className="d-ws" title="Switch dataset"><span className="d-ws-mark">D</span><strong>Demo Skirmish</strong><ChevronDown size={14} /></button>}
            </div>
            {platform === "mac" ? <button type="button" className="d-ws" title="Switch dataset"><span className="d-ws-mark">D</span><strong>Demo Skirmish</strong><ChevronDown size={14} /></button> : null}
            <button type="button" className="d-item"><Search size={15} />Search<kbd>{key(platform, "⌘K", "Ctrl+K")}</kbd></button>
            <button type="button" className="d-item"><Bell size={15} />Updates<span className="d-count">7</span></button>
            <button type="button" className="d-item"><Layers size={15} />Layers<span className="d-muted">3 of 4</span></button>
          </div>
          <div className="cg-win-main">
            <header className="cg-win-top">
              <span className="d-crumbs">Iron Wardens<span>/</span>Warden Squad</span>
              <span className="d-spacer" />
              <span className="d-muted">Edited just now</span>
              <button type="button" className="d-ghost"><Focus size={14} />Focus<kbd>{key(platform, "⌘.", "Ctrl+.")}</kbd></button>
              <button type="button" className="d-ghost"><Code2 size={14} />Source</button>
              {platform === "windows" ? <WinCaption /> : null}
            </header>
            <div style={{ padding: "8px 40px" }} className="d-page">
              <div className="d-pageicon"><KindIcon kind="unit" size={28} /></div>
              <h1>Warden Squad</h1>
            </div>
          </div>
        </div>
      </div>
    ),
    after: (
      <Matrix platforms={["windows"]} paper="pane">
        {() => (
          <div className="cg-row-flex">
            <State label="Caption, default"><span style={{ display: "flex", height: "var(--cg-header)" }}><WinCaption /></span></State>
            <State label="Minimise hover"><span style={{ display: "flex", height: "var(--cg-header)" }}><WinCaption hover="min" /></span></State>
            <State label="Close hover"><span style={{ display: "flex", height: "var(--cg-header)" }}><WinCaption hover="close" /></span></State>
          </div>
        )}
      </Matrix>
    ),
  },

  "sidebar.item": {
    paper: "surface",
    render: (_mode, platform) => (
      <div className="cg-row-flex">
        <div className="cg-col cg-col-232">
          <State label="Default, with a muted count"><button type="button" className="d-item"><Layers size={15} />Layers<span className="d-muted">3 of 4</span></button></State>
          <State label="Hover"><button type="button" className="d-item is-hover"><Layers size={15} />Layers<span className="d-muted">3 of 4</span></button></State>
          <State label="Pressed"><button type="button" className="d-item is-press"><Layers size={15} />Layers<span className="d-muted">3 of 4</span></button></State>
          <State label="Focus"><button type="button" className="d-item is-focus"><Layers size={15} />Layers<span className="d-muted">3 of 4</span></button></State>
        </div>
        <div className="cg-col cg-col-232">
          <State label="Active: the source in the list"><button type="button" className="d-item active"><Table2 size={15} />All units<span className="d-muted">6</span></button></State>
          <State label="Current: the open entry"><button type="button" className="d-item i1 current"><span className="d-tog-space" /><KindIcon kind="unit" size={15} />Warden Squad</button></State>
          <State label="Count badge, key"><div className="cg-stack"><button type="button" className="d-item"><Bell size={15} />Updates<span className="d-count">7</span></button><button type="button" className="d-item"><Search size={15} />Search<kbd>{key(platform, "⌘K", "Ctrl+K")}</kbd></button></div></State>
          <State label="Unavailable (read-only dataset)"><button type="button" className="d-item" disabled title="The dataset is read-only"><Plus size={14} />New entry</button></State>
        </div>
      </div>
    ),
  },

  "source.group-heading": {
    render: () => (
      <div className="cg-col cg-col-318">
        <State label="Unfolded"><button type="button" className="d-group" aria-expanded><ChevronDown size={13} />Units<span>4</span></button></State>
        <State label="Folded"><button type="button" className="d-group" aria-expanded={false}><ChevronRight size={13} />Models<span>4</span></button></State>
        <State label="Hover"><button type="button" className="d-group is-hover"><ChevronDown size={13} />Upgrades<span>4</span></button></State>
        <State label="Focus"><button type="button" className="d-group is-focus"><ChevronDown size={13} />Groups<span>1</span></button></State>
      </div>
    ),
  },

  "source.row": {
    render: () => (
      <div className="cg-row-flex">
        <div className="cg-col cg-col-318">
          <ColHeads />
          <State label="Default"><SrcRow kind="unit" name="Warden Archers" cost={22} /></State>
          <State label="Hover"><SrcRow kind="unit" name="Warden Archers" cost={22} cls="is-hover" /></State>
          <State label="Pressed"><SrcRow kind="unit" name="Warden Archers" cost={22} cls="is-press" /></State>
          <State label="Focus"><SrcRow kind="unit" name="Warden Archers" cost={22} cls="is-focus" /></State>
          <State label="Selected, changed, cost lowered by a layer"><SrcRow kind="unit" name="Warden Squad" cost={18} was={20} diag="preservation" changed="House rules" cls="selected" /></State>
        </div>
        <div className="cg-col cg-col-318">
          <ColHeads />
          <State label="Error edge"><SrcRow kind="unit" name="Ice Guard" cost={24} diag="error" changed="Frost Wardens" /></State>
          <State label="Preservation edge"><SrcRow kind="unit" name="Warden Squad" cost={18} was={20} diag="preservation" changed="House rules" /></State>
          <State label="Suggestion edge, zero cost"><SrcRow kind="upgrade" name="Spear" cost={0} diag="suggestion" /></State>
          <State label="No text: the key in mono"><SrcRow kind="unit" name="frost-seer" cost={50} diag="suggestion" noText changed="Frost Wardens" /></State>
          <State label="No cost of its own"><SrcRow kind="model" name="Captain" /></State>
        </div>
      </div>
    ),
  },

  "source.filter": {
    render: () => (
      <div className="cg-col cg-col-318">
        <State label="Empty"><div className="d-src-tools" style={{ padding: 0 }}><label className="d-filter"><Search size={13} /><input placeholder="Filter Iron Wardens" aria-label="Filter Iron Wardens" readOnly /></label><button type="button" className="d-icon sm" aria-label="Display options"><SlidersHorizontal size={14} /></button></div></State>
        <State label="Focus"><div className="d-src-tools" style={{ padding: 0 }}><label className="d-filter is-focus-within"><Search size={13} /><input placeholder="Filter Iron Wardens" aria-label="Filter Iron Wardens" readOnly /></label><button type="button" className="d-icon sm" aria-label="Display options"><SlidersHorizontal size={14} /></button></div></State>
        <State label="Typed (Esc clears)"><div className="d-src-tools" style={{ padding: 0 }}><label className="d-filter is-focus-within"><Search size={13} /><input value="war" aria-label="Filter Iron Wardens" readOnly /></label><button type="button" className="d-icon sm" aria-label="Display options"><SlidersHorizontal size={14} /></button></div></State>
      </div>
    ),
  },

  "control.button": {
    wide: true,
    render: (_mode, platform) => (
      <div className="cg-btn-grid">
        <span className="cg-state-label" />
        {["Default", "Hover", "Pressed", "Focus", "Disabled"].map((label) => <span key={label} className="cg-head-label">{label}</span>)}
        <span className="cg-head-label">Primary</span>
        <button type="button" className="d-btn primary">Run checks</button>
        <button type="button" className="d-btn primary">Run checks</button>
        <button type="button" className="d-btn primary is-press">Run checks</button>
        <button type="button" className="d-btn primary is-focus">Run checks</button>
        <button type="button" className="d-btn primary" disabled>Run checks</button>
        <span className="cg-head-label">Quiet</span>
        <button type="button" className="d-btn">Show diff</button>
        <button type="button" className="d-btn is-hover">Show diff</button>
        <button type="button" className="d-btn is-press">Show diff</button>
        <button type="button" className="d-btn is-focus">Show diff</button>
        <button type="button" className="d-btn" disabled>Show diff</button>
        <span className="cg-head-label">Small</span>
        <button type="button" className="d-btn primary sm"><CornerDownLeft size={12} />Change to halberd</button>
        <button type="button" className="d-btn sm is-hover"><Undo2 size={12} />Undo</button>
        <button type="button" className="d-btn sm is-press">Go to</button>
        <button type="button" className="d-btn sm is-focus">Go to</button>
        <button type="button" className="d-btn sm" disabled>Go to</button>
        <span className="cg-head-label">Ghost</span>
        <button type="button" className="d-ghost"><Focus size={14} />Focus<kbd>{key(platform, "⌘.", "Ctrl+.")}</kbd></button>
        <button type="button" className="d-ghost is-hover"><Code2 size={14} />Source</button>
        <button type="button" className="d-ghost on"><Focus size={14} />Focus<kbd>{key(platform, "⌘.", "Ctrl+.")}</kbd></button>
        <button type="button" className="d-ghost is-focus"><Code2 size={14} />Source</button>
        <button type="button" className="d-ghost" disabled><Code2 size={14} />Source</button>
        <span className="cg-head-label">Icon</span>
        <span><button type="button" className="d-icon" aria-label="Focus mode"><Maximize2 size={14} /></button></span>
        <span><button type="button" className="d-icon is-hover" aria-label="Focus mode"><Maximize2 size={14} /></button></span>
        <span><button type="button" className="d-icon is-press" aria-label="Close"><X size={15} /></button></span>
        <span><button type="button" className="d-icon is-focus" aria-label="Close"><X size={15} /></button></span>
        <span><button type="button" className="d-icon" disabled aria-label="Close"><X size={15} /></button></span>
      </div>
    ),
    after: <p className="cg-lang-text">Pressed on the ghost row is the toggled-on state (<code>.on</code>: selection tint, accent text). Primary has no hover of its own in D; on Windows a press darkens it (<code>accent-press</code>), on macOS the press filter does. Disabled keeps the quiet fill with muted text and says why in its tooltip.</p>,
  },

  "control.segmented": {
    paper: "surface",
    render: () => (
      <div className="cg-col cg-col-318">
        <State label="Selected: This entry"><div className="d-seg" role="radiogroup" aria-label="Scope"><button type="button" role="radio" aria-checked className="active">This entry <span className="d-muted">1</span></button><button type="button" role="radio" aria-checked={false}>Dataset <span className="d-muted">3</span></button></div></State>
        <State label="Hover on Dataset"><div className="d-seg"><button type="button" className="active">This entry <span className="d-muted">1</span></button><button type="button" className="is-hover">Dataset <span className="d-muted">3</span></button></div></State>
        <State label="Focus"><div className="d-seg"><button type="button">This entry <span className="d-muted">1</span></button><button type="button" className="active is-focus">Dataset <span className="d-muted">3</span></button></div></State>
      </div>
    ),
  },

  "control.kbd": {
    render: (_mode, platform) => (
      <div className="cg-row-flex">
        <State label="Single"><span><kbd>Esc</kbd></span></State>
        <State label="Combination"><span style={{ display: "flex", gap: 4 }}><kbd>{key(platform, "⌘K", "Ctrl+K")}</kbd><kbd>{key(platform, "⌘⇧C", "Ctrl+Shift+C")}</kbd><kbd>{key(platform, "⇧F12", "Shift+F12")}</kbd></span></State>
        <State label="Beside a command" wide><ul className="d-actions" style={{ width: 250 }}><li><button type="button"><Play size={14} />Run checks<kbd>{key(platform, "⌘⇧C", "Ctrl+Shift+C")}</kbd></button></li><li><button type="button"><Plus size={14} />Insert a statement<kbd>/</kbd></button></li></ul></State>
        <State label="Key hints in a footer" wide><footer className="d-src-foot" style={{ border: 0, padding: 0 }}><kbd>↑</kbd><kbd>↓</kbd> move <kbd>{key(platform, "⌘.", "Ctrl+.")}</kbd> focus</footer></State>
      </div>
    ),
  },

  "page.breadcrumbs": {
    render: (_mode, platform) => (
      <div className="cg-col">
        <State label="Default"><header className="d-top" style={{ padding: 0 }}><span className="d-crumbs">Iron Wardens<span>/</span>Warden Squad</span><span className="d-spacer" /><span className="d-muted">Edited just now</span><button type="button" className="d-ghost"><Focus size={14} />Focus<kbd>{key(platform, "⌘.", "Ctrl+.")}</kbd></button><button type="button" className="d-ghost"><Code2 size={14} />Source</button></header></State>
        <State label="Focus mode on"><header className="d-top" style={{ padding: 0 }}><span className="d-crumbs">Frost Wardens<span>/</span>Ice Guard</span><span className="d-spacer" /><span className="d-muted">Edited just now</span><button type="button" className="d-ghost on" aria-pressed><Focus size={14} />Focus<kbd>{key(platform, "⌘.", "Ctrl+.")}</kbd></button><button type="button" className="d-ghost"><Code2 size={14} />Source</button></header></State>
        <State label="Long names: the crumb is cut, the page title keeps the whole name"><header className="d-top" style={{ padding: 0, maxWidth: 420 }}><span className="d-crumbs">Iron Wardens Reserve Detachment<span>/</span>Warden Squad with Banner and Shield-bearer Escort</span><span className="d-spacer" /><button type="button" className="d-ghost"><Code2 size={14} />Source</button></header></State>
      </div>
    ),
    after: <p className="cg-lang-text">D cuts a long crumb mid-word (no ellipsis, because the crumb is a flex row). Open for E1: end the entry name with an ellipsis and show the whole path in its tooltip; the page title below always shows the whole name.</p>,
  },

  "page.title": {
    render: () => (
      <div className="cg-row-flex">
        <State label="Default" wide>
          <div className="d-page">
            <div className="d-pageicon"><KindIcon kind="unit" size={28} /></div>
            <h1>Warden Squad</h1>
            <p className="d-backlinks"><ArrowDownLeft size={14} /><span className="d-muted">3 backlinks</span><M hint="Root entry of this source">Iron Wardens</M><M to="iron-wardens:warden-captain">Warden Captain</M></p>
          </div>
        </State>
        <State label="No text: the key stands in for the name" wide>
          <div className="d-page">
            <div className="d-pageicon"><KindIcon kind="unit" size={28} /></div>
            <h1 className="d-notext">frost-seer<span className="d-tag warn">No en text</span></h1>
          </div>
        </State>
      </div>
    ),
  },

  "page.layer-chip": {
    render: () => (
      <div className="cg-row-flex">
        <State label="Chips"><span style={{ display: "flex", gap: 8 }}><span className="d-layer">add-on</span><span className="d-layer">House rules</span><span className="d-layer">Variant · test</span></span></State>
        <State label="In a list header" wide><header className="d-src-head" style={{ border: 0, padding: 0, height: "auto" }}><KindIcon kind="system" size={15} /><strong>Frost Wardens</strong><span className="d-muted">8</span><span className="d-layer">add-on</span></header></State>
      </div>
    ),
  },

  "page.mention": {
    render: () => (
      <div className="cg-row-flex">
        <div className="cg-col">
          <State label="Tags (three tones)"><span style={{ display: "flex", gap: 6 }}><span className="d-tag t1">infantry</span><span className="d-tag t2">line</span><span className="d-tag t3">leader</span></span></State>
          <State label="Mention, hover, focus"><span style={{ display: "flex", gap: 8 }}><span className="d-mwrap"><button type="button" className="d-mention">Shield Wall</button></span><span className="d-mwrap"><button type="button" className="d-mention is-hover">Halberd</button></span><span className="d-mwrap"><button type="button" className="d-mention is-focus">Spear</button></span></span></State>
          <State label="Broken reference"><span className="d-mwrap"><button type="button" className="d-mention broken" aria-label="Unknown reference halbred">halbred</button></span></State>
        </div>
        <State label="Peek (hover or focus a mention)">
          <span className="d-peek is-static" role="tooltip">
            <span className="d-peek-head"><KindIcon kind="upgrade" size={14} /><strong>Halberd</strong><span className="mono">iron-wardens:halberd</span></span>
            <span><span className="d-kw">cost</span><span className="mono">pts 2</span></span>
            <span className="d-peek-foot">Click to open · <kbd>F12</kbd></span>
          </span>
        </State>
        <State label="Peek of a broken reference">
          <span className="d-peek is-static" role="tooltip">
            <span className="d-peek-head"><strong>Unknown reference</strong><span className="mono">halbred</span></span>
            <span>No entry has this key. Did you mean <span className="mono">halberd</span>?</span>
            <span className="d-peek-foot">The fix is in the helper</span>
          </span>
        </State>
      </div>
    ),
  },

  "page.property-row": {
    render: () => (
      <div className="cg-col" style={{ maxWidth: 560 }}>
        <State label="Properties block; the Cost value is hovered"><PropRows cls="is-hover" /></State>
      </div>
    ),
  },

  "page.statement-block": {
    render: () => (
      <div className="d-blocks" style={{ maxWidth: 600 }}>
        <Blk kw="source key" diag="d2"><span className="mono">x-bs.exampleReviewState: draft</span></Blk>
        <Blk kw="cost" diag="d5"><span className="mono">pts 0</span></Blk>
        <Blk kw="use" diag="d1"><M to="iron-wardens:halberd" broken>halbred</M><span className="d-muted">2 pts</span></Blk>
        <h2 className="d-h">Models</h2>
        <Blk kw="model" sub={<>
          <div className="d-block i1 is-hover"><span className="d-tog-space" /><span className="d-kw">cost</span><span className="num">8 pts</span></div>
          <TableBlk head={["Profile", "Type", "Move", "Attack", "Wounds"]} row={["Warden", <M key="t" to="demo-skirmish:fighter">fighter</M>, "5\"", "3", "1"]} />
          <Blk kw="upgrade" closed sub={<Blk kw="cost"><span className="num">10 pts</span></Blk>}><strong>Banner</strong><span className="d-muted">up to 1 · folded</span></Blk>
          <Blk kw="hide when"><EyeOff size={13} style={{ color: "var(--cg-muted)" }} /><span className="mono">no(</span><M to="iron-wardens:warden-captain">Warden Captain</M><span className="mono">in force)</span></Blk>
        </>}><strong>Warden</strong><span className="d-muted">5 to 10 models</span></Blk>
        <div className="d-block i0 typing"><span className="d-tog-space" /><button type="button" className="d-slashbtn"><span className="d-slash">/</span><span className="d-placeholder">Type / to insert a statement</span></button></div>
      </div>
    ),
    after: <p className="cg-lang-text">Top to bottom: flagged preservation (amber), suggestion (cool) and error (red) blocks; a section heading; a toggle with a hovered child, a profile table, a folded child and a nested condition; the insert line.</p>,
  },

  "helper.pill": {
    paper: "pane",
    render: () => (
      <div className="cg-row-flex">
        <State label="Counts"><button type="button" className="d-pill"><span><DiagIcon kind="preservation" size={13} />1</span><span><DiagIcon kind="suggestion" size={13} />1</span><Maximize2 size={12} className="d-pill-open" /></button></State>
        <State label="Hover"><button type="button" className="d-pill is-hover"><span><DiagIcon kind="error" size={13} />1</span><span><DiagIcon kind="suggestion" size={13} />2</span><Maximize2 size={12} className="d-pill-open" /></button></State>
        <State label="No issues"><button type="button" className="d-pill"><span><Check size={13} className="d-ok" />No issues</span><Maximize2 size={12} className="d-pill-open" /></button></State>
      </div>
    ),
  },

  "helper.box": {
    paper: "pane",
    render: () => (
      <div className="cg-row-flex">
        <State label="This page's issues"><HelperBox issues={issuesFor(entry.full)} resolved={new Set()} elsewhere={5} checking="idle" onCollapse={noop} onExpand={noop} onFix={noop} onUndo={noop} onDiff={noop} onAll={noop} onChecks={noop} onInsert={noop} onProperties={noop} /></State>
        <State label="After a fix (Undo), checks running"><HelperBox issues={issuesFor("iron-wardens:spear")} resolved={new Set(["d5"])} elsewhere={6} checking="busy" onCollapse={noop} onExpand={noop} onFix={noop} onUndo={noop} onDiff={noop} onAll={noop} onChecks={noop} onInsert={noop} onProperties={noop} /></State>
      </div>
    ),
  },

  "helper.panel-tabs": {
    paper: "surface",
    render: () => (
      <div className="cg-col cg-col-328">
        <State label="Issues active, hover on Suggestions">
          <header className="d-ptabs">
            <div role="tablist" aria-label="Helper">
              <button type="button" role="tab" aria-selected className="active">Issues<span className="d-pcount issues">1</span></button>
              <button type="button" role="tab" aria-selected={false} className="is-hover">Suggestions<span className="d-pcount suggestions">1</span></button>
              <button type="button" role="tab" aria-selected={false}>Properties</button>
            </div>
            <span className="d-spacer" />
            <button type="button" className="d-icon" aria-label="Back to the floating box"><PictureInPicture2 size={15} /></button>
          </header>
        </State>
        <State label="Resize edge, hover">
          <div style={{ position: "relative", height: 60, marginLeft: 8, borderLeft: "1px solid var(--cg-line)" }}>
            <div className="d-resize is-hover" role="separator" aria-orientation="vertical" aria-label="Resize the helper panel" />
            <p className="d-pfoot" style={{ paddingLeft: 12 }}><kbd>Esc</kbd> back to the box · drag the left edge to resize</p>
          </div>
        </State>
      </div>
    ),
  },

  "helper.issue-row": {
    paper: "surface",
    render: () => (
      <div className="cg-col cg-col-328">
        <section className="d-igroup"><h3><DiagIcon kind="error" size={13} />Errors<span className="d-muted">1</span></h3></section>
        <State label="Selected (elsewhere: Go to)">
          <div className="d-issue edge-error selected"><p>Unknown reference <code>halbred</code></p><p className="mono d-muted">frost-wardens:ice-guard/weapon</p><span className="d-fix"><button type="button" className="d-btn primary sm"><CornerDownLeft size={12} />Change to halberd</button><button type="button" className="d-btn sm">Go to</button></span></div>
        </State>
        <State label="Default and hover">
          <div className="cg-stack">
            <div className="d-issue edge-suggestion"><p><code>cost pts 0</code> is the default</p><p className="mono d-muted">iron-wardens:spear</p></div>
            <div className="d-issue edge-suggestion is-hover"><p><code>label $</code> repeats the default label</p><p className="mono d-muted">iron-wardens:warden-captain/leads</p></div>
          </div>
        </State>
        <State label="Preservation, diff open (this entry)">
          <div className="d-issue edge-preservation selected"><p>Source comment moves below <code>x-bs.exampleReviewState</code> on export</p><p className="mono d-muted">iron-wardens:warden-squad<span className="d-here"> · this entry</span></p><span className="d-fix"><button type="button" className="d-btn primary sm" aria-expanded>Hide diff</button></span><pre className="d-diff" aria-label="Export difference"><span className="del">- # review: second pass</span>{"\n"}<span>  x-bs.exampleReviewState: draft</span>{"\n"}<span className="add">+ # review: second pass</span></pre></div>
        </State>
        <State label="Done (Undo)">
          <div className="d-issue edge-error done"><p><Check size={13} />Fixed: Change to halberd</p><p className="mono d-muted">frost-wardens:ice-guard/weapon</p><span className="d-fix"><button type="button" className="d-btn sm"><Undo2 size={12} />Undo</button></span></div>
        </State>
      </div>
    ),
  },

  "helper.empty-state": {
    render: () => (
      <div className="cg-row-flex">
        <State label="Nothing in this scope"><p className="d-none"><Check size={13} />None on this entry</p></State>
        <State label="Filter without a match"><p className="d-empty" style={{ padding: 0 }}>No entry matches “halbred”. <button type="button">Clear filter</button></p></State>
        <State label="Helper header, all clear"><span className="d-hcounts"><span><Check size={12} className="d-ok" />Clear</span></span></State>
      </div>
    ),
  },

  "focus.exit": {
    render: (_mode, platform) => (
      <div className="cg-col" style={{ width: 348, maxWidth: "100%" }}>
        <State label="List header in focus mode">
          <header className="d-src-head" style={{ paddingLeft: platform === "mac" ? 14 : 10 }}>{platform === "mac" ? <TrafficLights /> : null}<KindIcon kind="system" size={15} /><strong>Iron Wardens</strong><span className="d-spacer" /><button type="button" className="d-exit" aria-label="Exit focus mode"><Minimize2 size={13} />Exit focus<kbd>Esc</kbd></button></header>
        </State>
        <div className="cg-row-flex">
          <State label="Hover"><button type="button" className="d-exit is-hover"><Minimize2 size={13} />Exit focus<kbd>Esc</kbd></button></State>
          <State label="Focus"><button type="button" className="d-exit is-focus"><Minimize2 size={13} />Exit focus<kbd>Esc</kbd></button></State>
          <State label="Enter focus (outside focus mode)"><span style={{ display: "flex", gap: 2 }}><button type="button" className="d-icon" aria-label="Focus mode: hide the sidebar"><Maximize2 size={14} /></button><button type="button" className="d-icon" aria-label="Close the source list"><X size={15} /></button></span></State>
        </div>
      </div>
    ),
  },

  "overlay.slash-menu": {
    paper: "pane",
    render: () => (
      <div className="d-slashmenu" role="menu" aria-label="Insert a statement">
        <p>Valid in <span className="mono">unit warden-squad</span></p>
        {[
          { icon: <KindIcon kind="upgrade" size={15} />, name: "Upgrade", syntax: "upgrade key range" },
          { icon: <KindIcon kind="group" size={15} />, name: "Group", syntax: "group key n default ref" },
          { icon: <KindIcon kind="profile-type" size={15} />, name: "Profile", syntax: "profile key: type | values" },
          { icon: <span className="d-hash">#</span>, name: "Cost", syntax: "cost type value" },
          { icon: <EyeOff size={15} />, name: "Hide when", syntax: "hide when condition" },
        ].map((item, index) => (
          <button type="button" role="menuitem" key={item.name} className={index === 0 ? "sel" : ""}>{item.icon}<span><strong>{item.name}</strong><small className="mono">{item.syntax}</small></span>{index === 0 ? <kbd>↵</kbd> : null}</button>
        ))}
      </div>
    ),
  },

  "overlay.command-palette": {
    paper: "none",
    render: (_mode, platform) => <Palette platform={platform} />,
    after: (
      <Matrix platforms={["mac"]} paper="none">
        {() => <Palette platform="mac" empty />}
      </Matrix>
    ),
  },

  "overlay.context-menu": {
    paper: "none",
    render: (_mode, platform) => (
      <div className="cg-menu" role="menu" aria-label="Warden Squad">
        <p className="cg-menu-label">Warden Squad</p>
        <button type="button" role="menuitem" className="cg-menu-item"><CornerDownLeft size={15} />Open<span className="cg-menu-key">{key(platform, "↵", "Enter")}</span></button>
        <button type="button" role="menuitem" className="cg-menu-item"><ArrowDownLeft size={15} />Show backlinks<span className="cg-menu-key">{key(platform, "⇧F12", "Shift+F12")}</span></button>
        <button type="button" role="menuitem" className="cg-menu-item is-hover"><PencilLine size={15} />Rename…<span className="cg-menu-key">F2</span></button>
        <button type="button" role="menuitem" className="cg-menu-item"><CopyPlus size={15} />Duplicate<span className="cg-menu-key">{key(platform, "⌘D", "Ctrl+D")}</span></button>
        <button type="button" role="menuitem" className="cg-menu-item"><Copy size={15} />Copy key<span className="cg-menu-key">{key(platform, "⌥⌘C", "Ctrl+Alt+C")}</span></button>
        <button type="button" role="menuitem" className="cg-menu-item" disabled title="Nothing copied yet"><ClipboardPaste size={15} />Paste statement<span className="cg-menu-key">{key(platform, "⌘V", "Ctrl+V")}</span></button>
        <div className="cg-menu-sep" role="separator" />
        <button type="button" role="menuitem" className="cg-menu-item"><PanelRightOpen size={15} />Open issues in the panel</button>
        <div className="cg-menu-sep" role="separator" />
        <button type="button" role="menuitem" className="cg-menu-item danger"><Trash2 size={15} />Delete Warden Squad<span className="cg-menu-key">{key(platform, "⌘⌫", "Del")}</span></button>
      </div>
    ),
    after: <p className="cg-lang-text">Rename is hovered; Paste statement is unavailable and says why in its tooltip (“Nothing copied yet”). Shortcuts are muted text, as in native menus, not keycaps.</p>,
  },

  "check.large-text": {
    wide: true,
    render: (mode, platform) => (
      <div className="cg-row-flex">
        {[false, true].map((large) => (
          <div key={String(large)} className={`fc-cg fc-d cg-scope ${mode}`} data-platform={platform === "windows" ? "windows" : undefined} data-text={large ? "large" : undefined} style={{ width: 540, maxWidth: "100%" }}>
            <State label={large ? "Large text (1.25×)" : "Default"}>
              <div className="cg-stack" style={{ width: 318, maxWidth: "100%" }}>
                <ColHeads />
                <SrcRow kind="unit" name="Warden Squad with Banner and Shield-bearer Escort" cost={118} was={120} diag="preservation" changed="House rules" cls="selected" />
                <SrcRow kind="unit" name="Warden Captain" cost={45} diag="suggestion" />
                <SrcRow kind="upgrade" name="Halberd" cost={2} />
                <SrcRow kind="unit" name="frost-seer-of-the-northern-reach" cost={50} noText changed="Frost Wardens" />
              </div>
            </State>
            <div style={{ marginTop: 10 }}><PropRows /></div>
          </div>
        ))}
      </div>
    ),
    after: <p className="cg-lang-text">Rows switch from a fixed height to a minimum under large text, names wrap (never truncated), and the cost column stays right-aligned at the top of its row; the cost column widens a little so three-digit costs with a lowered value still fit. Property labels wrap in a column sized in em.</p>,
  },
};

/* ---------- Command palette ---------- */

function Palette({ platform, empty }: { platform: Platform; empty?: boolean }) {
  const hl = (name: string) => { const i = name.toLowerCase().indexOf("ward"); return i < 0 ? name : <>{name.slice(0, i)}<mark>{name.slice(i, i + 4)}</mark>{name.slice(i + 4)}</>; };
  return (
    <div className="cg-palette" role="dialog" aria-label="Command palette">
      <div className="cg-pal-input"><Search size={16} /><input value={empty ? "halbred" : "ward"} aria-label="Search entries and commands" readOnly /><span className="cg-pal-scope">All</span><kbd>Esc</kbd></div>
      {empty ? (
        <div className="cg-pal-body">
          <p className="cg-pal-empty">No entry or command matches “halbred”.</p>
          <div className="cg-pal-group">Did you mean</div>
          <button type="button" className="cg-pal-row selected"><KindIcon kind="upgrade" size={15} /><strong>Halberd</strong><span className="mono">iron-wardens:halberd</span><span className="cg-pal-end">2</span></button>
          <button type="button" className="cg-pal-row"><Search size={15} /><strong>Search the text pack for “halbred”</strong></button>
        </div>
      ) : (
        <div className="cg-pal-body" role="listbox" aria-label="Results">
          <div className="cg-pal-group">Entries</div>
          {[
            { kind: "unit" as Kind, name: "Warden Squad", id: "iron-wardens:warden-squad", cost: 18 },
            { kind: "unit" as Kind, name: "Warden Captain", id: "iron-wardens:warden-captain", cost: 45 },
            { kind: "unit" as Kind, name: "Warden Archers", id: "iron-wardens:warden-archers", cost: 22 },
            { kind: "model" as Kind, name: "Warden", id: "iron-wardens:warden-squad/warden", cost: 8 },
          ].map((row, index) => (
            <button type="button" role="option" aria-selected={index === 0} key={row.id} className={`cg-pal-row${index === 0 ? " selected" : ""}`}><KindIcon kind={row.kind} size={15} /><strong>{hl(row.name)}</strong><span className="mono">{row.id}</span><span className="cg-pal-end">{row.cost}</span></button>
          ))}
          <div className="cg-pal-group">Commands</div>
          <button type="button" role="option" aria-selected={false} className="cg-pal-row"><Table2 size={15} /><strong>Open Iron {hl("Wardens")} in the list</strong></button>
          <button type="button" role="option" aria-selected={false} className="cg-pal-row"><Plus size={15} /><strong>New entry in Iron {hl("Wardens")}…</strong></button>
          <button type="button" role="option" aria-selected={false} className="cg-pal-row"><Play size={15} /><strong>Run checks</strong><span className="cg-pal-end"><kbd>{key(platform, "⌘⇧C", "Ctrl+Shift+C")}</kbd></span></button>
        </div>
      )}
      <div className="cg-pal-foot"><kbd>↑</kbd><kbd>↓</kbd><span>move</span><kbd>{key(platform, "↵", "Enter")}</kbd><span>open</span><kbd>{key(platform, "⌘↵", "Ctrl+Enter")}</kbd><span>open in focus mode</span></div>
    </div>
  );
}

/* ---------- The page ---------- */

type Entry = { id: string; title: string; from: string; platforms: string[]; states: string[]; summary: string };
type Section = { id: string; title: string; entries: Entry[] };
const sections = design.elements.sections as Section[];

export function ElementsPage() {
  return (
    <article className="cg-page cg-lang">
      <header className="cg-head">
        <p className="cg-kicker">D4 · Step 2 <TrackChip status="proposal" /></p>
        <h1>Elements</h1>
        <p className="cg-lede">Every primitive Direction D uses, drawn live from the tokens, in light and dark and, where they differ, on macOS and Windows. States sit side by side. The command palette and the context menu are new: D doesn't draw them, but every E1 screen needs them. The list comes from <code>design-data/cogitator.design.json</code> (<code>elements.sections</code>).</p>
        <nav className="cg-jump" aria-label="Sections">{sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}</nav>
      </header>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="cg-lang-section">
          <h2>{section.title}</h2>
          {section.entries.map((item) => {
            const renderer = renderers[item.id] ?? editorRenderers[item.id];
            const platforms = item.platforms.filter((p): p is Platform => p === "mac" || p === "windows");
            return (
              <div key={item.id} id={item.id} className="cg-el">
                <header><h3>{item.title}</h3><code>{item.id}</code><span className="cg-el-from">{item.from}</span></header>
                <p>{item.summary}</p>
                {renderer ? (
                  <>
                    <Matrix platforms={platforms} paper={renderer.paper} wide={renderer.wide}>{renderer.render}</Matrix>
                    {renderer.after ? <div style={{ marginTop: 12 }}>{renderer.after}</div> : null}
                  </>
                ) : <p className="cg-lang-text">No renderer for this entry yet.</p>}
              </div>
            );
          })}
        </section>
      ))}
    </article>
  );
}
