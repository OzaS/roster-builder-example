import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Circle, Info, LoaderCircle, OctagonAlert, Search, X } from 'lucide-react';
import { Dialog, DialogHeader } from './Dialog';
import type { SourceInfo } from './sourceTypes';
import type { Notify } from './Toasts';
import './workspace.css';

// Install / update jobs, shared by the desktop and tablet prototypes: one simulated queue shared by Welcome, Sources and the
// window chrome. By default an install brings every faction and never pauses (DEC-022); with Advanced installation
// on it pauses on "Choose factions" until the user picks. Cancel needs no confirmation.

export type StepState = 'waiting' | 'active' | 'done' | 'needs-you';
export type JobStep = { label: string; state: StepState; progress: number };
/** DEC-060: the GitHub version picked is a kept version with every faction installed; the job waits on the reinstall offer. */
export type Reinstall = { version: string; current: string; /** Gallery: the confirmed reinstall fails. */ fails?: boolean };
export type Job = { id: string; kind: 'install' | 'update'; sourceId: string; name: string; size: string; factions: string[]; chosen: string[]; steps: JobStep[]; status: 'running' | 'needs-you' | 'done' | 'cancelled' | 'failed'; reinstall?: Reinstall; error?: string };
export type InstallEntry = { id: string; name: string; factions: string[]; size: string };

const steps = (labels: string[]): JobStep[] => labels.map((label, i) => ({ label, state: i === 0 ? 'active' : 'waiting', progress: 0 }));
export const jobPercent = (job: Job) => job.steps.length ? Math.round(job.steps.reduce((n, s) => n + (s.state === 'done' ? 100 : s.progress), 0) / job.steps.length) : 0;
const isLive = (job: Job) => job.status === 'running' || job.status === 'needs-you';

/** DEC-060 sample (DEC-001 placeholder names): Example System Three v1.6 is in use, v1.4 is kept with every faction. */
export const REINSTALL_SOURCE: SourceInfo = { id: 'system-three', name: 'Example System Three', factions: ['Iron Choir', 'Salt Kingdoms', 'Hollow Court', 'Lantern Guild', 'Stone Wardens', 'Drift Clans'], repo: 'example/system-three', version: 'v1.6', installed: 'Oct 20', upstream: 'Oct 19', checked: '8 minutes ago', size: '22.4 MB', documents: 7, status: 'ready', kept: ['v1.4'], rosters: [] };
export const reinstallTitle = (job: Job) => `${job.name} · ${job.reinstall?.version}`;
export const reinstallDone = (job: Job) => `${job.name} ${job.reinstall?.version} is in use.`;
/** Failed reinstall: sample error; the version in use before stays in use. */
export const reinstallFailed = (job: Job) => ({ title: `Could not reinstall ${job.name} ${job.reinstall?.version}`, body: job.error ?? '' });

function advance(job: Job): Job {
  if (job.status !== 'running') return job;
  const i = job.steps.findIndex(s => s.state === 'active');
  if (i < 0) return job;
  const list = job.steps.map(s => ({ ...s }));
  list[i].progress = Math.min(100, list[i].progress + (job.kind === 'install' && list[i].label.startsWith('Import ') ? 12 : 34));
  if (list[i].progress < 100) return { ...job, steps: list };
  list[i].state = 'done';
  const next = list[i + 1];
  if (!next) return { ...job, steps: list, status: 'done' };
  if (next.label === 'Choose factions') { next.state = 'needs-you'; return { ...job, steps: list, status: 'needs-you' }; }
  next.state = 'active';
  return { ...job, steps: list };
}

