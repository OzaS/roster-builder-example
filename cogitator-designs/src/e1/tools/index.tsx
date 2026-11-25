import type { E1Screen } from "../types";
import { ChecksScreen } from "./ChecksScreen";
import { ConvertScreen } from "./ConvertScreen";
import { ExportScreen } from "./ExportScreen";
import { RenameScreen } from "./RenameScreen";
import { RoundtripScreen } from "./RoundtripScreen";

/** Part 2, worker A: the command-line tools inside the editor (run checks, convert, export, roundtrip, rename with a move record). */
export const toolScreens: E1Screen[] = [
  {
    id: "e1-tools-checks",
    group: "Checks and tools",
    title: "Run checks",
    item: "cg-e1-tools-checks",
    summary:
      "Run checks (⌘⇧C, or the check status button in the page toolbar) checks the dataset with its layers on, while the page stays editable. The toolbar button always says what the last run found (complete, 2 errors, doesn't compile) or that it is running or out of date, and opens the run popover under it: the steps with counts (Parse, Compile, Lower, Export check) and Cancel while it runs; then the result (complete or incomplete, the time), one row per class (errors, preservation failures, authoring suggestions) with its codes, leading into the diagnostics inbox filtered by that class, and what was checked (dataset and profile, layers on and off, the patch, the export dry run). The run is `augur dklpo check --with <layers>` plus `export --dry-run --exact`, and the popover shows that command to copy. A dataset that doesn't compile stops before Lower and offers the fix at the error. As built (E1-5, approved by the user 2026-11-25): the check button stands in the page toolbar before Focus, Source and Run, and reads Run checks ⌘⇧C before any run (A3); the sidebar's foot keeps Saved until a run exists, then the checks foot replaces it (A4); while the popover is open the floating helper is its pill (A3); the command to copy is the two commands the run is, `check --with` the layers that are on and the export check of the dataset alone (A8, with E1-6's G6).",
    states: [
      { id: "running", title: "Running: compile 3 of 5" },
      { id: "passed", title: "Complete, suggestions only" },
      { id: "failed", title: "Incomplete: 2 errors" },
      { id: "no-compile", title: "Doesn't compile: stopped before Lower" },
      { id: "stale", title: "Out of date since the last check" },
      { id: "before-run", title: "As built: before any run (Run checks ⌘⇧C)" },
      { id: "as-built", title: "As built: beside Focus, Source and Run; the two commands" },
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
      { what: "Report", how: "Convert another (in the options footer) goes back to the options." },
    ],
    render: ({ mode, platform, state, interactive }) => <ConvertScreen key={`${state}-${platform}`} mode={mode} platform={platform} state={state} interactive={interactive} />,
  },
  {
    id: "e1-tools-export",
    group: "Checks and tools",
    title: "Export",
    item: "cg-e1-tools-export",
    summary:
      "File › Export… (⇧⌘E) opens a sheet over the editor: the format (XML data files or JSON data files: each document keeps the format it was converted from, the choice is for documents added since), the destination and the text language, then the exactness the export would have, from a dry run made as the sheet opens. Exact: every envelope entry is current, and Write the original files can return the kept files byte for byte (C3). Not exact: the counts (current, stale, unbound, conflicts) and each entry that won't apply with its entry, code (preserve/stale, preserve/unbound) and why, Write the original files unavailable with its reason (preserve/original-outdated), and that the export still writes (Export anyway) unless Require an exact export is on, which refuses and says so beside the button. The result lists the written files with their sizes. A Level 1 construct refuses the export by name, exact or not, and nothing is written. As built (E1-5, approved by the user 2026-11-25): Require an exact export starts on when the dry run is exact and off when it isn't, and a dataset without an envelope reads “Not exact: no envelope (bsdata.compat.json)” (A12); a write that fails says “Can’t export … to <folder>” with the reason, the files written before it stopped and Try again (A13); the written sizes are B, KB or MB as Convert writes them (A14, changed by the user).",
    states: [
      { id: "exact", title: "Exact: originals available" },
      { id: "non-exact", title: "Not exact, with the reasons" },
      { id: "written", title: "Written: the files" },
      { id: "failed", title: "Refused: a Level 1 construct" },
      { id: "written-sizes", title: "As built: written sizes in B, KB or MB" },
      { id: "no-envelope", title: "As built: not exact, no envelope" },
      { id: "write-failed", title: "As built: a write that fails" },
    ],
    tryIt: [
      { what: "Exactness", how: "in the non-exact state turn Require an exact export on: the button becomes Export refused and the reason shows beside it; off again writes anyway." },
      { what: "Export", how: "Export (anyway) shows the written files; Done or Esc closes the sheet, and the toast brings it back." },
    ],
    render: ({ mode, state, interactive }) => <ExportScreen key={state} mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-tools-roundtrip",
    group: "Checks and tools",
    title: "Roundtrip",
    item: "cg-e1-tools-roundtrip",
    summary:
      "Roundtrip (palette › Roundtrip, Tools menu) as a tool view in place of the list and the page, like the diagnostics inbox. Two routes, as the roundtrip command has them, switched in the toolbar. From the XML data (the input the dataset was converted from): C2, norm of the import against norm of the converted dataset, and C1, each regenerated document's source tree against its original, with the documents listed below with their verdicts. From this dataset (the reverse route): the XML written twice must be byte-identical, its import must give the same norm as the dataset's lowering, and with reconvert it is converted back and compared by norm, identities and files (a changed file is listed, not a failure). The left column holds the contracts and documents with status edges; the right shows what the selected row compared and every difference (norm path, or class, path and before → after), with the command to copy. An input that is only partly imported stops before C2 and says which file and why.",
    states: [
      { id: "equal", title: "From the XML data: equal" },
      { id: "differences", title: "Differences in a document" },
      { id: "reverse", title: "From this dataset: reverse route" },
      { id: "refused", title: "Refused: input partly imported" },
    ],
    tryIt: [
      { what: "Rows", how: "click C2, C1 or a document: the right side shows what was compared and the differences." },
      { what: "Route", how: "switch From the XML data / From this dataset in the toolbar; Run roundtrip runs it again." },
    ],
    render: ({ mode, state, interactive }) => <RoundtripScreen key={state} mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-tools-rename",
    group: "Checks and tools",
    title: "Rename with a move record",
    item: "cg-e1-tools-rename",
    summary:
      "F2 (or Rename… on an entry, a list row or a key in the text) opens a sheet over the editor: the new key, with the module prefix, and the preview the move command gives as a dry run while you type. The classification first (parent-preserving: same parent, a minor change, records at the manifest's version; structural: a new parent selection, which needs a new major, with Raise the version to 4.0.0 as --bump-major does), then what rosters do on open (followed and listed as moved, or kept unresolved for review with “moved to …: add it again”), the counts (declaration, uses moved with it, references, text keys, map lines, records), every file with its lines before and after, and the records appended to moves.dkl (a use named after the entry is renamed with it and gets its own record). Apply writes every file or none; ⌘Z undoes it. A key that is taken refuses with move/new-exists and names what holds it; an invalid key says the rule. Moving under another parent is drawn ahead of the command line, which refuses it today (move/relocate).",
    states: [
      { id: "rename", title: "Rename: parent-preserving" },
      { id: "structural", title: "Move to another parent: structural, bump major" },
      { id: "conflict", title: "Refused: the key is taken" },
    ],
    tryIt: [
      { what: "Type", how: "change the key: every hunk and record follows; try halberd (taken), an upper-case letter (invalid) or spear (unchanged)." },
      { what: "Structural", how: "turn Raise the version off: Apply becomes unavailable and the reason shows beside it." },
      { what: "Apply", how: "Apply or Esc closes the sheet; the toast offers Undo or brings the sheet back." },
    ],
    render: ({ mode, state, interactive }) => <RenameScreen key={state} mode={mode} state={state} interactive={interactive} />,
  },
];
