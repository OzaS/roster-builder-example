import type { E1Screen } from "../types";
import { LayerStackScreen } from "./LayerStackScreen";
import { SearchScreen } from "./SearchScreen";
import { RunnerScreen } from "./RunnerScreen";

/** E1 screens part 2, worker B: the layer stack with its page overlay, dataset search, the dataset runner. */
export const layerScreens: E1Screen[] = [
  {
    id: "e1-layers-stack",
    group: "Layers",
    title: "Layer stack and page overlay",
    item: "cg-e1-layers-stack",
    summary:
      "The sidebar's Layers opens the dataset's layer stack as a full view in place of the list and the page (as Updates opens the inbox). Left: the base, then its add-ons and variants in the order they apply (later wins), each with its kind and purpose, its key and version, the `requires:` result and what it does (patches applied, new modules, text keys) or why it is refused; a switch turns a layer on or off, and a test variant is marked Test. The order is Derived (from requires: and each patch's after, ties by key) or Explicit (like --layers: drag a row or ⌥↑ ⌥↓; an order that breaks an after is a layer-order error and nothing applies). Right: the selected layer's manifest facts, its patch report (each operation with its outcome and line), the values it changes (base value → value), the conflict when a later layer sets the same value (the value through the stack, the later one wins), and for an add-on the display-only check (logic hash with and without it; text that reaches logic is addon-changes-rules: declare it a variant). Show on page opens the entry with the layer overlay: changed values get an accent edge, the base value struck and the layer as a chip that explains the change; Effective / Base only switches the values; Layer changes (⌘⌥L) turns the overlay off.",
    states: [
      { id: "stack", title: "Stack OK, House rules selected" },
      { id: "refused", title: "A layer refused: requires mismatch" },
      { id: "conflict", title: "Draft points on: patch conflict" },
      { id: "addon-rules", title: "Add-on that changes rules" },
      { id: "overlay", title: "Entry page with the layer overlay" },
    ],
    tryIt: [
      { what: "Select", how: "click a layer or move with ↑ ↓; the detail follows." },
      { what: "On / off", how: "the switch (or Space on a row); turning Draft points on shows the conflict with House rules, off brings 18 back." },
      { what: "Order", how: "Explicit, then drag a row or ⌥↑ ⌥↓; put Draft points above House rules to see the layer-order error; Use the derived order fixes it." },
      { what: "Overlay", how: "Show on page beside a Warden Squad value; on the page click the House rules chip for how it changed; Effective / Base only; Back or the sidebar's Layers return." },
    ],
    render: ({ mode, state, interactive }) => <LayerStackScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-layers-search",
    group: "Search",
    title: "Dataset search and replace",
    item: "cg-e1-layers-search",
    summary:
      "Search the whole dataset (⇧⌘F, or the palette's “Search everywhere”); ⌘K stays the quick jump to one entry or command. One field with Match case and Whole word, and four scopes with their counts: Entries (names and keys), Text (rule text, notes), References, Statements. Results fill the view in place of the list and the page, grouped by source (a layer's source says which layer holds it), then by entry, each match with its field, the line's text with the match highlighted, and file:line; filter chips for kind, source and layer say how many matches they hide. The preview shows the lines around the selected match with Open (↵) and Open at the line (⌘↵). Replace (⌥⌘F) works on names and text only: each match shows its change (struck, then inserted) with a checkbox, Replace n in m files applies the checked ones and Undo takes them back. Keys and references are not replaced as text: renaming a key changes every reference and writes a move record, so they show as locked and lead to Rename… (F2, the rename preview). With no match the view says what it searched, what it skipped (a layer that is off, filters) and offers to search with that layer or create the entry.",
    states: [
      { id: "results", title: "Results for “shield”" },
      { id: "no-results", title: "No results" },
      { id: "filters", title: "Search with filters" },
      { id: "replace", title: "Replace preview" },
    ],
    tryIt: [
      { what: "Search", how: "type in the field (try “warden”, “cost”, “blade”); Aa and ab narrow; the scope chips turn Entries, Text, References and Statements on and off." },
      { what: "Filters", how: "Kind, Source and Layer open a menu with counts; × or Clear removes them." },
      { what: "Results", how: "↑ ↓ move (the preview follows), ↵ or double-click opens the entry." },
      { what: "Replace", how: "in the replace state (shield → Guard) uncheck a match, then Replace; Undo brings the text back; the key shield-wall and its references stay locked, with Rename… in the preview." },
      { what: "No results", how: "Search with Draft points on adds the off layer to the search." },
    ],
    render: ({ mode, state, interactive }) => <SearchScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-layers-runner",
    group: "Run",
    title: "Dataset runner with hot reload",
    item: "cg-e1-layers-runner",
    summary:
      "Run (⌘R, or the toolbar's Run) opens a basic roster builder over the dataset being edited, as the Battle Augur desktop app builds rosters but plain: a developer tool with no export sheets, stars, grouped units or appearance. Docked, it is a right-hand pane beside the page (728 px at 1440, resizable by its left edge down to 560; the source list folds and the helper box becomes its pill while it is open); its header button opens it in its own window (Dock brings it back). The header says what runs and how fresh it is (“Live · built 12:04:31 · 180 ms”); the status opens the live-reload menu: Reload On save (default) or While typing (after a 400 ms pause), Pause live reload (⌥⌘P), Reload now (⇧⌘R), the build log. The configuration row picks what runs like augur dklpo test --with (the dataset alone or with its layers, the variants, Draft points marked Test, the locale), the force and the points limit, with the total against the limit. Below: the Add list by category with costs and slot counts, the roster tree (force → categories → selections with their option summary and cost), the selected item's options (counts with min and max, choices, toggles), its profile and rules as plain tables and a cost breakdown, and the engine's validation errors with the item they belong to. On reload the runner swaps to the new build keeping the roster, reopened through the roster-open rules (parent-preserving move records followed, otherwise matched by name, structural moves kept for review); a summary says what happened and marks the affected items. A build that fails keeps running the last good build under a banner that leads to the error. Go to entry (F12, or double-click) opens an item's page; Show in runner (⌥⌘R) does the reverse. Save as test… writes the roster with its expected results as test/*.yaml for augur dklpo test; Roster ▸ Open saved roster…, Reset roster. At 960 px the runner can't sit beside a 480 px page, so it takes the page area and ⌘R switches between page and runner (its own window keeps both in view).",
    states: [
      { id: "empty", title: "Empty: pick a force" },
      { id: "progress", title: "Roster in progress" },
      { id: "reloaded", title: "Just reloaded, change summary" },
      { id: "error", title: "Compile error: last good build" },
      { id: "review", title: "Kept for review after a structural move" },
      { id: "save-test", title: "Save as test scenario" },
      { id: "detached", title: "Detached window, live menu open" },
      { id: "narrow", title: "960 px window" },
    ],
    tryIt: [
      { what: "Build", how: "click a row in Add; select an item in the tree; change counts with − +, pick a weapon, take the Banner; the costs, the total and the errors follow. Fewer than 5 Wardens is an error with its item." },
      { what: "Reload", how: "Reload (⇧⌘R) rebuilds and keeps the roster; Pause stops saves from rebuilding; the status opens the live menu (On save / While typing)." },
      { what: "Review", how: "in the reloaded state Review (or the amber Banner row) shows why it was kept; Add it again under Command or Remove it." },
      { what: "Editor", how: "Go to entry (F12) or double-click a roster item opens its page on the left; Show in runner (⌥⌘R) selects the page's entry in the roster; ⌘R closes and opens the runner." },
      { what: "Window", how: "the ↗ button detaches the runner into its own window, Dock brings it back; drag the runner's left edge to resize it." },
      { what: "Test", how: "Save as test… opens the sheet: name, where it is saved, what it expects, the YAML it writes." },
    ],
    render: ({ mode, state, interactive }) => <RunnerScreen mode={mode} state={state} interactive={interactive} />,
  },
];
