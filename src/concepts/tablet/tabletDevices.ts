// Device frames and input modes of the tablet prototype (gallery chrome plus the facts the shell needs).
// Sizes are the logical window sizes of the device; the width class follows the Material window size classes.

export type TabletDeviceId = 'ipad-landscape' | 'ipad-portrait' | 'android' | 'fold' | 'split';
export type TabletInput = 'touch' | 'pointer';
export type WidthClass = 'compact' | 'medium' | 'expanded';
export type TabletDevice = { id: TabletDeviceId; label: string; short: string; width: number; height: number; system: 'ios' | 'android' };

export const tabletDevices: TabletDevice[] = [
  { id: 'ipad-landscape', label: 'iPad 11″ landscape', short: 'iPad landscape', width: 1194, height: 834, system: 'ios' },
  { id: 'ipad-portrait', label: 'iPad 11″ portrait', short: 'iPad portrait', width: 834, height: 1194, system: 'ios' },
  { id: 'android', label: 'Android tablet', short: 'Android', width: 1280, height: 800, system: 'android' },
  { id: 'fold', label: 'Foldable unfolded', short: 'Foldable', width: 884, height: 1104, system: 'android' },
  { id: 'split', label: 'Split view', short: 'Split view', width: 600, height: 834, system: 'ios' },
];

export const defaultDeviceId: TabletDeviceId = 'ipad-landscape';
export const defaultInput: TabletInput = 'touch';
export const tabletInputs: Array<{ id: TabletInput; label: string }> = [{ id: 'touch', label: 'Touch' }, { id: 'pointer', label: 'Pointer' }];

export const deviceById = (id: TabletDeviceId): TabletDevice => tabletDevices.find(d => d.id === id) ?? tabletDevices[0];
export const isDeviceId = (value: unknown): value is TabletDeviceId => tabletDevices.some(d => d.id === value);
export const isTabletInput = (value: unknown): value is TabletInput => value === 'touch' || value === 'pointer';

/** Larger text and display zoom (UX-025): iOS accessibility text sizes and Display Zoom, Android font scale up to 2.0 and
 *  display size. The prototype scales the whole tablet UI, so the layout sees a smaller logical window (width / scale). */
export type TextScale = 100 | 150 | 200;
export const textScales: TextScale[] = [100, 150, 200];
export const defaultTextScale: TextScale = 100;
export const isTextScale = (value: unknown): value is TextScale => textScales.includes(Number(value) as TextScale);

export const widthClassOf = (width: number): WidthClass => width < 600 ? 'compact' : width < 840 ? 'medium' : 'expanded';
export const widthClassLabel: Record<WidthClass, string> = { compact: 'Compact <600', medium: 'Medium 600–839', expanded: 'Expanded ≥840' };

/** Gallery screens drawn on a fixed device and text size whatever the gallery's switches say (DEC-050: the chip at 150 % in the
 *  Android tablet's 300 px catalogue pane). */
export const fixedFrames: Record<string, { device: TabletDeviceId; textScale: TextScale }> = {
  'tablet-editor-chips-text-150': { device: 'android', textScale: 150 },
};
