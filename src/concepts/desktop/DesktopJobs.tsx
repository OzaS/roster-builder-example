import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Circle, LoaderCircle, Search, X } from 'lucide-react';
import type { SourceInfo } from './desktopData';
import type { Notify } from '../workspace/Toasts';

// Install / update jobs for the desktop prototype: one simulated queue shared by Welcome, Sources and the
// window chrome. Installs pause on "Choose factions" until the user picks; Cancel needs no confirmation.

export type StepState = 'waiting' | 'active' | 'done' | 'needs-you';
export type JobStep = { label: string; state: StepState; progress: number };
export type Job = { id: string; kind: 'install' | 'update'; sourceId: string; name: string; size: string; factions: string[]; chosen: string[]; steps: JobStep[]; status: 'running' | 'needs-you' | 'done' | 'cancelled' };
export type InstallEntry = { id: string; name: string; factions: string[]; size: string };

const steps = (labels: string[]): JobStep[] => labels.map((label, i) => ({ label, state: i === 0 ? 'active' : 'waiting', progress: 0 }));
export const jobPercent = (job: Job) => Math.round(job.steps.reduce((n, s) => n + (s.state === 'done' ? 100 : s.progress), 0) / job.steps.length);
const isLive = (job: Job) => job.status === 'running' || job.status === 'needs-you';

function advance(job: Job): Job {
  if (job.status !== 'running') return job;
  const i = job.steps.findIndex(s => s.state === 'active');
  if (i < 0) return job;
  const list = job.steps.map(s => ({ ...s }));
  list[i].progress = Math.min(100, list[i].progress + (job.kind === 'install' && i === 3 ? 12 : 34));
  if (list[i].progress < 100) return { ...job, steps: list };
  list[i].state = 'done';
  const next = list[i + 1];
  if (!next) return { ...job, steps: list, status: 'done' };
  if (next.label === 'Choose factions') { next.state = 'needs-you'; return { ...job, steps: list, status: 'needs-you' }; }
  next.state = 'active';
  return { ...job, steps: list };
}

export function useDesktopJobs(initial: SourceInfo[], notify: Notify, onViewSource: (id: string) => void) {
  const [sources, setSources] = useState(initial);
  const [jobs, setJobs] = useState<Job[]>([]);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
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
    setJobs(list => [...list.filter(j => j.sourceId !== entry.id), { id: `job-${entry.id}-${Date.now()}`, kind: 'install', sourceId: entry.id, name: entry.name, size: entry.size, factions: entry.factions, chosen: [], steps: steps([`Download · ${entry.size}`, 'Read data files', 'Choose factions', 'Import factions', 'Save']), status: 'running' }]);
  };
  const startUpdate = (ids: string[]) => setJobs(list => [...list.filter(j => !ids.includes(j.sourceId) || isLive(j)), ...ids.filter(id => !list.some(j => j.sourceId === id && isLive(j))).map(id => {
    const source = sources.find(s => s.id === id)!;
    return { id: `job-${id}-${Date.now()}`, kind: 'update' as const, sourceId: id, name: source.name, size: '3.1 MB', factions: source.factions, chosen: source.factions, steps: steps(['Download · 3.1 MB', 'Read data files', 'Import changes', 'Check rosters']), status: 'running' as const };
  })]);
  const chooseFactions = (id: string, chosen: string[]) => setJobs(list => list.map(j => j.id !== id ? j : { ...j, chosen, status: 'running', steps: j.steps.map(s => s.state === 'needs-you' ? { ...s, state: 'done', progress: 100 } : s.label === 'Import factions' ? { ...s, label: `Import ${chosen.length} ${chosen.length === 1 ? 'faction' : 'factions'}`, state: 'active' } : s) }));
  const cancel = (id: string) => { const job = jobsRef.current.find(j => j.id === id); setJobs(list => list.map(j => j.id === id ? { ...j, status: 'cancelled' } : j)); if (job) notify(`Cancelled ${job.kind === 'install' ? 'install' : 'update'} of ${job.name}`); };
  const clearEnded = () => setJobs(list => list.filter(isLive));
  const progressOf = (sourceId: string) => { const job = jobs.find(j => j.sourceId === sourceId && isLive(j)); return job ? { job, percent: jobPercent(job) } : undefined; };
  return { sources, setSources, jobs, startInstall, startUpdate, chooseFactions, cancel, clearEnded, progressOf };
}
export type DesktopJobs = ReturnType<typeof useDesktopJobs>;

