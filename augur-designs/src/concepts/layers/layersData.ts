// A3 "host UI" (Next track, Proposal): sample data and words for add-ons and variants over a base dataset.
// Everything here is invented and game-neutral (DEC-001). The format terms are DEC-072/073: an add-on (text and
// display-only data, can't change legality) and a variant (rules and content). A dataset layer (a catalogue dataset over
// a system dataset) is picked as data in its own right, so it is listed as installed data that "needs" its base.

export type LayerKind = 'addon' | 'variant';
export type LayerOrigin = { kind: 'file'; label: string } | { kind: 'link'; label: string };
export type LayerProblem =
  /** `requires:` not met: the base version is outside the layer's range. */
  | { code: 'requirement'; title: string; detail: string; fix?: string }
  /** `layer-order`: nothing in the stack is applied until it's fixed. */
  | { code: 'order'; title: string; detail: string; fix: string }
  /** `addon-changes-rules`: the compiler found logic changes in an add-on. */
  | { code: 'changes-rules'; title: string; detail: string; fix?: string }
  /** A layer whose patches follow the base's move records: it keeps working (info, not a problem). */
  | { code: 'moved'; title: string; detail: string; fix?: string };

export type Layer = {
  id: string;
  title: string;
  kind: LayerKind;
  /** Add-ons: text, locale. Variants: rules, content, test. */
  purpose: string;
  version: string;
  origin: LayerOrigin;
  licence?: string;
  enabled: boolean;
  test?: boolean;
  /** The patch report ("12 changes active · 1 not applied"); add-ons say what they cover. */
  report: string;
  requires: string;
  problem?: LayerProblem;
};

export const BASE = {
  id: 'open-field',
  title: 'Open Field',
  version: '1.4',
  next: '1.5',
  repo: 'example/open-field',
  factions: '3 factions · Frontier Coalition, Free Cities…',
  rosters: 4,
};

export const PURPOSE: Record<string, string> = { text: 'Rules text', locale: 'Translation', rules: 'Rules changes', content: 'New content', test: 'Test data', 'content-test': 'New content · test data' };

export const ADDONS: Layer[] = [
  { id: 'rules-text', title: 'Open Field · Rules text', kind: 'addon', purpose: 'text', version: '1.2.0', origin: { kind: 'file', label: 'open-field-text.zip' }, licence: 'CC BY 4.0', enabled: true, report: 'Wording for 412 entries', requires: 'Open Field 1.2 or later' },
  { id: 'german', title: 'Open Field · German text', kind: 'addon', purpose: 'locale', version: '0.9.0', origin: { kind: 'link', label: 'example/open-field-de' }, licence: 'CC BY 4.0', enabled: true, report: 'Used when the app is in German', requires: 'Open Field 1.3 or later' },
];

export const VARIANTS: Layer[] = [
  { id: 'errata', title: 'Open Field · Errata 2026', kind: 'variant', purpose: 'rules', version: '1.0.3', origin: { kind: 'link', label: 'example/open-field-errata' }, licence: 'CC BY 4.0', enabled: true, report: '14 changes active', requires: 'Open Field 1.4 or later' },
  { id: 'house', title: 'House rules: Skirmish', kind: 'variant', purpose: 'rules', version: '0.4.0', origin: { kind: 'file', label: 'skirmish-house-rules.zip' }, enabled: true, report: '6 changes active · 1 not applied', requires: 'Open Field 1.4 (any 1.4.x)' },
  { id: 'playtest', title: 'Playtest: new detachments', kind: 'variant', purpose: 'content-test', version: '0.2.0', origin: { kind: 'link', label: 'example/playtest-detachments' }, enabled: false, test: true, report: '2 new detachments · 9 changes', requires: 'Open Field 1.4 or later' },
];

/** The same stack with problems, one of each kind the host names. */
export const PROBLEM_ADDONS: Layer[] = [
  ADDONS[0],
  { ...ADDONS[1], id: 'notes', title: 'Club notes', purpose: 'text', version: '0.1.0', origin: { kind: 'file', label: 'club-notes.zip' }, licence: undefined, enabled: false, report: 'Not in use',
    problem: { code: 'changes-rules', title: 'Changes rules, so it can’t be an add-on', detail: 'An add-on may only change text. This one changes costs in 3 places, so it is not used. Its author can publish it as a variant.', fix: 'Remove' } },
];
export const PROBLEM_VARIANTS: Layer[] = [
  { ...VARIANTS[1], report: 'On · not used until the order is fixed', problem: { code: 'order', title: 'Must come after Errata 2026', detail: 'One of its changes builds on an entry the errata adds. Until the order is fixed, no variant is used.', fix: 'Move below Errata 2026' } },
  { ...VARIANTS[0], report: 'On · not used until the order is fixed' },
  { id: 'frontier', title: 'Frontier homebrew', kind: 'variant', purpose: 'content', version: '2.1.0', origin: { kind: 'link', label: 'example/frontier-homebrew' }, enabled: false, report: 'Not in use', requires: 'Open Field 1.5 or later',
    problem: { code: 'requirement', title: 'Needs Open Field 1.5 or later', detail: 'Open Field 1.4 is installed, so this variant is off.', fix: 'Update Open Field to 1.5' } },
];

