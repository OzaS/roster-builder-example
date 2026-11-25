import { AlertTriangle, Check, ChevronDown, ChevronRight, CircleAlert, Flag, Layers, Minus, Pause, Play, Plus, RefreshCw, Replace, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { DiagIcon, KindIcon } from "../../glyphs";
import { State, type Mode, type Platform } from "../../language/Specimen";
import { stackFor } from "./data";
import { ChangeCard, Changed, LayerRow, RowMenu, ValueChain } from "./LayerStackScreen";
import "./layers.css";
import "./search.css";
import "./runner.css";

/**
 * Elements view renderers for the E1 part 2 primitives (layer row, value chain, layer overlay, search field and rows,
 * runner status, tree and option rows). `ElementsPage` looks them up after its own; the entries are in
 * `cogitator.design.json` (`elements.sections`: layers, search, runner).
 */
type Renderer = { paper?: "pane" | "surface" | "none"; wide?: boolean; render: (mode: Mode, platform: Platform) => ReactNode; after?: ReactNode };

const stack = stackFor("stack");
const refused = stackFor("refused");
const conflict = stackFor("conflict");
const box = (children: ReactNode, width = 480) => <div style={{ width }}>{children}</div>;

export const layerRenderers: Record<string, Renderer> = {
  "layers.row": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Base (always first, no switch)" wide>{box(<LayerRow layer={stack[0]} n={1} selected={false} explicit={false} />)}</State>
        <State label="Applied, selected" wide>{box(<LayerRow layer={stack[1]} n={2} selected explicit={false} />)}</State>
        <State label="Explicit order: drag grip" wide>{box(<LayerRow layer={stack[2]} n={3} selected={false} explicit />)}</State>
        <State label="Refused: requires mismatch (error edge)" wide>{box(<LayerRow layer={refused[2]} n={3} selected={false} explicit={false} />)}</State>
        <State label="Conflict: overrides an earlier layer (info edge), Test" wide>{box(<LayerRow layer={conflict[4]} n={5} selected={false} explicit={false} conflict={{ text: "overrides House rules on 1 value", by: false }} />)}</State>
        <State label="Off (test variants are never on by default)" wide>{box(<LayerRow layer={stack[4]} selected={false} explicit={false} />)}</State>
        <State label="Hover" wide>{box(<LayerRow layer={stack[3]} n={4} selected={false} explicit={false} cls="is-hover" />)}</State>
      </div>
    ),
  },
  "layers.row-menu": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Base: no ⋯, no menu" wide>{box(<LayerRow layer={stack[0]} n={1} selected={false} explicit={false} onMore={() => undefined} />, 520)}</State>
        <State label="Selected: ⋯ shown (also on hover and focus)" wide>{box(<LayerRow layer={stack[2]} n={3} selected explicit={false} onMore={() => undefined} />, 520)}</State>
        <State label="Not selected: ⋯ hidden until hover" wide>{box(<LayerRow layer={stack[1]} n={2} selected={false} explicit={false} onMore={() => undefined} />, 520)}</State>
        <State label="Menu (right-click or ⋯): Turn off first, Remove last in the destructive colour"><RowMenu layer={stack[2]} inline /></State>
      </div>
    ),
  },
  "layers.chain": { render: () => box(<ValueChain />, 460) },
  "layers.overlay": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Overlay bar" wide>
          <div className="cg-ly-bar" style={{ width: 680, margin: 0 }}><Layers size={14} /><span><strong>Effective values</strong> · Base + House rules + Frost Wardens + Short names</span><span className="d-spacer" /><span className="cg-seg"><button type="button" className="active">Effective</button><button type="button">Base only</button></span></div>
        </State>
        <State label="Changed value: effective, base struck, layer chip" wide>
          <dl className="d-props" style={{ width: 520, border: 0 }}><div className="cg-lchg-row"><dt><span className="d-hash">#</span>Cost</dt><dd><strong className="num">18 pts</strong><Changed base="20" layer="House rules" /></dd></div></dl>
        </State>
        <State label="Base only: what the layer would set" wide>
          <dl className="d-props" style={{ width: 520, border: 0 }}><div className="cg-lchg-row"><dt><span className="d-hash">#</span>Cost</dt><dd><strong className="num">20 pts</strong><span className="cg-lchg-would"><Layers size={11} />House rules sets 18</span></dd></div></dl>
        </State>
        <State label="Card (the chip opens it; floats)" wide><ChangeCard /></State>
      </div>
    ),
  },
  "search.field": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Field with Match case on, scopes with counts" wide>
          <div className="cg-sr-row" style={{ width: 900 }}>
            <button type="button" className="d-icon sm" aria-label="Show replace"><ChevronRight size={14} /></button>
            <label className="cg-sr-field"><Search size={14} /><input defaultValue="shield" aria-label="Search" /><span className="cg-sr-toggles"><button type="button" className="on" aria-pressed>Aa</button><button type="button" aria-pressed={false}><span className="cg-sr-word">ab</span></button></span></label>
            <span className="cg-sr-scopes"><button type="button" className="cg-sr-scope on"><Check size={12} />Entries<span>3</span></button><button type="button" className="cg-sr-scope on"><Check size={12} />Text<span>1</span></button><button type="button" className="cg-sr-scope">References<span>2</span></button></span>
          </div>
        </State>
        <State label="Replace row" wide>
          <div className="cg-sr-row" style={{ width: 760 }}>
            <span className="cg-sr-indent" />
            <label className="cg-sr-field"><Replace size={14} /><input defaultValue="Shield Line" aria-label="Replace with" /></label>
            <button type="button" className="d-btn primary"><Replace size={13} />Replace 2 in 2 files<kbd>⇧⌘↵</kbd></button>
          </div>
        </State>
      </div>
    ),
  },
  "search.hit": {
    wide: true,
    render: () => (
      <div style={{ width: 600 }}>
        <section className="cg-sr-group">
          <h3><KindIcon kind="catalogue" size={13} />Iron Wardens<span className="d-muted">3</span></h3>
          <div className="cg-sr-entry">
            <p className="cg-sr-ehead"><KindIcon kind="unit" size={14} /><strong>Shield Bearers</strong><span className="mono">iron-wardens:shield-bearers</span><span className="d-spacer" /><span className="d-muted">2</span></p>
            <div className="cg-sr-hit selected"><span className="cg-sr-field-tag name">name</span><span className="cg-sr-text"><span className="cg-sr-prefix">shield-bearers: </span><mark className="cg-sr-mark">Shield</mark> Bearers</span><span className="mono cg-sr-line">en.dkl:5</span></div>
            <div className="cg-sr-hit"><span className="cg-sr-field-tag key">key</span><span className="cg-sr-text mono">unit <mark className="cg-sr-mark">shield</mark>-bearers</span><span className="mono cg-sr-line">module.dkl:58</span></div>
          </div>
        </section>
        <section className="cg-sr-group">
          <h3><Layers size={13} />House rules<span className="d-layer">variant</span><span className="d-muted">2</span></h3>
          <div className="cg-sr-entry">
            <div className="cg-sr-hit"><span className="cg-check cg-sr-check" aria-checked="true"><i><Check size={10} strokeWidth={3} /></i></span><span className="cg-sr-text"><span className="cg-sr-prefix">shield-wall: </span><span className="cg-sr-diff"><del>Shield Wall</del><ins>Shield Line</ins></span></span><span className="mono cg-sr-line">en.dkl:3</span></div>
            <div className="cg-sr-hit locked"><span className="cg-sr-lock">key</span><span className="cg-sr-text mono">use <mark className="cg-sr-mark">shield-wall</mark></span><span className="mono cg-sr-line">module.dkl:17</span></div>
            <div className="cg-sr-hit"><span className="cg-sr-field-tag text">text</span><span className="cg-sr-text">Counts as a <mark className="cg-sr-ins">Shield Line</mark> for the unit it leads.</span><span className="mono cg-sr-line"><Check size={12} className="d-ok" />en.dkl:6</span></div>
          </div>
        </section>
      </div>
    ),
    after: <p className="cg-lang-text">Rows from top: a match (selected), a key match, a replace preview with its checkbox, a locked key in replace mode, a replaced match.</p>,
  },
  "runner.status": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Live, building, paused, last good build" wide>
          <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className="cg-rn-status live"><span className="cg-rn-dot" />Live · built 12:04:31 · 180 ms<ChevronDown size={12} /></span>
            <span className="cg-rn-status building"><RefreshCw size={13} />Building…<ChevronDown size={12} /></span>
            <span className="cg-rn-status paused"><span className="cg-rn-dot warn" />Paused · built 12:04:31<span className="cg-rn-sub">1 save waiting</span><ChevronDown size={12} /></span>
            <span className="cg-rn-status error"><span className="cg-rn-dot err" />Last good build 12:04:31<span className="cg-rn-sub">new build failed</span><ChevronDown size={12} /></span>
          </span>
        </State>
        <State label="Reloaded summary" wide>
          <div className="cg-ly-callout accent cg-rn-banner" style={{ width: 640, margin: 0 }}><RefreshCw size={14} /><span><strong>Reloaded 12:06:02:</strong> 2 entries changed · roster kept · 1 matched by name · 1 kept for review</span><span className="cg-rn-banner-actions"><button type="button" className="d-btn sm">Review<span className="cg-rn-count">1</span></button><button type="button" className="d-icon sm" aria-label="Hide"><X size={13} /></button></span></div>
        </State>
        <State label="Build failed: the last good build runs" wide>
          <div className="cg-ly-callout err cg-rn-banner" style={{ width: 640, margin: 0 }}><CircleAlert size={14} /><span><strong>New build failed:</strong> <span className="mono">iron-wardens/module.dkl:20</span> doesn't parse. Still running the last good build.</span><span className="cg-rn-banner-actions"><button type="button" className="d-btn sm primary">Go to the error<kbd>F8</kbd></button></span></div>
        </State>
        <State label="Paused" wide>
          <div className="cg-ly-callout warn cg-rn-banner" style={{ width: 640, margin: 0 }}><Pause size={14} /><span>Live reload is paused: saves don't rebuild until you resume.</span><span className="cg-rn-banner-actions"><button type="button" className="d-btn sm"><Play size={12} />Resume</button><button type="button" className="d-btn sm"><RefreshCw size={12} />Reload now</button></span></div>
        </State>
      </div>
    ),
  },
  "runner.tree": {
    wide: true,
    render: () => (
      <div className="cg-stack" style={{ gridTemplateColumns: "220px 480px", display: "grid", gap: 16 }}>
        <div>
          <p className="cg-rn-cat">Line<span>2 of 1..4</span></p>
          <button type="button" className="cg-rn-addrow"><KindIcon kind="unit" size={14} /><span className="cg-rn-name">Warden Squad</span><span className="num cg-rn-cost">18</span><Plus size={13} className="cg-rn-plus" /></button>
          <button type="button" className="cg-rn-addrow is-hover" style={{ background: "var(--cg-hover)" }}><KindIcon kind="unit" size={14} /><span className="cg-rn-name">Warden Archers</span><span className="num cg-rn-cost">22</span><Plus size={13} className="cg-rn-plus" style={{ opacity: 1 }} /></button>
        </div>
        <div>
          <div className="cg-rn-node force"><ChevronDown size={13} /><Flag size={14} /><span className="cg-rn-name"><strong>Warband</strong><span className="mono">iron-wardens</span></span><span className="num cg-rn-cost">250</span><span /></div>
          <div className="cg-rn-node cat"><ChevronDown size={13} /><span className="cg-rn-name">Line</span><span className="cg-rn-slot">2 of 1..4</span><span /></div>
          <div className="cg-rn-node sel selected"><span className="cg-rn-tog" /><KindIcon kind="unit" size={14} /><span className="cg-rn-name"><span className="cg-rn-nm">Warden Squad (1)</span><span className="cg-rn-sum">5 Wardens · Spear</span></span><span className="num cg-rn-cost">58</span><span /></div>
          <div className="cg-rn-node sel edge-error"><span className="cg-rn-tog" /><KindIcon kind="unit" size={14} /><span className="cg-rn-name"><span className="cg-rn-nm">Warden Squad (2)</span><span className="cg-rn-sum">4 Wardens · Spear</span></span><span className="num cg-rn-cost">50</span><span className="cg-rn-diag"><DiagIcon kind="error" size={13} /></span></div>
          <div className="cg-rn-node sel edge-changed"><span className="cg-rn-tog" /><KindIcon kind="unit" size={14} /><span className="cg-rn-name"><span className="cg-rn-nm">Warden Archers</span><span className="cg-rn-sum">5 Archers</span><span className="cg-rn-markchip">Longbow 4 → 5 pts</span></span><span className="num cg-rn-cost">92</span><span /></div>
          <div className="cg-rn-node kept edge-preservation"><span className="cg-rn-tog" /><span className="cg-rn-tog" /><KindIcon kind="upgrade" size={14} /><span className="cg-rn-name"><span className="cg-rn-nm">Banner</span><span className="cg-rn-markchip kept">kept for review · moved</span></span><span className="num cg-rn-cost">–</span><span className="cg-rn-diag"><AlertTriangle size={13} className="cg-rn-warn" /></span></div>
        </div>
      </div>
    ),
  },
  "runner.option": {
    wide: true,
    render: () => (
      <div className="cg-rn-opts" style={{ width: 520 }}>
        <div className="cg-rn-opt"><span className="cg-rn-oname">Warden</span><span className="cg-rn-octl"><span className="cg-rn-step"><button type="button" aria-label="Fewer"><Minus size={12} /></button><span className="num">5</span><button type="button" aria-label="More"><Plus size={12} /></button></span></span><span className="cg-rn-orange">5 to 10</span><span className="num cg-rn-ocost">40</span></div>
        <div className="cg-rn-opt"><span className="cg-rn-oname">Weapon</span><span className="cg-rn-octl"><span className="cg-seg"><button type="button" className="active">Spear</button><button type="button">Halberd<span className="d-muted">+2</span></button></span></span><span className="cg-rn-orange">choose 1 each</span><span className="num cg-rn-ocost">–</span></div>
        <div className="cg-rn-opt"><span className="cg-rn-oname">Banner<small>hidden when no Warden Captain in force</small></span><span className="cg-rn-octl"><span className="cg-check" aria-checked="true"><i><Check size={10} strokeWidth={3} /></i>taken</span></span><span className="cg-rn-orange">up to 1</span><span className="num cg-rn-ocost">10</span></div>
        <div className="cg-rn-opt"><span className="cg-rn-oname">Banner</span><span className="cg-rn-octl"><button type="button" className="cg-check" disabled><i />hidden</button></span><span className="cg-rn-orange">up to 1</span><span className="num cg-rn-ocost">–</span></div>
        <div className="cg-rn-opt bad"><span className="cg-rn-oname">Warden</span><span className="cg-rn-octl"><span className="cg-rn-step"><button type="button" aria-label="Fewer"><Minus size={12} /></button><span className="num">4</span><button type="button" aria-label="More"><Plus size={12} /></button></span></span><span className="cg-rn-orange">5 to 10</span><span className="num cg-rn-ocost">32</span></div>
        <div className="cg-rn-opt marked"><span className="cg-rn-oname">Weapon</span><span className="cg-rn-octl"><span className="cg-seg"><button type="button" className="active">Halberd<span className="d-muted">+2</span></button><button type="button">Spear</button></span></span><span className="cg-rn-orange">choose 1</span><span className="num cg-rn-ocost">2</span></div>
      </div>
    ),
    after: <p className="cg-lang-text">Rows from top: count (stepper), choice (segmented), toggle taken, toggle hidden, a count below its minimum (error edge), an option the last reload changed (accent edge).</p>,
  },
};
