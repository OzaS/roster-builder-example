import type { ColorScheme, ThemeMode, WorkflowScreen } from '../../types';
import { TabletDeviceFrame } from './TabletDeviceFrame';
import { TabletWorkbench } from './TabletWorkbench';
import { TabletPrefsContext } from './tabletEnv';
import { defaultDeviceId, defaultInput, isDeviceId, isTabletInput } from './tabletDevices';
import { colorSchemes } from '../../types';

/** `?tablet=<page>&device=<id>&input=touch|pointer&theme=light&scheme=<id>`: the tablet at its real size, centred. */
export function TabletStandalone({ params }: { params: URLSearchParams }) {
  const device = params.get('device');
  const input = params.get('input');
  const scheme = params.get('scheme');
  const deviceId = isDeviceId(device) ? device : defaultDeviceId;
  const inputMode = isTabletInput(input) ? input : defaultInput;
  const themeMode: ThemeMode = params.get('theme') === 'light' ? 'light' : 'dark';
  const colorScheme: ColorScheme = colorSchemes.some(s => s.id === scheme) ? scheme as ColorScheme : 'default';
  const screen = `tablet-${params.get('tablet') || 'home'}` as WorkflowScreen;
  return <TabletPrefsContext.Provider value={{ deviceId, input: inputMode, setDeviceId: () => {}, setInput: () => {} }}>
    <div className="tb-standalone">
      <TabletDeviceFrame fit="none" themeMode={themeMode} colorScheme={colorScheme}><TabletWorkbench workflowScreen={screen} themeMode={themeMode} colorScheme={colorScheme} /></TabletDeviceFrame>
      <a className="tb-standalone-link" href="?gallery=tablet">← Tablet design library</a>
    </div>
  </TabletPrefsContext.Provider>;
}
