import { ChevronRight, FileArchive, Github, Link2, Plus } from 'lucide-react';
import { ADD_DATA_SUB, ADD_FROM_LINK, INSTALL_FILE, NO_DATA } from '../workspace/CollectionLinks';
import { JobsPanel, REINSTALL_SOURCE, ReinstallDialogContent, type Job } from '../workspace/Jobs';
import { NoPresetCollections } from './DesktopSourceFlows';

// Elements view (desktop): the approved 2026-11-02 states for a build with no default collection (DEC-059, R0-09) and
// reinstalling a kept version (DEC-060). Static samples; the live flows are on Sources and Welcome (Preview states).

const noop = () => {};
const reinstallJob = (status: Job['status'], error?: string): Job => ({ id: `demo-${status}`, kind: 'install', sourceId: REINSTALL_SOURCE.id, name: REINSTALL_SOURCE.name, size: REINSTALL_SOURCE.size, factions: REINSTALL_SOURCE.factions, chosen: REINSTALL_SOURCE.factions, steps: [], status, reinstall: { version: 'v1.4', current: 'v1.6' }, error });

export function DesktopDataElements() {
  return <section className="dt-app ux-screen dark dt-data-elements" aria-label="No default collection and reinstall a kept version">
    <div className="dt-data-elements-grid">
      <section className="dtp-card dtp-detail" aria-label="Add game data, no default collection">
        {/* DEC-069 (approved 2026-11-17): file first (primary), the link, collections, Search GitHub last. */}
        <span className="dtp-eyebrow">Add game data</span><h2>Choose a game system</h2><p className="dtp-muted">{ADD_DATA_SUB}</p>
        <button className="dtp-link-row dts-primary-row" type="button"><FileArchive size={16} /><span><strong>{INSTALL_FILE.title}</strong><small>{INSTALL_FILE.sub}</small></span><ChevronRight size={15} /></button>
        <h3>Repository link</h3>
        <div className="dtp-inline-form"><label className="dtp-search"><Link2 size={15} /><input placeholder="https://github.com/owner/repository" aria-label="Repository link (example)" /></label><button className="dtp-btn" type="button">Continue</button></div>
        <NoPresetCollections />
        <button className="dtp-link-row" type="button"><Plus size={16} /><span><strong>Add a collection or library</strong><small>Lists of sources kept by the community</small></span><ChevronRight size={15} /></button>
        <button className="dtp-link-row" type="button"><Github size={16} /><span><strong>Search GitHub</strong><small>Find data repositories by name</small></span><ChevronRight size={15} /></button>
      </section>
      <section className="dt-recents dt-start" aria-label="Welcome first run, no game data">
        <header><h2>Start with game data</h2><span>{NO_DATA.homeHero}</span></header>
        <span className="dtp-row-actions dt-first-run-actions"><button className="dtp-btn primary" type="button"><FileArchive size={15} />{INSTALL_FILE.short}</button><button className="dtp-btn" type="button"><Link2 size={15} />{ADD_FROM_LINK}</button></span>
      </section>
    </div>
    <div className="dt-data-elements-grid">
      <div className="dt-data-elements-jobs"><JobsPanel jobs={[reinstallJob('needs-you'), reinstallJob('done'), reinstallJob('failed', 'The kept version could not be read: a data file is missing. v1.6 stays in use.')]} onChoose={noop} onCancel={noop} onReinstall={noop} onHide={noop} onClear={noop} onViewSource={noop} /></div>
      <section className="dt-modal dte-dialog dt-data-elements-dialog" role="dialog" aria-label="Reinstall confirmation (example)"><ReinstallDialogContent job={reinstallJob('needs-you')} onConfirm={noop} onClose={noop} /></section>
    </div>
  </section>;
}