/** `advancedInstall` is read when an install starts: off installs every faction without pausing, on adds the Choose factions step. */
export function useWorkspaceJobs(initial: SourceInfo[], notify: Notify, onViewSource: (id: string) => void, advancedInstall = false) {
  const [sources, setSources] = useState(initial);
  const [jobs, setJobs] = useState<Job[]>([]);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const advancedRef = useRef(advancedInstall);
  advancedRef.current = advancedInstall;
  const running = jobs.some(j => j.status === 'running');
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const before = jobsRef.current;
      const after = before.map(advance);
      after.forEach(job => {
        if (job.status !== 'done' || before.find(b => b.id === job.id)?.status === 'done') return;
        if (job.kind === 'update') {
          setSources(list => list.map(s => s.id === job.sourceId ? { ...s, version: s.next ?? s.version, next: undefined, status: 'ready', kept: [s.version, ...(s.kept ?? [])].slice(0, 2), installed: 'Just now', lastUpdate: { from: s.version, to: s.next ?? s.version, when: 'just now', check: 'done', done: s.rosters.length } } : s));
          notify(`${job.name} updated. 5 rosters checked, 1 changed.`, { kind: 'notification', action: { label: 'View', run: () => onViewSource(job.sourceId) } });
        } else {
          setSources(list => [...list.filter(s => s.id !== job.sourceId), { id: job.sourceId, name: job.name, factions: job.chosen, repo: `example/${job.sourceId}`, version: 'v1.0', installed: 'Just now', upstream: 'Oct 18', checked: 'Just now', size: job.size, documents: job.chosen.length + 1, status: 'ready', rosters: [] }]);
          notify(`${job.name} installed · ${job.chosen.length} ${job.chosen.length === 1 ? 'faction' : 'factions'}`, { kind: 'notification', action: { label: 'View', run: () => onViewSource(job.sourceId) } });
        }
      });
      setJobs(after);
    }, 420);
    return () => clearInterval(timer);
  }, [running, notify, onViewSource]);
  const startInstall = (entry: InstallEntry) => {
    if (jobsRef.current.some(j => j.sourceId === entry.id && isLive(j))) return;
    const advanced = advancedRef.current;
    setJobs(list => [...list.filter(j => j.sourceId !== entry.id), { id: `job-${entry.id}-${Date.now()}`, kind: 'install', sourceId: entry.id, name: entry.name, size: entry.size, factions: entry.factions, chosen: advanced ? [] : entry.factions, steps: steps(advanced ? [`Download · ${entry.size}`, 'Read data files', 'Choose factions', 'Import factions', 'Save'] : [`Download · ${entry.size}`, 'Read data files', `Import ${entry.factions.length} ${entry.factions.length === 1 ? 'faction' : 'factions'}`, 'Save']), status: 'running' }]);
  };
  const startUpdate = (ids: string[]) => setJobs(list => [...list.filter(j => !ids.includes(j.sourceId) || isLive(j)), ...ids.filter(id => !list.some(j => j.sourceId === id && isLive(j))).map(id => {
    const source = sources.find(s => s.id === id)!;
    return { id: `job-${id}-${Date.now()}`, kind: 'update' as const, sourceId: id, name: source.name, size: '3.1 MB', factions: source.factions, chosen: source.factions, steps: steps(['Download · 3.1 MB', 'Read data files', 'Import changes', 'Check rosters']), status: 'running' as const };
  })]);
  const chooseFactions = (id: string, chosen: string[]) => setJobs(list => list.map(j => j.id !== id ? j : { ...j, chosen, status: 'running', steps: j.steps.map(s => s.state === 'needs-you' ? { ...s, state: 'done', progress: 100 } : s.label === 'Import factions' ? { ...s, label: `Import ${chosen.length} ${chosen.length === 1 ? 'faction' : 'factions'}`, state: 'active' } : s) }));
  /** DEC-060 (gallery): a GitHub link resolves to a kept version of an installed source with every faction installed.
   *  The job pauses on the reinstall offer whether Advanced installation is on or off. */
  const startReinstall = (fails = false) => {
    const source = REINSTALL_SOURCE;
    setSources(list => list.some(s => s.id === source.id) ? list.map(s => s.id === source.id ? { ...s, version: 'v1.6', kept: ['v1.4'] } : s) : [...list, source]);
    setJobs(list => [...list.filter(j => j.sourceId !== source.id), { id: `job-reinstall-${Date.now()}`, kind: 'install', sourceId: source.id, name: source.name, size: source.size, factions: source.factions, chosen: source.factions, steps: [], status: 'needs-you', reinstall: { version: 'v1.4', current: 'v1.6', fails } }]);
  };
  /** Confirmed: switch to that kept version (no new download). The version in use before stays as a kept version; rosters don't change. */
  const reinstall = (id: string) => {
    const job = jobsRef.current.find(j => j.id === id);
    if (!job?.reinstall) return;
    const { version, current, fails } = job.reinstall;
    if (fails) {
      const error = `The kept version could not be read: a data file is missing. ${current} stays in use.`;
      setJobs(list => list.map(j => j.id === id ? { ...j, status: 'failed', error } : j));
      notify(`Could not reinstall ${job.name} ${version}`, { kind: 'notification', action: { label: 'View', run: () => onViewSource(job.sourceId) } });
      return;
    }
    setJobs(list => list.map(j => j.id === id ? { ...j, status: 'done' } : j));
    setSources(list => list.map(s => s.id === job.sourceId ? { ...s, version, kept: [current, ...(s.kept ?? []).filter(v => v !== version)], installed: 'Just now' } : s));
    notify(`${job.name} ${version} is in use.`, { kind: 'notification', action: { label: 'View', run: () => onViewSource(job.sourceId) } });
  };
  const cancel = (id: string) => { const job = jobsRef.current.find(j => j.id === id); setJobs(list => list.map(j => j.id === id ? { ...j, status: 'cancelled' } : j)); if (job) notify(`Cancelled ${job.kind === 'install' ? 'install' : 'update'} of ${job.name}`); };
  const clearEnded = () => setJobs(list => list.filter(isLive));
  const progressOf = (sourceId: string) => { const job = jobs.find(j => j.sourceId === sourceId && isLive(j) && !j.reinstall); return job ? { job, percent: jobPercent(job) } : undefined; };
  return { sources, setSources, jobs, startInstall, startUpdate, chooseFactions, startReinstall, reinstall, cancel, clearEnded, progressOf };
}
export type WorkspaceJobs = ReturnType<typeof useWorkspaceJobs>;

