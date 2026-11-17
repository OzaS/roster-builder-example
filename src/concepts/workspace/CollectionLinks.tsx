import type { ReactNode } from 'react';

/*
 * R2-06 (F4e, approved 2026-11-09, DEC-051): easier collection and library links. The strings of the approved
 * proposal (public/reviews/f4e-collection-links-2026-11-09.html, "Strings"), shared by the phone, tablet and desktop
 * Add collection sheet / dialog like app-core's one set of strings. Names, repositories and the system are placeholders
 * (DEC-001): the user types the game system's name, nothing in the app names one.
 */

export const LINK_LABEL = 'Repository, collection or library link';
export const LINK_HELPER = 'Paste a GitHub repository, a collection file (.json) or an organisation or user (github.com/name).';
export const NEED_LINK = 'Need a link?';
/** Retired (DEC-069, 2026-11-17): no built-in data search. Kept for the retired Search for data screens only. */
export const SEARCH_DATA = { title: 'Search for data', sub: 'Search Google in your browser' };
/** DEC-069: the guide covers both ways in, a file on this device first. */
export const GUIDE = { title: 'Step-by-step guide', short: 'Guide', sub: 'Install from a file or a link' };
export const FINDING = 'Looking in the repository…';
export const SEVERAL = { title: (count: number) => `This repository has ${count} collections`, body: 'Choose one to preview it.', preview: 'Preview' };
export const DATA_REPO = { title: 'This repository holds game data, not a collection.', body: 'You can install it now. Or add the collection or organisation that lists it, to see related data too.', install: 'Install it' };
export const NOTHING_FOUND = { title: 'No collection or game data in this repository.', body: 'Check the link. If you have the data as files, install them from this device instead.' };
export const DATA_SEARCH = {
  title: 'Search for data', sub: 'Opens Google in your browser', system: 'Game system', systemHelp: "Type the game system's name. Leave it empty to search for all data.",
  open: 'Search on Google', note: 'Opens in your browser. Battle Augur does not check the results. Copy a repository link from them, come back, and paste it.',
  desktopNote: 'Battle Augur does not check the results. Copy a repository link, come back, and paste it.',
};
export const PASTE_LINK = 'Paste a link';

/*
 * DEC-069 (approved 2026-11-17): no built-in data search, local data first. Installing from a file on this device is the
 * primary way to add game data, pasting a link second; nothing names or points to a data source. Shared by phone, tablet
 * and desktop.
 */
export const INSTALL_FILE = { title: 'Install from a file on this device', short: 'Install from a file', sub: 'An archive, data files or a folder' };
export const ADD_FROM_LINK = 'Add from a link';
export const ADD_DATA_SUB = 'A file on this device, a link, or GitHub search';
/** Bodies of the no-data places: the Home hero (first run), Home without data, empty Sources. */
export const NO_DATA = {
  homeHero: 'First add the game data you play with. Install it from a file on this device, or add a link to it. It stays on this device.',
  emptyHome: 'Rosters are built from game data. Install it from a file on this device or add a link in Sources, then create a roster here.',
  emptySources: 'Install game data from a file on this device, or add a link to a repository. Installs from a link download 10–80 MB; you can limit that to Wi-Fi in Settings.',
};
/** The system typed on the gallery's Search for data screens. */
export const EXAMPLE_SEARCH_SYSTEM = 'Example System';

export type FoundIn = { repo: string; file: string; branch: string };
export const foundIn = (f: FoundIn) => `Found in ${f.repo} · ${f.file} (${f.branch})`;

/** The Google query: the quoted system name (left out when empty), the format name and GitHub only. Nothing searches on its own. */
export const dataSearchQuery = (system: string) => `${system.trim() ? `"${system.trim()}" ` : ''}BattleScribe data site:github.com`;
export const dataSearchUrl = (system: string) => `https://www.google.com/search?q=${encodeURIComponent(dataSearchQuery(system))}`;

/** A collection file found in a repository's root (several = choose one, then preview). */
export type RepoCollection = { name: string; file: string; sources: number };

/** Placeholder repositories and what the lookup finds in each (gallery sample). */
export const LINK_SAMPLES = {
  found: 'github.com/example-maintainer/game-sources',
  several: 'github.com/example-maintainer/lists',
  dataRepo: 'github.com/example-org/example-system',
  nothing: 'github.com/someone/notes',
};
export const FOUND_COLLECTION = { name: 'Example Sources', by: 'Example Maintainer', sources: 12, description: 'Data repositories the maintainer tests with this app.', from: { repo: 'example-maintainer/game-sources', file: 'collection.json', branch: 'main' } };
export const SEVERAL_COLLECTIONS: RepoCollection[] = [
  { name: 'Skirmish Sources', file: 'skirmish.json', sources: 8 },
  { name: 'Large Battles', file: 'large.json', sources: 14 },
  { name: 'Community picks', file: 'community.json', sources: 21 },
];

export type GuideStep = { text: ReactNode; sub?: string; action?: boolean };
export type GuideGroup = { id: 'file' | 'link'; title: string; steps: GuideStep[] };

const FILE_KINDS = 'Save the game data on this device: an archive (.zip or .bsr), data files (.gst and .cat, also .gstz, .catz or their .json form) or a folder that holds them.';

/**
 * DEC-069 (approved 2026-11-17): the guide in two groups, each numbered from 1. Touch (phone and tablet): file step 2
 * carries the Install from a file on this device action (where the old step 1 carried Search for data).
 */
