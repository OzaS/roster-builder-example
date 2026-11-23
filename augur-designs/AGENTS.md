# Agent Notes (Battle Augur gallery)

Paths below are relative to `augur-designs/`. Shared rules: the repository `AGENTS.md` and `../docs/` (principles, done checklist, workflow). Run from the root: `npm run dev:augur`, `npm run build`.

## Design Source Of Truth
- Inspect `src/design-data/roster-builder.design.json` before changing gallery workflows, screen grouping, screen labels, archived designs, trash, or element coverage.
- React components and icon mappings remain in code; the JSON stores editable design metadata and workflow structure.
- Workflow deletion must move screens to the `unsorted` workflow, never delete them.

## Trash
- Removed screens live in each design's `trash.screens`.
- Do not inspect, modify, or account for trash screens unless the user explicitly asks to review trash.

## Elements
- When adding new UI primitives, controls, rows, cards, panels, or workflow/gallery chrome, add a representative entry to the Elements view.
- Keep `design.elements.sections` in `src/design-data/roster-builder.design.json` aligned with `DesignElementsPanel`.

## Comments
- Screen review comments live in `design.comments` inside `src/design-data/roster-builder.design.json`.
- Review comments when the user asks about screen feedback, comment state, Glance view, or design review notes.

## Design Tracks: Current And Next (DEC-074, refines DEC-051)
- One switch in the rail: **Current** is what the app ships; **Next** is everything designed but not yet built. The store comes from the design kit (`@designs/kit`, `createTrack`); `src/look.ts` exports it (`useTrack()` for gallery chrome, `useLook()` / `useNextLook()` for design markup; the root attribute stays `data-look`). `?track=next|current` sets it for one page load.
- Next items are listed in `src/design-data/next-track.json`: `kind` `look` (a style change; styles in `src/styles/next/` scoped to `:root[data-look="next"]`, markup reading `useNextLook()`) or `screen` (a new screen: one that `replaces` a Current screen id, swapped in on Next, or a `variantOf` one, shown beside it on Next for comparison; the board and routing follow `src/nextTrack.ts` (the kit's `createNextRegistry`), and on Current a Next-only screen falls back to the screen it replaces or varies). Each item has `status` `proposal` or `approved`, and `open` (platform → screen) says which screen the rail opens. Items of one feature carry `feature: <id>` and the file's `features` list gives that feature one rail row (title, status, `open`); a feature with many screens is listed once.
- New or changed designs go into Next as Proposals at any time; the Current look must stay byte-identical (check captures with `?track=current` before and after). Only the user approves: set `status` to `approved` when they say so.
- Implementation takes only Approved items. The app PR that builds an item promotes it in the gallery: Next styles and markup become the base, a replaced screen moves to the archive (never deleted), and the item leaves `next-track.json`. Each app release tags the gallery.
- Frames the Next styles don't cover are wrapped in `PinLook look="current"` (today: foldable, the archived tablet sketch).

## Release Tracks And Design Freeze (DEC-051)
- The MVP 0.5.0 designs are the read-only annotated tag `design-mvp-0.5.0`; view them with `git worktree add <dir> design-mvp-0.5.0`. Never move or edit it.
- `main` is the 1.0 design track. Designs are made and approved during R0. Once implementation starts (R1 on), do not change a design: show the proposed change visually (a mockup or capture beside the current design) and ask the user first. Only approved changes go into the gallery.
