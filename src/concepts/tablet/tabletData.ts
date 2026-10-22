// Synthetic sample data for the tablet pages (DEC-001): a long roster list to show search and scrolling.
import { rosterLibrary, type RosterStatus, type RosterSummary } from '../desktop/desktopData';

const names = ['Border patrol', 'Club night', 'Spring league', 'Harvest cup', 'Winter siege', 'Training squad', 'Quick match', 'River crossing', 'Hilltop watch', 'Tournament list', 'Beginner box', 'Scout screen', 'Campaign week 1', 'Campaign week 2', 'Campaign week 3', 'Garrison', 'Relief column', 'Night raid', 'Rearguard'];
const pool: Array<[string, string]> = [['Frontier Coalition', 'Open Field'], ['Free Cities', 'Open Field'], ['Northern Realms', 'Open Field'], ['Glass Legion', 'Example System Two'], ['Tide Wardens', 'Example System Two']];
const limits = [500, 750, 1000, 1500];
const opened = ['Today', 'Yesterday', 'Oct 17', 'Oct 15', 'Oct 11', 'Oct 8', 'Oct 4', 'Sep 30', 'Sep 26', 'Sep 21', 'Sep 15', 'Sep 9', 'Sep 2', 'Aug 28', 'Aug 20', 'Aug 14', 'Aug 6', 'Jul 30', 'Jul 21'];

const generated: RosterSummary[] = names.map((name, i) => {
  const [faction, system] = pool[(i * 2 + 1) % pool.length];
  const limit = limits[i % limits.length];
  const status: RosterStatus = i % 7 === 3 ? 'issues' : i % 11 === 5 ? 'data-changed' : 'ready';
  const used = status === 'issues' ? limit + 10 + (i % 3) * 15 : Math.round(limit * (0.55 + (i * 37 % 40) / 100) / 5) * 5;
  return { name, faction, system, used, limit, opened: opened[i], forces: 1 + (i % 5 === 0 ? 1 : 0), units: 3 + (i * 3) % 9, status, issues: status === 'issues' ? 1 + (i % 2) : undefined, mark: name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('') };
});

/** The sample list of the many-rosters state: the standard seven plus nineteen more. */
export const manyRosters: RosterSummary[] = [...rosterLibrary, ...generated];
