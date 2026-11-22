# Agent Notes (repository)

This repository holds the design galleries of two products and what they share.

- `augur-designs/`: Battle Augur gallery. **Read `augur-designs/AGENTS.md`** before changing it.
- `cogitator-designs/`: Field Cogitator gallery. **Read `cogitator-designs/AGENTS.md`** before changing it.
- `design-kit/`: shared gallery code (`@designs/kit`). See `design-kit/README.md`.
- `docs/`: shared design rules. **Read `docs/design-principles.md` and `docs/done-checklist.md` before any design slice**; `docs/agent-workflow.md` covers tracks, verification and PRs.

Rules for every gallery:
- **Current / Next tracks (DEC-074 in the Battle Augur docs):** new or changed designs go to Next as Proposals; Current stays byte-identical; only the user approves; the product PR that builds an item promotes it.
- **Neutral sample data:** no third-party product content, names or vocabulary.
- **One package manager:** npm workspaces at the root (`npm install`, `npm run build`). Don't add per-folder lock files.
- **Pages:** `scripts/build-pages.mjs` assembles `dist/` (`/augur/`, `/cogitator/`, `pages/index.html`). A new gallery is added there and on the landing page.
