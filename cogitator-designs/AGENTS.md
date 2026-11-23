# Agent Notes (Field Cogitator gallery)

Paths below are relative to `cogitator-designs/`. Shared rules: the repository `AGENTS.md` and `../docs/` (principles, done checklist, workflow). Run from the root: `npm run dev:cogitator`, `npm run build`.

## The product
Field Cogitator (working name) is a **desktop editor for datasets** in the DKLPO format (the successor data language of the Battle Augur project). It is a separate product from Battle Augur: its designs live only here, never in `augur-designs/`. First scope (E1): open and save a dataset, edit text and structured fields, follow references, see diagnostics (errors, preservation failures, authoring suggestions), run checks, convert and export, all through the same APIs as the command line tools.

## Direction (user, 2026-11-22)
- **Linear** for structure and speed: sidebar, dense grouped lists, keyboard first, a command palette, detail view with a properties panel, diagnostics as an inbox, quiet chrome with one accent.
- **Notion** for content: each entry a page (title, properties block, rules and text as blocks), `/` to insert, references as mentions with backlinks, table views.
- **Battle Augur desktop** for flavour: menu bar, macOS and Windows frames, tokens and accent, tree and inspector panes, aligned cost columns, category symbols.
- The mood board and directions A–C led to **Direction D** (the user's mix, 2026-11-22). A–C and the mood board were removed on 2026-11-23 (no longer used); they stay in the history at the tag `cogitator-directions-2026-11-22`.

## Approved (user, 2026-11-23)
- Direction D, the design language, the Elements view and the E1 screens (parts 1 and 2) are **approved** (`status: "approved"` in `next-track.json`). The user expects changes once they use the app: a change to an approved design is drawn as a Proposal and approved again (the Battle Augur design freeze rule, DEC-051, applies once E1 implementation starts).

## Design language (D4 step 2, 2026-11-22)
- New screens take every value from `src/language/tokens.css` (colour, type, density, radii, elevation, motion, focus; macOS base, `[data-platform="windows"]`, `[data-text="large"]`) and pane widths from `src/language/layout.ts`; no hard-coded colours or sizes in screen CSS.
- Primitives come from the Elements view (`?page=elements`): Direction D's under `.fc-d` in `src/directions/direction-d.css`, the newer ones in `src/language/primitives.css`. A new primitive gets an Elements entry (renderer in `src/pages/ElementsPage.tsx`) and an entry in `src/design-data/cogitator.design.json` (`elements.sections`, which the page renders from).
- Direction D's frame captures (`?view=frame&direction=d&mode=light|dark&state=…`) must stay byte-identical unless a change to D is approved.

## E1 screens (D4 step 3, 2026-11-22)
- Each E1 screen is an `E1Screen` (`src/e1/types.ts`) registered in its part's list (`src/e1/start/`, `src/e1/editor/`, collected by `src/e1/registry.ts`), with a `next-track.json` item and an entry in `cogitator.design.json` `screens`. `?page=e1` shows them all, `&screen=<id>` one, `?view=frame&screen=<id>&mode=&state=&platform=windows` one alone for captures.
- Screens draw on a gallery page beside others: no focus on mount (`autoFocus` or effects), or the page scrolls to the last screen.

## Rules
- Track: `src/track.ts` (own storage key) and `src/design-data/next-track.json`; new designs start as Next / Proposal until the user approves them; approved items stay on Next until the app builds them.
- Sample data: synthetic datasets only (the Battle Augur docs' synthetic DKLPO examples are fine); no third-party product content or vocabulary.
- Shared chrome comes from `@designs/kit`; move code into the kit only when a second gallery needs it.
