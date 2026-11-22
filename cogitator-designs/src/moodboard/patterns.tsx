import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, CircleDashed, Filter, GripVertical, Image, Inbox, Layers, Minus, Play, Plus, Search, Square, X } from "lucide-react";
import { DiagIcon, KindIcon } from "../glyphs";
import "./mini.css";

/**
 * The mood board patterns. Each mock is an original drawing in HTML/CSS with Field Cogitator content: it illustrates the
 * pattern, it does not copy any product's chrome, branding or logo.
 */
export type Pattern = { id: string; title: string; verdict: "borrow" | "avoid"; why: string; mock: ReactNode };
export type PatternGroup = { id: string; source: string; blurb: string; patterns: Pattern[] };

const K = ({ children }: { children: ReactNode }) => <kbd className="mm-kbd">{children}</kbd>;
const Bar = ({ w, strong }: { w: number; strong?: boolean }) => <i className={`mm-bar${strong ? " strong" : ""}`} style={{ width: `${w}%` }} />;

export const patternGroups: PatternGroup[] = [
  {
    id: "linear",
    source: "Linear: structure and speed",
    blurb: "A fast list-and-detail tool driven from the keyboard, with quiet chrome and one accent.",
    patterns: [
      {
        id: "palette", title: "Command palette", verdict: "borrow",
        why: "Every command, entry and setting by name from one key (⌘K); data authors live on the keyboard.",
        mock: (
          <div className="mm mm-dim">
            <div className="mm-under"><Bar w={60} /><Bar w={80} /><Bar w={45} /><Bar w={70} /><Bar w={55} /></div>
            <div className="mm-pop mm-palette">
              <div className="mm-input"><Search size={12} /> warden<span className="mm-caret" /></div>
              <div className="mm-h">Entries</div>
              <div className="mm-row sel"><KindIcon kind="unit" size={12} /> Warden Squad <span className="mm-mono mm-muted">iron-wardens</span></div>
              <div className="mm-row"><KindIcon kind="unit" size={12} /> Warden Captain <span className="mm-mono mm-muted">iron-wardens</span></div>
              <div className="mm-h">Commands</div>
              <div className="mm-row"><Play size={12} /> Run checks <K>⌘⇧C</K></div>
            </div>
          </div>
        ),
      },
      {
        id: "grouped-list", title: "Dense grouped list", verdict: "borrow",
        why: "Entries grouped by kind in 28 px rows with aligned columns: many rows in view, no boxes or bands.",
        mock: (
          <div className="mm mm-col">
            <div className="mm-h">Units <span className="mm-muted">2</span></div>
            <div className="mm-row sel"><KindIcon kind="unit" size={12} /> Warden Squad <span className="mm-mono mm-muted">warden-squad</span><span className="mm-num">18</span><DiagIcon kind="preservation" size={12} /></div>
            <div className="mm-row"><KindIcon kind="unit" size={12} /> Warden Captain <span className="mm-mono mm-muted">warden-captain</span><span className="mm-num">45</span><DiagIcon kind="suggestion" size={12} /></div>
            <div className="mm-h">Upgrades <span className="mm-muted">2</span></div>
            <div className="mm-row"><KindIcon kind="upgrade" size={12} /> Spear <span className="mm-mono mm-muted">spear</span><span className="mm-num">0</span><DiagIcon kind="suggestion" size={12} /></div>
            <div className="mm-row"><KindIcon kind="upgrade" size={12} /> Halberd <span className="mm-mono mm-muted">halberd</span><span className="mm-num">2</span><span className="mm-gap" /></div>
          </div>
        ),
      },
      {
        id: "properties", title: "Properties panel beside the detail", verdict: "borrow",
        why: "Structured fields (kind, cost, categories, layer) edit as properties; the body stays free for statements.",
        mock: (
          <div className="mm">
            <div className="mm-main">
              <div className="mm-title">Warden Squad</div>
              <div className="mm-mono mm-muted">iron-wardens:warden-squad</div>
              <div className="mm-lines"><Bar w={90} /><Bar w={70} /><Bar w={82} /><Bar w={50} /></div>
            </div>
            <div className="mm-props">
              <div><span>Kind</span><b><KindIcon kind="unit" size={11} /> Unit</b></div>
              <div><span>Cost</span><b className="mm-tab">18 pts</b></div>
              <div><span>Categories</span><b><i className="mm-chip">infantry</i><i className="mm-chip">line</i></b></div>
              <div><span>Layer</span><b><Layers size={11} /> House rules</b></div>
            </div>
          </div>
        ),
      },
      {
        id: "inbox", title: "Diagnostics as an inbox", verdict: "borrow",
        why: "Diagnostics are a to-do list: grouped by kind, triaged with keys, gone when the check passes.",
        mock: (
          <div className="mm">
            <div className="mm-list">
              <div className="mm-h"><Inbox size={12} /> Inbox <span className="mm-muted">7</span></div>
              <div className="mm-row sel"><DiagIcon kind="error" size={12} /> Unknown ref <span className="mm-mono">halbred</span><i className="mm-unread" /></div>
              <div className="mm-row"><DiagIcon kind="preservation" size={12} /> Comment moves on export<i className="mm-unread" /></div>
              <div className="mm-row"><DiagIcon kind="preservation" size={12} /> Prefix not restored</div>
              <div className="mm-row"><DiagIcon kind="suggestion" size={12} /> <span className="mm-mono">cost pts 0</span> is default</div>
            </div>
            <div className="mm-preview">
              <div className="mm-mono mm-muted">ref-unknown</div>
              <div className="mm-strong">ice-guard/weapon</div>
              <div className="mm-code">use <u>halbred</u></div>
              <span className="mm-btn">Change to halberd</span>
              <div className="mm-muted mm-keys"><K>E</K> done <K>H</K> snooze</div>
            </div>
          </div>
        ),
      },
      {
        id: "views", title: "Saved views and filters", verdict: "borrow",
        why: "Saved filters like Unreferenced or Changed by a layer answer recurring questions in one click.",
        mock: (
          <div className="mm">
            <div className="mm-side">
              <div className="mm-h">Views</div>
              <div className="mm-row">All entries<span className="mm-num">24</span></div>
              <div className="mm-row sel">Changed by layers<span className="mm-num">3</span></div>
              <div className="mm-row">Unreferenced<span className="mm-num">1</span></div>
              <div className="mm-row">With diagnostics<span className="mm-num">7</span></div>
            </div>
            <div className="mm-main">
              <div className="mm-filters"><i className="mm-chip on"><Filter size={10} /> Layer is not Base</i><i className="mm-chip">+ Filter</i></div>
              <div className="mm-row"><KindIcon kind="unit" size={12} /> Warden Squad<span className="mm-num">18</span></div>
              <div className="mm-row"><KindIcon kind="unit" size={12} /> Ice Guard<span className="mm-num">24</span></div>
              <div className="mm-row"><KindIcon kind="upgrade" size={12} /> Rime Blade<span className="mm-num">3</span></div>
            </div>
          </div>
        ),
      },
      {
        id: "shortcuts", title: "Shortcut hints in every menu", verdict: "borrow",
        why: "Each action names its key where it appears, so pointer users pick up the keyboard path.",
        mock: (
          <div className="mm mm-dim">
            <div className="mm-under"><div className="mm-code">hide when no(<u>warden-captain</u> in force)</div><Bar w={50} /><Bar w={65} /></div>
            <div className="mm-pop mm-menu">
              <div className="mm-row sel">Go to definition <K>F12</K></div>
              <div className="mm-row">Peek <K>⌥F12</K></div>
              <div className="mm-row">Show backlinks <K>⇧F12</K></div>
              <div className="mm-row">Rename… <K>F2</K></div>
              <div className="mm-row">Copy path <K>⌘⇧C</K></div>
            </div>
          </div>
        ),
      },
      {
        id: "workflow", title: "Issue states, assignees and cycles", verdict: "avoid",
        why: "Diagnostics come from checks, not from people filing them; states, owners and sprints would be invented work.",
        mock: (
          <div className="mm mm-col">
            <div className="mm-row"><CircleDashed size={12} /> Unknown ref halbred<i className="mm-chip">In progress</i><i className="mm-avatar">AB</i></div>
            <div className="mm-row"><CircleDashed size={12} /> Comment moves on export<i className="mm-chip">Backlog</i><i className="mm-avatar">CD</i></div>
            <div className="mm-row"><CircleDashed size={12} /> Prefix not restored<i className="mm-chip">Todo</i><i className="mm-avatar">AB</i></div>
            <div className="mm-foot mm-muted">Cycle 12 · 3 of 7 assigned · priority: high</div>
          </div>
        ),
      },
      {
        id: "tiny-meta", title: "Small, faint metadata", verdict: "avoid",
        why: "10–11 px low-contrast text fits more but fails large text and dark themes; metadata stays at 12 px and readable.",
        mock: (
          <div className="mm mm-col">
            <div className="mm-row">Warden Squad<span className="mm-faint">unit · iron-wardens · 3 refs · edited 2m</span></div>
            <div className="mm-row">Warden Captain<span className="mm-faint">unit · iron-wardens · 1 ref · edited 1h</span></div>
            <div className="mm-row">Spear<span className="mm-faint">upgrade · iron-wardens · 4 refs</span></div>
            <div className="mm-row">Halberd<span className="mm-faint">upgrade · iron-wardens · 2 refs</span></div>
          </div>
        ),
      },
    ],
  },
  {
    id: "augur",
    source: "Battle Augur desktop: flavour",
    blurb: "The family's own desktop app: native window frames, tokens and accent, tree and inspector panes, status edges.",
    patterns: [
      {
        id: "frames", title: "macOS and Windows frames", verdict: "borrow",
        why: "One family: traffic lights and menu commands on macOS, caption buttons, 4 px corners and Segoe on Windows.",
        mock: (
          <div className="mm mm-pair">
            <div className="mm-win mac"><div className="mm-winbar"><span className="mm-lights"><i /><i /><i /></span><span>demo-skirmish</span></div><div className="mm-lines"><Bar w={70} /><Bar w={50} /><Bar w={60} /></div></div>
            <div className="mm-win win"><div className="mm-winbar"><span>demo-skirmish</span><span className="mm-caps"><Minus size={10} /><Square size={9} /><X size={10} /></span></div><div className="mm-lines"><Bar w={70} /><Bar w={50} /><Bar w={60} /></div></div>
          </div>
        ),
      },
      {
        id: "panes", title: "Tree and inspector panes", verdict: "borrow",
        why: "Two tones and one hairline: the tree on the window canvas, the work on the pane tone, the inspector beside it.",
        mock: (
          <div className="mm mm-tones">
            <div className="mm-side">
              <div className="mm-row"><ChevronDown size={11} /> iron-wardens</div>
              <div className="mm-row ind sel"><KindIcon kind="unit" size={11} /> Warden Squad</div>
              <div className="mm-row ind"><KindIcon kind="unit" size={11} /> Warden Captain</div>
              <div className="mm-row"><ChevronRight size={11} /> frost-wardens</div>
            </div>
            <div className="mm-main pane"><div className="mm-title">Warden Squad</div><div className="mm-lines"><Bar w={80} /><Bar w={60} /><Bar w={72} /></div></div>
            <div className="mm-side right"><div className="mm-h">Issues</div><div className="mm-row"><DiagIcon kind="preservation" size={11} /> 1</div><div className="mm-row"><DiagIcon kind="suggestion" size={11} /> 1</div></div>
          </div>
        ),
      },
      {
        id: "cost-column", title: "Aligned cost column", verdict: "borrow",
        why: "Costs and ranges in tabular figures in one column: compare at a glance, with a layer's change beside the base value.",
        mock: (
          <div className="mm mm-col">
            <div className="mm-row"><KindIcon kind="unit" size={12} /> Warden Squad<span className="mm-was">20</span><span className="mm-num acc">18</span></div>
            <div className="mm-row"><KindIcon kind="unit" size={12} /> Warden Captain<span className="mm-num">45</span></div>
            <div className="mm-row"><KindIcon kind="unit" size={12} /> Ice Guard<span className="mm-num">24</span></div>
            <div className="mm-row"><KindIcon kind="upgrade" size={12} /> Halberd<span className="mm-num">2</span></div>
            <div className="mm-row"><KindIcon kind="upgrade" size={12} /> Spear<span className="mm-num">0</span></div>
          </div>
        ),
      },
      {
        id: "status-edges", title: "Status edges on rows", verdict: "borrow",
        why: "A 3 px edge says error, preservation failure, suggestion or changed by a layer; rows stay distinct without dividers.",
        mock: (
          <div className="mm mm-col">
            <div className="mm-row edge error"><KindIcon kind="unit" size={12} /> Ice Guard <span className="mm-muted">error</span></div>
            <div className="mm-row edge preservation"><KindIcon kind="unit" size={12} /> Warden Squad <span className="mm-muted">preservation</span></div>
            <div className="mm-row edge suggestion"><KindIcon kind="upgrade" size={12} /> Spear <span className="mm-muted">suggestion</span></div>
            <div className="mm-row edge changed"><KindIcon kind="rule" size={12} /> Shield Wall <span className="mm-muted">changed by a layer</span></div>
            <div className="mm-row edge"><KindIcon kind="upgrade" size={12} /> Halberd <span className="mm-muted">clean</span></div>
          </div>
        ),
      },
      {
        id: "tabs-chrome", title: "Tabs and actions in the 44 px chrome row", verdict: "borrow",
        why: "Open entries as tabs in the title-bar row, with Check and a job pill; no separate toolbar spends a row.",
        mock: (
          <div className="mm mm-col">
            <div className="mm-chrome">
              <span className="mm-lights"><i /><i /><i /></span>
              <span className="mm-tab-item on">Warden Squad<i className="mm-dirty" /></span>
              <span className="mm-tab-item">Ice Guard</span>
              <span className="mm-spacer" />
              <span className="mm-job">Roundtrip 62%</span>
            </div>
            <div className="mm-lines pad"><Bar w={40} strong /><Bar w={80} /><Bar w={65} /><Bar w={75} /></div>
          </div>
        ),
      },
      {
        id: "symbols", title: "Category symbols", verdict: "borrow",
        why: "One glyph per declaration kind makes long trees scannable without relying on colour.",
        mock: (
          <div className="mm mm-grid">
            {(["unit", "model", "upgrade", "group", "rule", "category", "force", "profile-type"] as const).map((kind) => (
              <span key={kind}><KindIcon kind={kind} size={14} /> {kind}</span>
            ))}
          </div>
        ),
      },
      {
        id: "budget", title: "Points budget header", verdict: "avoid",
        why: "A roster's big points total means nothing for a dataset; that header space goes to the path, layer and checks.",
        mock: (
          <div className="mm mm-col">
            <div className="mm-budget"><div><div className="mm-muted">Warband · First Watch</div><div className="mm-title">Example roster</div></div><div className="mm-big">177<small> / 500 pts</small></div></div>
            <div className="mm-lines pad"><Bar w={80} /><Bar w={60} /></div>
          </div>
        ),
      },
      {
        id: "ambient", title: "Ambient gradient backdrop", verdict: "avoid",
        why: "Decoration behind working text costs contrast in some schemes; an editor stays flat.",
        mock: (
          <div className="mm mm-ambient">
            <div className="mm-title">Open a dataset</div>
            <div className="mm-muted">Recent: demo-skirmish · 3 add-ons</div>
          </div>
        ),
      },
    ],
  },
  {
    id: "notion",
    source: "Notion: content",
    blurb: "Pages made of blocks: a title, a properties block, / to insert, mentions with backlinks, table views.",
    patterns: [
      {
        id: "page", title: "Entry as a page", verdict: "borrow",
        why: "Title, a properties block, then the body: one entry reads top to bottom in file order.",
        mock: (
          <div className="mm mm-doc">
            <div className="mm-doc-icon"><KindIcon kind="unit" size={16} /></div>
            <div className="mm-title lg">Warden Squad</div>
            <div className="mm-prop"><span>Kind</span>Unit</div>
            <div className="mm-prop"><span>Cost</span><b className="mm-tab">18 pts</b></div>
            <div className="mm-prop"><span>Categories</span><i className="mm-chip">infantry</i><i className="mm-chip">line</i></div>
            <div className="mm-lines"><Bar w={85} /><Bar w={60} /></div>
          </div>
        ),
      },
      {
        id: "slash", title: "/ to insert a statement", verdict: "borrow",
        why: "Typing / lists only the statements valid at the cursor, each with its syntax, so authors learn the format while writing.",
        mock: (
          <div className="mm mm-doc">
            <div className="mm-code">model warden 5..10</div>
            <div className="mm-code ind">cost pts 8</div>
            <div className="mm-code ind">/up<span className="mm-caret" /></div>
            <div className="mm-pop mm-slash">
              <div className="mm-h">Valid in model</div>
              <div className="mm-row sel"><KindIcon kind="upgrade" size={12} /> upgrade <span className="mm-mono mm-muted">key range</span></div>
              <div className="mm-row"><KindIcon kind="group" size={12} /> group <span className="mm-mono mm-muted">key n default</span></div>
              <div className="mm-row"><KindIcon kind="profile-type" size={12} /> profile <span className="mm-mono mm-muted">key: type | …</span></div>
            </div>
          </div>
        ),
      },
      {
        id: "mentions", title: "References as mentions, with peek", verdict: "borrow",
        why: "A reference shows its target's name; hover peeks at it, ⌘-click goes there, a broken one is marked in place.",
        mock: (
          <div className="mm mm-doc">
            <div className="mm-code">hide when no(<span className="mm-mention">Warden Captain</span> in force, deep)</div>
            <div className="mm-code">use <span className="mm-mention broken">halbred</span></div>
            <div className="mm-pop mm-peek">
              <div className="mm-strong"><KindIcon kind="unit" size={12} /> Warden Captain</div>
              <div className="mm-mono mm-muted">iron-wardens:warden-captain</div>
              <div className="mm-code">cost pts 45</div>
              <div className="mm-code">association leads 0..1</div>
            </div>
          </div>
        ),
      },
      {
        id: "backlinks", title: "Backlinks at the page foot", verdict: "borrow",
        why: "Every entry lists what refers to it, layers included, so a rename or removal shows its reach first.",
        mock: (
          <div className="mm mm-doc">
            <div className="mm-lines"><Bar w={80} /><Bar w={55} /></div>
            <div className="mm-h">3 backlinks</div>
            <div className="mm-row"><KindIcon kind="system" size={12} /> iron-wardens <span className="mm-mono mm-muted">root use</span></div>
            <div className="mm-row"><KindIcon kind="unit" size={12} /> Warden Captain <span className="mm-mono mm-muted">leads … to</span></div>
            <div className="mm-row"><Layers size={12} /> House rules <span className="mm-mono mm-muted">patch cost</span></div>
          </div>
        ),
      },
      {
        id: "table", title: "Table view of a collection", verdict: "borrow",
        why: "Entries as rows and properties as columns for bulk edits, such as every cost in a module, without opening pages.",
        mock: (
          <div className="mm mm-col">
            <table className="mm-table">
              <thead><tr><th>Name</th><th>Kind</th><th>Cost</th><th>Categories</th></tr></thead>
              <tbody>
                <tr><td>Warden Squad</td><td>unit</td><td className="mm-tab">18</td><td>infantry, line</td></tr>
                <tr className="edit"><td>Warden Captain</td><td>unit</td><td className="mm-tab"><span className="mm-cell">45</span></td><td>infantry</td></tr>
                <tr><td>Spear</td><td>upgrade</td><td className="mm-tab">0</td><td>—</td></tr>
                <tr><td>Halberd</td><td>upgrade</td><td className="mm-tab">2</td><td>—</td></tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        id: "toggles", title: "Toggles for nested statements", verdict: "borrow",
        why: "Nested statements fold like toggle blocks; a long unit collapses to its models and groups.",
        mock: (
          <div className="mm mm-doc">
            <div className="mm-row"><ChevronDown size={12} /><span className="mm-code">model warden 5..10</span></div>
            <div className="mm-row ind"><ChevronRight size={12} /><span className="mm-code">upgrade banner ..1</span><span className="mm-muted">2 lines</span></div>
            <div className="mm-row ind"><ChevronDown size={12} /><span className="mm-code">group weapon 1 default spear</span></div>
            <div className="mm-row ind2"><GripVertical size={12} className="mm-grip" /><span className="mm-code">use spear</span></div>
            <div className="mm-row ind2"><Plus size={12} className="mm-grip" /><span className="mm-code">use halberd</span></div>
          </div>
        ),
      },
      {
        id: "canvas", title: "Free-form canvas", verdict: "avoid",
        why: "Columns, images and blocks placed anywhere can't round-trip through a grammar; page order is file order.",
        mock: (
          <div className="mm mm-canvas">
            <div className="mm-blk"><Bar w={80} /><Bar w={60} /></div>
            <div className="mm-blk img"><Image size={18} /></div>
            <div className="mm-blk callout">Remember to rebalance!</div>
            <div className="mm-blk"><Bar w={70} /><Bar w={40} /></div>
          </div>
        ),
      },
      {
        id: "airy", title: "Airy page spacing", verdict: "avoid",
        why: "Wide margins and a 40 px title show one entry and little else; keep the page idea, not the spacing.",
        mock: (
          <div className="mm mm-airy">
            <div className="mm-title xl">Warden Squad</div>
            <Bar w={50} />
          </div>
        ),
      },
    ],
  },
];
