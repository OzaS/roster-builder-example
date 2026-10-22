# Mobile content pieces outside the phone frame

The tablet takes the desktop **layout** pieces (`./`, `../desktop/`) and the mobile **content** pieces (`../ux/`, styles in
`src/styles/ux.css`, `sources.css`) inside its panes (DEC-039). This is the audit of what those mobile pieces assume about
the phone frame (`.device-frame.phone`, 390 px wide, 844 px high, one pane at a time) and what the tablet needs.

## Summary

- **Content is mostly frame-neutral.** There are no `100vw` / `100vh` units and no fixed 390 px widths in `ux.css`
  (390 px appears only in the tablet subscription card, `min(390px, 100%)`; the viewport units are `52vh` on the select popover, now a variable, and `6vw` in the subscription card title clamp). Cards, rows, chips, option rows, profile tables
  and the options surface are plain `.ux-*` rules that only need an ancestor `.ux-screen` for the `--ux-*` tokens. The
  desktop root already carries `ux-screen`, so they render inside a `.dt-app` pane.
- **Overlays are the main assumption.** Every sheet, dialog and glance layer is `position: absolute; inset: 0` against the
  nearest positioned ancestor, which is the `.ux-screen` root, not the pane. They are bottom-anchored sheets by default and
  become centred dialogs only under `.device-frame.tablet`.
- **The big components are not pane-ready by API.** The workbench pieces are private functions inside
  `CodexWorkbench.tsx` that take the whole `ConceptProps` (about 50 fields: roster, selection, every handler). Reusing them in
  a tablet pane means extracting them behind data props first; that is the larger change this file only lists.
- **Fixed additively (this slice):** the opt-in size class `.ux-size-regular` (see below) and the `--ux-popover-max-height`
  variable (default `52vh`). Nothing else changed; the phone
  library and phone/tablet workbench screens render byte-identically.

## Opt-in size class: `.ux-size-regular`

Put `ux-size-regular` on an ancestor of the pieces (a tablet pane host, or the window root). It adds the same rules that
`.device-frame.tablet` already applied, as alternative selectors on the existing rules in `ux.css`:

| Piece | With `.ux-size-regular` |
| --- | --- |
| Force selector, loadout selector (`.ux-force-selector-layer`, `.ux-loadout-selector-layer`) | Centred dialog, `min(520px, 100%)` wide, 12 px radius, 24 px layer padding instead of a bottom sheet |
| Entry dialogs (rename, destination: `.ux-entry-dialog-layer`) | Centred, `max-width: 480px` |
| Reference glance layer (`.ux-reference-glance-layer`) | 24 px padding |
| Swipe rows (`.ux-swipe-actions`, `.ux-swipe-unit-content`) | Swipe actions hidden, content never translated (rows get pointer / hover or context actions instead) |

Without the class (phone, compact) nothing changes. The layers still cover the whole host (`inset: 0`); to confine them to a
pane, give the pane host `position: relative` (and `overflow: hidden`), or render the layer in the window root.

## Components

