// Poses of the passport foldable, after Apple's iPhone Duo (HIG "Designing for iPhone Duo", September 2026).
// Sizes are points: the App Store screenshot sizes at @3x (outer 1398 × 2034 px, inner 2007 × 2853 px). The outer display is
// passport-shaped, wider and shorter than other iPhones; the inner display opens like a book with the hinge down the middle.

export type DuoPoseId = 'closed' | 'closed-landscape' | 'open' | 'open-folded' | 'open-portrait';

export type DuoPose = {
  id: DuoPoseId;
  label: string;
  display: 'outer' | 'inner';
  width: number;
  height: number;
  /** `vertical`: status, toolbar and tab bar on the trailing edge (closed, and open in landscape). Open in portrait keeps
   *  standard horizontal bars. */
  bars: 'vertical' | 'horizontal';
  /** The spine of the closed device (left in portrait, top in landscape) or the fold of the inner display. */
  hinge: 'left' | 'top' | 'center-x' | 'center-y';
  /** The outer front camera (Dynamic Island) is always visible, in the corner, aligned with the side controls. */
  camera: 'top' | 'bottom' | null;
  /** The status (time and the Wi-Fi/battery ring) sits at the top of the side bar; the closed device in landscape hides it. */
  status: boolean;
  /** Partially folded: the folding region is a reserved region and panes divide at the fold. */
  folded: boolean;
};

export const duoPoses: DuoPose[] = [
  { id: 'closed', label: 'Closed · outer display', display: 'outer', width: 466, height: 678, bars: 'vertical', hinge: 'left', camera: 'top', status: true, folded: false },
  { id: 'closed-landscape', label: 'Closed · outer display, landscape', display: 'outer', width: 678, height: 466, bars: 'vertical', hinge: 'top', camera: 'bottom', status: false, folded: false },
  { id: 'open', label: 'Open · inner display', display: 'inner', width: 951, height: 669, bars: 'vertical', hinge: 'center-x', camera: null, status: true, folded: false },
  { id: 'open-folded', label: 'Partially folded · inner display', display: 'inner', width: 951, height: 669, bars: 'vertical', hinge: 'center-x', camera: null, status: true, folded: true },
  { id: 'open-portrait', label: 'Open · inner display, portrait', display: 'inner', width: 669, height: 951, bars: 'horizontal', hinge: 'center-y', camera: null, status: true, folded: false },
];

export const poseById = (id: DuoPoseId): DuoPose => duoPoses.find(p => p.id === id) ?? duoPoses[0];
export const isDuoPose = (value: unknown): value is DuoPoseId => duoPoses.some(p => p.id === value);

/** Width of the trailing control column: 46 pt glass buttons with their margins (Apple's diagrams: about 80 pt). */
export const BAR_WIDTH = 80;
/** Reserved folding region around the hinge when the device is partially folded. */
export const FOLD_GAP = 24;
/** Horizontal status bar of the open display in portrait. */
export const STATUS_HEIGHT = 28;

/** Width the app's content gets in a pose (the side bar is outside it; content does not run under the controls). */
export const contentWidth = (pose: DuoPose) => pose.bars === 'vertical' ? pose.width - BAR_WIDTH : pose.width;
