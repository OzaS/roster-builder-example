import type { E1Screen } from "../types";
import { StartWindow, type OpenProblem, type StartState } from "./StartWindow";
import { EditorDialogs, type EditorDialog } from "./EditorDialogs";
import { SettingsWindow, settingsSections, type SettingsSection } from "./Settings";

/** Worker A: open and recent datasets, settings, the window's empty and error states. */
export const startScreens: E1Screen[] = [
  {
    id: "e1-start-window",
    group: "Open a dataset",
    title: "Start window",
    item: "cg-e1-start-window",
    platforms: ["mac", "windows"],
    summary: "What Field Cogitator shows when no dataset is open (first launch, after Close dataset, File › Open). The sidebar carries the app's actions (Open folder…, Open file…, Convert from XML data…, the sample, Settings); the main pane lists recent datasets as dense rows with a status edge from the last check (title, folder, DKLPO version, layers on / total, last opened). The selected row opens a second line with the last check and its actions. A drop target takes a folder or an archive. Also drawn at the 960 px minimum window and with large text.",
    states: [
      { id: "recent", title: "Recent datasets" },
      { id: "first-run", title: "First run (no recents)" },
      { id: "opening", title: "Opening a dataset" },
      { id: "missing", title: "A recent dataset is missing" },
      { id: "narrow", title: "960 px minimum window" },
      { id: "large", title: "Large text" },
    ],
    tryIt: [
      { what: "Move and open", how: "click a row, then ↑ ↓ and Return (Enter); double-click opens. Opening shows its steps with counts; Esc or Cancel stops it." },
      { what: "Remove and undo", how: "⌘⌫ (Delete on Windows) or Remove from the list; the footer offers Undo (⌘Z)." },
      { what: "Missing dataset", how: "select Glass Moors: Locate… finds it again (the row gets its new folder), or remove it." },
      { what: "Problems on open", how: "open Copper Vale (newer DKLPO), Tidewater Skirmish (files that don't parse) or the team copy (read-only folder); Open folder… picks a folder of XML files that isn't a dataset." },
      { what: "Convert and the sample", how: "Convert from XML data… runs the conversion steps; Open the sample dataset opens Demo Skirmish read-only. Filter the list by name or folder." },
    ],
    render: ({ mode, platform, state, interactive }) => {
      const initial = (["recent", "first-run", "opening", "missing"].includes(state ?? "") ? state : "recent") as StartState;
      if (state === "narrow") return <StartWindow mode={mode} platform={platform} interactive={interactive} width={960} height={760} />;
      return <StartWindow mode={mode} platform={platform} initial={initial} interactive={interactive} large={state === "large"} />;
    },
  },
  {
    id: "e1-start-errors",
    group: "Open a dataset",
    title: "Open errors",
    item: "cg-e1-start-errors",
    platforms: ["mac", "windows"],
    summary: "When a dataset can't be opened as is: a sheet below the title row on macOS, a centred dialog with a footer band on Windows, over the start window. Each says what happened in one sentence, names the folder, and offers the choices as verbs; Return does the primary, Esc the safe one (Cancel). Not a dataset (no manifest; Convert… when it holds XML data files), written for a newer DKLPO version (open read-only), files that don't parse (open anyway: they open as source text with their errors), a folder you can't write to (open read-only or Save as…).",
    states: [
      { id: "not-dataset", title: "Not a dataset" },
      { id: "newer-format", title: "Newer DKLPO version" },
      { id: "parse-errors", title: "Files that don't parse" },
      { id: "permission", title: "Folder not writable" },
    ],
    tryIt: [
      { what: "Choices", how: "the primary choice opens or converts (the steps run in the start window); Cancel, Esc or a click outside the dialog goes back to the list." },
      { what: "From the list", how: "after Cancel, open Copper Vale, Tidewater Skirmish or the team copy again, or use Open folder…, to bring each dialog back." },
    ],
    render: ({ mode, platform, state, interactive }) => {
      const problem = (["not-dataset", "newer-format", "parse-errors", "permission"].includes(state ?? "") ? state : "not-dataset") as OpenProblem;
      return <StartWindow key={problem} mode={mode} platform={platform} problem={problem} interactive={interactive} />;
    },
  },
  {
    id: "e1-start-editor-dialogs",
    group: "Open a dataset",
    title: "Window-level dialogs over the editor",
    item: "cg-e1-start-editor-dialogs",
    summary: "Drawn over a static Direction D window (D unchanged). The sidebar's dataset switcher (Demo Skirmish ▾) as a popover with sections: the open dataset with its folder and layers, recent datasets, Open… and Convert…, Show in Finder and Close dataset. Closing or switching with unsaved changes asks Save / Don't save / Cancel and lists the changed entries. A module changed by another program: Reload / Keep mine / Compare, without and with unsaved edits (Compare becomes the primary when both changed). A save that failed: the reason, Retry, Save as…; the edits stay in the editor. macOS (Direction D's frame); the Windows dialog form is on the open-errors screen.",
    states: [
      { id: "switcher", title: "Dataset switcher" },
      { id: "unsaved", title: "Unsaved changes" },
      { id: "changed-on-disk", title: "Changed on disk, no unsaved edits" },
      { id: "changed-on-disk-edits", title: "Changed on disk, with unsaved edits" },
      { id: "save-failed", title: "Save failed" },
    ],
    tryIt: [
      { what: "Switcher", how: "pick a recent dataset or Close dataset: with unsaved changes, the Save / Don't save / Cancel sheet follows." },
      { what: "Choices", how: "every choice closes the dialog and says what happened in a toast; Esc takes the safe choice; Show the dialog again brings it back." },
    ],
    render: ({ mode, state, interactive }) => {
      const initial = (["switcher", "unsaved", "changed-on-disk", "changed-on-disk-edits", "save-failed"].includes(state ?? "") ? state : "switcher") as EditorDialog;
      return <EditorDialogs key={initial} mode={mode} initial={initial} interactive={interactive} />;
    },
  },
  {
    id: "e1-start-settings",
    group: "Settings",
    title: "Settings",
    item: "cg-e1-start-settings",
    width: 880,
    platforms: ["mac", "windows"],
    summary: "The settings window. macOS: about 720 px wide, toolbar tabs (icon above label), the section name as the title, labels right-aligned at the left and controls with help text at the right (the classic preferences layout, no grouped boxes). Windows: Windows' own settings layout in a window of the app's frame (title row with the caption buttons, navigation list with the accent indicator, the section title, label and help at the left of each row and the control at the right edge), without Windows' setting cards: rows are an open list separated by space. Sections: General, Editor, Checking, Text, Appearance, Keyboard (read-only shortcut list), Command line (engine and tool versions, read-only). Only what E1 has: no accounts, sync or cloud.",
    states: settingsSections.map((s) => ({ id: s.id, title: s.title })),
    tryIt: [
      { what: "Sections", how: "the toolbar tabs (macOS) or the navigation list (Windows) switch sections." },
      { what: "Controls", how: "checkboxes and switches toggle; pop-up buttons and drop-downs open their options; radios pick; Clear recent datasets… answers with Undo; Copy command says Copied." },
      { what: "Keyboard", how: "filter the shortcut list by command name." },
    ],
    render: ({ mode, platform, state }) => {
      const initial = (settingsSections.some((s) => s.id === state) ? state : "general") as SettingsSection;
      return <SettingsWindow key={`${initial}-${platform}`} mode={mode} platform={platform} initial={initial} />;
    },
  },
];
