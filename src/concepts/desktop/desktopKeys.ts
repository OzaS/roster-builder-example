// Editable key bindings for the desktop prototype. "Mod" is Command on macOS and Ctrl elsewhere.

export type KeyAction = 'palette' | 'newRoster' | 'rosters' | 'lookup' | 'settings' | 'summary' | 'toggleCatalogue' | 'toggleInspector' | 'undo' | 'redo' | 'exportRoster';
export type KeyBindings = Record<KeyAction, string>;

export const keyActions: Array<{ id: KeyAction; label: string; group: 'General' | 'Roster editor' }> = [
  { id: 'palette', label: 'Command palette', group: 'General' },
  { id: 'newRoster', label: 'New roster', group: 'General' },
  { id: 'rosters', label: 'Go to Rosters', group: 'General' },
  { id: 'lookup', label: 'Go to Lookup', group: 'General' },
  { id: 'settings', label: 'Settings', group: 'General' },
  { id: 'summary', label: 'Roster summary', group: 'Roster editor' },
  { id: 'toggleCatalogue', label: 'Show or hide the catalogue', group: 'Roster editor' },
  { id: 'toggleInspector', label: 'Show or hide the inspector', group: 'Roster editor' },
  { id: 'undo', label: 'Undo', group: 'Roster editor' },
  { id: 'redo', label: 'Redo', group: 'Roster editor' },
  { id: 'exportRoster', label: 'Export roster', group: 'Roster editor' },
];

export const defaultBindings: KeyBindings = {
  palette: 'Mod+K', newRoster: 'Mod+N', rosters: 'Mod+Shift+R', lookup: 'Mod+F', settings: 'Mod+,',
  summary: 'Mod+I', toggleCatalogue: 'Mod+B', toggleInspector: 'Mod+Alt+B',
  undo: 'Mod+Z', redo: 'Mod+Shift+Z', exportRoster: 'Mod+E',
};

const codeKey = (code: string, key: string) => code.startsWith('Key') ? code.slice(3) : code.startsWith('Digit') ? code.slice(5)
  : ({ Comma: ',', Period: '.', Slash: '/', Semicolon: ';', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Minus: '-', Equal: '=' } as Record<string, string>)[code] ?? key;

/** The binding string for a key event, or null while only modifiers are held. */
export function comboFromEvent(e: KeyboardEvent): string | null {
  if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) return null;
  return [e.metaKey || e.ctrlKey ? 'Mod' : '', e.altKey ? 'Alt' : '', e.shiftKey ? 'Shift' : '', codeKey(e.code, e.key)].filter(Boolean).join('+');
}

export const hasCommandModifier = (combo: string) => combo.startsWith('Mod+') || combo.startsWith('Alt+');

export function formatCombo(combo: string) {
  return combo.split('+').map(part => ({ Mod: '⌘', Alt: '⌥', Shift: '⇧' } as Record<string, string>)[part] ?? part).join(' ');
}
