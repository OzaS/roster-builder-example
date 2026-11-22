# Agent workflow

## Where things go

| Path | Content |
| --- | --- |
| `augur-designs/` | Battle Augur gallery (its own `AGENTS.md`) |
| `cogitator-designs/` | Field Cogitator gallery (its own `AGENTS.md`) |
| `design-kit/` | Shared gallery code (`@designs/kit`): track store, Next registry, track switch |
| `docs/` | These rules |
| `pages/` | Landing page of the Pages site |

Run `npm install` once at the root, then `npm run dev:augur` or `npm run dev:cogitator`. `npm run build` builds both and assembles `dist/` (`/augur/`, `/cogitator/`, landing page).

## Current and Next

- **Current** is what the product ships. **Next** is designed but not built. One switch in each gallery's rail; `?track=next|current` in a link.
- **Proposals go to Next** at any time: a `next-track.json` item (`look`, or `screen` with `replaces` / `variantOf`) with `status: "proposal"`, and Next styles scoped to `:root[data-look="next"]` with markup reading `useNextLook()`.
- **Only the user approves.** Set `status: "approved"` when they say so. Implementation takes only Approved items.
- **Promotion:** the product PR that builds an item promotes it in the gallery: Next styles and markup become the base, a replaced screen moves to the archive (never deleted), the item leaves `next-track.json`. Each product release tags the gallery.
- A frame the Next styles don't cover is pinned with `PinLook look="current"`.

## A design slice

1. Read the gallery's `AGENTS.md`, its design JSON and [design principles](design-principles.md).
2. When the direction is open, draw two or three options side by side first and let the user pick (cheaper than a full pass on the wrong one).
3. Build on Next; keep Current byte-identical.
4. Go through the [done checklist](done-checklist.md).
5. Branch `design/<slice>`, PR into `main`, merge after the checks (design slices have no separate code review). Pages deploys from `main`.
6. Record the outcome in the product's docs.

## Kit or product?

Code goes into `design-kit/` when a second gallery needs it; until then it stays in the product. Kit components take product data as props and use the gallery tokens (`--surface`, `--surface-2`, `--ink`, `--muted`, `--radius-sm`), with CSS variables for anything a product restyles.
