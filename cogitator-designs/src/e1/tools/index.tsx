import type { E1Screen } from "../types";
import { ChecksScreen } from "./ChecksScreen";
import { ConvertScreen } from "./ConvertScreen";

/** Part 2, worker A: the command-line tools inside the editor (run checks, convert, export, roundtrip, rename with a move record). */
export const toolScreens: E1Screen[] = [
  {
    id: "e1-tools-checks",
    group: "Checks and tools",
    title: "Run checks",
    item: "cg-e1-tools-checks",
    summary:
      "Run checks (⌘⇧C, or the check status button in the page toolbar) checks the dataset with its layers on, while the page stays editable. The toolbar button always says what the last run found (complete, 2 errors, doesn't compile) or that it is running or out of date, and opens the run popover under it: the steps with counts (Parse, Compile, Lower, Export check) and Cancel while it runs; then the result (complete or incomplete, the time), one row per class (errors, preservation failures, authoring suggestions) with its codes, leading into the diagnostics inbox filtered by that class, and what was checked (dataset and profile, layers on and off, the patch, the export dry run). The run is `augur dklpo check --with <layers>` plus `export --dry-run --exact`, and the popover shows that command to copy. A dataset that doesn't compile stops before Lower and offers the fix at the error.",
    states: [
      { id: "running", title: "Running: compile 3 of 5" },
      { id: "passed", title: "Complete, suggestions only" },
      { id: "failed", title: "Incomplete: 2 errors" },
      { id: "no-compile", title: "Doesn't compile: stopped before Lower" },
      { id: "stale", title: "Out of date since the last check" },
    ],
    tryIt: [
      { what: "Run", how: "⌘⇧C or Run again: the steps fill with counts, then the result; Esc or Cancel stops a run (the old results stay, out of date)." },
      { what: "Status", how: "the toolbar button and the sidebar's foot follow the run; the button opens and closes the popover." },
      { what: "Doesn't compile", how: "Indent to 4 spaces, then Run again: the run goes through Lower and the export check." },
    ],
    render: ({ mode, state, interactive }) => <ChecksScreen key={state} mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-tools-convert",
    group: "Checks and tools",
    title: "Convert from XML data",
    item: "cg-e1-tools-convert",
    platforms: ["mac", "windows"],
    summary:
      "From the start window's Convert from XML data… or File › Convert…: a window of its own, because it starts with no dataset open and ends by opening a new one. The options stay in the left column as the command's flags in words: the input (a folder, an archive or some files, with what was found in it), the output folder (new and empty, or Update a dataset converted before), the dataset key, version, text language and text columns, the compatibility envelope and Keep the original files (C1, C3; the full id map is always written), and Run a roundtrip after converting (C2 and C1). The right pane lists the input's documents and what Convert writes, then the steps with counts and Cancel, then the report: the three contracts with verdicts, the numbers the command reports, each document's C1 result with its differences (class, path, before → after), the preservation diagnostics, Open the converted dataset, and the commands to copy. Dry run converts and reports without writing. An input that can't be read stops before anything is written.",
    states: [
      { id: "options", title: "Options and the input's documents" },
      { id: "converting", title: "Converting: steps with counts" },
      { id: "equal", title: "Report: equal" },
      { id: "differences", title: "Report: differences found" },
      { id: "refused", title: "Input can't be read" },
    ],
    tryIt: [
      { what: "Convert", how: "Convert (⌘↵) runs the steps, then the report; Esc cancels. Dry run does the same and writes nothing (Open is then unavailable and says why)." },
      { what: "Options", how: "switch the input kind, the text language and columns; turning the envelope off also turns Keep the original files off (it needs the envelope); the command line under the report follows." },
      { what: "Report", how: "Convert another goes back to the options." },
    ],
    render: ({ mode, platform, state, interactive }) => <ConvertScreen key={`${state}-${platform}`} mode={mode} platform={platform} state={state} interactive={interactive} />,
  },
];
