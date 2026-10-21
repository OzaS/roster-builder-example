// Synthetic, game-neutral sample data for the desktop hub screens (DEC-001).

export type RosterStatus = 'ready' | 'issues' | 'data-changed' | 'faction-removed';
export type RosterSummary = { name: string; faction: string; system: string; used: number; limit: number; opened: string; forces: number; units: number; status: RosterStatus; issues?: number; mark: string };

export const rosterLibrary: RosterSummary[] = [
  { name: 'The Ashen Expedition', faction: 'Frontier Coalition', system: 'Open Field', used: 770, limit: 1000, opened: '12 minutes ago', forces: 1, units: 6, status: 'ready', mark: 'AE' },
  { name: 'Northern Watch', faction: 'Frontier Coalition', system: 'Open Field', used: 1500, limit: 1500, opened: 'Yesterday', forces: 1, units: 10, status: 'ready', mark: 'NW' },
  { name: 'Operation First Light', faction: 'Free Cities', system: 'Open Field', used: 985, limit: 1000, opened: 'Monday', forces: 1, units: 8, status: 'issues', issues: 2, mark: 'FL' },
  { name: 'Weekend skirmish', faction: 'Frontier Coalition', system: 'Open Field', used: 495, limit: 500, opened: 'Oct 16', forces: 1, units: 4, status: 'ready', mark: 'WS' },
  { name: 'Harbour defence', faction: 'Free Cities', system: 'Open Field', used: 1240, limit: 1000, opened: 'Oct 12', forces: 2, units: 11, status: 'issues', issues: 1, mark: 'HD' },
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
export type SourceInfo = { id: string; name: string; factions: string[]; repo: string; version: string; next?: string; installed: string; upstream: string; checked: string; size: string; documents: number; status: SourceStatus; fromFile?: boolean; kept?: string[]; rosters: string[]; lastUpdate?: LastUpdate };

export const installedSources: SourceInfo[] = [
  { id: 'open-field', name: 'Open Field', factions: ['Frontier Coalition', 'Free Cities', 'Northern Realms'], repo: 'example/open-field', version: 'v1.4', next: 'v1.5', installed: 'Oct 2', upstream: 'Oct 19', checked: '8 minutes ago', size: '14.2 MB', documents: 6, status: 'update', kept: ['v1.3'], rosters: ['The Ashen Expedition', 'Northern Watch', 'Operation First Light', 'Weekend skirmish', 'Harbour defence'] },
  { id: 'system-two', name: 'Example System Two', factions: ['Glass Legion', 'Ember Covenant', 'Tide Wardens', 'Ash Pilgrims'], repo: 'example/system-two', version: 'v3.0.2', installed: 'Sep 30', upstream: 'Sep 29', checked: '8 minutes ago', size: '38.6 MB', documents: 14, status: 'review', rosters: ['Glass Legion trial', 'Ember patrol'], lastUpdate: { from: 'v3.0.1', to: 'v3.0.2', when: 'Sep 30', check: 'done', done: 2 } },
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

/* --------------------------- Sources flows (revision 05) --------------------------- */

/** Where the roster check of a source's last update stands. */
export type CheckState = 'not-checked' | 'checking' | 'done' | 'cancelled' | 'failed';
export type LastUpdate = { from: string; to: string; when: string; check: CheckState; done: number; nothingChanged?: boolean };
export type RosterCheck = { status: 'unchanged' | 'changed' | 'faction-removed'; lines: string[] };

/** What the roster check finds per roster; rosters not listed are unchanged. */
export const rosterChecks: Record<string, RosterCheck> = {
  'Operation First Light': { status: 'changed', lines: ['Removed: Signal flare', 'Free Cities detachment: 985 → 995', '1 new error'] },
  'Glass Legion trial': { status: 'changed', lines: ['Removed: Lancer escort', 'Glass Legion detachment: 600 → 615'] },
  'Ember patrol': { status: 'faction-removed', lines: ['Faction removed: the installed data no longer has Ember Covenant'] },
};

export type DataChanges = { added: string[]; changed: string[]; removed: string[] };
/** The data changes of each source's last update (and of Open Field's pending v1.5). */
export const dataChanges: Record<string, DataChanges> = {
  'open-field': {
    added: ['Patrol Walker Mk II · unit', 'Signal Corps · unit'],
    changed: ['Line Infantry · 120 → 125 pts', 'Recon Team · 85 → 80 pts', 'Force Commander · 90 → 95 pts', 'Harbour Guard · 110 → 115 pts', 'Heavy carbine · +5 → +6 pts'],
    removed: ['Signal flare · rule'],
  },
  'system-two': {
    added: ['Reef Lancers · unit', 'Tide Wardens r1 → r2'],
    changed: ['Glass Legion detachment · 600 → 615 pts', 'Glass Legion r6 → r7', 'Ash Pilgrims r3 → r4'],
    removed: ['Ember Covenant · faction', 'Lancer escort · unit'],
  },
};

export type Listing = { id: string; name: string; repo: string; description: string; updated: string; factions: string[]; size: string; supported?: boolean; archived?: boolean };
export type CollectionPage = { id: string; kind: 'collection' | 'library'; name: string; by: string; link: string; description: string; updated: string; listings: Listing[]; entries: string[]; parent?: string };

const listing = (id: string, repo: string, description: string, updated: string, extra: Partial<Listing> = {}): Listing => {
  const known = collectionSources.find(c => c.id === id);
  return { id, name: known?.name ?? id, repo, description, updated, factions: known?.factions ?? ['Wardens', 'Wayfarers'], size: known?.size ?? '3.4 MB', ...extra };
};
const sandbox = listing('sandbox-rules', 'example-community/sandbox-rules', 'Community rules for open play, with two starter factions.', 'Aug 14', { name: 'Sandbox Rules', factions: ['Free Company', 'Wanderers'], size: '2.9 MB' });
const campaign = listing('campaign-kit', 'example-community/campaign-kit', 'Campaign tracks and extra scenarios for Open Field.', 'Jul 3', { name: 'Campaign Kit', factions: ['Campaign rules'], size: '0.8 MB' });

export const sourceCollections: Record<string, CollectionPage> = {
  default: {
    id: 'default', kind: 'collection', name: 'Default collection', by: 'Battle Augur', link: 'https://example.org/collections/default.json', updated: 'Oct 18',
    description: 'Sources tested with this app. Community repositories; nothing is downloaded until you install.',
    listings: [
      listing('open-field', 'example/open-field', 'Example game system with three factions.', 'Oct 19', { supported: true }),
      listing('system-two', 'example/system-two', 'Example game system with four factions.', 'Sep 29', { supported: true }),
      listing('system-three', 'example/system-three', 'Example game system with six factions.', 'Oct 11', { supported: true }),
      listing('example-skirmish', 'example/skirmish', 'Small skirmish games with two factions.', 'Oct 2', { supported: true }),
      sandbox, campaign,
      listing('open-field-legacy', 'example/open-field-legacy', 'First edition of Open Field. No longer maintained.', 'Mar 2024', { name: 'Open Field (first edition)', archived: true, factions: ['Frontier Coalition', 'Free Cities'], size: '9.8 MB' }),
      listing('skirmish-classic', 'example/skirmish-classic', 'The original skirmish rules.', 'Jan 2024', { name: 'Example Skirmish Classic', archived: true }),
    ],
    entries: ['example-org', 'community-picks'],
  },
  'example-org': {
    id: 'example-org', kind: 'library', name: 'Example Data Org', by: 'GitHub organisation', link: 'https://github.com/example', updated: 'Oct 19', parent: 'default',
    description: 'Every repository of the organisation that keeps the example systems.',
    listings: [
      listing('open-field', 'example/open-field', 'Example game system with three factions.', 'Oct 19'),
      listing('system-three', 'example/system-three', 'Example game system with six factions.', 'Oct 11'),
      listing('example-skirmish', 'example/skirmish', 'Small skirmish games with two factions.', 'Oct 2'),
      listing('system-two', 'example/system-two', 'Example game system with four factions.', 'Sep 29'),
      listing('data-tools', 'example/data-tools', 'Test files for data authors.', 'Feb 2024', { name: 'Data Tools', archived: true }),
    ],
    entries: [],
  },
  'community-picks': {
    id: 'community-picks', kind: 'collection', name: 'Community picks', by: 'Example maintainers', link: 'https://example.org/community-picks.json', updated: 'Oct 6', parent: 'default',
    description: 'Fan-made systems and add-ons picked by the community.',
    listings: [sandbox, campaign, listing('night-raid', 'example-community/night-raid', 'Fast night-time raids for two to four players.', 'Sep 21', { name: 'Night Raid', factions: ['Raiders', 'Sentries'], size: '1.6 MB' })],
    entries: [],
  },
};

/** GitHub-wide repository search sample: matched against name, repository and description. */
export const githubRepositories: Listing[] = [
  listing('open-field', 'example/open-field', 'Open Field data files: three factions and core rules.', 'Oct 19'),
  listing('system-three', 'example/system-three', 'Example System Three data, six factions.', 'Oct 11'),
  listing('field-notes', 'example-user/field-notes', 'Homebrew units and scenarios for Open Field.', 'Sep 2', { name: 'Field Notes', factions: ['Homebrew'], size: '0.6 MB' }),
  listing('open-field-translated', 'example-translations/open-field', 'Open Field data with translated names.', 'Aug 20', { name: 'Open Field (translated)', factions: ['Frontier Coalition', 'Free Cities', 'Northern Realms'], size: '14.6 MB' }),
  sandbox,
  listing('open-field-legacy', 'example/open-field-legacy', 'First edition of Open Field. No longer maintained.', 'Mar 2024', { name: 'Open Field (first edition)', archived: true }),
  listing('field-sketches', 'example-user/field-sketches', 'Early drafts of field rules.', 'Nov 2023', { name: 'Field Sketches', archived: true }),
];
