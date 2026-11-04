import { useState, type ReactNode } from 'react';
import { ArrowLeft, Bug, Check, ChevronRight, Copy, Cpu, Database, EyeOff, FolderOpen, HardDrive, Info, Keyboard, Languages, Layers3, LayoutGrid, Palette, RotateCcw, SlidersHorizontal, SquareTerminal, Timer, Trash2, Upload } from 'lucide-react';
import type { ColorScheme } from '../../types';
import { Segmented, Switch } from '../workspace/Primitives';
import { REOPEN_ROSTER_DETAIL, REOPEN_ROSTER_TITLE } from '../ux/SourceJobs';
import { colourSchemes } from '../desktop/desktopData';
import { Facts, ListDetail, Row, WorkspaceScope, type SessionProps } from './TabletPieces';
import { editorShortcuts, generalShortcuts, keyLabel } from './tabletKeys';
import { useTabletExperience } from './tabletExperience';
import { PageTitle, TabletToolbar } from './TabletToolbar';
import { SettingsResults, SettingsSearchField } from '../ux/SettingsSearch';
import { Chip as MobileChip } from '../ux/uxShared';
import { DEBUG_SUBTITLE, DEVELOPER_NOTE, HIDE_DEVELOPER_DETAIL, SHOW_HIDDEN_DETAIL, SHOW_HIDDEN_TITLE } from '../ux/DeveloperPages';

// Settings (T2b): sections as a list, each one a real page in the detail pane. Key bindings are a read-only list here: the
// shortcuts work with a hardware keyboard and appear in the system overlay; the editor stays on the desktop.

type ThemePref = 'system' | 'light' | 'dark';
const sections = [
  { id: 'appearance', label: 'Appearance', sub: 'Theme and colour scheme', icon: Palette },
  { id: 'language', label: 'Language', sub: 'English', icon: Languages },
  { id: 'rosters', label: 'Rosters', sub: 'Defaults for new rosters', icon: Layers3 },
  { id: 'data', label: 'Game data', sub: 'Updates and installation', icon: Database },
  { id: 'storage', label: 'Storage', sub: '67.1 MB used', icon: HardDrive },
  { id: 'keys', label: 'Keyboard shortcuts', sub: 'With a hardware keyboard', icon: Keyboard },
  { id: 'advanced', label: 'Advanced', sub: 'Catalogue search, Separate all', icon: SlidersHorizontal },
  { id: 'about', label: 'About', sub: 'Version and licences', icon: Info },
] as const;

/** F1b (DEC-063, approved 2026-11-04): two About sub-pages, each opening in the detail pane with Back to About. Developer options
 *  appear after the 7-tap unlock on About › Version; Debug only in debug builds, whatever the unlock. Gallery states:
 *  tablet-settings-about-developer (About with both rows), tablet-settings-developer, tablet-settings-debug. */
const subPages = {
  developer: { label: 'Developer options', sub: 'For checking game data' },
  debug: { label: 'Debug', sub: 'Internal tools · debug build' },
} as const;
const UNLOCKED_STATES = ['about-developer', 'developer', 'debug'];
const FLAGS = [{ id: 'lookup', name: 'Lookup tab', tier: '1.0 · built', on: true }, { id: 'library', name: 'Library tab', tier: '1.x · placeholder', on: false }, { id: 'tools', name: 'Tools tab', tier: '1.x · placeholder', on: false }];

const Group = ({ title, children }: { title?: string; children: ReactNode }) => <section className="tb-section">{title && <span className="ux-result-label">{title}</span>}{children}</section>;

