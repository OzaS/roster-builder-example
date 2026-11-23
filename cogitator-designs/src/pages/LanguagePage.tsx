import { TrackChip } from "@designs/kit";
import {
  ArrowDownLeft, Bell, Check, ChevronDown, ChevronRight, Code2, CornerDownLeft, EyeOff, FileText, Focus, Layers, Maximize2, Minimize2, Minus,
  PanelRightOpen, PictureInPicture2, Play, Plus, Search, SlidersHorizontal, Table2, Undo2, X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DiagIcon, KindIcon } from "../glyphs";
import { collapseSteps, layout } from "../language/layout";
import { contrast, hex, modes, over, Spec, useTokenColors, useTokenLengths, type Mode, type Platform, type RGBA } from "../language/Specimen";
import type { DiagKind, Kind } from "../sample";

/* ---------- Colour ---------- */

const swatchGroups: { label: string; tokens: { name: string; use: string }[] }[] = [
  { label: "Surfaces", tokens: [
    { name: "--cg-surface", use: "Sidebar, panel, window paper" },
    { name: "--cg-pane", use: "Source list, page" },
    { name: "--cg-float", use: "Raised objects only" },
    { name: "--cg-line", use: "Pane edges, hairlines" },
  ] },
  { label: "Text", tokens: [
    { name: "--cg-ink", use: "Text, names, values" },
    { name: "--cg-muted", use: "Secondary text, keys, counts" },
    { name: "--cg-accent-text", use: "Links, mentions, active icons" },
    { name: "--cg-accent-ink", use: "Text on the accent" },
  ] },
  { label: "Accent and states", tokens: [
    { name: "--cg-accent", use: "Primary button, changed dot, focus" },
    { name: "--cg-hover", use: "Hover (ink 5%)" },
    { name: "--cg-press", use: "Pressed, active tab (ink 10%)" },
    { name: "--cg-select", use: "Selection (accent 14%)" },
    { name: "--cg-mention", use: "Mention chip (accent 10%)" },
  ] },
  { label: "Status", tokens: [
    { name: "--cg-status-error", use: "Error: edge, icon, broken reference" },
    { name: "--cg-status-preservation", use: "Preservation failure (amber)" },
    { name: "--cg-status-suggestion", use: "Suggestion (cool)" },
    { name: "--cg-status-ok", use: "Saved, fixed, diff additions" },
    { name: "--cg-badge-error", use: "Count badge fill (error 16%)" },
    { name: "--cg-badge-error-text", use: "Count badge number (error 80% with ink in light)" },
  ] },
  { label: "Tag hues (mixed 20% into the paper)", tokens: [
    { name: "--cg-tag-1", use: "Tag tone 1" },
    { name: "--cg-tag-2", use: "Tag tone 2" },
    { name: "--cg-tag-3", use: "Tag tone 3" },
  ] },
];

type Pair = { fg: string; bg: string; base?: string; use: string; need: number };
const pairs: Pair[] = [
  { fg: "--cg-ink", bg: "--cg-pane", use: "Text on the list and the page", need: 4.5 },
  { fg: "--cg-ink", bg: "--cg-surface", use: "Sidebar and panel text", need: 4.5 },
  { fg: "--cg-ink", bg: "--cg-float", use: "Helper box, menus, palette", need: 4.5 },
  { fg: "--cg-ink", bg: "--cg-select", base: "--cg-surface", use: "Active sidebar item", need: 4.5 },
  { fg: "--cg-muted", bg: "--cg-pane", use: "Secondary text, column heads, keywords", need: 4.5 },
  { fg: "--cg-muted", bg: "--cg-surface", use: "Sidebar headings and counts", need: 4.5 },
  { fg: "--cg-muted", bg: "--cg-float", use: "Muted text in floating objects", need: 4.5 },
  { fg: "--cg-muted", bg: "--cg-hover", base: "--cg-pane", use: "Filter placeholder (hover fill)", need: 4.5 },
  { fg: "--cg-accent-text", bg: "--cg-pane", use: "Links, Open all, Clear filter", need: 4.5 },
  { fg: "--cg-accent-text", bg: "--cg-mention", base: "--cg-pane", use: "Mention chips", need: 4.5 },
  { fg: "--cg-accent-text", bg: "--cg-select", base: "--cg-pane", use: "Layer chip, Exit focus", need: 4.5 },
  { fg: "--cg-accent-ink", bg: "--cg-accent", use: "Primary button", need: 4.5 },
  { fg: "--cg-status-error", bg: "--cg-pane", use: "Broken reference, error text", need: 4.5 },
  { fg: "--cg-badge-error-text", bg: "--cg-badge-error", base: "--cg-surface", use: "Updates count badge (11.5 px bold)", need: 4.5 },
  { fg: "--cg-status-preservation", bg: "--cg-pane", use: "Preservation text and icon", need: 4.5 },
  { fg: "--cg-status-suggestion", bg: "--cg-pane", use: "Suggestion text, “No en text” tag", need: 4.5 },
  { fg: "--cg-status-ok", bg: "--cg-pane", use: "Diff additions (11.5 px mono)", need: 4.5 },
];

