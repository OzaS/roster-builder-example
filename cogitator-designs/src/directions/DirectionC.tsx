import { ArrowDownLeft, Check, ChevronDown, ChevronRight, Copy, CornerDownLeft, FileCode2, GripVertical, Layers, Play, Plus, Repeat2, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { MacWindow, TrafficLights } from "../frames";
import { DiagIcon, KindIcon } from "../glyphs";
import { backlinks, diagLabel, diagnostics, entry, layers, type DiagKind, type Kind } from "../sample";
import "./direction-c.css";

type TreeRow = { label: string; kind?: Kind | "folder" | "file"; depth: number; open?: boolean; cost?: number; was?: number; edge?: DiagKind | "changed"; selected?: boolean; count?: number; noText?: boolean; tag?: string };
const tree: TreeRow[] = [
  { label: "Demo Skirmish", kind: "system", depth: 0, open: true },
  { label: "pts", kind: "cost-type", depth: 1, tag: "limit 500" },
  { label: "Profile types", kind: "folder", depth: 1, open: false, count: 2 },
  { label: "Categories", kind: "folder", depth: 1, open: false, count: 3 },
  { label: "Warband", kind: "force", depth: 1 },
  { label: "Shield Wall", kind: "rule", depth: 1, edge: "changed" },
  { label: "Iron Wardens", kind: "system", depth: 0, open: true },
  { label: "Warden Squad", kind: "unit", depth: 1, open: true, cost: 18, was: 20, edge: "preservation", selected: true },
  { label: "Warden", kind: "model", depth: 2, open: false, cost: 8 },
  { label: "Warden Captain", kind: "unit", depth: 1, open: false, cost: 45, edge: "suggestion" },
  { label: "Spear", kind: "upgrade", depth: 1, cost: 0, edge: "suggestion" },
  { label: "Halberd", kind: "upgrade", depth: 1, cost: 2 },
  { label: "Frost Wardens", kind: "system", depth: 0, open: true, tag: "Frost" },
  { label: "Ice Guard", kind: "unit", depth: 1, open: false, cost: 24, edge: "error" },
  { label: "frost-seer", kind: "unit", depth: 1, open: false, cost: 50, edge: "suggestion", noText: true },
  { label: "Rime Blade", kind: "upgrade", depth: 1, cost: 3 },
  { label: "Dataset files", kind: "folder", depth: 0, open: true },
  { label: "dataset.dkl", kind: "file", depth: 1 },
  { label: "bsdata.map", kind: "file", depth: 1 },
  { label: "bsdata.compat.json", kind: "file", depth: 1, tag: "envelope" },
];

const Ref = ({ children, broken }: { children: ReactNode; broken?: boolean }) => <span className={`c-ref${broken ? " broken" : ""}`}>{children}</span>;
const order: DiagKind[] = ["error", "preservation", "suggestion"];

/** Direction C, Augur blend: Battle Augur desktop panes and tokens, Linear speed, the entry as a Notion-style page. */
export function DirectionC({ mode }: { mode: "light" | "dark" }) {
  return (
    <MacWindow mode={mode} className="fc-c">
      <header className="c-chrome">
        <TrafficLights />
        <nav className="c-tabs">
          <button className="active"><KindIcon kind="unit" size={14} />Warden Squad<i className="c-dirty" aria-label="Unsaved" /></button>
          <button><KindIcon kind="unit" size={14} />Ice Guard</button>
          <button><FileCode2 size={14} />house-rules / dataset.dkl</button>
          <button className="c-icon" aria-label="Open entry"><Plus size={15} /></button>
        </nav>
        <button className="c-command"><Search size={14} />Go to entry or run a command<kbd>⌘K</kbd></button>
        <span className="c-chrome-actions">
          <button className="c-btn"><Repeat2 size={14} />Roundtrip</button>
          <button className="c-btn primary"><Play size={13} />Check<kbd>⌘⇧C</kbd></button>
        </span>
      </header>

      <div className="c-body">
        <aside className="c-tree" aria-label="Dataset">
          <div className="c-ds">
            <strong>Demo Skirmish</strong><span className="muted">3.2.0 · lenient</span>
            <button className="c-icon sm" aria-label="Layers"><Layers size={14} /></button>
          </div>
          <ul className="c-layers" aria-label="Layer stack">
            {layers.map((layer, index) => (
              <li key={layer.id} className={layer.on ? "" : "off"}>
                <span className={`c-check${layer.on ? " on" : ""}`}>{layer.on ? <Check size={11} strokeWidth={3} /> : null}</span>
                <span className="c-layer-name">{layer.title.replace(" (homebrew)", "").replace(" (trial)", "")}</span>
                <span className="muted">{index === 0 ? "base" : layer.kind.replace("Variant · ", "")}</span>
              </li>
            ))}
          </ul>
          <div className="c-filter"><Search size={13} /><span>Filter entries</span><kbd>⌘F</kbd></div>
          <ul className="c-rows">
            {tree.map((row) => (
              <li key={row.label + row.depth} className={`c-row d${row.depth}${row.selected ? " selected" : ""}${row.edge ? ` edge-${row.edge}` : ""}${row.depth === 0 ? " top" : ""}`}>
                {row.open === undefined ? <span className="c-tw" /> : row.open ? <ChevronDown size={13} className="c-tw" /> : <ChevronRight size={13} className="c-tw" />}
                {row.kind === "folder" ? null : row.kind === "file" ? <FileCode2 size={14} /> : row.kind ? <KindIcon kind={row.kind} size={14} /> : null}
                <span className={`c-label${row.noText ? " notext" : ""}`}>{row.label}</span>
                {row.count ? <span className="muted">{row.count}</span> : null}
                {row.tag ? <span className="c-tag">{row.tag}</span> : null}
                <span className="c-cost num">{row.was !== undefined ? <s>{row.was}</s> : null}{row.cost ?? ""}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="c-page" aria-label="Entry">
          <div className="c-measure">
            <p className="c-kicker"><KindIcon kind="unit" size={14} />Unit<span>·</span>Iron Wardens<span className="c-layerchip"><Layers size={12} />Base · patched by House rules</span></p>
            <h1>{entry.name}</h1>
            <p className="c-path"><span className="mono">{entry.full}</span><Copy size={12} /><a><ArrowDownLeft size={13} />{backlinks.length} backlinks</a></p>

            <dl className="c-props">
              <div><dt>Categories</dt><dd><span className="c-chip">infantry</span><span className="c-chip">line</span></dd></div>
              <div><dt>Cost</dt><dd><strong className="num">18 pts</strong><s className="muted">20</s><span className="c-changed">House rules</span></dd></div>
              <div><dt>Root</dt><dd className="mono">cat line*</dd></div>
              <div><dt>Rules</dt><dd><Ref>Shield Wall</Ref></dd></div>
              <div><dt>Name (en)</dt><dd>Warden Squad</dd></div>
              <div><dt>BSData id</dt><dd className="mono">{entry.bsdataId}</dd></div>
              <div className="flag"><dt>Source key</dt><dd className="mono">{entry.extra.key}: {entry.extra.value}<DiagIcon kind="preservation" size={13} /><DiagIcon kind="suggestion" size={13} /></dd></div>
            </dl>

            <h2 className="c-h">Statements<span className="muted"><kbd>/</kbd> insert <kbd>@</kbd> reference <kbd>⌥↑↓</kbd> move</span><span className="c-colhead">pts</span></h2>
            <ol className="c-stmts">
              <li className="s0"><ChevronDown size={13} className="c-tw" /><span className="c-kw">model</span><strong>warden</strong><span className="mono">5..10</span><span className="c-cost num">8</span></li>
              <li className="s1"><span className="c-tw" /><span className="c-kw">profile</span><span className="mono">warden:</span><Ref>fighter</Ref><span className="c-cells"><span>M <b>5"</b></span><span>A <b>3</b></span><span>W <b>1</b></span></span></li>
              <li className="s1"><ChevronDown size={13} className="c-tw" /><span className="c-kw">upgrade</span><strong>banner</strong><span className="mono">..1</span><span className="c-cost num">10</span></li>
              <li className="s2 focus"><GripVertical size={14} className="c-grip" /><span className="c-tw" /><span className="c-kw">hide when</span><span className="mono">no(</span><Ref>Warden Captain</Ref><span className="mono">in force, deep)</span></li>
              <li className="s1"><ChevronDown size={13} className="c-tw" /><span className="c-kw">group</span><strong>weapon</strong><span className="mono">1 default</span><Ref>Spear</Ref></li>
              <li className="s2"><span className="c-tw" /><span className="c-kw">use</span><Ref>Spear</Ref><span className="c-cost num">0</span></li>
              <li className="s2"><span className="c-tw" /><span className="c-kw">use</span><Ref>Halberd</Ref><span className="c-cost num">2</span></li>
              <li className="s2 empty"><span className="c-tw" /><span className="c-caret" /><span className="muted">Type / to insert a statement</span></li>
            </ol>

            <div className="c-peek" role="presentation">
              <p className="c-peek-head"><KindIcon kind="unit" size={14} /><strong>Warden Captain</strong><span className="mono muted">iron-wardens:warden-captain</span></p>
              <p><span className="c-kw">cost</span><span className="mono">pts 45</span></p>
              <p><span className="c-kw">association</span><span className="mono">leads 0..1 to</span><Ref>Warden Squad</Ref></p>
              <p className="c-peek-foot"><kbd>F12</kbd> open <kbd>⌘↵</kbd> open in new tab <kbd>Esc</kbd> close</p>
            </div>

            <h2 className="c-h">Referenced by<span className="muted">{backlinks.length}</span></h2>
            <ul className="c-backlinks">
              {backlinks.map((link) => (
                <li key={link.from}><ArrowDownLeft size={14} /><span className="mono">{link.from}</span><span className="mono muted">{link.where}</span><span className={`c-tag${link.layer !== "Base" ? " changed" : ""}`}>{link.layer}</span></li>
              ))}
            </ul>
          </div>
        </main>

        <aside className="c-inspector" aria-label="Issues">
          <nav className="c-itabs"><button className="active">Issues<span className="c-count">{diagnostics.length}</span></button><button>Layers</button><button>History</button></nav>
          <div className="c-seg"><button>This entry <span className="muted">2</span></button><button className="active">Dataset <span className="muted">7</span></button></div>
          {order.map((kind) => (
            <section key={kind} className="c-igroup">
              <h3><DiagIcon kind={kind} size={13} />{diagLabel[kind]}<span className="muted">{diagnostics.filter((d) => d.kind === kind).length}</span></h3>
              {diagnostics.filter((d) => d.kind === kind).map((d) => (
                <div key={d.id} className={`c-issue edge-${kind}${d.id === "d1" ? " selected" : ""}${d.where === entry.full ? " here" : ""}`}>
                  <p>{d.message.split("`").map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part))}</p>
                  <p className="mono muted">{d.where}</p>
                  {d.id === "d1" ? <span className="c-fix"><button className="c-btn primary sm"><CornerDownLeft size={12} />{d.fix?.replace(/`/g, "")}</button><button className="c-btn sm">Go to</button><button className="c-icon sm" aria-label="Dismiss"><X size={13} /></button></span> : null}
                </div>
              ))}
            </section>
          ))}
          <p className="c-ifoot"><kbd>J</kbd><kbd>K</kbd> move <kbd>↵</kbd> apply fix <kbd>G</kbd> go to</p>
        </aside>
      </div>

      <footer className="c-status">
        <span><i className="c-dot err" />Checked 2 min ago · 1 error</span>
        <span>3 of 4 layers</span>
        <span>dklpo 1.0</span>
        <span className="c-spacer" />
        <span>Unsaved: 1 entry</span>
        <span>fmt clean</span>
        <span>statement 4 of 8</span>
      </footer>
    </MacWindow>
  );
}