| Component | File | What it assumes | What the tablet needs |
| --- | --- | --- | --- |
| Roster tree: force list, section branches (`.ux-force-list`, `.ux-tree-branch`, `.ux-tree-units`), `Tree` | `ux/CodexWorkbench.tsx` (private), `ux.css` `.ux-wb-tree` | `props: ConceptProps` for everything; `.ux-wb-tree` is a one-column grid with 12 px padding that shows one pane at a time through `.ux-workbench.show-detail` / `show-checks` classes; the three-pane widths come from `--ux-tree-track` / `--ux-rail-track` set inline on the workbench root from `tabletPanelLayout` | Extract `Tree` behind data props (roster, selection, handlers); drop the one-pane-at-a-time classes in favour of the desktop panes and resizer (`PanelResizer`); no `.device-frame.tablet` rules |
| Unit rows (`SwipeableUnitRow`), `TreeUnitMain` | `ux/CodexWorkbench.tsx`; `TreeUnitMain` in `ux/uxShared.tsx` | Pointer-drag swipe with `touch-action: pan-y`; delete / duplicate / rename revealed by swiping; hidden on tablet only through `.device-frame.tablet` (now also `.ux-size-regular`) | Add `ux-size-regular` and give rows hover / context actions (the desktop prototype has them); keep swipe for touch tablets only if wanted. `TreeUnitMain` is presentational and reusable as is |
| Unit detail: `Detail`, `StructuredOptions`, `FlatOptions`, `OptionButton` | `ux/CodexWorkbench.tsx` | `props: ConceptProps`; `.ux-wb-detail` is a grid that fills the frame and scrolls itself; options use `.ux-opt-*` rules (44 px touch targets) | Extract behind data props; confirm the pane gives `.ux-wb-detail` a bounded height (flex child with `min-height: 0`) |
| Loadout groups: `LoadoutSelector`, loadout slots | `ux/CodexWorkbench.tsx`, `ux.css` `.ux-loadout-selector-layer` | Bottom sheet: absolute `inset: 0` layer, sheet `max-height: 82%` of the layer, closes on `onMouseDown` on the backdrop | `ux-size-regular` (centred dialog); pane host `position: relative` if it should stay inside the pane; mouse-down close works for touch via emulated mouse events but should become a pointer event |
| Profiles: `UnitProfile`, `ProfileSection`, `ProfileTable`, `FitWidthTable`, `ReferenceTag` | `ux/CodexWorkbench.tsx` | Container-neutral. `FitWidthTable` scales the table to its own container with a `ResizeObserver`, so it already follows pane width | Nothing for layout; extract with the detail |
| Reference glance: `ReferenceGlanceStack`, `ReferenceDefinition` | `ux/CodexWorkbench.tsx`, `ux.css` `.ux-reference-glance-*` | Layer is absolute `inset: 0` at `z-index: 90`; `.device-frame.phone .ux-reference-glance-stack` forces full width and `calc(100% - 10px)` height; elsewhere the stack is `min(100%, 560px)` by `min(88%, 720px)` | `ux-size-regular` for the padding; the base (non-phone) stack size is already tablet-friendly |
| Options surface: `MobileUnitOptions`, `Count`, `ToggleRow`, `RadioRow`, `FoldSection`, `MobileUnitProfile` | `ux/MobileUnitOptions.tsx`, `ux.css` `.ux-mobile-unit-options`, `.ux-5a-*`, `.ux-5b-tabs` | Self-contained flex column with its own scroll and a sticky header; `onBack` draws a back header for the phone drill-down; `compact` sets `max-height: 640px`; 44 px minimum targets | Usable in a pane as is. Omit `onBack` (or hide the header) when the drill-down is a pane, not a screen; the 16 px padding and 44 px targets are touch-sized, so check density against the desktop inspector |
| Option rows (`.ux-opt-row`, `.ux-opt-check`) | `ux.css` | Class-based, no frame. A `:hover` style exists next to the touch styles | None |
| Chips: `Chip` (`valid` / `warning` / `error` / `cool` / `neutral`) | `ux/uxShared.tsx`, `ux.css` `.ux-chip` | None; needs `.ux-screen` tokens | Note the name clash with the workspace `Chip` (`dtp-chip`, tones `ok` / `warn` / `err` / `accent`); import one under an alias. Pick per context: workspace chips in chrome and lists, mobile chips inside mobile content |
| Budget: `BudgetMeter`, `ExpandableBudget`, `budget()` | `ux/uxShared.tsx` | Presentational; `ExpandableBudget` expands in the flow | Tablet shows budget through `SummaryToggle` / `RosterSummary` / `PointsLine`; reuse `budget()` only |
| Select field and its popover (`.ux-select-field`, `.ux-select-popover`) | `ux.css` | Popover opens under the field (`top: calc(100% + 8px)`) with `max-height: min(330px, 52vh)`, one of two viewport units in the mobile styles (the other is `clamp(22px, 6vw, 28px)` on the subscription card title) | Fixed additively: the height reads `--ux-popover-max-height` and defaults to `52vh` (phone unchanged); set it on a pane host to bound popovers by the pane |
| Bottom sheets: install job sheet, `.ux-sheet` | `ux/SourceJobs.tsx`, `ux.css` `.ux-sheet`, `sources.css` `.ux-job-backdrop` | Bottom-anchored (`margin-top: auto` inside an absolute backdrop, grip handle, top-rounded corners, 80 px bottom padding for the tab bar) | Not reused: the tablet uses the workspace `JobsPanel` / `JobsToggle` / `FactionPicker` |
| Detail mode bar (`DetailModeBar`) | `ux/CodexWorkbench.tsx`, `ux.css` `.ux-detail-mode-layer` | Absolute `bottom: 14px; left: 50%` of the window root, `max-width: calc(100% - 24px)` | If kept, anchor to the detail pane (pane `position: relative`); otherwise drop for the desktop inspector tabs |
| Tab bar (`TabBar`) | `ux/CodexWorkbench.tsx`, `ux.css` `.ux-tabbar` | Absolute bottom of the window root with `env(safe-area-inset-bottom)` padding; `has-tabs` shifts floating pieces up (`.ux-job-float { bottom: 96px }`) | Not reused: the tablet has the desktop activity rail and tabs |
| Toasts: `ux-job-toast`, `ux-job-float` (pill and toasts) | `ux/SourceJobs.tsx`, `sources.css` | `.ux-job-float` is absolute at `left/right: 14px; bottom: 18px` of the window root (96 px with tabs), stacked and centred, full width of the phone | Not reused: the tablet uses workspace `ToastRegion` (functional top right, notification bottom right). `ux-undo-toast` exists only as a design element (`DesignElementsPanel`), not in the workbench |
| Floating subscription layer | `ux/uxShared.tsx` `SubscriptionGate`, `ux.css` `.ux-subscription-layer` | Absolute `inset: 0`, card `min(360px, 100%)` (390 px on tablet frames) | Out of scope for panes; works as a window-level overlay |
| Library / roster list screens | `ux/CodexWorkbench.tsx` `Library`, `ux.css` `.ux-wb-home-body` | `.device-frame.phone` rules stack the roster organiser above the list and set 14 px padding | Not planned for panes; desktop Rosters page covers it |

## Left for later (larger than additive)

1. Extract `Tree`, `Detail` / `StructuredOptions` / `LoadoutSelector` / profiles from `CodexWorkbench.tsx` behind data props
   so a tablet pane can render them without `ConceptProps`.
2. Replace the one-pane-at-a-time classes (`show-detail`, `show-checks`, `focus-*`, `tree-collapsed`) and the
   `.device-frame.tablet` three-pane rules with the workspace panes and `PanelResizer`.
3. Decide per overlay whether it is confined to a pane (pane host `position: relative`) or the window (render at the root).
4. Both resets apply inside a `.dt-app` pane (`.ux-screen :where(button)` / `.ux-screen *` and `.dt-app button`); check the
   few places where they disagree (button display and font) when the first mobile piece lands in a tablet pane.
