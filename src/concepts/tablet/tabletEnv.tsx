import { createContext, useContext } from 'react';
import { defaultDeviceId, defaultInput, deviceById, widthClassOf, type TabletDevice, type TabletDeviceId, type TabletInput, type WidthClass } from './tabletDevices';

/** Gallery preferences: which device frame and input mode the Tablet library shows. Provided by the gallery (or a standalone link). */
export type TabletPrefs = { deviceId: TabletDeviceId; input: TabletInput; setDeviceId: (id: TabletDeviceId) => void; setInput: (input: TabletInput) => void };
export const TabletPrefsContext = createContext<TabletPrefs>({ deviceId: defaultDeviceId, input: defaultInput, setDeviceId: () => {}, setInput: () => {} });
export const useTabletPrefs = () => useContext(TabletPrefsContext);

/** What the app inside the frame knows about its window: the device, how it is operated and the resulting width class. */
export type TabletEnv = { device: TabletDevice; input: TabletInput; widthClass: WidthClass };
export const makeTabletEnv = (deviceId: TabletDeviceId, input: TabletInput): TabletEnv => { const device = deviceById(deviceId); return { device, input, widthClass: widthClassOf(device.width) }; };
export const TabletEnvContext = createContext<TabletEnv>(makeTabletEnv(defaultDeviceId, defaultInput));
export const useTabletEnv = () => useContext(TabletEnvContext);
