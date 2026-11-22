// Editable key bindings for the desktop prototype. "Mod" is Command on macOS and Ctrl elsewhere.
// DEC-055: the inspector pane became the unit dialog, so its toggle (Mod+Alt+B) is retired; units open with Enter or a click.

// R2-03 (F4c, approved 2026-11-08): Star unit toggles the star of the focused catalogue row; it has no default key (⌘D is
// Duplicate unit), so Settings › Key bindings lists it as Not set until the user records one.
export type KeyAction = 'palette' | 'newRoster' | 'rosters' | 'lookup' | 'settings' | 'summary' | 'toggleCatalogue' | 'undo' | 'redo' | 'exportRoster' | 'starUnit';
export type KeyBindings = Record<KeyAction, string>;

export const keyActions: Array<{ id: KeyAction; label: string; group: 'General' | 'Roster editor' }> = [
  { id: 'palette', label: 'Command palette', group: 'General' },
  { id: 'newRoster', label: 'New roster', group: 'General' },
  { id: 'rosters', label: 'Go to Rosters', group: 'General' },
  { id: 'lookup', label: 'Go to Lookup', group: 'General' },
  { id: 'settings', label: 'Settings', group: 'General' },
  { id: 'summary', label: 'Roster summary', group: 'Roster editor' },
  { id: 'toggleCatalogue', label: 'Show or hide the catalogue', group: 'Roster editor' },
  { id: 'undo', label: 'Undo', group: 'Roster editor' },
  { id: 'redo', label: 'Redo', group: 'Roster editor' },
  { id: 'exportRoster', label: 'Export roster', group: 'Roster editor' },
  { id: 'starUnit', label: 'Star unit', group: 'Roster editor' },
];

export const defaultBindings: KeyBindings = {
  palette: 'Mod+K', newRoster: 'Mod+N', rosters: 'Mod+Shift+R', lookup: 'Mod+F', settings: 'Mod+,',
  summary: 'Mod+I', toggleCatalogue: 'Mod+B',
  undo: 'Mod+Z', redo: 'Mod+Shift+Z', exportRoster: 'Mod+E', starUnit: '',
};

const codeKey = (code: string, key: string) => code.startsWith('Key') ? code.slice(3) : code.startsWith('Digit') ? code.slice(5)
  : ({ Comma: ',', Period: '.', Slash: '/', Semicolon: ';', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Minus: '-', Equal: '=' } as Record<string, string>)[code] ?? key;

/** The binding string for a key event, or null while only modifiers are held. */
export function comboFromEvent(e: KeyboardEvent): string | null {
  if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) return null;
  return [e.metaKey || e.ctrlKey ? 'Mod' : '', e.altKey ? 'Alt' : '', e.shiftKey ? 'Shift' : '', codeKey(e.code, e.key)].filter(Boolean).join('+');
}

export const hasCommandModifier = (combo: string) => combo.startsWith('Mod+') || combo.startsWith('Alt+');

/** The window chrome and key labels of one desktop platform (RK-03: Windows has no menu bar and shows Ctrl labels). */
export type DesktopOs = 'mac' | 'windows';

export function formatCombo(combo: string, os: DesktopOs = 'mac') {
  if (os === 'windows') return combo.split('+').map(part => ({ Mod: 'Ctrl', Alt: 'Alt', Shift: 'Shift' } as Record<string, string>)[part] ?? part).join('+');
  return combo.split('+').map(part => ({ Mod: '⌘', Alt: '⌥', Shift: '⇧' } as Record<string, string>)[part] ?? part).join(' ');
}
