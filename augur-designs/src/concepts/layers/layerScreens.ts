// A3 host UI (Next track, Proposal): the gallery screens, per library. One list feeds the WorkflowScreen type, the gallery's
// screen ids and labels, and the routing; the design JSON and next-track.json carry the same ids.

const STATES = [
  ['base', 'Sources · Open Field with its variants and add-ons'],
  ['problems', 'Sources · Problems in words, each with its fix'],
  ['order', 'Edit variant order'],
  ['order-conflict', 'Edit variant order · conflict, Done unavailable'],
  ['install', 'Add an add-on or variant · a file first, a link second'],
  ['check-fits', 'Requirement check · fits'],
  ['check-needs', 'Requirement check · needs a newer base'],
  ['check-rules', 'Requirement check · refused, an add-on that changes rules'],
  ['review', 'Roster open · saved with different data'],
  ['review-missing', 'Roster open · a missing variant'],
  ['base-update', 'Base update · a layer no longer fits, keys moved'],
  ['after-update', 'Base updated · turned off and moved, in the list'],
  ['roster-info', 'Roster info · the recorded layers'],
] as const;

export type LayerState = (typeof STATES)[number][0];

/** Phone only: the Sources list with layers nested under their base (tablet and desktop show it beside the detail). */
const PHONE_EXTRA = [['sources', 'Sources · layers listed under their base']] as const;

export const phoneLayerScreens = [...PHONE_EXTRA, ...STATES].map(([s, label]) => ({ id: `layers-${s}` as const, label: `A3 · ${label}` }));
export const tabletLayerScreens = STATES.map(([s, label]) => ({ id: `tablet-layers-${s}` as const, label: `Tablet · A3 · ${label}` }));
export const desktopLayerScreens = STATES.map(([s, label]) => ({ id: `desktop-layers-${s}` as const, label: `Desktop · A3 · ${label}` }));

export type LayerScreen = `layers-${LayerState | 'sources'}` | `tablet-layers-${LayerState}` | `desktop-layers-${LayerState}`;

export const layerScreenIds = [...phoneLayerScreens, ...tabletLayerScreens, ...desktopLayerScreens].map(s => s.id) as LayerScreen[];
export const layerScreenLabels = [...phoneLayerScreens, ...tabletLayerScreens, ...desktopLayerScreens] as Array<{ id: LayerScreen; label: string }>;

/** The state a layer screen opens in, from its id (`desktop-layers-review` → `review`). */
export const layerState = (screen: string | undefined): LayerState | 'sources' | undefined => {
  const m = screen?.match(/^(?:tablet-|desktop-)?layers-(.+)$/);
  return m ? (m[1] as LayerState | 'sources') : undefined;
};
