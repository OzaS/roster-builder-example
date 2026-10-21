// Synthetic, game-neutral sample data for the desktop hub screens (DEC-001).

export type RosterStatus = 'ready' | 'issues' | 'data-changed' | 'faction-removed';
export type RosterSummary = { name: string; faction: string; system: string; used: number; limit: number; opened: string; forces: number; units: number; status: RosterStatus; issues?: number; mark: string };

export const rosterLibrary: RosterSummary[] = [
  { name: 'The Ashen Expedition', faction: 'Frontier Coalition', system: 'Open Field', used: 770, limit: 1000, opened: '12 minutes ago', forces: 1, units: 6, status: 'ready', mark: 'AE' },
  { name: 'Northern Watch', faction: 'Frontier Coalition', system: 'Open Field', used: 1500, limit: 1500, opened: 'Yesterday', forces: 1, units: 10, status: 'ready', mark: 'NW' },
  { name: 'Operation First Light', faction: 'Free Cities', system: 'Open Field', used: 985, limit: 1000, opened: 'Monday', forces: 1, units: 8, status: 'issues', issues: 2, mark: 'FL' },
  { name: 'Weekend skirmish', faction: 'Frontier Coalition', system: 'Open Field', used: 495, limit: 500, opened: 'Oct 16', forces: 1, units: 4, status: 'ready', mark: 'WS' },
  { name: 'Harbour defence', faction: 'Free Cities', system: 'Open Field', used: 1240, limit: 1000, opened: 'Oct 12', forces: 2, units: 11, status: 'issues', issues: 2, mark: 'HD' },
  { name: 'Glass Legion trial', faction: 'Glass Legion', system: 'Example System Two', used: 600, limit: 750, opened: 'Oct 3', forces: 1, units: 5, status: 'data-changed', mark: 'GL' },
  { name: 'Ember patrol', faction: 'Ember Covenant', system: 'Example System Two', used: 340, limit: 500, opened: 'Sep 28', forces: 1, units: 3, status: 'faction-removed', mark: 'EP' },
];

export type LookupKind = 'Unit' | 'Rule' | 'Equipment';
export type LookupEntry = { id: string; kind: LookupKind; name: string; owner: string; source: string; meta: string; cost?: string; badge?: string; text: string; profile?: string[]; conditional?: string; usedIn?: string[] };

export const lookupEntries: LookupEntry[] = [
  { id: 'u1', kind: 'Unit', name: 'Line Infantry', owner: 'Frontier Coalition', source: 'Open Field', meta: 'Core · 10 models', cost: '120', text: 'A steady formation that holds ground and advances in good order.', profile: ['6', '4+', '7', '1'], conditional: 'Cost depends on the roster: +12 per extra model, +10 with Field standard.', usedIn: ['The Ashen Expedition', 'Northern Watch', 'Weekend skirmish'] },
  { id: 'u2', kind: 'Unit', name: 'Recon Team', owner: 'Frontier Coalition', source: 'Open Field', meta: 'Core · 5 models', cost: '85', text: 'Light scouts that deploy ahead of the main force.', profile: ['7', '5+', '6', '1'], usedIn: ['The Ashen Expedition'] },
  { id: 'u3', kind: 'Unit', name: 'Force Commander', owner: 'Frontier Coalition', source: 'Open Field', meta: 'Command · 1 model', cost: '90', text: 'Leads the detachment. Nearby units keep their formation bonus.', profile: ['6', '3+', '9', '4'], usedIn: ['The Ashen Expedition', 'Northern Watch'] },
  { id: 'u4', kind: 'Unit', name: 'Harbour Guard', owner: 'Free Cities', source: 'Open Field', meta: 'Core · 8 models', cost: '110', text: 'City militia drilled to defend walls and gates.', profile: ['5', '4+', '7', '1'], usedIn: ['Harbour defence'] },
  { id: 'u5', kind: 'Unit', name: 'Patrol Walker', owner: 'Frontier Coalition', source: 'Open Field', meta: 'Support · 1 model', cost: '145', text: 'A two-legged walker that covers rough ground quickly.', profile: ['8', '3+', '8', '6'] },
  { id: 'r1', kind: 'Rule', name: 'Steady advance', owner: 'Core rules', source: 'Open Field', meta: 'Unit ability', badge: 'Ability', text: 'This unit may make a normal move and keep its formation bonus while within range of its commander.' },
  { id: 'r2', kind: 'Rule', name: 'Field standard', owner: 'Frontier Coalition', source: 'Open Field', meta: 'Upgrade rule', badge: 'Upgrade', text: 'A unit carrying a field standard may re-roll one failed resolve test per round.' },
  { id: 'r3', kind: 'Rule', name: 'Forward deployment', owner: 'Core rules', source: 'Open Field', meta: 'Deployment', badge: 'Keyword', text: 'Set up this unit anywhere more than 9" from enemy units after both sides have deployed.' },
  { id: 'e1', kind: 'Equipment', name: 'Service rifle', owner: 'Line Infantry, Field Marshal', source: 'Open Field', meta: 'Ranged weapon', cost: 'Included', text: 'Range 24" · Attacks 1 · Strength 3.' },
  { id: 'e2', kind: 'Equipment', name: 'Heavy carbine', owner: 'Veteran Guard', source: 'Open Field', meta: 'Ranged weapon', cost: '+5', text: 'Range 18" · Attacks 2 · Strength 4.', conditional: 'Replaces Service rifle. Cost is per model.' },
];

