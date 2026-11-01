import type { EditorStart } from '../tablet/TabletEditor';
import type { DuoPage } from './DuoBars';
import type { DuoPoseId } from './duoPoses';

// Kept apart from DuoWorkbench so the gallery frame can find a screen's pose without importing the app modules (and their
// CSS) ahead of the other libraries: the stylesheet order of the Phone, Tablet and Desktop libraries stays as it was.

/** A gallery screen of the Foldable library: the pose it is drawn in, the page and the state it opens on. */
export type DuoScreen = { pose: DuoPoseId; page: DuoPage; state?: string; editor?: EditorStart };

export const duoScreens: Record<string, DuoScreen> = {
  'duo-closed-rosters': { pose: 'closed', page: 'rosters' },
  'duo-closed-roster-detail': { pose: 'closed', page: 'rosters', state: 'detail' },
  'duo-closed-editor': { pose: 'closed', page: 'rosters', editor: 'editor' },
  'duo-closed-unit': { pose: 'closed', page: 'rosters', editor: 'unit' },
  'duo-closed-add': { pose: 'closed', page: 'rosters', editor: 'add' },
  'duo-closed-lookup': { pose: 'closed', page: 'lookup' },
  'duo-closed-settings': { pose: 'closed', page: 'settings' },
  'duo-closed-landscape-rosters': { pose: 'closed-landscape', page: 'rosters' },
  'duo-closed-landscape-editor': { pose: 'closed-landscape', page: 'rosters', editor: 'editor' },
  'duo-open-rosters': { pose: 'open', page: 'rosters' },
  'duo-open-editor': { pose: 'open', page: 'rosters', editor: 'editor' },
  'duo-open-add': { pose: 'open', page: 'rosters', editor: 'add' },
  'duo-open-lookup': { pose: 'open', page: 'lookup' },
  'duo-open-settings': { pose: 'open', page: 'settings' },
  'duo-open-sources': { pose: 'open', page: 'sources' },
  'duo-folded-rosters': { pose: 'open-folded', page: 'rosters' },
  'duo-folded-editor': { pose: 'open-folded', page: 'rosters', editor: 'editor' },
  'duo-portrait-rosters': { pose: 'open-portrait', page: 'rosters' },
  'duo-portrait-editor': { pose: 'open-portrait', page: 'rosters', editor: 'editor' },
};
export const defaultDuoScreen = 'duo-closed-rosters';
export const duoScreenOf = (screen: string | undefined): DuoScreen => duoScreens[screen ?? ''] ?? duoScreens[defaultDuoScreen];
