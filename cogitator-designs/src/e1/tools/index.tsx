import type { E1Screen } from "../types";
import { ChecksScreen } from "./ChecksScreen";

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
];