/** Window-chrome button: live progress of the jobs; opens the jobs panel. */
export function JobsToggle({ jobs, open, onToggle }: { jobs: Job[]; open: boolean; onToggle: () => void }) {
  if (!jobs.length) return null;
  const live = jobs.filter(isLive);
  const needs = jobs.find(j => j.status === 'needs-you');
  const first = live[0];
  const label = needs?.reinstall ? 'Reinstall this version?' : needs ? `${needs.name}: choose factions` : first ? `${first.kind === 'install' ? 'Installing' : 'Updating'} ${first.name}${live.length > 1 ? ` +${live.length - 1}` : ''} · ${jobPercent(first)}%` : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} finished`;
  return <button type="button" className={`dt-jobs-toggle ${open ? 'active' : ''} ${needs ? 'needs' : ''}`} aria-expanded={open} aria-controls="dt-jobs" title="Installs and updates" onClick={onToggle}>
    {needs ? <AlertTriangle size={14} /> : first ? <span className="dt-ring" style={{ ['--p' as string]: `${jobPercent(first)}%` }} aria-hidden="true" /> : <Check size={14} />}
    <span>{label}</span>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
  </button>;
}

export function FactionPicker({ job, onChoose, onCancel }: { job: Job; onChoose: (chosen: string[]) => void; onCancel: () => void }) {
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string[]>(job.factions.slice(0, 1));
  const shown = job.factions.filter(f => f.toLowerCase().includes(query.toLowerCase()));
  return <div className="dt-faction-picker">
    <p>Install only the factions you play. You can add the others later from the source.</p>
    <label className="dtp-search"><Search size={14} /><input placeholder="Find a faction…" aria-label="Find a faction" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <div className="dt-faction-tools"><span>{chosen.length} of {job.factions.length} selected</span><button onClick={() => setChosen(chosen.length === job.factions.length ? [] : job.factions)}>{chosen.length === job.factions.length ? 'Select none' : 'Select all'}</button></div>
    <div className="dt-faction-list" role="group" aria-label="Factions">{shown.map(f => <label key={f}><input type="checkbox" checked={chosen.includes(f)} onChange={e => setChosen(c => e.target.checked ? [...c, f] : c.filter(x => x !== f))} />{f}</label>)}{!shown.length && <small>No factions match.</small>}</div>
    <div className="dt-job-actions"><button className="dtp-btn primary small" disabled={!chosen.length} onClick={() => onChoose(chosen)}>Install {chosen.length} {chosen.length === 1 ? 'faction' : 'factions'}</button><button className="dtp-btn small" onClick={onCancel}>Cancel install</button></div>
  </div>;
}

/** DEC-060 (approved 2026-11-02): in place of an empty faction picker, the offer to reinstall the kept version. */
export function ReinstallOffer({ onReinstall, onCancel }: { onReinstall: () => void; onCancel: () => void }) {
  return <div className="dt-reinstall">
    <div className="dtp-notice" role="status"><Info size={16} /><span><strong>This version is already on this device</strong><small>It's a kept version, so there is nothing new to install. You can reinstall it to make it the game data in use.</small></span></div>
    <div className="dt-job-actions"><button className="dtp-btn primary small" onClick={onReinstall}>Reinstall this version</button><button className="dtp-btn small" onClick={onCancel}>Cancel</button></div>
  </div>;
}

const reinstallConfirmTitle = (job: Job) => `Reinstall ${job.name} ${job.reinstall?.version}?`;

/** The confirm dialog's header, text and buttons (also drawn on its own in the Elements view). */
export function ReinstallDialogContent({ job, onConfirm, onClose }: { job: Job; onConfirm: () => void; onClose: () => void }) {
  const r = job.reinstall;
  if (!r) return null;
  return <>
    <DialogHeader title={reinstallConfirmTitle(job)} onClose={onClose} />
    <p className="dt-reinstall-body">{r.version} becomes the game data in use. The version in use now ({r.current}) stays on this device as a kept version. Your rosters don't change.</p>
    <footer className="dte-foot"><span /><button type="button" className="dtp-btn" onClick={onClose}>Cancel</button><button type="button" className="dtp-btn primary" data-autofocus onClick={onConfirm}>Reinstall</button></footer>
  </>;
}

/** The desktop confirmation (dialog shell) before a reinstall. */
export function ReinstallDialog({ job, onConfirm, onClose }: { job: Job; onConfirm: () => void; onClose: () => void }) {
  return <Dialog label={reinstallConfirmTitle(job)} onClose={onClose}><ReinstallDialogContent job={job} onConfirm={onConfirm} onClose={onClose} /></Dialog>;
}

/** Popover under the chrome, like the roster summary: every job with its steps. */
export function JobsPanel({ jobs, onChoose, onPick, onCancel, onReinstall, onHide, onClear, onViewSource }: { jobs: Job[]; onChoose: (id: string, chosen: string[]) => void; /** When set, a waiting install offers a button that opens the picker elsewhere (the tablet's sheet) instead of the inline picker. */ onPick?: (id: string) => void; onCancel: (id: string) => void; /** DEC-060: Reinstall this version (the host confirms first). */ onReinstall?: (id: string) => void; onHide: () => void; onClear: () => void; onViewSource: (id: string) => void }) {
  const ended = jobs.filter(j => !isLive(j));
  return <section id="dt-jobs" className="dt-jobs" aria-label="Installs and updates">
    <header><h2>Installs and updates</h2><button className="dtp-btn small" onClick={onHide} title="Jobs keep running">Hide</button></header>
    {jobs.map(job => <article key={job.id} className={`dt-job ${job.status}`}>
      {job.reinstall ? <div className="dt-job-title"><strong>{reinstallTitle(job)}</strong></div> : <div className="dt-job-title"><strong>{job.status === 'done' ? (job.kind === 'install' ? 'Installed' : 'Updated') : job.status === 'cancelled' ? `Cancelled ${job.kind}` : job.kind === 'install' ? 'Installing' : 'Updating'} {job.name}</strong><span>{job.status === 'cancelled' ? '' : `${jobPercent(job)}%`}</span></div>}
      {job.reinstall && job.status === 'needs-you' && <ReinstallOffer onReinstall={() => onReinstall?.(job.id)} onCancel={() => onCancel(job.id)} />}
      {job.reinstall && job.status === 'done' && <div className="dt-job-actions"><small>{reinstallDone(job)}</small><button className="dtp-btn small" onClick={() => onViewSource(job.sourceId)}>View source</button></div>}
      {job.reinstall && job.status === 'failed' && <><div className="dtp-notice err" role="alert"><OctagonAlert size={16} /><span><strong>{reinstallFailed(job).title}</strong><small>{reinstallFailed(job).body}</small></span></div>
        <div className="dt-job-actions"><button className="dtp-btn small" onClick={() => onViewSource(job.sourceId)}>View source</button></div></>}
      {!job.reinstall && isLive(job) && <div className="dtp-progress"><em style={{ width: `${jobPercent(job)}%` }} /></div>}
      {!job.reinstall && isLive(job) && <ol className="dt-job-steps">{job.steps.map(step => <li key={step.label} className={step.state}>
        {step.state === 'done' ? <Check size={13} /> : step.state === 'active' ? <LoaderCircle size={13} className="dt-spin" /> : step.state === 'needs-you' ? <AlertTriangle size={13} /> : <Circle size={11} />}
        <span>{step.label}</span><small>{step.state === 'active' ? `${step.progress}%` : step.state === 'needs-you' ? 'Needs you' : step.state === 'done' ? 'Done' : 'Waiting'}</small>
      </li>)}</ol>}
      {!job.reinstall && job.status === 'needs-you' && (onPick ? <div className="dt-job-actions"><button className="dtp-btn primary small" onClick={() => onPick(job.id)}>Choose factions</button><button className="dtp-btn small" onClick={() => onCancel(job.id)}>Cancel install</button></div> : <FactionPicker job={job} onChoose={chosen => onChoose(job.id, chosen)} onCancel={() => onCancel(job.id)} />)}
      {job.status === 'running' && <div className="dt-job-actions"><button className="dtp-btn small" onClick={() => onCancel(job.id)} title="Factions already imported stay installed">Cancel</button></div>}
      {!job.reinstall && job.status === 'done' && <div className="dt-job-actions"><small>{job.kind === 'install' ? `${job.chosen.length} ${job.chosen.length === 1 ? 'faction' : 'factions'} · ${job.size}` : '5 rosters checked · 1 changed'}</small><button className="dtp-btn small" onClick={() => onViewSource(job.sourceId)}>View source</button></div>}
    </article>)}
    {ended.length > 0 && <footer><button className="dt-job-clear" onClick={onClear}><X size={13} />Clear finished</button></footer>}
  </section>;
}
