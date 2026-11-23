/**
 * Direction D, the entry editor the user chose (2026-11-22, their mix of the mood board's directions A–C) and approved
 * (2026-11-23): what it optimises for and what it costs. A–C and the mood board were removed on 2026-11-23; they stay
 * in the history at the tag `cogitator-directions-2026-11-22`.
 */
export type DirectionId = "d";

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
    id: "d",
    letter: "D",
    title: "Entry editor",
    item: "cg-direction-d",
    oneLine: "A sidebar and a document page; a source opens a dense entry list beside the sidebar; a floating helper box expands into an issues panel; focus mode hides the sidebar.",
    optimises: [
      "Writing with the source in view: the grouped entry list (cost, layer-change and diagnostic columns, status edges) sits beside the page, so the next entry is one click or ↓ away and the page keeps its document shape.",
      "Diagnostics at the size the moment needs: a pill, a floating box with this page's issues, suggestions and actions, or the resizable panel with Issues, Suggestions and Properties for the entry or the whole dataset.",
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
