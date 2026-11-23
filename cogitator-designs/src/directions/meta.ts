/** The directions of the D4 mood board (A–C) and the user's mix (D): what each optimises for and what it costs. All Proposals. */
export type DirectionId = "a" | "b" | "c" | "d";

export type DirectionMeta = {
  id: DirectionId;
  letter: string;
  title: string;
  item: string;
  oneLine: string;
  optimises: string[];
  costs: string[];
  rows: string;
};

export const directions: DirectionMeta[] = [
  {
    id: "a",
    letter: "A",
    title: "Linear-first",
    item: "cg-direction-a",
    oneLine: "A dense entry list beside a detail view with a properties panel; diagnostics are an inbox you triage.",
    optimises: [
      "Scanning and triage: 20 entry rows in view (27 with group headings), with cost, layer-change and diagnostic columns.",
      "Keyboard flow: j / k through the list, Enter opens, single-key properties (C cost, L layer).",
      "Diagnostics as work: an inbox grouped by kind, each item marked done or snoozed.",
    ],
    costs: [
      "The entry body reads as a form, not as the DKLPO text authors think in; nested statements lose their shape.",
      "Three columns leave the detail about 530 px wide; long rule text wraps hard.",
      "Close to an issue tracker: authors may expect assignees and states that a dataset doesn't have.",
    ],
    rows: "20 entry rows in the list, 6 content lines and 3 backlinks in the detail",
  },
  {
    id: "b",
    letter: "B",
    title: "Notion-first",
    item: "cg-direction-b",
    oneLine: "Each entry is a document page: properties block, statements as blocks and toggles, mentions, / insert, backlinks; table views in the sidebar.",
    optimises: [
      "Reading and writing one entry: the page shows the whole entry in file order, nested children as toggles.",
      "References: every reference is a mention with a peek; backlinks sit under the title.",
      "Learning the format: the / menu lists the statements that are valid at the cursor.",
    ],
    costs: [
      "Fewer rows in view: the page tree shows 8 entries, and the page one entry at a time.",
      "Diagnostics are margin notes beside their block and a list under Updates; there is no inbox to triage the whole dataset beside the work.",
      "Free-form expectations: a page invites layouts the grammar can't hold, so the editor must refuse them politely.",
    ],
    rows: "8 entries in the page tree, 10 body blocks, 2 margin notes",
  },
  {
    id: "c",
    letter: "C",
    title: "Augur blend",
    item: "cg-direction-c",
    oneLine: "Battle Augur desktop panes and tokens, Linear speed (palette, inbox, keys), the entry as a Notion-style page.",
    optimises: [
      "One family with Battle Augur: frames, tokens, tree and inspector, status edges, aligned cost column.",
      "Both views at once: a tree with 20 rows and status edges, the entry as a page, the issues inbox beside it.",
      "Layers in plain sight: the stack in the tree header, layer changes marked on rows and values.",
    ],
    costs: [
      "Busiest of the three: three panes plus tabs; the inspector needs to collapse below 1280 px.",
      "Two models to learn: blocks for the entry, rows for everything else.",
      "Inherits Augur's roster habits (cost column, edges) that must be re-read for data authors.",
    ],
    rows: "20 tree rows plus the 4-layer stack, 8 statement lines, 7 issues",
  },
  {
    id: "d",
    letter: "D",
    title: "User mix (A + B + C)",
    item: "cg-direction-d",
    oneLine: "B's sidebar and document page; a source opens A's dense list beside the sidebar; a floating helper box expands into C's issues panel; focus mode hides the sidebar.",
    optimises: [
      "Writing with the source in view: A's grouped list (cost, layer-change and diagnostic columns, status edges) sits beside B's page, so the next entry is one click or ↓ away and the page keeps its document shape.",
      "Diagnostics at the size the moment needs: a pill, a floating box with this page's issues, suggestions and actions, or C's resizable panel with Issues, Suggestions and Properties for the entry or the whole dataset.",
      "Focus mode (double-click a source, ⌘. or the toolbar): the sidebar goes, and the list, the page and the panel share the width.",
    ],
    costs: [
      "Four columns at full stretch (sidebar, list, page, panel) leave the page about 560 px at 1440 px; the sidebar or the panel has to give way, which is what focus mode and the floating box are for.",
      "The floating box takes the page's right margin: the page shifts left by about 290 px while the box is open, or the author collapses it to the pill.",
      "More to learn: two ways to an entry (sidebar tree and source list) and three helper states; the window must remember them so the layout never feels random.",
    ],
    rows: "17 rows in the source list (Iron Wardens: 13 entries and 4 group headings), 9 sources, entries and tables in the sidebar tree, 9 page blocks, 5 helper rows",
  },
];
