# Design principles

Stated by the user (2026-11-11, refined 2026-11-12 and 2026-11-22). They apply to every product here.

## Ideology

1. **Fast access.** Any part of the product and any function is reachable as fast and as conveniently as possible.
2. **Declared and responsive actions.** Every action says what it does and to what, shows whether it is available, and answers at once.
3. **Vertical space first.** Users value rows in view over decoration. Count rows in view when comparing layouts.
4. **Readable in every theme.** Light, dark and every colour scheme, at large text sizes too.

## Containers: open lists, not cards

- **No card as the default container.** A bordered or raised box is used only for things that float above other content or move and dismiss as one object: dialogs, sheets, menus, popovers, toasts, a job pill, a paper preview.
- **Open lists:** groups separated by space and a text heading; rows without dividers or fills; selection as a rounded tinted shape; no ⋯ menu on every row (hover/selected actions on desktop, swipe and long-press on touch).
- **Not a spreadsheet:** avoid full-width hairlines, tinted bands and table grids for ordinary lists.
- **Rows must stay distinct:** when rows run together, give each an anchor rather than a box (for example the status edge on roster and unit rows: green OK, red error, amber over a limit, accent changed).
- A one-time explanation (getting started) may be a card: it is shown once and dismissed.

## Actions

| State | Required behaviour |
| --- | --- |
| Available | Visible verb and target where ambiguous; accessible name and keyboard equivalent |
| Pressed | Immediate visual acknowledgment (target: within 100 ms) |
| Pending | Local busy state, no accidental duplicate, progress when it lasts |
| Success | Update the affected row and totals; short outcome only when useful; Undo for reversible removal |
| Failure | Keep input, say what failed, offer retry or recovery in place |
| Unavailable | Say why; tell a hard prohibition from a soft limit that can still be exceeded |

## Type and targets (starting points)

| Platform | Working text | Targets |
| --- | --- | --- |
| iOS / iPadOS | 17 pt body | 44 pt |
| Android | 16 sp body | 48 dp |
| macOS | 13 px working text | — |
| Windows | 14 px working text (Segoe UI Variable) | — |

Secondary text 12–13 only where readable. Section labels in sentence case, 13/18, weight 600 (no heavy uppercase). Quantities in tabular figures, a cost next to its unit. At large text, names wrap and costs move below; never truncate the only copy of a name.

## Platforms

Shared layout, platform behaviour: Android ripple, selected navigation, predictive back; Apple content first, native back, toolbar grouping, Dynamic Type; Windows explicit pressed and focus states, forced colours, keyboard-complete commands, 4 / 8 px corners; macOS menu commands and shortcuts.

## Sample data

Synthetic and product-neutral. No third-party product content, names or vocabulary in designs, samples or fixtures.
