import { useState, type ReactNode } from 'react';
import { Check, ChevronRight, Database, FolderOpen, HardDrive, Info, Keyboard, Languages, Layers3, Palette, Upload } from 'lucide-react';
import type { ColorScheme } from '../../types';
import { Segmented, Switch } from '../workspace/Primitives';
import { colourSchemes } from '../desktop/desktopData';
import { defaultBindings, formatCombo, keyActions } from '../desktop/desktopKeys';
import { Facts, ListDetail, Row, WorkspaceScope, type SessionProps } from './TabletPieces';

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
  { id: 'about', label: 'About', sub: 'Version and licences', icon: Info },
] as const;

const Group = ({ title, children }: { title?: string; children: ReactNode }) => <section className="tb-section">{title && <span className="ux-result-label">{title}</span>}{children}</section>;

export function TabletSettings({ env, notify, session, themePref, scheme, onTheme, onScheme }: SessionProps & { themePref: ThemePref; scheme: ColorScheme; onTheme: (t: ThemePref) => void; onScheme: (s: ColorScheme) => void }) {
  const { light, advancedInstall, setAdvancedInstall, settingsSection, setSettingsSection, language, setLanguage, setAppearanceImport } = session;
  const [open, setOpen] = useState(settingsSection !== undefined);
  const [limit, setLimit] = useState(1000);
  const [toggles, setToggles] = useState({ rememberSections: true, reopenLast: true, autoChecks: true });
  const [keep, setKeep] = useState(1);
  const flip = (key: keyof typeof toggles) => (v: boolean) => setToggles(t => ({ ...t, [key]: v }));
  const current = sections.find(s => s.id === (settingsSection ?? 'appearance')) ?? sections[0];
  const page = (() => {
    switch (current.id) {
      case 'appearance': return <>
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
        <div className="ux-src-group tb-switches"><Switch label="Remember option sections" detail="Folded option sections stay folded the next time you open a unit." checked={toggles.rememberSections} onChange={flip('rememberSections')} /><Switch label="Reopen the last roster on launch" detail="The roster you were editing opens again when the app starts." checked={toggles.reopenLast} onChange={flip('reopenLast')} /></div>
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
        <p className="tb-note"><Keyboard size={15} /><span>These shortcuts work with a hardware keyboard. On iPad hold ⌘ to see them anywhere; on Android press Ctrl + /. The key bindings editor is part of the desktop app.</span></p>
        {(['General', 'Roster editor'] as const).map(group => <Group key={group} title={group}><div className="ux-src-group">{keyActions.filter(a => a.group === group).map(a => <div className="ux-src-kv tb-key-row" key={a.id}><span>{a.label}</span><kbd className="tb-kbd">{formatCombo(defaultBindings[a.id])}</kbd></div>)}</div></Group>)}
      </>;
      default: return <>
        <Facts rows={[['Version', '1.0.0 · tablet preview'], ['Engine', '0.9.4'], ['Protocol', '12'], ['SQLite', '3.46']]} />
        <Row selected={false} title="Open source licences" sub="Libraries this app is built with" end={<ChevronRight size={17} />} onClick={() => notify('Licences (prototype)')} />
        <p className="tb-note"><Info size={15} />Game data and rosters stay on this device.</p>
      </>;
    }
  })();
  return <div className="tb-page">
    <ListDetail env={env} label="Settings" open={open} onClose={() => setOpen(false)}
      list={<div className="tb-list scroll">{sections.map(s => <Row key={s.id} selected={s.id === current.id} mark={<s.icon size={20} />} title={s.label} sub={s.sub} end={<ChevronRight size={17} />} onClick={() => { setSettingsSection(s.id); setOpen(true); }} />)}</div>}
      detail={<><div className="tb-detail-title"><span><h2>{current.label}</h2><small>{current.sub}</small></span></div>{page}</>} />
  </div>;
}
