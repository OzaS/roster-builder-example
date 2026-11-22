// Installed-source shapes shared by the jobs (installs and updates) and the pages that list them.

export type SourceStatus = 'ready' | 'update' | 'review';
export type SourceInfo = { id: string; name: string; factions: string[]; repo: string; version: string; next?: string; installed: string; upstream: string; checked: string; size: string; documents: number; status: SourceStatus; fromFile?: boolean; kept?: string[]; rosters: string[]; lastUpdate?: LastUpdate };
/** Where the roster check of a source's last update stands. */
export type CheckState = 'not-checked' | 'checking' | 'done' | 'cancelled' | 'failed';
export type LastUpdate = { from: string; to: string; when: string; check: CheckState; done: number; nothingChanged?: boolean };
