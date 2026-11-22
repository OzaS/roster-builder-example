/** The three directions of the D4 mood board: what each optimises for and what it costs. All Proposals. */
export type DirectionId = "a" | "b" | "c";

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
      "Scanning and triage: 24 entry rows in view, grouped by kind, with cost and diagnostic columns.",
      "Keyboard flow: j / k through the list, Enter opens, single-key properties (C cost, L layer).",
      "Diagnostics as work: an inbox grouped by kind, each item marked done or snoozed.",
    ],
    costs: [
      "The entry body reads as a form, not as the DKLPO text authors think in; nested statements lose their shape.",
      "Three columns leave the detail about 560 px wide; long rule text wraps hard.",
      "Close to an issue tracker: authors may expect assignees and states that a dataset doesn't have.",
    ],
    rows: "24 list rows, 14 body lines",
  },
  {
    id: "b",
    letter: "B",
    title: "Notion-first",
    item: "cg-direction-b",
    oneLine: "Each entry is a document page: properties block, statements as blocks, mentions, a table view and backlinks.",
    optimises: [
      "Reading and writing one entry: the page shows the whole entry in file order, nested children as toggles.",
      "References: every reference is a mention with a peek; backlinks sit at the page foot.",
      "Learning the format: the / menu lists the statements that are valid at the cursor.",
    ],
    costs: [
      "Fewer rows in view: a generous page shows about 9 entries in the tree and one entry at a time.",
      "Diagnostics live inline and in an updates panel; there is no single place to triage the whole dataset.",
      "Free-form expectations: a page invites layouts the grammar can't hold, so the editor must refuse them politely.",
    ],
    rows: "9 tree rows, 11 body blocks",
  },
  {
    id: "c",
    letter: "C",
    title: "Augur blend",
    item: "cg-direction-c",
    oneLine: "Battle Augur desktop panes and tokens, Linear speed (palette, inbox, keys), the entry as a Notion-style page.",
    optimises: [
      "One family with Battle Augur: frames, tokens, tree and inspector, status edges, aligned cost column.",
      "Both views at once: a tree with 22 rows and status edges, the entry as a page, the diagnostics inbox beside it.",
      "Layers in plain sight: the stack in the tree header, layer changes marked on rows and values.",
    ],
    costs: [
      "Busiest of the three: three panes plus tabs; the inspector needs to collapse below 1280 px.",
      "Two models to learn: blocks for the entry, rows for everything else.",
      "Inherits Augur's roster habits (cost column, edges) that must be re-read for data authors.",
    ],
    rows: "22 tree rows, 13 body lines, 7 issues",
  },
];