/** Window-chrome button: live progress of the jobs; opens the jobs panel. */
export function JobsToggle({ jobs, open, onToggle }: { jobs: Job[]; open: boolean; onToggle: () => void }) {
  if (!jobs.length) return null;
  const live = jobs.filter(isLive);
  const needs = jobs.find(j => j.status === 'needs-you');
  const first = live[0];
  const label = needs ? `${needs.name}: choose factions` : first ? `${first.kind === 'install' ? 'Installing' : 'Updating'} ${first.name}${live.length > 1 ? ` +${live.length - 1}` : ''} · ${jobPercent(first)}%` : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} finished`;
  return <button type="button" className={`dt-jobs-toggle ${open ? 'active' : ''} ${needs ? 'needs' : ''}`} aria-expanded={open} aria-controls="dt-jobs" title="Installs and updates" onClick={onToggle}>
    {needs ? <AlertTriangle size={14} /> : first ? <span className="dt-ring" style={{ ['--p' as string]: `${jobPercent(first)}%` }} aria-hidden="true" /> : <Check size={14} />}
    <span>{label}</span>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
  </button>;
}

function FactionPicker({ job, onChoose, onCancel }: { job: Job; onChoose: (chosen: string[]) => void; onCancel: () => void }) {
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

/** Popover under the chrome, like the roster summary: every job with its steps. */
export function JobsPanel({ jobs, onChoose, onCancel, onHide, onClear, onViewSource }: { jobs: Job[]; onChoose: (id: string, chosen: string[]) => void; onCancel: (id: string) => void; onHide: () => void; onClear: () => void; onViewSource: (id: string) => void }) {
  const ended = jobs.filter(j => !isLive(j));
  return <section id="dt-jobs" className="dt-jobs" aria-label="Installs and updates">
    <header><h2>Installs and updates</h2><button className="dtp-btn small" onClick={onHide} title="Jobs keep running">Hide</button></header>
    {jobs.map(job => <article key={job.id} className={`dt-job ${job.status}`}>
      <div className="dt-job-title"><strong>{job.status === 'done' ? (job.kind === 'install' ? 'Installed' : 'Updated') : job.status === 'cancelled' ? `Cancelled ${job.kind}` : job.kind === 'install' ? 'Installing' : 'Updating'} {job.name}</strong><span>{job.status === 'cancelled' ? '' : `${jobPercent(job)}%`}</span></div>
      {isLive(job) && <div className="dtp-progress"><em style={{ width: `${jobPercent(job)}%` }} /></div>}
      {isLive(job) && <ol className="dt-job-steps">{job.steps.map(step => <li key={step.label} className={step.state}>
        {step.state === 'done' ? <Check size={13} /> : step.state === 'active' ? <LoaderCircle size={13} className="dt-spin" /> : step.state === 'needs-you' ? <AlertTriangle size={13} /> : <Circle size={11} />}
        <span>{step.label}</span><small>{step.state === 'active' ? `${step.progress}%` : step.state === 'needs-you' ? 'Needs you' : step.state === 'done' ? 'Done' : 'Waiting'}</small>
      </li>)}</ol>}
      {job.status === 'needs-you' && <FactionPicker job={job} onChoose={chosen => onChoose(job.id, chosen)} onCancel={() => onCancel(job.id)} />}
      {job.status === 'running' && <div className="dt-job-actions"><button className="dtp-btn small" onClick={() => onCancel(job.id)} title="Factions already imported stay installed">Cancel</button></div>}
      {job.status === 'done' && <div className="dt-job-actions"><small>{job.kind === 'install' ? `${job.chosen.length} ${job.chosen.length === 1 ? 'faction' : 'factions'} · ${job.size}` : '5 rosters checked · 1 changed'}</small><button className="dtp-btn small" onClick={() => onViewSource(job.sourceId)}>View source</button></div>}
    </article>)}
    {ended.length > 0 && <footer><button className="dt-job-clear" onClick={onClear}><X size={13} />Clear finished</button></footer>}
  </section>;
}
