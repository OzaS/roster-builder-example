import { CircleCheck, Copy, Keyboard, Languages, PencilLine, Search, SlidersHorizontal, SunMoon, Terminal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { TrafficLights, WinCaption } from "../../frames";
import type { E1Mode, E1Platform } from "../types";
import { E1Window, Radios, Select, SetRow, ToggleRow, keyFor } from "./parts";

/**
 * The settings window. macOS: a ~720 px window with toolbar tabs (icon above label), the section name as the title, label
 * column at the right edge of the left side and controls to its right (the classic preferences layout, no grouped boxes).
 * Windows: Windows' own settings layout in a window of the app's frame (title row with the caption buttons, a navigation
 * list at the left with the accent indicator, the section title, label and help at the left of each row and the control at
 * the right edge) but without Windows' setting cards: rows are an open list, separated by space (the no-card rule).
 * Only what E1 has: no accounts, no sync, no cloud.
 */
export type SettingsSection = "general" | "editor" | "checking" | "text" | "appearance" | "keyboard" | "command-line";
export const settingsSections: { id: SettingsSection; title: string; icon: ReactNode }[] = [
  { id: "general", title: "General", icon: <SlidersHorizontal size={18} /> },
  { id: "editor", title: "Editor", icon: <PencilLine size={18} /> },
  { id: "checking", title: "Checking", icon: <CircleCheck size={18} /> },
  { id: "text", title: "Text", icon: <Languages size={18} /> },
  { id: "appearance", title: "Appearance", icon: <SunMoon size={18} /> },
  { id: "keyboard", title: "Keyboard", icon: <Keyboard size={18} /> },
  { id: "command-line", title: "Command line", icon: <Terminal size={18} /> },
];

type Values = {
  openLast: boolean; recentLength: string; cleared: boolean;
  sourceBeside: boolean; fmtOnSave: boolean; slash: boolean; fontSize: string;
  level: "lenient" | "strict"; checkOnSave: boolean; suggestions: boolean;
  language: string; noText: "key" | "readable";
  theme: "system" | "light" | "dark"; accent: "system" | "app";
};

const shortcuts: { group: string; rows: { what: string; mac: string[]; win: string[] }[] }[] = [
  { group: "File", rows: [
    { what: "Open folder…", mac: ["⌘", "O"], win: ["Ctrl", "O"] },
    { what: "Open file…", mac: ["⇧", "⌘", "O"], win: ["Ctrl", "Shift", "O"] },
    { what: "Save", mac: ["⌘", "S"], win: ["Ctrl", "S"] },
    { what: "Close dataset", mac: ["⇧", "⌘", "W"], win: ["Ctrl", "Shift", "W"] },
    { what: "Settings", mac: ["⌘", ","], win: ["Ctrl", ","] },
  ] },
  { group: "Find and move", rows: [
    { what: "Search entries and commands", mac: ["⌘", "K"], win: ["Ctrl", "K"] },
    { what: "Go to definition", mac: ["F12"], win: ["F12"] },
    { what: "Show backlinks", mac: ["⇧", "F12"], win: ["Shift", "F12"] },
    { what: "Layers", mac: ["⇧", "⌘", "L"], win: ["Ctrl", "Shift", "L"] },
    { what: "Next and previous entry", mac: ["↓", "↑"], win: ["↓", "↑"] },
    { what: "Focus mode", mac: ["⌘", "."], win: ["Ctrl", "."] },
  ] },
  { group: "Edit", rows: [
    { what: "Insert a statement", mac: ["/"], win: ["/"] },
    { what: "Rename…", mac: ["F2"], win: ["F2"] },
    { what: "Duplicate", mac: ["⌘", "D"], win: ["Ctrl", "D"] },
    { what: "Delete", mac: ["⌘", "⌫"], win: ["Del"] },
    { what: "Undo", mac: ["⌘", "Z"], win: ["Ctrl", "Z"] },
  ] },
  { group: "Checks", rows: [
    { what: "Run checks", mac: ["⇧", "⌘", "C"], win: ["Ctrl", "Shift", "C"] },
  ] },
];

export function SettingsWindow({ mode, platform, initial = "general" }: { mode: E1Mode; platform: E1Platform; initial?: SettingsSection }) {
  const [section, setSection] = useState<SettingsSection>(initial);
  const [v, setV] = useState<Values>({
    openLast: true, recentLength: "10", cleared: false,
    sourceBeside: false, fmtOnSave: true, slash: true, fontSize: platform === "mac" ? "13 px (system)" : "14 px (system)",
    level: "lenient", checkOnSave: true, suggestions: true,
    language: "English (en)", noText: "key",
    theme: "system", accent: "system",
  });
  const [copied, setCopied] = useState(false);
  const [keyFilter, setKeyFilter] = useState("");
  const set = <K extends keyof Values>(key: K) => (value: Values[K]) => setV((current) => ({ ...current, [key]: value }));
  const mac = platform === "mac";
  const title = settingsSections.find((s) => s.id === section)!.title;
  const sys = mac ? "macOS" : "Windows";
  const datasetPath = mac ? "~/Datasets/demo-skirmish" : "C:\\Users\\you\\Datasets\\demo-skirmish";

  const body = (() => {
    switch (section) {
      case "general":
        return (
          <>
            <div className="cg-set-group">
              <ToggleRow platform={platform} group="At start:" text="Open the last dataset" on={v.openLast} onChange={set("openLast")} help="Otherwise Field Cogitator starts with the start window and its recent datasets." />
            </div>
            <div className="cg-set-group">
              <SetRow label={mac ? "Recent datasets:" : "Recent datasets to keep"} help="The start window and the dataset switcher list this many.">
                <Select platform={platform} value={v.recentLength} options={["5", "10", "20"]} onChange={set("recentLength")} label="Recent datasets to keep" />
              </SetRow>
              <SetRow label={mac ? "" : "Clear the recent list"} help={v.cleared ? <>The list is empty. <button type="button" className="e1s-link" onClick={() => set("cleared")(false)}>Undo</button></> : "Removes the 8 datasets from the list; no folder is touched."}>
                <button type="button" className="d-btn" disabled={v.cleared} title={v.cleared ? "The recent list is already empty" : "Remove every dataset from the recent list"} onClick={() => set("cleared")(true)}>{v.cleared ? "Recent list cleared" : "Clear recent datasets…"}</button>
              </SetRow>
            </div>
          </>
        );
      case "editor":
        return (
          <>
            <div className="cg-set-group">
              <ToggleRow platform={platform} group="Page:" text="Show the source text beside the page" on={v.sourceBeside} onChange={set("sourceBeside")} help="New windows open with the DKLPO source next to the entry page. The Source button switches it per window." />
              <ToggleRow platform={platform} text="Insert statements with /" on={v.slash} onChange={set("slash")} help="Typing / in an empty block opens the insert menu with the statements valid there." />
            </div>
            <div className="cg-set-group">
              <ToggleRow platform={platform} group="Saving:" text="Format on save" on={v.fmtOnSave} onChange={set("fmtOnSave")} help={<>Runs <code>fmt</code> on each file you save, as <code>augur dklpo fmt</code> does.</>} />
            </div>
            <div className="cg-set-group">
              <SetRow label={mac ? "Font size:" : "Font size"} help={`Working text in lists and pages. For larger text everywhere, use ${sys}' text size setting.`}>
                <Select platform={platform} value={v.fontSize} options={mac ? ["12 px", "13 px (system)", "14 px", "15 px", "16 px"] : ["13 px", "14 px (system)", "15 px", "16 px", "18 px"]} onChange={set("fontSize")} label="Font size" />
              </SetRow>
            </div>
          </>
        );
      case "checking":
        return (
          <>
            <div className="cg-set-group">
              <SetRow top stack label={mac ? "Check level:" : "Check level by default"} help={<>For datasets that don’t say; a dataset’s own <code>checking:</code> line wins.</>}>
                <Radios label="Check level by default" value={v.level} onChange={set("level")} options={[
                  { id: "lenient", label: "Lenient", note: "Errors and preservation failures; suggestions as hints" },
                  { id: "strict", label: "Strict", note: <>Also what strict datasets must fix, as <code>check --strict</code></> },
                ]} />
              </SetRow>
            </div>
            <div className="cg-set-group">
              <ToggleRow platform={platform} group="When:" text="Run checks on save" on={v.checkOnSave} onChange={set("checkOnSave")} help={<>Checks run in the background; the helper box and Updates change when they finish. {keyFor(platform, "⇧⌘C", "Ctrl+Shift+C")} runs them any time.</>} />
              <ToggleRow platform={platform} group="Show:" text="Show authoring suggestions" on={v.suggestions} onChange={set("suggestions")} help="Hide them to see only errors and preservation failures. They still run; Updates counts only what is shown." />
            </div>
          </>
        );
      case "text":
        return (
          <>
            <div className="cg-set-group">
              <SetRow label={mac ? "Text pack language:" : "Text pack language"} help="Names and rule text show in this language when the dataset has it, otherwise in its first language.">
                <Select platform={platform} value={v.language} options={["English (en)", "German (de)", "The dataset’s first language"]} onChange={set("language")} label="Text pack language" />
              </SetRow>
            </div>
            <div className="cg-set-group">
              <SetRow top stack label={mac ? "Names without text:" : "Names without text"} help="The no-text suggestion lists every entry without a name in this language.">
                <Radios label="Names without text" value={v.noText} onChange={set("noText")} options={[
                  { id: "key", label: "The key, in mono and marked", note: <code className="d-notext">frost-seer</code> },
                  { id: "readable", label: "The key as a readable name", note: "Frost seer, with a no-text tag" },
                ]} />
              </SetRow>
            </div>
          </>
        );
      case "appearance":
        return (
          <>
            <div className="cg-set-group">
              <SetRow top stack label={mac ? "Theme:" : "Theme"} help="Large text follows the system text size.">
                <Radios label="Theme" value={v.theme} onChange={set("theme")} options={[
                  { id: "system", label: `Use the ${sys} setting` }, { id: "light", label: "Light" }, { id: "dark", label: "Dark" },
                ]} />
              </SetRow>
            </div>
            <div className="cg-set-group">
              <SetRow top stack label={mac ? "Accent colour:" : "Accent colour"} help="Status colours (errors, preservation failures, suggestions) never follow the accent.">
                <Radios label="Accent colour" value={v.accent} onChange={set("accent")} options={[
                  { id: "system", label: `Follow the ${sys} accent colour` }, { id: "app", label: "Field Cogitator blue" },
                ]} />
              </SetRow>
            </div>
          </>
        );
      case "keyboard": {
        const q = keyFilter.trim().toLowerCase();
        const groups = shortcuts.map((g) => ({ ...g, rows: g.rows.filter((r) => !q || r.what.toLowerCase().includes(q)) })).filter((g) => g.rows.length);
        return (
          <>
            <div className="e1s-keyhead">
              <label className="d-filter"><Search size={13} /><input value={keyFilter} placeholder="Filter commands" aria-label="Filter shortcuts" onChange={(event) => setKeyFilter(event.target.value)} /></label>
              <span className="d-muted">Read-only in E1; changing shortcuts comes later.</span>
            </div>
            {groups.length ? groups.map((g) => (
              <section key={g.group} className="cg-set-group e1s-keygroup" aria-label={g.group}>
                <h3 className="cg-set-heading">{g.group}</h3>
                <div className="cg-keys">
                  {g.rows.map((r) => <div key={r.what} className="cg-keyrow"><span>{r.what}</span><span>{(mac ? r.mac : r.win).map((k) => <kbd key={k}>{k}</kbd>)}</span></div>)}
                </div>
              </section>
            )) : <p className="d-empty">No command matches “{keyFilter}”. <button type="button" onClick={() => setKeyFilter("")}>Clear filter</button></p>}
          </>
        );
      }
      default:
        return (
          <>
            <div className="cg-set-group">
              <SetRow label={mac ? "Engine:" : "Engine"} help={<>Checks, formatting, conversion and export run through this engine: the same code as the <code>augur dklpo</code> command line, so results match.</>}>
                <strong>DKLPO engine 0.14.0</strong>
              </SetRow>
              <SetRow label={mac ? "Language:" : "DKLPO version"} help="Datasets written for a newer version open read-only.">
                <strong>DKLPO 1.0</strong>
              </SetRow>
              <SetRow label={mac ? "Command line tools:" : "Command line tools"} help={<>The same engine: <code>check</code>, <code>fmt</code>, <code>convert</code>, <code>export</code>, <code>roundtrip</code>, <code>move</code>, <code>diff</code>.</>}>
                <strong>augur dklpo 0.14.0</strong>
              </SetRow>
            </div>
            <div className="cg-set-group">
              <SetRow stack top label={mac ? "Same check:" : "Run the same check in a terminal"} help="Prints the diagnostics the helper panel shows for the open dataset.">
                <code className="e1s-cmd">augur dklpo check {datasetPath}</code>
                <button type="button" className="d-btn sm" onClick={() => setCopied(true)} title="Copy the command to the clipboard"><Copy size={12} />{copied ? "Copied" : "Copy command"}</button>
              </SetRow>
            </div>
          </>
        );
    }
  })();

  if (mac) {
    return (
      <E1Window mode={mode} platform={platform} width={720} height="auto" label="Settings" className="e1s-set">
        <header className="e1s-set-bar">
          <div className="e1s-set-titlerow"><TrafficLights /><strong>{title}</strong></div>
          <div className="cg-tooltabs" role="tablist" aria-label="Settings sections">
            {settingsSections.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={s.id === section} className="cg-tooltab" onClick={() => setSection(s.id)}>{s.icon}{s.title}</button>
            ))}
          </div>
        </header>
        <div className="e1s-set-body" role="tabpanel" aria-label={title}>{body}</div>
      </E1Window>
    );
  }
  return (
    <E1Window mode={mode} platform={platform} width={880} height="auto" label="Settings" className="e1s-set">
      <header className="e1s-set-wintitle"><span className="d-ws-mark" aria-hidden>FC</span>Settings<span className="d-spacer" /><WinCaption /></header>
      <div className="e1s-set-wingrid">
        <nav className="cg-navlist e1s-set-nav" aria-label="Settings sections">
          {settingsSections.map((s) => (
            <button key={s.id} type="button" className="cg-navitem" aria-current={s.id === section ? "page" : undefined} onClick={() => setSection(s.id)}>{s.icon}{s.title}</button>
          ))}
        </nav>
        <div className="e1s-set-winbody" aria-label={title}>
          <h1>{title}</h1>
          {body}
        </div>
      </div>
    </E1Window>
  );
}
