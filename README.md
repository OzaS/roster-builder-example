# Design galleries

| Folder | What |
| --- | --- |
| `augur-designs/` | **Battle Augur**: the roster builder app; phone, tablet, foldable and desktop libraries, each with workflows, single screens, a Glance view and an Elements view |
| `cogitator-designs/` | **Field Cogitator**: the data editor for datasets (desktop) |
| `design-kit/` | Shared gallery code (`@designs/kit`) |
| `docs/` | Shared design rules: principles, done checklist, agent workflow, review rubric |

Sample data is synthetic and neutral.

## How to view

- **Hosted:** https://ozas.github.io/roster-builder-example/ lists both galleries: `/augur/` and `/cogitator/` (built from `main` on every push). Older links to the root with a query string open the Battle Augur gallery.
- **Locally:** `npm install` at the root, then `npm run dev:augur` or `npm run dev:cogitator` and open the address it prints. `npm run build` builds both into `dist/`.

In each gallery the rail picks the **design track** (in Battle Augur also the library: Phone, Tablet, Foldable, Desktop):

- **Current** is what the app ships.
- **Next** is everything designed but not yet built. On Next the rail lists each item with a **Proposal** or **Approved** chip, and board labels of Next screens carry the same chip.

Battle Augur links (after `/augur/`):

| Parameter | Effect |
| --- | --- |
| `?track=next` / `?track=current` | open on that track (switching writes it into the address, so a copied link opens the same track; the older `?look=` still works) |
| `?gallery=phone\|tablet\|foldable\|desktop` | open a library |
| `?screen=<screen id>&theme=light\|dark&view=single\|all-screens\|elements` | open one screen of the phone library |
| `?tablet=<screen>&theme=light\|dark` | a tablet screen on its own (for example `?tablet=editor`) |
| `?desktop=<screen>&theme=light\|dark` | a desktop screen on its own (for example `?desktop=editor`) |

The MVP 0.5.0 designs are the read-only tag `design-mvp-0.5.0`.
