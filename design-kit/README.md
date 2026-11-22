# @designs/kit

Shared gallery code for the galleries in this repository. Source TypeScript, consumed directly by each gallery's Vite build (no build step).

| Export | What |
| --- | --- |
| `createTrack(storageKey)` | The Current / Next store: `useTrack`, `useLook`, `useNextLook`, `setTrack`, `PinLook`; `data-look` on `<html>`; `?track=` in the URL |
| `createNextRegistry(items)` | The Next items (`look` / `screen`, `replaces` / `variantOf`, `proposal` / `approved`) and the screen routing per track |
| `TrackSwitch`, `TrackChip` | The rail switch with the Next item list, and the status chip |

CSS uses the gallery tokens `--surface`, `--surface-2`, `--ink`, `--muted`, `--radius-sm`; `--track-switch-bg` and `--track-switch-shadow` restyle the switch's well.

**Planned, moved here when Field Cogitator needs them:** device and window frames, the Elements view shell, comments, capture tools, the review-page template.
