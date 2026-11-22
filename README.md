# Roster builder design gallery

The design reference for the roster builder app: phone, tablet, foldable and desktop libraries, each with workflows, single screens, a Glance view and an Elements view. Sample data is synthetic and game-neutral.

## How to view

- **Hosted:** https://ozas.github.io/roster-builder-example/ (built from `main` on every push).
- **Locally:** `npm install`, then `npm run dev` and open the address it prints.

The rail on the left picks the library (Phone, Tablet, Foldable, Desktop) and the **design track**:

- **Current** is what the app ships.
- **Next** is everything designed but not yet built. On Next the rail lists each item with a **Proposal** or **Approved** chip, and board labels of Next screens carry the same chip.

Links:

| Parameter | Effect |
| --- | --- |
| `?track=next` / `?track=current` | open on that track (switching writes it into the address, so a copied link opens the same track; the older `?look=` still works) |
| `?gallery=phone\|tablet\|foldable\|desktop` | open a library |
| `?screen=<screen id>&theme=light\|dark&view=single\|all-screens\|elements` | open one screen of the phone library |
| `?tablet=<screen>&theme=light\|dark` | a tablet screen on its own (for example `?tablet=editor`) |
| `?desktop=<screen>&theme=light\|dark` | a desktop screen on its own (for example `?desktop=editor`) |

The MVP 0.5.0 designs are the read-only tag `design-mvp-0.5.0`.
