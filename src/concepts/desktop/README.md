# Battle Augur desktop exploration 01

Lives in the existing design gallery as **Battle Augur · Desktop**. Select the desktop workflow to review Welcome and Roster editor, or Elements for component compositions.

Run `npm run dev`. Direct prototype links:

- `http://localhost:5173/?desktop` — welcome and recent rosters
- `http://localhost:5173/?desktop=editor` — three-panel roster editor

The desktop prototype uses synthetic, game-neutral Open Field data. It borrows the existing workbench's neutral violet palette, T3's window/panel structure, and the launch-screen hierarchy of a code editor. Catalogue, roster and inspector use flat rows and dividers rather than cards.

Explore create, recent rosters, catalogue search and role filter, add/select/duplicate/remove units, collapse groups, edit model counts/equipment/upgrades/notes, Profile/Rules tabs, validation and over-budget states, panel toggles, light/dark appearance, and Command/Ctrl K or N. JSON import/export round-trips prototype rosters only. Dialogs contain keyboard focus and close with Escape.

Edits live for the prototype session and can be exported. The recent list contains fixed sample snapshots. This is a design prototype; it does not run the Battle Augur engine, install data, or persist workspace changes. Single-detachment editing is the scope of this first pass.

Gallery metadata: `src/design-data/roster-builder.design.json`. UI: `DesktopWorkbench.tsx`. Namespaced styles: `desktop.css`. Desktop screens retain their desktop frame in single-screen, workflow-board and Glance views; mobile concepts keep their existing frames.

Validation: `npm run build`, rendered visual checks at 1440px, and browser interaction checks for live budget updates, duplication/removal, profiles, validation, recent snapshots, create/empty state and gallery selection.
