# Workspace layer (shared by Desktop and Tablet)

Layout pieces used by both the desktop prototype (`../desktop/`) and the coming tablet prototype. The tablet takes these
layout pieces and the mobile content pieces from `../ux/` (DEC-039). Desktop imports everything here; nothing here imports
from `desktop/`.

Class names keep the `dt-` / `dtp-` / `dte-` prefixes of the desktop prototype. Renaming them is a separate job.

## Modules

| Module | What it is |
| --- | --- |
| `Primitives.tsx` | `Chip` (tones), `Switch`, `Segmented`, `IconButton`, `PageActions` (portal into a slot in the window chrome). |
| `PanelResizer.tsx` | Side panel resize handle: drag, arrow keys (Shift for bigger steps), double-click to reset. The host passes `limits` and the accessible `label`. |
| `Toasts.tsx` | `useToasts()` (state, auto-dismiss, `notify`) and `ToastRegion`. Functional toasts (result of the user's own action, optional Undo) top right; notifications (background events) bottom right. `ToastOptions`, `Notify`. |
| `Dialog.tsx` | `ModalShell` (scrim plus dialog, host handles focus), `Dialog` (takes focus, keeps Tab inside, closes on Escape, `wide` variant) and `DialogHeader`. |
| `Jobs.tsx` | Simulated install and update queue: `useWorkspaceJobs`, `JobsToggle`, `JobsPanel`, `FactionPicker`, `jobPercent`, types. |
| `sourceTypes.ts` | `SourceInfo` and related types used by the jobs and the Sources pages (re-exported from `desktop/desktopData.ts`). |
| `RosterSummary.tsx` | `SummaryToggle` (points button), `PointsLine` (thin line under the tabs) and `RosterSummary` (popover). They take totals, limits and actions as props and know nothing about the roster document. |
| `workspace.css` | The rules for all of the above, in the order they had in the desktop files. |
| `MOBILE-PIECES.md` | Which mobile components can be reused inside tablet panes and what each assumes. |

## Rules

- **Platform-neutral.** No desktop-only assumptions baked in: no hover-only actions, no keyboard-only paths, no window-chrome
  geometry in component logic. Anything that differs per platform (shortcut hints, which actions exist, pane limits,
  labels) comes in as props; the desktop passes `kbd` hints and panel limits, the tablet can pass touch labels and none.
- **Game-neutral (DEC-001).** Sample data stays synthetic.
- **Stay presentational.** Roster, source and layout state belong to the host (`DesktopWorkbench` today, the tablet
  workbench later). The only state kept here is UI state of the piece itself (toast timers, jobs queue, faction picker).

## Styling contract

- The host root carries the `dt-app` class. It provides the `--dt-*` tokens (mapped onto the shared `--ux-*` theme tokens)
  and the button/input reset that these rules build on.
- Modules import `workspace.css` themselves. It is evaluated before the host's own CSS, so a host rule of equal specificity
  overrides a workspace rule. The host's `.dt-app button/select { font: inherit }` reset is the exception that matters:
  it is evaluated later than `workspace.css`, so workspace rules that set `font-size` on buttons or selects need a
  `.dt-app` prefix (the summary rows have one).
- Overlays (`.dt-toast`, `.dt-modal-scrim`, `.dt-summary`, `.dt-jobs`) are positioned absolutely against the root.