export const TOUCH_GUIDE_GROUPS: GuideGroup[] = [
  { id: 'file', title: 'From a file on this device', steps: [
    { text: FILE_KINDS },
    { text: <>Tap <b>Install from a file on this device</b> and pick the archive, the files or the folder.</>, action: true },
    { text: 'Battle Augur reads them and installs the game data it finds. It stays on this device.' },
  ] },
  { id: 'link', title: 'From a link', steps: [
    { text: 'Copy the address of a repository or a collection file (.json).' },
    { text: <>Paste it into the link field, check the preview, then tap <b>Add collection</b>.</> },
    { text: <>Open the saved collection, choose game data and tap <b>Install</b>.</> },
  ] },
];

/** Desktop wording of the two groups (Choose, like the other desktop steps). */
export const DESKTOP_GUIDE_GROUPS: GuideGroup[] = [
  { id: 'file', title: 'From a file on this device', steps: [
    { text: FILE_KINDS },
    { text: <>Choose <b>Install from a file</b> and pick the archive, the files or the folder.</>, action: true },
    { text: 'Battle Augur reads them and installs the game data it finds. It stays on this device.' },
  ] },
  { id: 'link', title: 'From a link', steps: [
    { text: 'Copy the address of a repository or a collection file (.json).' },
    { text: <>Paste it into the link field, check the preview, then <b>Add collection</b>.</> },
    { text: <>Open it, choose game data, <b>Install</b>.</> },
  ] },
];

/** Retired with Search for data (DEC-069): the R2-06 six-step guide. Phone and tablet (touch): step 1 carried a Search for data button. */
export const TOUCH_GUIDE_STEPS: GuideStep[] = [
  { text: <>Tap <b>Search for data</b>.</>, action: true },
  { text: "Search for your game system's data repository or collection." },
  { text: 'Open a result and copy its address.', sub: 'A repository link works. A collection file (.json) link works too.' },
  { text: 'Come back here and paste it into the link field.' },
  { text: <>Check the preview, then tap <b>Add collection</b>.</> },
  { text: <>Open the saved collection, choose game data and tap <b>Install</b>.</> },
];

/** Retired with Search for data (DEC-069): the R2-06 desktop guide steps. */
export const DESKTOP_GUIDE_STEPS: GuideStep[] = [
  { text: <>Choose <b>Search for data</b>.</> },
  { text: "Search for your game system's data repository or collection." },
  { text: 'Open a result and copy its address (repository or .json file).' },
  { text: 'Paste it into the link field.' },
  { text: <>Check the preview, then <b>Add collection</b>.</> },
  { text: <>Open it, choose game data, <b>Install</b>.</> },
];

export const GUIDE_KINDS_TITLE = 'Which link is which?';
export const GUIDE_KINDS: Array<{ kind: string; text: string }> = [
  { kind: 'Repository', text: 'one project on GitHub. If it holds game data, you install it. If it has a collection file, we find it.' },
  { kind: 'Collection', text: 'a list of repositories someone keeps (a .json file). Adding it shows all of them.' },
  { kind: 'Organisation or user', text: "everyone's repositories under one GitHub name (github.com/name)." },
];
export const GUIDE_NO_COLLECTION: ReactNode = <>Found game data but no collection? Tap <b>Install it</b> when the app offers it. You don't need a collection to install.</>;
/** Desktop wording of the hint (Choose, like the desktop steps). */
export const DESKTOP_GUIDE_NO_COLLECTION: ReactNode = <>Found game data but no collection? Choose <b>Install it</b> when the app offers it. You don't need a collection to install.</>;

/**
 * The numbered step list of the guide (a primitive: Elements `links.guide-steps`, `tablet.links-guide`, `desktop.links-guide`).
 * Numbers sit in accent circles; a step's action (step 1 on touch) renders under its text. Styled per platform by `prefix`.
 */
export function GuideSteps({ steps, prefix, action }: { steps: GuideStep[]; prefix: string; action?: ReactNode }) {
  return <ol className={`${prefix}-steps`} aria-label="Steps">
    {steps.map((step, i) => <li key={i}><span className={`${prefix}-step-n`} aria-hidden="true">{i + 1}</span>
      <span>{step.text}{step.sub && <small>{step.sub}</small>}{step.action && action ? <span className={`${prefix}-step-action`}>{action}</span> : null}</span></li>)}
  </ol>;
}

/** DEC-069: the guide's two groups (From a file on this device, From a link), each a heading and its own steps from 1. */
export function GuideGroups({ groups, prefix, titleClassName, action }: { groups: GuideGroup[]; prefix: string; titleClassName: string; action?: ReactNode }) {
  return <>
    {groups.map((group) => <section key={group.id} className={`${prefix}-group guide-group`} aria-label={group.title}>
      <h4 className={`${titleClassName} guide-group-title`}>{group.title}</h4>
      <GuideSteps steps={group.steps} prefix={prefix} action={action} />
    </section>)}
  </>;
}

/** "Which link is which?": the three kinds of link, each in the accent colour, then the no-collection hint. */
export function GuideKinds({ prefix }: { prefix: string }) {
  return <dl className={`${prefix}-kinds`}>
    {GUIDE_KINDS.map(k => <div key={k.kind}><dt>{k.kind}</dt><dd>: {k.text}</dd></div>)}
  </dl>;
}
