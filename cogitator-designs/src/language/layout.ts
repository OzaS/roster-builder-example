/**
 * Field Cogitator design language: layout numbers (D4 step 2, extracted from Direction D).
 *
 * Pane widths, minimums and window breakpoints in px. They live in code, not in `tokens.css`, because the window needs
 * them as numbers (grid columns, the panel's resize clamp, the collapse rules). Everything visual is in `tokens.css`.
 */
export const layout = {
  /** Sidebar (B's quiet paper sidebar). Fixed in D; when it becomes resizable it keeps this minimum. */
  sidebar: 232,
  sidebarMin: 200,
  /** Source list (A's dense grouped list). */
  sourceList: 318,
  sourceListMin: 260,
  /** In focus mode the list also carries the window controls, so it is a little wider. */
  sourceListFocus: 348,
  /** The document page: the text column is at most `pageMax` wide; below `pageMin` something else gives way. */
  pageMin: 480,
  pageMax: 760,
  /** Helper panel (C's inspector), resizable by its left edge. */
  panel: 328,
  panelMin: 260,
  panelMax: 520,
  /** The floating helper box and the margin it takes from the page while it is open. */
  helperBox: 276,
  helperBoxMargin: 292,
  /** The window: design width, design height and the smallest window the app allows. */
  windowDesign: 1440,
  windowHeight: 900,
  windowMin: 960,
} as const;

/**
 * Collapse order as the window narrows (all four parts open at the design width). Each step happens at the width where
 * keeping the part would push the page below `pageMin`; widening reverses the steps in the opposite order.
 */
export const collapseSteps = [
  {
    below: layout.sidebar + layout.sourceList + layout.pageMin + layout.panel, // 1358
    hides: "Helper panel",
    becomes: "the floating helper box; its expand button brings the panel back once the window is wide enough",
  },
  {
    below: layout.sidebar + layout.sourceList + layout.pageMin + layout.helperBoxMargin, // 1322
    hides: "Floating helper box",
    becomes: "the pill with the counts; clicking it opens the box over the page margin",
  },
  {
    below: layout.sidebar + layout.sourceList + layout.pageMin, // 1030
    hides: "Sidebar",
    becomes: "focus-mode layout: the list carries the window controls; ⌘. or Exit focus brings the sidebar back over the list as an overlay",
  },
  {
    below: layout.windowMin, // 960
    hides: "Nothing more",
    becomes: "960 px is the minimum window width: the list (318 px) and the page (612 px) always fit side by side",
  },
] as const;