export function TabletSettings({ env, notify, session, themePref, scheme, onTheme, onScheme, focusSearch, onFocusSearch, separateAll: separateAllProp, onSeparateAll: onSeparateAllProp, searchable = false }: SessionProps & { themePref: ThemePref; scheme: ColorScheme; onTheme: (t: ThemePref) => void; onScheme: (s: ColorScheme) => void; focusSearch: boolean; onFocusSearch: (on: boolean) => void; separateAll?: boolean; onSeparateAll?: (on: boolean) => void; /** UX-053 (approved 2026-11-01): the page's top row with the Settings search (tablet library only; the foldable shell is unchanged). */ searchable?: boolean }) {
  // Controlled by the tablet workbench so the editor's unit pane follows it; the foldable shell keeps it local.
  const [separateAllLocal, setSeparateAllLocal] = useState(false);
  const separateAll = separateAllProp ?? separateAllLocal;
  const onSeparateAll = onSeparateAllProp ?? setSeparateAllLocal;
  const { experience, choose } = useTabletExperience();
  const { light, advancedInstall, setAdvancedInstall, settingsSection, setSettingsSection, language, setLanguage, setAppearanceImport } = session;
  const [open, setOpen] = useState(settingsSection !== undefined);
  // UX-053 (approved 2026-11-01): search in the page's top row; results replace the section list and stay operable. Gallery states tablet-settings-search*.
  const [query, setQuery] = useState(session.state === 'search' ? 'search' : session.state === 'search-no-results' ? 'lantern' : session.state === 'search-developer' ? 'hidden' : '');
  const [limit, setLimit] = useState(1000);
  const [toggles, setToggles] = useState({ rememberSections: true, reopenLast: false, autoChecks: true });
  const [keep, setKeep] = useState(1);
  const flip = (key: keyof typeof toggles) => (v: boolean) => setToggles(t => ({ ...t, [key]: v }));
  const unlocked = UNLOCKED_STATES.includes(session.state);
  const [showHidden, setShowHidden] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [flags, setFlags] = useState<Record<string, boolean>>(() => Object.fromEntries(FLAGS.map(f => [f.id, f.on])));
  const [imports, setImports] = useState(2);
  const subPage = settingsSection === 'developer' || settingsSection === 'debug' ? subPages[settingsSection] : undefined;
  const current = sections.find(s => s.id === (subPage ? 'about' : settingsSection ?? 'appearance')) ?? sections[0];
  const backToAbout = <button type="button" className="ux-job-btn tb-back" onClick={() => setSettingsSection('about')}><ArrowLeft size={16} />Back to About</button>;
  const subPageBody = settingsSection === 'developer' ? <>
    <p className="tb-note"><Info size={15} />{DEVELOPER_NOTE}</p>
    <WorkspaceScope light={light}><div className="ux-src-group tb-switches"><Switch label={SHOW_HIDDEN_TITLE} detail={SHOW_HIDDEN_DETAIL} checked={showHidden} onChange={setShowHidden} /></div></WorkspaceScope>
    <Row selected={false} mark={<EyeOff size={20} />} title="Hide developer options" sub={HIDE_DEVELOPER_DETAIL} onClick={() => { setSettingsSection('about'); notify('Developer options are hidden'); }} />
  </> : settingsSection === 'debug' ? <>
    <Group title="Performance">
      <WorkspaceScope light={light}><div className="ux-src-group tb-switches"><Switch label="Performance overlay" detail="UI frame drops and tap → view latency, per screen" checked={overlay} onChange={setOverlay} /></div></WorkspaceScope>
      <Facts rows={[['Lists', '0 drops · 38 ms'], ['Roster editor', '2 drops · 64 ms'], ['Add unit', '1 drop · 51 ms']]} />
      <div className="tb-actions"><button type="button" className="ux-job-btn" onClick={() => notify('Report saved (prototype)')}><Copy size={16} />Save report</button><button type="button" className="ux-job-btn ux-src-ghost"><RotateCcw size={16} />Reset</button></div>
    </Group>
    <Group title="Feature flags">
      <WorkspaceScope light={light}><div className="ux-src-group tb-switches">{FLAGS.map(f => <Switch key={f.id} label={f.name} detail={f.tier} checked={flags[f.id]} onChange={v => setFlags(c => ({ ...c, [f.id]: v }))} />)}</div></WorkspaceScope>
      <div className="tb-actions"><button type="button" className="ux-job-btn ux-src-ghost" onClick={() => setFlags(Object.fromEntries(FLAGS.map(f => [f.id, f.on])))}><RotateCcw size={16} />Reset to defaults</button></div>
    </Group>
    <Group title="Installs">
      <WorkspaceScope light={light}><div className="tb-setting stacked"><span><strong>Imports at once</strong><small>For measuring installs that run together.</small></span><Segmented<number> label="Imports at once" value={imports} onChange={setImports} options={[1, 2].map(v => ({ value: v, label: String(v) }))} /></div></WorkspaceScope>
      <Facts rows={[['Install measurements', 'Last 10'], ['3 sources · 2 at once', '14.2 s'], ['3 sources · 1 at once', '19.8 s'], ['1 source · update', '4.1 s']]} />
      <div className="tb-actions"><button type="button" className="ux-job-btn"><Copy size={16} />Copy</button><button type="button" className="ux-job-btn ux-src-ghost"><Trash2 size={16} />Clear</button></div>
    </Group>
    <Group title="Tools">
      <Row selected={false} mark={<LayoutGrid size={20} />} title="Component gallery" sub="Every design-system component and state" end={<ChevronRight size={17} />} onClick={() => notify('Component gallery (prototype)')} />
      <Row selected={false} mark={<Timer size={20} />} title="Engine bench" sub="Time engine operations on installed data" end={<ChevronRight size={17} />} onClick={() => notify('Engine bench (prototype)')} />
    </Group>
    <Group title="Engine worker">
      <Facts rows={[['Cache', '12 documents · 8.4 MB'], ['Sessions', '1 open'], ['Heap', '142 MB']]} />
      <div className="tb-actions"><button type="button" className="ux-job-btn" onClick={() => notify('Engine worker restarted')}><Cpu size={16} />Restart</button></div>
    </Group>
    <p className="tb-note"><Info size={15} />Only in debug builds. Settings search does not list these tools.</p>
  </> : null;
  const page = (() => {
    switch (current.id) {
      case 'appearance': return <>
        <WorkspaceScope light={light}><div className="ux-src-group tb-switches"><Switch label="Reduce motion" detail="Use direct transitions instead of spring and shape motion. Device accessibility preferences also apply." checked={experience.reducedMotion} onChange={value => choose('reducedMotion', value)} /><Switch label="Reduce transparency" detail="Use solid backgrounds for toolbars and controls." checked={experience.reducedTransparency} onChange={value => choose('reducedTransparency', value)} /></div></WorkspaceScope>
        <WorkspaceScope light={light}><div className="tb-setting"><span><strong>Theme</strong><small>System follows the device setting.</small></span><Segmented<ThemePref> label="Theme" value={themePref} onChange={onTheme} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div></WorkspaceScope>
        <Group title="Colour scheme"><div className="tb-schemes" role="radiogroup" aria-label="Colour scheme">{colourSchemes.map(c => <button type="button" key={c.id} role="radio" aria-checked={scheme === c.id} className={`ux-start-row tb-scheme ${scheme === c.id ? 'on' : ''}`} onClick={() => onScheme(c.id)}><i style={{ background: c.accent }} /><span><strong>{c.name}</strong></span>{scheme === c.id && <Check size={18} />}</button>)}</div>
          <button type="button" className="ux-job-btn tb-wide" onClick={() => setAppearanceImport({ kind: 'scheme', outcome: 'idle' })}><Upload size={16} />Import colour scheme</button></Group>
      </>;
      case 'language': return <>
        <Group><div className="tb-schemes" role="radiogroup" aria-label="Language">{[['en', 'English'], ['fr', 'Français · imported']].map(([id, name]) => <button type="button" key={id} role="radio" aria-checked={language === id} className={`ux-start-row tb-scheme ${language === id ? 'on' : ''}`} onClick={() => setLanguage(id)}><Languages size={20} /><span><strong>{name}</strong></span>{language === id && <Check size={18} />}</button>)}</div>
          <button type="button" className="ux-job-btn tb-wide" onClick={() => setAppearanceImport({ kind: 'language', outcome: 'idle' })}><Upload size={16} />Import language pack</button></Group>
        <p className="tb-note"><Info size={15} />Only the app is translated. Game data is shown as written.</p>
      </>;
      case 'rosters': return <WorkspaceScope light={light}>
        <div className="tb-setting stacked"><span><strong>Points limit for new rosters</strong><small>The guided creation starts with this limit.</small></span><Segmented<number> label="Points limit" value={limit} onChange={setLimit} options={[500, 750, 1000, 1500, 2000].map(v => ({ value: v, label: v.toLocaleString('en-US') }))} /></div>
        <div className="ux-src-group tb-switches"><Switch label={REOPEN_ROSTER_TITLE} detail={REOPEN_ROSTER_DETAIL} checked={toggles.reopenLast} onChange={flip('reopenLast')} /><Switch label="Remember option sections" detail="Folded option sections stay folded the next time you open a unit." checked={toggles.rememberSections} onChange={flip('rememberSections')} /></div>
      </WorkspaceScope>;
      case 'data': return <WorkspaceScope light={light}>
        <div className="ux-src-group tb-switches"><Switch label="Check for updates automatically" detail="When the app is open and online." checked={toggles.autoChecks} onChange={flip('autoChecks')} /><Switch label="Advanced installation" detail="Choose which factions to install when you add game data. Off: everything is installed." checked={advancedInstall} onChange={setAdvancedInstall} /></div>
        <p className="tb-note"><Info size={15} />{advancedInstall ? 'Each install pauses on “Choose factions” until you pick. Sources you already installed keep their factions.' : 'Each install brings every faction and never pauses. Turn Advanced installation on to pick factions.'}</p>
        <div className="tb-setting stacked"><span><strong>Keep previous versions</strong><small>{keep === 0 ? 'Older versions are deleted after an update.' : `Uses about ${keep * 13} MB per source.`}</small></span><Segmented<number> label="Keep previous versions" value={keep} onChange={setKeep} options={[0, 1, 2, 3].map(v => ({ value: v, label: v === 0 ? 'Off' : String(v) }))} /></div>
      </WorkspaceScope>;
      case 'storage': return <>
        <div className="tb-storage"><div className="tb-storage-bar" role="img" aria-label="Storage used: game data 53.9 MB, kept versions 12.8 MB, rosters 0.4 MB"><i style={{ width: '62%' }} /><i style={{ width: '15%' }} /><i style={{ width: '1%' }} /></div>
          <Facts rows={[['Game data', '53.9 MB'], ['Kept versions', '12.8 MB'], ['Rosters', '0.4 MB'], ['Total', '67.1 MB']]} /></div>
        <p className="tb-note"><Info size={15} />Everything is stored in the app's private storage on this device. Removing the app removes it.</p>
        <div className="tb-actions"><button type="button" className="ux-job-btn" onClick={() => notify('Kept versions cleared. 12.8 MB freed.')}>Clear kept versions</button><button type="button" className="ux-job-btn" onClick={() => notify('Choose where to save the backup (prototype)')}><FolderOpen size={16} />Export all rosters</button></div>
      </>;
      case 'keys': return <>
        <p className="tb-note"><Keyboard size={15} /><span>These shortcuts work with a hardware keyboard. {env.device.system === 'ios' ? 'Hold ⌘ to see them anywhere.' : 'Press Ctrl + / to see them anywhere.'} They are fixed; the key bindings editor is part of the desktop app.</span></p>
        {[generalShortcuts, editorShortcuts].map(group => <Group key={group.title} title={group.title}><div className="ux-src-group">{group.items.map(a => <div className="ux-src-kv tb-key-row" key={a.combo}><span>{a.label}</span><kbd className="tb-kbd">{keyLabel(a.combo, env.device.system)}</kbd></div>)}</div></Group>)}
      </>;
      // DEC-050 (UX-059), DEC-054: Settings › Advanced, two opt-in preferences (off by default) as plain rows: no enclosing card.
      case 'advanced': return <WorkspaceScope light={light}>
        <div className="tb-plain-rows" role="group" aria-label="Advanced">
          <Switch label="Focus search when opening the catalogue" detail={`Off: Add unit opens the catalogue for browsing. ${keyLabel('Mod+F', env.device.system)} on a keyboard always focuses the search.`} checked={focusSearch} onChange={onFocusSearch} />
          <Switch label="Enable Separate all" detail="Units with several models also offer Separate all, which gives every model its own options in one step. Off: only Separate 1." checked={separateAll} onChange={onSeparateAll} />
        </div>
      </WorkspaceScope>;
      default: return <>
        <Facts rows={[['Version', '1.0.0 · tablet preview'], ['Engine', '0.9.4'], ['Protocol', '12'], ['SQLite', '3.46']]} />
        <Row selected={false} title="Open source licences" sub="Libraries this app is built with" end={<ChevronRight size={17} />} onClick={() => notify('Licences (prototype)')} />
        {unlocked && <Row selected={false} mark={<Bug size={20} />} title="Developer options" sub="For checking game data" end={<ChevronRight size={17} />} onClick={() => setSettingsSection('developer')} />}
        {unlocked && <Row selected={false} mark={<SquareTerminal size={20} />} title="Debug" sub={DEBUG_SUBTITLE} label={`Debug, ${DEBUG_SUBTITLE}, debug build`} end={<span className="tb-row-end-inline"><MobileChip tone="neutral">Debug build</MobileChip><ChevronRight size={17} /></span>} onClick={() => setSettingsSection('debug')} />}
        <p className="tb-note"><Info size={15} />Game data and rosters stay on this device.</p>
      </>;
    }
  })();
  // DEC-050: no title row; the rail shows the page. Section pages keep their own heading (and Back when they open over the list).
  return <div className="tb-page">
    {searchable ? <TabletToolbar title="Settings" input={env.input} search={<SettingsSearchField query={query} onQuery={q => { setQuery(q); if (q.trim()) setOpen(false); }} />} /> : <PageTitle>Settings</PageTitle>}
    <ListDetail env={env} label="Settings" open={open} onClose={() => setOpen(false)}
      list={searchable && query.trim() ? <div className="tb-list scroll"><SettingsResults platform="tablet" query={query} developerUnlocked={session.state === 'search-developer'} onClear={() => setQuery('')} /></div>
        : <div className="tb-list scroll">{sections.map(s => <Row key={s.id} selected={s.id === current.id} mark={<s.icon size={20} />} title={s.label} sub={s.sub} end={<ChevronRight size={17} />} onClick={() => { setSettingsSection(s.id); setOpen(true); }} />)}</div>}
      detail={subPage ? <>{backToAbout}<div className="tb-detail-title"><span><h2>{subPage.label}</h2><small>{subPage.sub}</small></span></div>{subPageBody}</>
        : <><div className="tb-detail-title"><span><h2>{current.label}</h2><small>{current.sub}</small></span></div>{page}</>} />
  </div>;
}
