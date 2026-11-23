import type { E1Screen } from "../types";
import { StartWindow, type StartState } from "./StartWindow";

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
];
