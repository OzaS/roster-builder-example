# Agent Notes (Field Cogitator gallery)

Paths below are relative to `cogitator-designs/`. Shared rules: the repository `AGENTS.md` and `../docs/` (principles, done checklist, workflow). Run from the root: `npm run dev:cogitator`, `npm run build`.

## The product
Field Cogitator (working name) is a **desktop editor for datasets** in the DKLPO format (the successor data language of the Battle Augur project). It is a separate product from Battle Augur: its designs live only here, never in `augur-designs/`. First scope (E1): open and save a dataset, edit text and structured fields, follow references, see diagnostics (errors, preservation failures, authoring suggestions), run checks, convert and export, all through the same APIs as the command line tools.

## Direction (user, 2026-11-22)
- **Linear** for structure and speed: sidebar, dense grouped lists, keyboard first, a command palette, detail view with a properties panel, diagnostics as an inbox, quiet chrome with one accent.
- **Notion** for content: each entry a page (title, properties block, rules and text as blocks), `/` to insert, references as mentions with backlinks, table views.
- **Battle Augur desktop** for flavour: menu bar, macOS and Windows frames, tokens and accent, tree and inspector panes, aligned cost columns, category symbols.
- Start with a **mood board** (patterns side by side, each marked borrow or avoid); the user picks before the design language and screens.

## Rules
- Track: `src/track.ts` (own storage key) and `src/design-data/next-track.json`; everything is Next / Proposal until the user approves it.
- Sample data: synthetic datasets only (the Battle Augur docs' synthetic DKLPO examples are fine); no third-party product content or vocabulary.
- Shared chrome comes from `@designs/kit`; move code into the kit only when a second gallery needs it.