export type SourceStatus = 'ready' | 'update' | 'review';
export type SourceInfo = { id: string; name: string; factions: string[]; repo: string; version: string; next?: string; installed: string; upstream: string; checked: string; size: string; documents: number; status: SourceStatus; fromFile?: boolean; kept?: string[]; rosters: string[] };

export const installedSources: SourceInfo[] = [
  { id: 'open-field', name: 'Open Field', factions: ['Frontier Coalition', 'Free Cities', 'Northern Realms'], repo: 'example/open-field', version: 'v1.4', next: 'v1.5', installed: 'Oct 2', upstream: 'Oct 19', checked: '8 minutes ago', size: '14.2 MB', documents: 6, status: 'update', kept: ['v1.3'], rosters: ['The Ashen Expedition', 'Northern Watch', 'Operation First Light', 'Weekend skirmish', 'Harbour defence'] },
  { id: 'system-two', name: 'Example System Two', factions: ['Glass Legion', 'Ember Covenant', 'Tide Wardens', 'Ash Pilgrims'], repo: 'example/system-two', version: 'v3.0.2', installed: 'Sep 30', upstream: 'Sep 29', checked: '8 minutes ago', size: '38.6 MB', documents: 14, status: 'review', rosters: ['Glass Legion trial', 'Ember patrol'] },
  { id: 'skirmish', name: 'Skirmish Rules', factions: ['Wardens', 'Outcasts'], repo: 'skirmish-rules.zip', version: 'local', installed: 'Oct 14', upstream: '—', checked: 'Not checked (from a file)', size: '1.1 MB', documents: 3, status: 'ready', fromFile: true, rosters: [] },
];

export const collectionSources = [
  { id: 'open-field', name: 'Open Field', detail: 'Example game system · 3 factions', factions: ['Frontier Coalition', 'Free Cities', 'Northern Realms'], size: '14.2 MB' },
  { id: 'system-two', name: 'Example System Two', detail: 'Example game system · 4 factions', factions: ['Glass Legion', 'Ember Covenant', 'Tide Wardens', 'Ash Pilgrims'], size: '38.6 MB' },
  { id: 'system-three', name: 'Example System Three', detail: 'Example game system · 6 factions', factions: ['Iron Choir', 'Salt Kingdoms', 'Hollow Court', 'Lantern Guild', 'Stone Wardens', 'Drift Clans'], size: '22.4 MB' },
  { id: 'example-skirmish', name: 'Example Skirmish', detail: 'Example skirmish system · 2 factions', factions: ['Watch', 'Wayfarers'], size: '2.3 MB' },
];

export const colourSchemes = [
  { id: 'default', name: 'Default', accent: '#7c8cff' },
  { id: 'crimson', name: 'Crimson', accent: '#d8392f' },
  { id: 'gilded', name: 'Gilded', accent: '#c69a44' },
  { id: 'azure', name: 'Azure', accent: '#29b3e6' },
  { id: 'verdant', name: 'Verdant', accent: '#5d9c69' },
] as const;
