import { createContext, useContext } from 'react';
import { useNextLook } from '../../look';
import { defaultDeviceId, defaultInput, defaultTextScale, deviceById, widthClassOf, type TabletDevice, type TabletDeviceId, type TabletInput, type TextScale, type WidthClass } from './tabletDevices';

/** Gallery preferences: which device frame, input mode and text size the Tablet library shows. Provided by the gallery (or a standalone link). */
export type TabletPrefs = { deviceId: TabletDeviceId; input: TabletInput; textScale?: TextScale; setDeviceId: (id: TabletDeviceId) => void; setInput: (input: TabletInput) => void; setTextScale?: (scale: TextScale) => void };
export const TabletPrefsContext = createContext<TabletPrefs>({ deviceId: defaultDeviceId, input: defaultInput, textScale: defaultTextScale, setDeviceId: () => {}, setInput: () => {} });
export const useTabletPrefs = () => useContext(TabletPrefsContext);

/** What the app inside the frame knows about its window: the device, how it is operated, the text size, the logical width
 *  the layout gets at that size (device width / scale) and the resulting width class. Layout decisions use `width`. */
export type TabletEnv = { device: TabletDevice; input: TabletInput; textScale: TextScale; width: number; widthClass: WidthClass;
  /** Foldable library only (passport foldable, HIG "Designing for iPhone Duo"): `vertical` when the system puts the toolbar and
   *  tab bar on the trailing edge (the counterpart of `toolbarVerticalEdge`). Toolbars then hand their items to the side bar. */
  bars?: 'vertical';
  /** Foldable library only: where the hinge crosses the content (x from the content's leading edge) and the reserved folding
   *  region around it. `active` when the device is partially folded: panes then divide at the fold. */
  fold?: { x: number; gap: number; active: boolean } };
export const makeTabletEnv = (deviceId: TabletDeviceId, input: TabletInput, textScale: TextScale = defaultTextScale): TabletEnv => {
  const device = deviceById(deviceId); const width = Math.round(device.width * 100 / textScale);
  return { device, input, textScale, width, widthClass: widthClassOf(width) };
};
export const TabletEnvContext = createContext<TabletEnv>(makeTabletEnv(defaultDeviceId, defaultInput));
export const useTabletEnv = () => useContext(TabletEnvContext);

/** The proposed look (src/look.ts) on the tablet. The Foldable library reuses the tablet pieces (its device id is `duo`) and stays on the current look in this pass. */
export const useTabletNextLook = (env?: TabletEnv) => { const own = useTabletEnv(); return useNextLook() && ((env ?? own).device.id as string) !== 'duo'; };
