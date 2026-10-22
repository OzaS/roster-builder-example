// Synthetic, game-neutral sample data of the tablet roster editor (DEC-001). The roster document, its undo history and the
// validation rules come from the desktop editor flows; this file adds the catalogue, the sample rosters and the unit detail.

import { primaryForce, specialRoster, type EditorUnit, type Force, type ReadOnlyInfo } from '../desktop/DesktopEditorFlows';
import { lookupEntries, rosterLibrary } from '../desktop/desktopData';

export type CatalogueEntry = { name: string; role: string; models: number; points: number; weapon: string };
export const editorCatalogue: CatalogueEntry[] = [
  { name: 'Force Commander', role: 'Command', models: 1, points: 90, weapon: 'Command blade' },
  { name: 'Field Marshal', role: 'Command', models: 1, points: 115, weapon: 'Service rifle' },
  { name: 'Line Infantry', role: 'Core', models: 10, points: 120, weapon: 'Service rifle' },
  { name: 'Recon Team', role: 'Core', models: 5, points: 85, weapon: 'Scout carbine' },
  { name: 'Veteran Guard', role: 'Specialist', models: 5, points: 165, weapon: 'Heavy carbine' },
  { name: 'Support Battery', role: 'Support', models: 3, points: 180, weapon: 'Field cannon' },
  { name: 'Patrol Walker', role: 'Support', models: 1, points: 145, weapon: 'Twin autocannon' },
];

const baseUnits = (): EditorUnit[] => [
  { ...editorCatalogue[0], id: 1, upgrade: false },
  { ...editorCatalogue[2], id: 2, upgrade: true },
  { ...editorCatalogue[2], id: 3, upgrade: false },
  { ...editorCatalogue[3], id: 4, upgrade: false },
  { ...editorCatalogue[4], id: 5, upgrade: false },
  { ...editorCatalogue[5], id: 6, upgrade: false },
];

export type LoadedRoster = { name: string; mark: string; units: EditorUnit[]; forces: Force[]; limit: number; faction: string; force: string; system: string; readOnly: ReadOnlyInfo | null; selected: number };

/** The sample document behind each roster of the library (the same snapshots as the desktop editor). */
export function loadRoster(name: string): LoadedRoster {
  const entry = rosterLibrary.find(r => r.name === name) ?? rosterLibrary[0];
  const mark = entry.mark;
  const special = specialRoster(name);
  if (special) return { name, mark, units: special.units, forces: special.forces, limit: special.limit, faction: special.faction, force: special.force, system: special.readOnly?.system ?? entry.system, readOnly: special.readOnly, selected: special.units[0].id };
  let units = baseUnits();
  let limit = 1000;
  if (name === 'Northern Watch') { units = [...units, ...Array.from({ length: 4 }, (_, i) => ({ ...editorCatalogue[5], id: 10 + i, upgrade: i === 0 }))]; limit = 1500; }
  if (name === 'Operation First Light') units = [...units.map(u => u.id === 4 ? { ...u, models: 2 } : u), { ...editorCatalogue[1], id: 10, upgrade: true }, { ...editorCatalogue[0], id: 11, upgrade: false }];
  if (name === 'Weekend skirmish') { const b = baseUnits(); units = [b[0], { ...b[1], upgrade: false }, b[2], b[4]]; limit = 500; }
  if (name === 'Glass Legion trial') { units = units.slice(0, 4); limit = 750; }
  return { name: entry.name, mark, units, forces: [primaryForce('Expedition force', entry.faction)], limit, faction: entry.faction, force: 'Expedition force', system: entry.system, readOnly: null, selected: units[1]?.id ?? units[0].id };
}

/** Primary weapon choices of a unit: its own weapon first, then the shared ones. All are included in the unit cost. */
export const weaponChoices = (unit: EditorUnit) => Array.from(new Set([unit.weapon, 'Service rifle', 'Scout carbine', 'Heavy carbine']));

const weaponStats: Record<string, [string, string, string]> = {
  'Service rifle': ['24"', '1', '3'], 'Scout carbine': ['18"', '1', '3'], 'Heavy carbine': ['18"', '2', '4'], 'Command blade': ['Melee', '3', '4'],
  'Field cannon': ['48"', '1', '7'], 'Twin autocannon': ['36"', '4', '6'],
};
export const weaponProfile = (weapon: string) => weaponStats[weapon] ?? ['12"', '1', '3'];

/** Unit profile: Move, Defence, Resolve, Health (from the lookup samples where the unit has one). */
export const unitProfile = (unit: EditorUnit) => lookupEntries.find(e => e.kind === 'Unit' && e.name === unit.name)?.profile ?? (unit.role === 'Command' ? ['6', '3+', '9', '4'] : unit.role === 'Support' ? ['5', '3+', '7', '5'] : ['6', '4+', '7', '1']);

export const unitRules = (unit: EditorUnit) => [
  { name: 'Steady advance', text: 'This unit may make a normal move and keep its formation bonus while within range of its commander.' },
  ...(unit.role === 'Core' && unit.name === 'Recon Team' ? [{ name: 'Forward deployment', text: 'Set up this unit anywhere more than 9" from enemy units after both sides have deployed.' }] : []),
  ...(unit.upgrade ? [{ name: 'Field standard', text: 'A unit carrying a field standard may re-roll one failed resolve test per round.' }] : []),
];

export const unitCategories = (unit: EditorUnit, faction: string) => [unit.role, unit.models === 1 && unit.role === 'Support' ? 'Vehicle' : unit.role === 'Command' ? 'Character' : 'Infantry', faction];
