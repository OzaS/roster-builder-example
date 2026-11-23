import { ArrowRightLeft, Check, ChevronDown, ChevronsUpDown, FileArchive, FileWarning, Folder, FolderOpen, SquareX, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { State } from "../../language/Specimen";
import type { E1Platform } from "../types";
import { recents } from "./data";
import { CheckCounts, Dialog, ProgressRow, RecentHeads, RecentRow, SetRow, Toggle, keyFor } from "./parts";
import { settingsSections } from "./Settings";

/**
 * Elements view renderers for part A's primitives (start window, open errors, settings). The Elements page merges these
 * into its own renderer table; the entries are listed in `cogitator.design.json` (`elements.sections`, section "e1-start").
 */
type Renderer = { paper?: "pane" | "surface" | "none"; wide?: boolean; render: (mode: "light" | "dark", platform: E1Platform) => ReactNode; after?: ReactNode };
const noop = () => undefined;
const r = (id: string) => recents.find((x) => x.id === id)!;

export const startElementRenderers: Record<string, Renderer> = {
  "e1.recent-row": {
    wide: true,
    render: (_mode, platform) => (
      <div className="cg-stack" style={{ maxWidth: 900 }}>
        <RecentHeads />
        <State label="Default, suggestion edge"><RecentRow r={r("ember-leagues")} platform={platform} /></State>
        <State label="Selected: the last check and the actions on a second line">
          <RecentRow r={r("demo-skirmish")} platform={platform} selected more={<><CheckCounts counts={r("demo-skirmish").lastCheck!.counts} when="today" /><span className="cg-recent-actions"><button type="button" className="d-btn primary sm">Open<kbd>{keyFor(platform, "↵", "Enter")}</kbd></button><button type="button" className="d-btn sm">{platform === "mac" ? "Show in Finder" : "Show in Explorer"}</button></span></>} />
        </State>
        <State label="Archive tag, preservation edge"><RecentRow r={r("lantern-watch")} platform={platform} /></State>
        <State label="Missing on disk: no edge, the folder cell says so"><RecentRow r={r("glass-moors")} platform={platform} /></State>
        <State label="Hover"><div className="cg-recent is-hover"><div className="cg-recent-line"><Folder size={15} /><span className="cg-recent-name"><span>Copper Vale</span></span><span className="cg-recent-path"><bdi dir="ltr">{r("copper-vale").path[platform]}</bdi></span><span className="cg-recent-cell num">1.2</span><span className="cg-recent-cell num">1 of 1</span><span className="cg-recent-cell">Wed 12 Nov</span></div></div></State>
      </div>
    ),
    after: <p className="cg-lang-text">The status edge is the last check's worst kind (error, preservation failure, suggestion); a clean or never-checked dataset has none. Names wrap instead of truncating; a long folder path loses its start, not its end. Large text: rows grow from a minimum height and every cell wraps.</p>,
  },

  "e1.progress-row": {
    render: () => (
      <div className="cg-col" style={{ width: 440, maxWidth: "100%" }}>
        <State label="Done"><ProgressRow status="done" label="Reading files" count="31 files · 412 KB" /></State>
        <State label="Running, with a bar"><ProgressRow status="running" label="Compiling" count="3 of 5 modules" value={0.6} /></State>
        <State label="Waiting"><ProgressRow status="waiting" label="Checking" /></State>
        <State label="Failed"><ProgressRow status="failed" label="Writing the dataset" count="Disk full" /></State>
      </div>
    ),
  },

  "e1.drop-target": {
    render: () => (
      <div className="cg-col" style={{ width: 440, maxWidth: "100%" }}>
        <State label="Idle"><div className="cg-drop"><Upload size={16} />Drop a dataset folder or a .zip archive here to open it</div></State>
        <State label="Dragging over it"><div className="cg-drop over"><Upload size={16} />Drop to open</div></State>
      </div>
    ),
  },

  "e1.dialog": {
    paper: "none",
    render: (_mode, platform) => (
      <Dialog platform={platform} tone="warn" icon={<FileWarning size={18} />} title="Copper Vale was written for a newer DKLPO version" target={platform === "mac" ? "~/Downloads/copper-vale" : "C:\\Users\\you\\Downloads\\copper-vale"}
        actions={[{ label: "Cancel", cancel: true, onClick: noop }, { label: "Open read-only", kind: "primary", onClick: noop }]}>
        <p>The dataset says <code>dklpo 1.2</code>; this build of Field Cogitator reads DKLPO 1.0.</p>
      </Dialog>
    ),
    after: <p className="cg-lang-text">macOS draws it as a sheet just below the title row (a light scrim); Windows as a centred dialog with a footer band, the choices in equal widths, the primary first and Cancel last. Each: an icon in the status tone, what happened in one sentence, the file or folder in mono, the choices as verbs; Return / Enter does the primary, Esc the safe choice. A destructive choice (Don't save, Reload and discard my edits) is red text and sits at the far left on macOS.</p>,
  },

  "e1.popover-sections": {
    paper: "none",
    render: (_mode, platform) => (
      <div className="cg-menu wide" role="menu" aria-label="Datasets">
        <div className="cg-menu-head"><span className="d-ws-mark" aria-hidden>D</span><strong>Demo Skirmish</strong><span className="mono" style={{ gridColumn: 2 }}>{platform === "mac" ? "~/Datasets/demo-skirmish" : "C:\\Users\\you\\Datasets\\demo-skirmish"}</span><small>DKLPO 1.0 · 3 of 4 layers on · 5 modules</small></div>
        <div className="cg-menu-sep" role="separator" />
        <p className="cg-menu-label section">Recent datasets</p>
        <button type="button" role="menuitem" className="cg-menu-item two is-hover"><Folder size={15} /><span><span>Ember Leagues</span><span className="mono">{platform === "mac" ? "~/Datasets/ember-leagues" : "C:\\Users\\you\\Datasets\\ember-leagues"}</span></span></button>
        <button type="button" role="menuitem" className="cg-menu-item two"><FileArchive size={15} /><span><span>Lantern Watch</span><span className="mono">lantern-watch.zip</span></span><span className="cg-tag">Archive</span></button>
        <div className="cg-menu-sep" role="separator" />
        <button type="button" role="menuitem" className="cg-menu-item"><FolderOpen size={15} />Open folder…<span className="cg-menu-key">{keyFor(platform, "⌘O", "Ctrl+O")}</span></button>
        <button type="button" role="menuitem" className="cg-menu-item"><ArrowRightLeft size={15} />Convert from XML data…</button>
        <div className="cg-menu-sep" role="separator" />
        <button type="button" role="menuitem" className="cg-menu-item"><SquareX size={15} />Close dataset<span className="cg-menu-key">{keyFor(platform, "⇧⌘W", "Ctrl+Shift+W")}</span></button>
      </div>
    ),
    after: <p className="cg-lang-text">The context menu, wider, with a head block (the open dataset: mark, title, folder, version and layers) and section labels; two-line items carry a folder in mono. Ember Leagues is hovered.</p>,
  },

  "e1.settings-row": {
    wide: true,
    render: (_mode, platform) => (
      <div className="cg-stack" style={{ maxWidth: 640 }}>
        <SetRow label={platform === "mac" ? "At start:" : "Open the last dataset"} help="A row: label, control, help text."><Toggle platform={platform} on text="Open the last dataset" /></SetRow>
        <SetRow label={platform === "mac" ? "" : "Run checks on save"} help="Off."><Toggle platform={platform} on={false} text="Run checks on save" /></SetRow>
        <SetRow label={platform === "mac" ? "" : "Format on save"} help="Unavailable while the dataset is read-only; the help and the tooltip say why."><Toggle platform={platform} on={false} text="Format on save" disabled title="The dataset is open read-only" /></SetRow>
        <SetRow label={platform === "mac" ? "Font size:" : "Font size"} help="Pop-up button (macOS) / drop-down (Windows), closed.">
          <span className="cg-select-wrap"><button type="button" className="cg-select">{platform === "mac" ? "13 px (system)" : "14 px (system)"}{platform === "mac" ? <ChevronsUpDown size={13} /> : <ChevronDown size={15} />}</button></span>
        </SetRow>
        <SetRow top stack label={platform === "mac" ? "Check level:" : "Check level by default"} help="Radios with a note per option.">
          <span className="cg-radios" role="radiogroup" aria-label="Check level">
            <button type="button" role="radio" aria-checked className="cg-radio"><i /><span>Lenient</span><small>Errors and preservation failures; suggestions as hints</small></button>
            <button type="button" role="radio" aria-checked={false} className="cg-radio"><i /><span>Strict</span></button>
          </span>
        </SetRow>
        <State label="Pop-up / drop-down open: the context-menu primitive, the current option ticked, 20 hovered">
          <span className="cg-select-wrap is-open"><button type="button" className="cg-select" aria-expanded>10{platform === "mac" ? <ChevronsUpDown size={13} /> : <ChevronDown size={15} />}</button>
            <span className="cg-menu" role="listbox" aria-label="Recent datasets to keep">{["5", "10", "20"].map((o) => <button key={o} type="button" role="option" aria-selected={o === "10"} className={`cg-menu-item${o === "20" ? " is-hover" : ""}`}>{o === "10" ? <Check size={14} /> : <span style={{ width: 14 }} />}{o}</button>)}</span>
          </span>
        </State>
      </div>
    ),
    after: <p className="cg-lang-text">macOS: the classic preferences layout (label right-aligned at the left, the control and its help at the right; checkboxes carry their own text, so a group label names several). Windows: label and help at the left, the control at the right edge (switches with On / Off), radios stacked below the label; rows are an open list separated by space, hover tints the row; no setting cards.</p>,
  },

  "e1.settings-nav": {
    render: (_mode, platform) => platform === "mac" ? (
      <div className="cg-tooltabs" role="tablist" aria-label="Settings sections" style={{ justifyContent: "flex-start", padding: 0 }}>
        {settingsSections.map((s, i) => <button key={s.id} type="button" role="tab" aria-selected={i === 2} className={`cg-tooltab${i === 4 ? " is-hover" : ""}`}>{s.icon}{s.title}</button>)}
      </div>
    ) : (
      <nav className="cg-navlist" style={{ width: 232, maxWidth: "100%" }} aria-label="Settings sections">
        {settingsSections.map((s, i) => <button key={s.id} type="button" className={`cg-navitem${i === 4 ? " is-hover" : ""}`} aria-current={i === 2 ? "page" : undefined}>{s.icon}{s.title}</button>)}
      </nav>
    ),
    after: <p className="cg-lang-text">macOS: toolbar tabs, icon above label, the selected one in the press fill with an accent icon (Checking selected, Appearance hovered). Windows: a navigation list with the accent indicator bar on the current item.</p>,
  },

  "e1.shortcut-list": {
    render: (_mode, platform) => (
      <div className="cg-col" style={{ width: 420, maxWidth: "100%" }}>
        <h3 className="cg-set-heading">Find and move</h3>
        <div className="cg-keys">
          {[["Search entries and commands", platform === "mac" ? ["⌘", "K"] : ["Ctrl", "K"]], ["Show backlinks", platform === "mac" ? ["⇧", "F12"] : ["Shift", "F12"]], ["Focus mode", platform === "mac" ? ["⌘", "."] : ["Ctrl", "."]]].map(([what, keys]) => (
            <div key={what as string} className="cg-keyrow"><span>{what}</span><span>{(keys as string[]).map((k) => <kbd key={k}>{k}</kbd>)}</span></div>
          ))}
        </div>
      </div>
    ),
    after: <p className="cg-lang-text">Read-only in E1: one keycap per key, macOS glyphs and Windows names, grouped by task with a filter above.</p>,
  },
};
