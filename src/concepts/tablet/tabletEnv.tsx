import { createContext, useContext } from 'react';
import { defaultDeviceId, defaultInput, defaultTextScale, deviceById, widthClassOf, type TabletDevice, type TabletDeviceId, type TabletInput, type TextScale, type WidthClass } from './tabletDevices';

/** Gallery preferences: which device frame, input mode and text size the Tablet library shows. Provided by the gallery (or a standalone link). */
export type TabletPrefs = { deviceId: TabletDeviceId; input: TabletInput; textScale?: TextScale; setDeviceId: (id: TabletDeviceId) => void; setInput: (input: TabletInput) => void; setTextScale?: (scale: TextScale) => void };
export const TabletPrefsContext = createContext<TabletPrefs>({ deviceId: defaultDeviceId, input: defaultInput, textScale: defaultTextScale, setDeviceId: () => {}, setInput: () => {} });
export const useTabletPrefs = () => useContext(TabletPrefsContext);

/** What the app inside the frame knows about its window: the device, how it is operated, the text size, the logical width
 *  the layout gets at that size (device width / scale) and the resulting width class. Layout decisions use `width`. */
export type TabletEnv = { device: TabletDevice; input: TabletInput; textScale: TextScale; width: number; widthClass: WidthClass };
export const makeTabletEnv = (deviceId: TabletDeviceId, input: TabletInput, textScale: TextScale = defaultTextScale): TabletEnv => {
  const device = deviceById(deviceId); const width = Math.round(device.width * 100 / textScale);
  return { device, input, textScale, width, widthClass: widthClassOf(width) };
};
export const TabletEnvContext = createContext<TabletEnv>(makeTabletEnv(defaultDeviceId, defaultInput));
export const useTabletEnv = () => useContext(TabletEnvContext);
