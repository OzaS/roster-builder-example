import type { ColorScheme, ThemeMode, WorkflowScreen } from '../../types';
import { colorSchemes } from '../../types';
import { DuoDeviceFrame } from './DuoFrame';
import { DuoWorkbench } from './DuoWorkbench';
import { duoScreenOf } from './duoScreens';

/** `?duo=<screen>&theme=light&scheme=<id>`: a Foldable screen (`duo-<screen>`) at its real size, e.g. `?duo=closed-editor`. */
export function DuoStandalone({ params }: { params: URLSearchParams }) {
  const scheme = params.get('scheme');
  const themeMode: ThemeMode = params.get('theme') === 'light' ? 'light' : 'dark';
  const colorScheme: ColorScheme = colorSchemes.some(s => s.id === scheme) ? scheme as ColorScheme : 'default';
  const screen = `duo-${params.get('duo') || 'closed-rosters'}` as WorkflowScreen;
  return <div className="tb-standalone">
    <DuoDeviceFrame fit="none" pose={duoScreenOf(screen).pose} themeMode={themeMode} colorScheme={colorScheme}><DuoWorkbench workflowScreen={screen} themeMode={themeMode} colorScheme={colorScheme} /></DuoDeviceFrame>
    <a className="tb-standalone-link" href="?gallery=foldable">← Foldable design library</a>
  </div>;
}