/** After the base update to 1.5: one layer no longer fits; one follows moved keys and keeps working. */
export const UPDATED_VARIANTS: Layer[] = [
  { ...VARIANTS[0], problem: { code: 'moved', title: '3 entries it changes moved in 1.5', detail: 'It follows them and keeps working.', fix: 'Show moved entries' } },
  { ...VARIANTS[1], enabled: false, report: 'Turned off', problem: { code: 'requirement', title: 'Turned off: needs Open Field 1.4', detail: 'Open Field is now 1.5. Install a newer House rules file, or switch Open Field back to 1.4.', fix: 'Install a newer file…' } },
  VARIANTS[2],
];

export const originLine = (l: Layer) => l.origin.kind === 'file' ? `From a file · ${l.origin.label}` : l.origin.label;
/** Short on touch (where from: a file or a link); the full file name or link where there is room. */
export const layerMeta = (l: Layer, full = false) => `${PURPOSE[l.purpose] ?? l.purpose} · ${l.version} · ${full ? originLine(l) : l.origin.kind === 'file' ? 'from a file' : 'from a link'}`;

/** The groups, in words: what each kind can do, so the user knows what turning one off means. */
export const GROUP_NOTE = {
  addon: 'Text only. Rosters stay valid without them.',
  variant: 'Change rules or add content. Rosters record them.',
};
export const ORDER_NOTE = 'Later in the list wins where two change the same thing.';

// ------------------------------------------------------------- install a layer

export type CheckState = 'fits' | 'needs' | 'changes-rules';
export const INSTALL_SAMPLE = { file: 'skirmish-house-rules.zip', size: '84 KB', title: 'House rules: Skirmish', kind: 'Variant', purpose: 'Rules changes', version: '0.4.0', requires: 'Open Field 1.4 (any 1.4.x)', report: '6 changes · all apply', licence: 'Not stated' };
export const NEEDS_SAMPLE = { file: 'frontier-homebrew-2.1.zip', size: '210 KB', title: 'Frontier homebrew', kind: 'Variant', purpose: 'New content', version: '2.1.0', requires: 'Open Field 1.5 or later', licence: 'CC BY-SA 4.0' };
export const RULES_SAMPLE = { file: 'club-notes.zip', size: '12 KB', title: 'Club notes', kind: 'Add-on', purpose: 'Rules text', version: '0.1.0', requires: 'Open Field 1.2 or later', licence: 'Not stated' };

// ------------------------------------------------------------- roster open review

export const REVIEW_ROSTER = { name: 'The Ashen Expedition', faction: 'Frontier Coalition', saved: 'Oct 12' };

export type ReviewLine = { tone: 'changed' | 'missing' | 'info' | 'warn' | 'err'; title: string; detail?: string; action?: string };

export const REVIEW_DATA: ReviewLine[] = [
  { tone: 'changed', title: 'Open Field 1.3 → 1.4', detail: 'Updated since the roster was saved' },
  { tone: 'changed', title: 'Errata 2026 1.0.2 → 1.0.3', detail: 'Variant updated' },
  { tone: 'changed', title: 'House rules: Skirmish is new', detail: 'Variant turned on after the roster was saved' },
  { tone: 'changed', title: 'Variant order changed', detail: 'House rules now comes after Errata 2026' },
];
export const REVIEW_MISSING: ReviewLine = { tone: 'missing', title: 'Playtest: new detachments 0.2.0', detail: 'Not installed · example/playtest-detachments. 3 selections come from it; they are kept unresolved.', action: 'Install from its link' };
export const REVIEW_SELECTIONS: ReviewLine[] = [
  { tone: 'info', title: '2 selections follow renamed entries', detail: 'Captain → Leader · Cloak → Mantle. Nothing to do.' },
  { tone: 'warn', title: 'Banner: moved to Warden Squad › Warden', detail: 'Kept as saved for review. Add it again in its new place.', action: 'Show in roster' },
  { tone: 'err', title: 'Torch: no longer in the data', detail: 'Removed in 1.4. Kept with its name, costs 0.', action: 'Show in roster' },
];
export const REVIEW_ADDONS: ReviewLine = { tone: 'info', title: 'German text 0.8 → 0.9', detail: 'Add-ons change only text; they never need a review.' };

export const REVIEW_ACTIONS = {
  open: 'Open with current data',
  openNote: 'Moves and changes above are saved with the roster.',
  keep: 'Keep for review',
  keepNote: 'Opens read-only, as saved. It stays marked Data changed in Rosters.',
};

/** A roster saved with a variant that is no longer installed, and nothing else changed. */
export const MISSING_ONLY: ReviewLine[] = [
  { tone: 'missing', title: 'House rules: Skirmish 0.4.0', detail: 'Not installed. It came from a file, skirmish-house-rules.zip. 5 selections and 2 cost changes come from it.', action: 'Install from a file…' },
];

// ------------------------------------------------------------- roster info and new roster

export const ROSTER_LAYERS = {
  base: 'Open Field 1.4 · example/open-field',
  variants: ['Open Field · Errata 2026 1.0.3', 'House rules: Skirmish 0.4.0'],
  addons: ['Open Field · Rules text 1.2.0', 'Open Field · German text 0.9.0'],
};
