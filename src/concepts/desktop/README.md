# Battle Augur desktop exploration 03

Lives in the existing design gallery as **Battle Augur · Desktop**. Select the desktop workflow to review Welcome and Roster editor, or Elements for component compositions.

Run `npm run dev`. Direct prototype links:

- `http://localhost:5173/?gallery=desktop` — separate desktop design library (Mobile/Desktop switch, independent view preferences)
- `http://localhost:5173/?desktop` — welcome and recent rosters
- `http://localhost:5173/?desktop=editor` — three-panel roster editor
- `?desktop=rosters`, `?desktop=lookup`, `?desktop=sources`, `?desktop=settings` — hub pages (draft)
- add `&theme=light` and `&scheme=<id>` (`generic`, `wh40k`, `horus-heresy`, `age-of-sigmar`, `old-world`) to preview a theme on the standalone links

The desktop prototype uses synthetic, game-neutral Open Field data. It uses the shared theme tokens (`--ux-*` from `ux.css`), so light/dark and every colour scheme apply, plus T3's window/panel structure, and the launch-screen hierarchy of a code editor. Catalogue, roster and inspector use flat rows and dividers rather than cards.

Explore create, recent rosters, catalogue search and role filter, add/select/duplicate/remove units, collapse groups, edit model counts/equipment/upgrades/notes, Profile/Rules tabs, validation and over-budget states, panel toggles, light/dark appearance, and Command/Ctrl K or N. JSON import/export round-trips prototype rosters only. Dialogs contain keyboard focus and close with Escape.

Edits live for the prototype session and can be exported. The recent list contains fixed sample snapshots. This is a design prototype; it does not run the Battle Augur engine, install data, or persist workspace changes. Single-detachment editing is the scope of this first pass.

Gallery metadata: `src/design-data/roster-builder.design.json`. UI: `DesktopWorkbench.tsx`. Namespaced styles: `desktop.css`. Desktop screens retain their desktop frame in single-screen, workflow-board and Glance views; mobile concepts keep their existing frames.

Validation: `npm run build`, rendered visual checks at 1440px, and browser interaction checks for live budget updates, duplication/removal, profiles, validation, recent snapshots, create/empty state and gallery selection.

Revision 02 removes the title/search bar and bottom status strip. Panel controls float at the top right, workspace tabs sit at the top with rounded shapes, and the activity rail appears only on Welcome. Inspector tabs use the same rounded language.

Revision 03 puts the desktop on the shared themes: the root carries `ux-screen`, `light|dark` and `ux-scheme-*`, and `--dt-*` tokens map onto `--ux-*`. The gallery Display controls and the in-app Settings (theme, colour scheme) drive it. Panels become rounded cards on the canvas, roster groups are soft cards, and the roster header is gone: its name, budget, points limit, validation, data version and Export live in a hidable **roster summary popover** opened from the points button at the top right. While the popover is closed, a thin points line runs under the tabs.

Hub pages (draft for discussion): **Rosters** (search, needs-attention filter, system filter, sort, list with points/status/opened, detail pane with rename, duplicate, export, two-step delete), **Lookup** (search, scope chips, grouped units/rules/equipment, read-only entry with profile, conditional cost note and the rosters that use it), **Sources** (update banner and Update all, installed list with status chips and progress, source detail with update card, info, kept versions, factions, rosters using it, two-step remove; Add game data with collection, repository link and GitHub search), **Settings** (section nav; appearance, language, rosters, game data, storage, shortcuts, about). The activity rail shows on hub pages; the first tab follows the current hub page. Command/Ctrl comma opens Settings. Code: `DesktopPages.tsx`, `desktopData.ts`, `desktop-pages.css`.
