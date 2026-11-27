import type { E1Screen } from "../types";
import { OpensScreen, RedundancyScreen } from "./RedundancyScreen";

/** X1's Cogitator part (Proposal, 2026-11-27): the Redundancy tool view and where it opens from. Data: the X0 synthetic dataset. */
export const redundancyScreens: E1Screen[] = [
  {
    id: "x1-redundancy",
    group: "Redundancy (X1)",
    title: "Redundancy: copies across modules",
    item: "cg-x1-redundancy",
    summary:
      "Proposal (X1, 2026-11-27). Tools › Redundancy (⇧⌘D, Ctrl+Shift+D; the palette finds it as “copies”, “duplicates” or “redundancy”) opens a tool view in place of the list and the page, like Updates and Roundtrip, and the sidebar’s new Redundancy item (after Layers) shows how many groups are left to extract. It is `augur dklpo clones` and `augur dklpo extract` on the open dataset. The list groups the copies by kind (entries, groups, rules, profiles) and ranks them by the logic bytes an extraction saves; groups that save nothing fold at the end of their kind; similar groups come last, listed only. A row says the copy kind (identical, value-only with its number of differences, similar: a word and a shape), how many members in which modules (the first three, then +n) and the base module. Selecting a group shows the base (abstract, new; Change… for the module and key), what it saves, the differences place by place with the base value marked, the members with what each keeps, and the change `extract --dry-run` plans as files with their lines, with the gate’s verdict (compiles with no new error, fmt clean, the same data in both id modes). Apply (⌘↵) writes it as one undo step; the view scans again and says what went and what is new. The gate can refuse (nothing written, the errors and a way to them); similar groups have no Apply and say why. Nothing selected: the scan’s summary, the density MQ-10 asks for, counts by kind. A large dataset (hundreds of groups, a group of about 800 members) folds most of its profiles and shows a group’s first members with Show all.",
    states: [
      { id: "list", title: "The list: by kind, ranked by saving; nothing selected" },
      { id: "preview", title: "A value-only group selected: the change, checked" },
      { id: "checking", title: "The change being checked: Apply waits" },
      { id: "applied", title: "Applied: one undo step, scanned again" },
      { id: "refused", title: "Refused by the check: nothing written" },
      { id: "similar", title: "A similar group: listed, no Apply" },
      { id: "empty", title: "Nothing left to extract" },
      { id: "no-compile", title: "The dataset doesn’t compile" },
      { id: "large", title: "A large dataset: 656 groups, 804 members" },
      { id: "narrow", title: "960 px window" },
      { id: "large-text", title: "Large text" },
    ],
    tryIt: [
      { what: "Select", how: "click a row or ↑ ↓: the right side follows; a fold opens the groups that save nothing." },
      { what: "Apply", how: "Apply or ⌘↵ in the preview: the row is marked Extracted, the toast and ⌘Z undo it." },
      { what: "The change", how: "click a file’s head to open or fold its lines; the text packs are folded." },
    ],
    render: ({ mode, state, interactive }) => <RedundancyScreen key={state} mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "x1-redundancy-opens",
    group: "Redundancy (X1)",
    title: "Where Redundancy opens from",
    item: "cg-x1-redundancy",
    summary:
      "Proposal (X1, 2026-11-27). Three ways in, each with the same key: the ⌘K palette lists the command Redundancy (⇧⌘D) for “copies”, “duplicates”, “clones” and “redundancy”; the Tools menu holds it between Roundtrip and Run Checks; the sidebar’s Redundancy item (after Layers) shows the groups left to extract from the last scan. On an entry that is a member of a group, a quiet line under the title says where else it is written (“Also written in Moss Covenant and Tide Compact, with other numbers”) and Show in Redundancy opens the view on that group. ⇧⌘D again goes back to the page.",
    states: [
      { id: "opens-palette", title: "⌘K: “copies” finds Redundancy" },
      { id: "opens-menu", title: "Tools menu, the sidebar item, the page line" },
    ],
    render: ({ mode, state, interactive }) => <OpensScreen key={state} mode={mode} state={state} interactive={interactive} />,
  },
];