function Swatches({ mode, onColors }: { mode: Mode; onColors: (mode: Mode, colors: Record<string, RGBA>) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const colors = useTokenColors(ref);
  useEffect(() => { if (Object.keys(colors).length) onColors(mode, colors); }, [colors, mode, onColors]);
  return (
    <Spec mode={mode} paper="pane" specRef={ref} label={`Colour tokens, ${mode}`}>
      <div className="cg-swatches">
        {swatchGroups.map((group) => (
          <div key={group.label}>
            <h4>{group.label}</h4>
            {group.tokens.map((token) => (
              <div key={token.name} className="cg-swatch">
                <i data-token={token.name} style={{ background: token.name.startsWith("--cg-tag") ? `color-mix(in srgb, var(${token.name}) var(--cg-tag-mix), var(--cg-pane))` : `var(${token.name})` }} />
                <span className="cg-swatch-name"><code>{token.name}</code><span>{token.use}</span></span>
                <span className="cg-swatch-hex">{colors[token.name] ? hex(colors[token.name]) : ""}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Spec>
  );
}

function ContrastTable({ colors }: { colors: Partial<Record<Mode, Record<string, RGBA>>> }) {
  const ratio = (mode: Mode, pair: Pair) => {
    const map = colors[mode];
    if (!map?.[pair.fg] || !map[pair.bg]) return undefined;
    const base = pair.base ? map[pair.base] : undefined;
    const bg = map[pair.bg][3] < 1 && base ? over(map[pair.bg], base) : map[pair.bg];
    return contrast(map[pair.fg], bg);
  };
  return (
    <div className="cg-table-wrap">
      <table className="cg-table">
        <thead><tr><th>Text on background</th><th>Where</th><th className="num">Light</th><th className="num">Dark</th><th className="num">Needs</th></tr></thead>
        <tbody>
          {pairs.map((pair) => (
            <tr key={`${pair.fg}-${pair.bg}-${pair.base ?? ""}`}>
              <td><code>{pair.fg.replace("--cg-", "")}</code> on <code>{pair.bg.replace("--cg-", "")}</code>{pair.base ? <> over <code>{pair.base.replace("--cg-", "")}</code></> : null}</td>
              <td>{pair.use}</td>
              {modes.map((mode) => {
                const value = ratio(mode, pair);
                return <td key={mode} className="num">{value === undefined ? "…" : <span className={value >= pair.need ? "cg-pass" : "cg-fail"}>{value.toFixed(2)} {value >= pair.need ? "AA" : "fails"}</span>}</td>;
              })}
              <td className="num">{pair.need}:1</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Type ---------- */

const typeRoles: { role: string; token: string; sample: ReactNode; style: CSSProperties }[] = [
  { role: "Page title", token: "--cg-text-title · --cg-weight-title", sample: "Warden Squad", style: { fontSize: "var(--cg-text-title)", fontWeight: "var(--cg-weight-title)", letterSpacing: "-0.02em", lineHeight: 1.15 } },
  { role: "Title, no text", token: "--cg-text-title-key · mono", sample: "frost-seer", style: { fontSize: "var(--cg-text-title-key)", fontFamily: "var(--cg-mono)", fontStyle: "italic", color: "var(--cg-muted)", lineHeight: 1.2 } },
  { role: "Section heading", token: "--cg-text-section · --cg-weight-section", sample: "Models", style: { fontSize: "var(--cg-text-section)", fontWeight: "var(--cg-weight-section)", letterSpacing: "-0.01em" } },
  { role: "Working text", token: "--cg-text · --cg-leading", sample: "Warden Captain leads Warden Squad, 0 to 1", style: { fontSize: "var(--cg-text)" } },
  { role: "Small", token: "--cg-text-small", sample: "20 in Base · lowered by House rules", style: { fontSize: "var(--cg-text-small)", color: "var(--cg-muted)" } },
  { role: "Section label", token: "--cg-text-caption · 600", sample: "Sources", style: { fontSize: "var(--cg-text-caption)", fontWeight: 600, color: "var(--cg-muted)" } },
  { role: "Micro", token: "--cg-text-micro", sample: "Name   Layer   pts", style: { fontSize: "var(--cg-text-micro)", color: "var(--cg-muted)", whiteSpace: "pre" } },
  { role: "Mono value", token: "--cg-text-mono · --cg-mono", sample: "iron-wardens:warden-squad", style: { fontSize: "var(--cg-text-mono)", fontFamily: "var(--cg-mono)" } },
  { role: "Mono keyword", token: "--cg-text-mono-kw · --cg-mono", sample: "hide when   no(warden-captain in force, deep)", style: { fontSize: "var(--cg-text-mono-kw)", fontFamily: "var(--cg-mono)", color: "var(--cg-muted)", whiteSpace: "pre" } },
];

function TypeScale({ platform }: { platform: Platform }) {
  const [ref, sizes] = useTokenLengths(["--cg-text-title", "--cg-text-title-key", "--cg-text-section", "--cg-text", "--cg-text-small", "--cg-text-caption", "--cg-text-micro", "--cg-text-mono", "--cg-text-mono-kw"]);
  return (
    <Spec mode="light" platform={platform} specRef={ref} label={`Type scale, ${platform}`}>
      <div className="cg-type">
        {typeRoles.map((role) => {
          const size = sizes[role.token.split(" ")[0]];
          return (
            <div key={role.role} className="cg-type-row">
              <div><strong>{role.role}</strong><span>{role.token.split(" · ")[0].replace("--cg-", "")}{size ? ` · ${size}px` : ""}</span></div>
              <div style={role.style}>{role.sample}</div>
            </div>
          );
        })}
      </div>
    </Spec>
  );
}

/* ---------- Density ---------- */

const densityTokens = ["--cg-row", "--cg-control", "--cg-control-sm", "--cg-colheads", "--cg-prop-row", "--cg-menu-item", "--cg-pill", "--cg-header", "--cg-toolbar", "--cg-footer", "--cg-helper-header", "--cg-icon-button", "--cg-row-group-gap"];
const densityUse: Record<string, string> = {
  "--cg-row": "Rows: sidebar items, source rows, group headings, tabs, filter, statement blocks",
  "--cg-control": "Buttons, segmented control, Exit focus",
  "--cg-control-sm": "Small buttons in rows (Fix, Undo, Show diff)",
  "--cg-colheads": "Column heads of the source list",
  "--cg-prop-row": "Property rows of the properties block",
  "--cg-menu-item": "Menu items (/ menu, context menu)",
  "--cg-pill": "Helper pill",
  "--cg-header": "Pane headers: list header, page toolbar, panel tabs, title bar row",
  "--cg-toolbar": "Filter row of the source list",
  "--cg-footer": "Pane footers (key hints)",
  "--cg-helper-header": "Helper box header, dataset switcher",
  "--cg-icon-button": "Icon buttons",
  "--cg-row-group-gap": "Space above a group heading",
};

function Density() {
  const [macRef, mac] = useTokenLengths(densityTokens);
  const [winRef, win] = useTokenLengths(densityTokens);
  const rowsInView = (v: Record<string, number>) => {
    if (!v["--cg-row"]) return undefined;
    const chrome = v["--cg-header"] + v["--cg-toolbar"] + v["--cg-colheads"] + v["--cg-footer"] + 8;
    const area = layout.windowHeight - chrome;
    const rows = Math.floor(area / v["--cg-row"]);
    const group = v["--cg-row"] + v["--cg-row-group-gap"];
    const withHeadings = (() => { let used = 0; let count = 0; const plan = [4, 4, 4, 1]; for (const n of plan) { if (used + group > area) break; used += group; count++; for (let i = 0; i < n && used + v["--cg-row"] <= area; i++) { used += v["--cg-row"]; count++; } } return count; })();
    return { chrome, area, rows, withHeadings };
  };
  const m = rowsInView(mac);
  const w = rowsInView(win);
  return (
    <>
      <div style={{ display: "none" }}>
        <Spec mode="light" specRef={macRef}><span /></Spec>
        <Spec mode="light" platform="windows" specRef={winRef}><span /></Spec>
      </div>
      <div className="cg-table-wrap">
        <table className="cg-table">
          <thead><tr><th>Token</th><th>Used by</th><th className="num">macOS</th><th className="num">Windows</th></tr></thead>
          <tbody>
            {densityTokens.map((token) => (
              <tr key={token}><td><code>{token.replace("--cg-", "")}</code></td><td>{densityUse[token]}</td><td className="num">{mac[token] ?? "…"} px</td><td className="num">{win[token] ?? "…"} px</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Rows in view: the source list in a 900 px window</h3>
      <p>The list column stacks a header, the filter row, the column heads, the rows and a footer. Counted from the tokens above, at a window height of {layout.windowHeight} px:</p>
      <div className="cg-pair">
        {([["macOS", m, mac], ["Windows", w, win]] as const).map(([name, r, v]) => (
          <div key={name}>
            <h4>{name}</h4>
            {r ? (
              <Spec mode="light" platform={name === "Windows" ? "windows" : "mac"} paper="pane" label={`Rows in view, ${name}`}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div className="cg-stackbar" aria-hidden style={{ ["--row-h" as string]: `${v["--cg-row"] / 3}px` }}>
                    <span style={{ height: v["--cg-header"] / 3 }}>header<b>{v["--cg-header"]}</b></span>
                    <span style={{ height: v["--cg-toolbar"] / 3 }}>filter<b>{v["--cg-toolbar"]}</b></span>
                    <span style={{ height: v["--cg-colheads"] / 3 + 4 }}>heads<b>{v["--cg-colheads"]}</b></span>
                    <span className="rows" style={{ height: r.area / 3 }}>{r.rows} rows × {v["--cg-row"]}</span>
                    <span style={{ height: v["--cg-footer"] / 3 + 4, borderBottom: 0 }}>footer<b>{v["--cg-footer"]}</b></span>
                  </div>
                  <ul className="cg-lang-list" style={{ fontSize: "var(--cg-text-small)", paddingLeft: 16 }}>
                    <li><strong>{r.rows} rows</strong> without group headings ({r.area} px of rows).</li>
                    <li><strong>{r.withHeadings} lines</strong> with group headings (Iron Wardens: 4 headings and 13 rows fit {r.withHeadings >= 17 ? "entirely" : "partly"}).</li>
                    <li>Chrome above and below the rows: {r.chrome} px.</li>
                  </ul>
                </div>
              </Spec>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Radii and elevation ---------- */

const radii = ["--cg-radius-chip", "--cg-radius-block", "--cg-radius-control", "--cg-radius-tab", "--cg-radius-group", "--cg-radius-popover", "--cg-radius-float", "--cg-radius-window"];
function Radii({ platform }: { platform: Platform }) {
  const [ref, values] = useTokenLengths(radii);
  return (
    <Spec mode="light" platform={platform} specRef={ref} label={`Radii, ${platform}`}>
      <div className="cg-radii">
        {radii.map((r) => <div key={r}><i style={{ borderRadius: `var(${r})` }} /><code>{r.replace("--cg-radius-", "")}</code><span>{values[r] ?? "…"} px</span></div>)}
      </div>
    </Spec>
  );
}

const elevations = [
  { token: "--cg-elev-pill", what: "Helper pill", radius: "--cg-radius-pill" },
  { token: "--cg-elev-box", what: "Floating helper box", radius: "--cg-radius-float" },
  { token: "--cg-elev-popover", what: "Peek popover, tooltip", radius: "--cg-radius-popover" },
  { token: "--cg-elev-menu", what: "/ menu, context menu", radius: "--cg-radius-popover" },
  { token: "--cg-elev-dialog", what: "Command palette, dialogs", radius: "--cg-radius-float" },
];

/* ---------- Icons ---------- */

const lucideInUse: { icon: ReactNode; name: string; use: string }[] = [
  { icon: <Search size={15} />, name: "search", use: "Search, filter" },
  { icon: <Bell size={15} />, name: "bell", use: "Updates" },
  { icon: <Layers size={15} />, name: "layers", use: "Layers, layer property" },
  { icon: <Table2 size={15} />, name: "table-2", use: "Table views" },
  { icon: <FileText size={15} />, name: "file-text", use: "Text pack" },
  { icon: <Plus size={15} />, name: "plus", use: "New entry, insert" },
  { icon: <ChevronDown size={15} />, name: "chevron-down", use: "Unfolded, menus" },
  { icon: <ChevronRight size={15} />, name: "chevron-right", use: "Folded" },
  { icon: <Maximize2 size={15} />, name: "maximize-2", use: "Focus mode, open pill" },
  { icon: <Minimize2 size={15} />, name: "minimize-2", use: "Exit focus" },
  { icon: <X size={15} />, name: "x", use: "Close list" },
  { icon: <SlidersHorizontal size={15} />, name: "sliders-horizontal", use: "Display options, properties" },
  { icon: <Focus size={15} />, name: "focus", use: "Focus toggle" },
  { icon: <Code2 size={15} />, name: "code-2", use: "Show source" },
  { icon: <ArrowDownLeft size={15} />, name: "arrow-down-left", use: "Backlinks" },
  { icon: <Minus size={15} />, name: "minus", use: "Collapse to pill" },
  { icon: <PanelRightOpen size={15} />, name: "panel-right-open", use: "Expand to panel" },
  { icon: <PictureInPicture2 size={15} />, name: "picture-in-picture-2", use: "Back to the box" },
  { icon: <Play size={15} />, name: "play", use: "Run checks" },
  { icon: <Undo2 size={15} />, name: "undo-2", use: "Undo a fix" },
  { icon: <CornerDownLeft size={15} />, name: "corner-down-left", use: "Apply (Enter)" },
  { icon: <Check size={15} />, name: "check", use: "Fixed, clear" },
  { icon: <EyeOff size={15} />, name: "eye-off", use: "Hide when" },
];
const kinds: { kind: Kind; label: string }[] = [
  { kind: "system", label: "System, catalogue (source)" }, { kind: "unit", label: "Unit" }, { kind: "model", label: "Model" }, { kind: "upgrade", label: "Upgrade" },
  { kind: "group", label: "Group" }, { kind: "rule", label: "Rule" }, { kind: "category", label: "Category" }, { kind: "force", label: "Force" },
  { kind: "profile-type", label: "Profile type, table" }, { kind: "cost-type", label: "Cost type" },
];
const diagMeaning: { kind: DiagKind; name: string; meaning: string }[] = [
  { kind: "error", name: "Error · red", meaning: "The dataset is wrong: an unknown reference, a broken rule. Blocks a clean export." },
  { kind: "preservation", name: "Preservation failure · amber", meaning: "Export would not give back the source exactly: a moved comment, a lost prefix. Show diff explains it." },
  { kind: "suggestion", name: "Suggestion · cool", meaning: "Optional authoring advice: a default value, a missing name. Apply or ignore." },
];

/* ---------- Keyboard ---------- */

const shortcuts: { mac: string[]; win: string[]; what: string }[] = [
  { mac: ["⌘K"], win: ["Ctrl+K"], what: "Command palette: search entries and run any command" },
  { mac: ["⌘."], win: ["Ctrl+."], what: "Focus mode on or off (hide the sidebar)" },
  { mac: ["Esc"], win: ["Esc"], what: "Steps back one level: closes the / menu, then exits focus mode, then returns the panel to the floating box" },
  { mac: ["/"], win: ["/"], what: "Insert a statement at the cursor (only statements valid there)" },
  { mac: ["↑", "↓"], win: ["↑", "↓"], what: "Move through the source list (also j and k)" },
  { mac: ["↵"], win: ["Enter"], what: "Apply the selected fix or menu item" },
  { mac: ["⌘⇧C"], win: ["Ctrl+Shift+C"], what: "Run checks" },
  { mac: ["F12"], win: ["F12"], what: "Go to definition (from a mention)" },
  { mac: ["⇧F12"], win: ["Shift+F12"], what: "Backlinks" },
  { mac: ["C", "T", "L"], win: ["C", "T", "L"], what: "Edit cost, categories, layer of the open entry (Properties tab)" },
];

/* ---------- The page ---------- */

const sections = [
  { id: "colour", label: "Colour" }, { id: "type", label: "Type" }, { id: "density", label: "Spacing and density" }, { id: "radii", label: "Radii and elevation" },
  { id: "icons", label: "Icons" }, { id: "keyboard", label: "Keyboard" }, { id: "motion", label: "Motion" }, { id: "layout", label: "Layout" },
];

export function LanguagePage() {
  const [colors, setColors] = useState<Partial<Record<Mode, Record<string, RGBA>>>>({});
  const onColors = useCallback((mode: Mode, map: Record<string, RGBA>) => setColors((current) => ({ ...current, [mode]: map })), []);
  const [motionOpen, setMotionOpen] = useState(true);
  const [spaceRef, space] = useTokenLengths(Array.from({ length: 10 }, (_, i) => `--cg-space-${i + 1}`));
  const [motionRef, motion] = useTokenLengths(["--cg-motion-fast", "--cg-motion-layout"]);
  return (
    <article className="cg-page cg-lang">
      <header className="cg-head">
        <p className="cg-kicker">D4 · Step 2 <TrackChip status="proposal" /></p>
        <h1>Design language</h1>
        <p className="cg-lede">Direction D written down as one token file and a few rules, so the E1 screens are drawn from the same parts. Nothing new is invented here: every value is the one Direction D already uses, and D now reads them from <code>language/tokens.css</code> (pane widths from <code>language/layout.ts</code>). Windows is a platform layer on top.</p>
        <nav className="cg-jump" aria-label="On this page">{sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}</nav>
      </header>

      <section id="colour" className="cg-lang-section">
        <h2>Colour</h2>
        <p>Quiet warm paper with one accent. Surfaces are named by role, not by shade: the sidebar and the panel sit on <code>surface</code>, the list and the page on <code>pane</code>, and only raised things use <code>float</code>. Hover, press and selection are mixes of ink or accent, so every theme gets them for free. Status colours always come with a shape (edge, icon), never alone.</p>
        <div className="cg-pair">
          {modes.map((mode) => <div key={mode}><h4>{mode === "light" ? "Light" : "Dark"}</h4><Swatches mode={mode} onColors={onColors} /></div>)}
        </div>
        <h3>Contrast</h3>
        <p>Computed from the rendered tokens (translucent fills composited over the paper they sit on). Everything here is text of 11.5 to 13 px, so each pair needs 4.5:1 (WCAG AA). Icons, edges and the changed dot are graphics and need 3:1; every status colour clears that on every paper.</p>
        <ContrastTable colors={colors} />
        <p className="cg-lang-text">Two light pairs inherited from Direction D missed AA (the error count badge at 3.94:1, the diff green at 4.37:1). The user chose the fix (2026-11-22): <code>status-ok</code> is #1b7f48 and the badge number uses <code>badge-error-text</code>, red mixed 80% with ink. Dark is unchanged.</p>
      </section>

      <section id="type" className="cg-lang-section">
        <h2>Type</h2>
        <p>The system font at the platform's working size: 13 px on macOS, 14 px Segoe UI Variable on Windows. One scale, one name per role; the platform layer swaps the sizes. Section labels are sentence case at weight 600, no uppercase. Source text, keys and statement keywords are mono. Costs use tabular figures so the column lines up.</p>
        <div className="cg-pair">
          <div><h4>macOS</h4><TypeScale platform="mac" /></div>
          <div><h4>Windows</h4><TypeScale platform="windows" /></div>
        </div>
        <h3>Tabular figures for costs</h3>
        <p>Every cost, count and quantity sets <code>font-variant-numeric: tabular-nums</code> and aligns right in a fixed column, beside its row's name. Proportional figures (right) wobble.</p>
        <Spec mode="light" label="Tabular and proportional figures">
          <div className="cg-figures">
            {(["tab", "prop"] as const).map((kind) => (
              <div key={kind}>
                <h4>{kind === "tab" ? "Tabular (use)" : "Proportional (avoid)"}</h4>
                <ol className={kind}>{[["Warden Squad", "18"], ["Warden Archers", "11"], ["Shield Bearers", "111"], ["Warden Captain", "45"], ["Longbow", "4"]].map(([name, cost]) => <li key={name}><span>{name}</span><span>{cost}</span></li>)}</ol>
              </div>
            ))}
          </div>
        </Spec>
      </section>

      <section id="density" className="cg-lang-section">
        <h2>Spacing and density</h2>
        <p>Spacing runs on a 4 px grid with the half steps D uses (6, 10, 14, 18). Density is set by a handful of heights; the 28 px row is the unit of the whole window. Windows rows are 32 px (Fluent compact) because its working text is a pixel larger and its targets slightly bigger; that costs three rows in the list.</p>
        <Spec mode="light" specRef={spaceRef} label="Spacing scale">
          <div className="cg-space">
            {Array.from({ length: 10 }, (_, i) => `--cg-space-${i + 1}`).map((token) => <div key={token}><code>{token.replace("--cg-", "")}</code><span>{space[token] ?? "…"} px</span><i style={{ width: `calc(var(${token}) * 4)` }} /></div>)}
          </div>
        </Spec>
        <h3>Heights</h3>
        <Density />
      </section>

      <section id="radii" className="cg-lang-section">
        <h2>Radii and elevation</h2>
        <p>Rows and controls are softly rounded (6 px on macOS, 4 px on Windows); only floating objects get the larger radii (9 and 12 on macOS, 8 on Windows). The window itself follows the platform: 12 px on macOS, 8 px on Windows 11.</p>
        <div className="cg-pair">
          <div><h4>macOS</h4><Radii platform="mac" /></div>
          <div><h4>Windows</h4><Radii platform="windows" /></div>
        </div>
        <h3>What may float</h3>
        <p>The no-card rule (design principles, Containers): a bordered or raised box is only for things that float above other content or move and dismiss as one object. In Field Cogitator that is a short list, and each has an elevation token:</p>
        <div className="cg-pair">
          {modes.map((mode) => (
            <div key={mode}>
              <h4>{mode === "light" ? "Light" : "Dark"}</h4>
              <Spec mode={mode} paper="pane" label={`Elevation, ${mode}`}>
                <div className="cg-elev">
                  {elevations.map((e) => <div key={e.token}><span className="cg-elev-obj" style={{ boxShadow: `var(${e.token})`, borderRadius: `var(${e.radius})`, height: e.token === "--cg-elev-pill" ? 30 : undefined }}>{e.what}</span><code>{e.token.replace("--cg-", "")}</code></div>)}
                </div>
              </Spec>
            </div>
          ))}
        </div>
        <ul className="cg-lang-list">
          <li><strong>Floats:</strong> the helper pill, the floating helper box, peek popovers and tooltips, the / menu and context menus, the command palette, dialogs.</li>
          <li><strong>Never floats:</strong> rows, groups, the source list, the page, the properties block, statement blocks, the docked helper panel, the sidebar, issue rows. They are open lists on their paper: groups separated by space and a heading, selection as a tinted rounded shape, rows told apart by status edges, not by boxes.</li>
          <li>Tables inside the page (profiles) keep a hairline grid because they are tables of values, not lists.</li>
        </ul>
      </section>

      <section id="icons" className="cg-lang-section">
        <h2>Icons</h2>
        <p>Lucide line icons at 13 to 15 px in rows and controls (28 px for the page icon), muted until their row is selected or active, then accent text. Category glyphs give every declaration kind its own symbol, the Battle Augur category-symbol idea, so a long list scans without colour.</p>
        <h3>Lucide icons in use</h3>
        <Spec mode="light" label="Lucide icons in use">
          <div className="cg-icons">{lucideInUse.map((icon) => <span key={icon.name} title={icon.use}>{icon.icon}<span>{icon.use}</span></span>)}</div>
        </Spec>
        <h3>Category glyphs</h3>
        <div className="cg-pair">
          {modes.map((mode) => (
            <Spec key={mode} mode={mode} label={`Category glyphs, ${mode}`}>
              <div className="cg-icons">{kinds.map((k) => <span key={k.kind}><KindIcon kind={k.kind} size={15} /><span>{k.label}</span></span>)}</div>
            </Spec>
          ))}
        </div>
        <h3>Diagnostics: icons and status edges</h3>
        <p>The three diagnostic kinds differ by shape as well as colour: a circle for errors, a diff page for preservation failures, a bulb for suggestions. In lists the same colour is a 3 px edge at the row's left; the accent dot in the Layer column means “changed by a layer”.</p>
        <div className="cg-pair">
          {modes.map((mode) => (
            <Spec key={mode} mode={mode} label={`Diagnostics, ${mode}`}>
              <div className="cg-edges">
                {diagMeaning.map((d) => (
                  <div key={d.kind}>
                    <button type="button" tabIndex={-1} className={`d-row edge-${d.kind}`} style={{ paddingRight: 10 }}>
                      <DiagIcon kind={d.kind} size={14} /><span className="d-name">{d.name}</span><span className="d-changed off" /><span /><span />
                    </button>
                    <p style={{ margin: "0 0 8px 34px", color: "var(--cg-muted)", fontSize: "var(--cg-text-small)" }}>{d.meaning}</p>
                  </div>
                ))}
                <button type="button" tabIndex={-1} className="d-row"><KindIcon kind="unit" size={14} /><span className="d-name">Changed by a layer</span><span className="d-changed" /><span /><span /></button>
              </div>
            </Spec>
          ))}
        </div>
      </section>

      <section id="keyboard" className="cg-lang-section">
        <h2>Keyboard</h2>
        <p>Keyboard first: every command has a key or is one ⌘K away, and the key is shown beside the command (a quiet keycap in the micro size). macOS uses its glyphs (⌘ ⇧ ⌥); Windows spells the modifiers out. Esc always steps back exactly one level.</p>
        <div className="cg-table-wrap">
          <table className="cg-table">
            <thead><tr><th>macOS</th><th>Windows</th><th>Does</th></tr></thead>
            <tbody>
              {shortcuts.map((s) => (
                <tr key={s.what}>
                  <td><Spec mode="light" paper="none" className="cg-inline-spec" style={{ display: "inline-flex", gap: 3, padding: 0, boxShadow: "none", background: "none" }}>{s.mac.map((k) => <kbd key={k}>{k}</kbd>)}</Spec></td>
                  <td><Spec mode="light" platform="windows" paper="none" style={{ display: "inline-flex", gap: 3, padding: 0, boxShadow: "none", background: "none" }}>{s.win.map((k) => <kbd key={k}>{k}</kbd>)}</Spec></td>
                  <td>{s.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="motion" className="cg-lang-section">
        <h2>Motion</h2>
        <p>Motion only explains a layout change, it never decorates. Column changes (focus mode, opening the list or the panel) and the page making room for the helper box take <code>motion-layout</code>; small feedback such as the resize edge lighting up takes <code>motion-fast</code>. Hover and press answer at once. With reduced motion both are zero.</p>
        <Spec mode="light" specRef={motionRef} label="Motion demo">
          <div className="cg-motion">
            <div className="cg-motion-track" aria-hidden><span style={{ flexBasis: motionOpen ? "36%" : "0%" }}>sidebar</span><span style={{ flexBasis: motionOpen ? "64%" : "100%" }}>list and page</span></div>
            <button type="button" className="d-btn" onClick={() => setMotionOpen(!motionOpen)}>{motionOpen ? "Enter focus" : "Exit focus"}</button>
            <span className="muted" style={{ fontSize: "var(--cg-text-small)" }}>motion-layout {motion["--cg-motion-layout"] ?? "…"}s · motion-fast {motion["--cg-motion-fast"] ?? "…"}s · ease</span>
          </div>
        </Spec>
      </section>

      <section id="layout" className="cg-lang-section">
        <h2>Layout</h2>
        <p>Four parts side by side: sidebar, source list, page, helper panel. At the 1440 px design width all four fit with the page at {layout.windowDesign - layout.sidebar - layout.sourceList - layout.panel} px. As the window narrows the parts give way in a fixed order, so the layout never feels random; widening brings them back in reverse.</p>
        <div className="cg-table-wrap">
          <table className="cg-table">
            <thead><tr><th>Part</th><th className="num">Width</th><th className="num">Minimum</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>Sidebar</td><td className="num">{layout.sidebar}</td><td className="num">{layout.sidebarMin}</td><td>Fixed in D; hidden in focus mode</td></tr>
              <tr><td>Source list</td><td className="num">{layout.sourceList}</td><td className="num">{layout.sourceListMin}</td><td>{layout.sourceListFocus} in focus mode (it carries the window controls)</td></tr>
              <tr><td>Page</td><td className="num">flexible</td><td className="num">{layout.pageMin}</td><td>Text column at most {layout.pageMax}, centred</td></tr>
              <tr><td>Helper panel</td><td className="num">{layout.panel}</td><td className="num">{layout.panelMin}</td><td>Resizable up to {layout.panelMax}</td></tr>
              <tr><td>Floating helper box</td><td className="num">{layout.helperBox}</td><td className="num">–</td><td>Takes {layout.helperBoxMargin} px of the page's right margin while open</td></tr>
              <tr><td>Window</td><td className="num">{layout.windowDesign}</td><td className="num">{layout.windowMin}</td><td>Design width × {layout.windowHeight}; the app refuses narrower windows</td></tr>
            </tbody>
          </table>
        </div>
        <h3>Collapse order</h3>
        <p>Minimum window width {layout.windowMin} px. Each step happens where keeping the part would push the page below {layout.pageMin} px:</p>
        <Spec mode="light" paper="surface" label="Collapse order">
          <div className="cg-collapse">
            {[{ width: layout.windowDesign, label: "Design width", step: undefined as undefined | (typeof collapseSteps)[number] }, ...collapseSteps.map((step) => ({ width: step.below, label: `${step.below}`, step }))].map(({ width, label, step }, index) => {
              const showPanel = index === 0;
              const box = index === 1;
              const pill = index >= 2;
              const side = index < 3;
              const list = side ? layout.sourceList : layout.sourceListFocus;
              const total = width;
              const page = total - (side ? layout.sidebar : 0) - list - (showPanel ? layout.panel : 0);
              const pct = (px: number) => `${(px / total) * 100}%`;
              return (
                <div key={label} className="cg-collapse-row">
                  <div><strong>{width} px</strong><span>{step ? `${step.hides} → ${step.becomes.split(";")[0]}` : "All four parts"}</span></div>
                  <div className="cg-bar" style={{ width: `${(width / layout.windowDesign) * 100}%` }}>
                    {side ? <span className="side" style={{ width: pct(layout.sidebar) }}>sidebar {layout.sidebar}</span> : null}
                    <span style={{ width: pct(list) }}>list {list}</span>
                    <span className="page" style={{ flex: 1 }}>page {page}{box ? <em className="box">box</em> : pill ? <em>pill</em> : null}</span>
                    {showPanel ? <span className="panel" style={{ width: pct(layout.panel), borderRight: 0 }}>panel {layout.panel}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Spec>
        <ul className="cg-lang-list">
          {collapseSteps.slice(0, -1).map((step) => <li key={step.hides}><strong>Below {step.below} px, {step.hides.toLowerCase()}:</strong> {step.becomes}.</li>)}
          <li><strong>{layout.windowMin} px is the minimum window width:</strong> {collapseSteps[collapseSteps.length - 1].becomes}.</li>
        </ul>
      </section>
    </article>
  );
}
