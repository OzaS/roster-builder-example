import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AlertTriangle, ArrowDown, ArrowRightLeft, ArrowUp, ArrowUpCircle, Check, ChevronRight, FileArchive, FlaskConical, GripVertical, Info, Languages, Link2, OctagonAlert, Plus, RotateCcw, Shuffle, Type, Wrench } from 'lucide-react';
import { BASE, GROUP_NOTE, INSTALL_SAMPLE, MISSING_ONLY, NEEDS_SAMPLE, ORDER_NOTE, REVIEW_ACTIONS, REVIEW_ADDONS, REVIEW_DATA, REVIEW_MISSING, REVIEW_ROSTER, REVIEW_SELECTIONS, ROSTER_LAYERS, RULES_SAMPLE, layerMeta, type CheckState, type Layer, type ReviewLine } from './layersData';
import './layers.css';

// A3 host UI (Next track, Proposal): the pieces phone, tablet and desktop share. Each platform puts them in its own chrome
// (phone page and sheets, tablet list/detail and sheets, desktop page and dialogs). Rows follow the Next look: open list,
// no dividers, a status edge per row (green in use, grey off, amber needs something, red not usable, accent changed).

export type LayerPlatform = 'phone' | 'tablet' | 'desktop';
export const btnClass = (p: LayerPlatform, tone: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary') =>
  p === 'desktop' ? `dtp-btn ${tone === 'primary' ? 'primary' : tone === 'danger' ? 'danger' : ''} lyr-btn` : `ux-job-btn ${tone === 'primary' ? 'primary' : tone === 'danger' ? 'destructive' : tone === 'ghost' ? 'ux-src-ghost' : ''} lyr-btn`;

type Tone = 'ok' | 'off' | 'warn' | 'err' | 'info';
const layerTone = (l: Layer): Tone => l.problem ? (l.problem.code === 'moved' ? 'info' : l.problem.code === 'requirement' ? 'warn' : 'err') : l.enabled ? 'ok' : 'off';
const kindIcon = (l: Layer) => l.purpose === 'locale' ? <Languages size={15} /> : l.kind === 'addon' ? <Type size={15} /> : l.test ? <FlaskConical size={15} /> : <Wrench size={15} />;

export function TestMark() {
  return <span className="lyr-test" title="Test data: rosters built with it are marked Test"><FlaskConical size={12} aria-hidden />Test</span>;
}

export function LayerSwitch({ on, label, disabled, reason, onChange }: { on: boolean; label: string; disabled?: boolean; reason?: string; onChange?: (on: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} title={disabled ? reason : `${on ? 'Turn off' : 'Turn on'} ${label}`} disabled={disabled} className={`lyr-switch ${on ? 'on' : ''}`} onClick={() => onChange?.(!on)}><i aria-hidden /></button>;
}

/** One layer: kind glyph, title (Test mark), purpose · version · where from, the patch report, the enabled switch; a problem in words with its fix. */
export function LayerRow({ layer, platform, onToggle, onOpen, selected, onFix }: { layer: Layer; platform: LayerPlatform; onToggle?: (on: boolean) => void; onOpen?: () => void; selected?: boolean; onFix?: () => void }) {
  const p = layer.problem;
  const blocked = p && (p.code === 'requirement' || p.code === 'changes-rules');
  return <div className={`lyr-row ${selected ? 'selected' : ''} ${layer.enabled ? '' : 'off'}`} data-tone={layerTone(layer)}>
    <span className="lyr-edge" aria-hidden />
    <button type="button" className="lyr-row-main" onClick={onOpen} aria-label={`${layer.title}, ${layer.enabled ? 'on' : 'off'}. Show details`}>
      <span className="lyr-kind" aria-hidden>{kindIcon(layer)}</span>
      <span className="lyr-text">
        <strong>{layer.title}{layer.test ? <TestMark /> : null}</strong>
        <small>{layerMeta(layer, platform === 'desktop')}</small>
        <small className="lyr-report">{layer.report}</small>
      </span>
    </button>
    <LayerSwitch on={layer.enabled} label={layer.title} disabled={!!blocked} reason={p?.title} onChange={onToggle} />
    {p ? <div className={`lyr-problem ${p.code}`} role={p.code === 'moved' ? undefined : 'status'}>
      {p.code === 'moved' ? <Shuffle size={15} aria-hidden /> : p.code === 'requirement' ? <AlertTriangle size={15} aria-hidden /> : <OctagonAlert size={15} aria-hidden />}
      <span><strong>{p.title}</strong><small>{p.detail}</small></span>
      {p.fix ? <button type="button" className={btnClass(platform, p.code === 'order' ? 'primary' : 'secondary')} onClick={onFix}>{p.fix}</button> : null}
    </div> : null}
  </div>;
}

export function GroupHead({ title, count, note, action }: { title: string; count: number; note: string; action?: ReactNode }) {
  return <div className="lyr-group-head"><span><strong>{title}<em>{count}</em></strong><small>{note}</small></span>{action}</div>;
}

/** Add-ons and variants as two groups under the base, each in its own order (later wins). */
export function LayerGroups({ platform, addons, variants, onEditOrder, onOpen, selectedId, onAdd, notify }: {
  platform: LayerPlatform; addons: Layer[]; variants: Layer[]; onEditOrder?: (group: 'addon' | 'variant') => void; onOpen?: (l: Layer) => void; selectedId?: string; onAdd?: () => void; notify?: (m: string) => void;
}) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const view = (l: Layer): Layer => (on[l.id] === undefined ? l : { ...l, enabled: on[l.id], report: on[l.id] ? l.report : 'Off' });
  const toggle = (l: Layer, v: boolean) => { setOn(s => ({ ...s, [l.id]: v })); notify?.(`${l.title} ${v ? 'on' : 'off'}${l.kind === 'variant' ? ' · rosters on Open Field will ask for review' : ''}`); };
  const editOrder = (g: 'addon' | 'variant') => onEditOrder ? <button type="button" className={`lyr-link ${platform}`} onClick={() => onEditOrder(g)}>Edit order</button> : null;
  return <div className={`lyr lyr-${platform} lyr-groups`}>
    <section className="lyr-group" aria-label="Variants">
      <GroupHead title="Variants" count={variants.length} note={GROUP_NOTE.variant} action={variants.length > 1 ? editOrder('variant') : null} />
      {variants.map(l => <LayerRow key={l.id} layer={view(l)} platform={platform} selected={selectedId === l.id} onOpen={() => onOpen?.(l)} onToggle={v => toggle(l, v)} onFix={() => notify?.(l.problem?.fix ?? '')} />)}
    </section>
    <section className="lyr-group" aria-label="Add-ons">
      <GroupHead title="Add-ons" count={addons.length} note={GROUP_NOTE.addon} action={addons.length > 1 ? editOrder('addon') : null} />
      {addons.map(l => <LayerRow key={l.id} layer={view(l)} platform={platform} selected={selectedId === l.id} onOpen={() => onOpen?.(l)} onToggle={v => toggle(l, v)} onFix={() => notify?.(l.problem?.fix ?? '')} />)}
    </section>
    <button type="button" className="lyr-add-row" onClick={onAdd}><span className="lyr-add-icon" aria-hidden><Plus size={18} /></span><span className="lyr-text"><strong>Add an add-on or variant</strong><small>A file on this device, or a link</small></span><ChevronRight size={16} aria-hidden /></button>
  </div>;
}

/** The summary of a problem stack at the top of the base: one line per problem, so it's seen before the list. */
export function StackProblems({ platform, count }: { platform: LayerPlatform; count: number }) {
  return <div className={`lyr lyr-${platform} lyr-banner err`} role="status"><OctagonAlert size={18} aria-hidden /><span><strong>{count} problems with add-ons and variants</strong><small>Variants are not used until the order is fixed. Each problem below says how to fix it.</small></span></div>;
}

// ------------------------------------------------------------- order

/** `house` builds on `errata`: the sample's order rule (a `layer-order` conflict when house comes first). */
const conflictOf = (ids: string[]) => ids.indexOf('house') >= 0 && ids.indexOf('errata') > ids.indexOf('house') ? 'house' : null;

/**
 * Edit order. Touch: Move up / Move down buttons on each row and a drag handle (press and drag). Desktop: drag by the handle,
 * or focus a row and press Alt+↑ / Alt+↓ (Move up / Move down are also in the row's context menu). The list shows the
 * conflict live and Done says why it is unavailable.
 */
export function OrderEditor({ platform, layers, initial, dragging, onDone, onCancel }: { platform: LayerPlatform; layers: Layer[]; initial?: string[]; dragging?: string; onDone?: () => void; onCancel?: () => void }) {
  const [ids, setIds] = useState<string[]>(initial ?? layers.map(l => l.id));
  const [dragId, setDragId] = useState<string | null>(dragging ?? null);
  const [over, setOver] = useState<number | null>(dragging ? 1 : null);
  const [said, setSaid] = useState('');
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const byId = Object.fromEntries(layers.map(l => [l.id, l]));
  const conflict = conflictOf(ids);
  const move = (id: string, by: number) => setIds(list => {
    const i = list.indexOf(id), j = i + by;
    if (j < 0 || j >= list.length) return list;
    const next = [...list]; next.splice(i, 1); next.splice(j, 0, id);
    setSaid(`${byId[id].title} moved to position ${j + 1} of ${list.length}`);
    window.requestAnimationFrame(() => refs.current[id]?.focus());
    return next;
  });
  const key = (e: KeyboardEvent, id: string) => { if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); move(id, e.key === 'ArrowUp' ? -1 : 1); } };
  const drop = (to: number) => { if (!dragId) return; setIds(list => { const next = list.filter(x => x !== dragId); next.splice(to > list.indexOf(dragId) ? to - 1 : to, 0, dragId); return next; }); setDragId(null); setOver(null); };
  const automatic = ids.join() === layers.map(l => l.id).join();
  return <div className={`lyr lyr-${platform} lyr-order`}>
    <p className="lyr-order-note"><Info size={15} aria-hidden /><span>{ORDER_NOTE} {platform === 'desktop' ? 'Drag by the handle, or focus a row and press Alt+↑ or Alt+↓.' : 'Drag by the handle or use the arrows.'}</span></p>
    <div className="lyr-order-list" role="list" aria-label="Variant order, first to last">
      {ids.map((id, i) => {
        const l = byId[id];
        const bad = conflict === id;
        return <div key={id} role="listitem" className="lyr-order-slot">
          {over === i && dragId ? <span className="lyr-drop-line" aria-hidden /> : null}
          <div ref={el => { refs.current[id] = el; }} tabIndex={0} className={`lyr-order-row ${dragId === id ? 'lifted' : ''} ${bad ? 'bad' : ''}`} data-tone={bad ? 'err' : l.enabled ? 'ok' : 'off'}
            aria-label={`${l.title}, position ${i + 1} of ${ids.length}${bad ? ', must come after Errata 2026' : ''}`} onKeyDown={e => key(e, id)}
            draggable={platform === 'desktop'} onDragStart={() => setDragId(id)} onDragEnd={() => { setDragId(null); setOver(null); }}
            onDragOver={e => { e.preventDefault(); setOver(i); }} onDrop={() => drop(i)}>
            <span className="lyr-edge" aria-hidden />
            <span className="lyr-handle" aria-hidden title="Drag to reorder"><GripVertical size={18} /></span>
            <span className="lyr-pos" aria-hidden>{i + 1}</span>
            <span className="lyr-text"><strong>{l.title}{l.test ? <TestMark /> : null}</strong><small>{bad ? 'Must come after Errata 2026: it builds on an entry the errata adds' : layerMetaShort(l)}</small></span>
            {platform !== 'desktop' ? <span className="lyr-order-btns">
              <button type="button" className="lyr-icon-btn" aria-label={`Move ${l.title} up`} disabled={i === 0} onClick={() => move(id, -1)}><ArrowUp size={18} /></button>
              <button type="button" className="lyr-icon-btn" aria-label={`Move ${l.title} down`} disabled={i === ids.length - 1} onClick={() => move(id, 1)}><ArrowDown size={18} /></button>
            </span> : <kbd className="lyr-kbd" aria-hidden>⌥↑↓</kbd>}
          </div>
        </div>;
      })}
      {over === ids.length && dragId ? <span className="lyr-drop-line" aria-hidden /> : null}
    </div>
    <p className="lyr-live" aria-live="polite">{said}</p>
    <div className="lyr-order-foot">
      <button type="button" className={btnClass(platform, 'ghost')} disabled={automatic} onClick={() => setIds(layers.map(l => l.id))} title={automatic ? 'Already in the automatic order' : 'Go back to the order the data asks for'}><RotateCcw size={15} />Automatic order</button>
      <span className="lyr-spacer" />
      <button type="button" className={btnClass(platform)} onClick={onCancel}>Cancel</button>
      <button type="button" className={btnClass(platform, 'primary')} disabled={!!conflict} onClick={onDone} title={conflict ? 'Fix the order first' : undefined}>Done</button>
    </div>
    {conflict ? <p className="lyr-why"><OctagonAlert size={14} aria-hidden />Done is unavailable: House rules: Skirmish must come after Errata 2026.</p> : null}
  </div>;
}
const layerMetaShort = (l: Layer) => `${l.kind === 'addon' ? 'Add-on' : 'Variant'} · ${l.version}`;

// ------------------------------------------------------------- install

/** Where a layer comes from (DEC-069: a file on this device first, a link second). */
export function InstallSource({ platform, link, onFile, onLink }: { platform: LayerPlatform; link?: string; onFile?: () => void; onLink?: () => void }) {
  const [value, setValue] = useState(link ?? '');
  return <div className={`lyr lyr-${platform} lyr-install-source`}>
    <button type="button" className="lyr-add-row primary" onClick={onFile}><span className="lyr-add-icon" aria-hidden><FileArchive size={18} /></span><span className="lyr-text"><strong>Choose a file on this device</strong><small>An archive or a folder with the add-on or variant</small></span><ChevronRight size={16} aria-hidden /></button>
    <form className="lyr-link-form" onSubmit={e => { e.preventDefault(); onLink?.(); }}>
      <label className="lyr-field"><span>Or paste a link</span><span className="lyr-field-box"><Link2 size={16} aria-hidden /><input value={value} onChange={e => setValue(e.target.value)} placeholder="https://github.com/owner/repository" inputMode="url" autoCapitalize="off" aria-label="Link to an add-on or variant" /></span></label>
      <button type="submit" className={btnClass(platform)} disabled={!value.trim()} title={value.trim() ? undefined : 'Paste a link first'}>Check link</button>
    </form>
    <p className="lyr-hint">The app reads the file first and tells you whether it fits {BASE.title} {BASE.version} before anything is added.</p>
  </div>;
}

type Sample = { file: string; size: string; title: string; kind: string; purpose: string; version: string; requires: string; licence?: string; report?: string };
const Facts = ({ s, fit }: { s: Sample; fit: ReactNode }) => <dl className="lyr-facts">
  <div><dt>Kind</dt><dd>{s.kind} · {s.purpose}</dd></div>
  <div><dt>Version</dt><dd>{s.version}</dd></div>
  <div><dt>Needs</dt><dd>{s.requires}{fit}</dd></div>
  {s.report ? <div><dt>Changes</dt><dd>{s.report}</dd></div> : null}
  <div><dt>Licence</dt><dd>{s.licence ?? 'Not stated'}</dd></div>
</dl>;

/** The requirement check, shown before anything is added: it fits, it needs a newer base, or it is refused. */
export function InstallCheck({ platform, state, onCancel, onAdd }: { platform: LayerPlatform; state: CheckState; onCancel?: () => void; onAdd?: () => void }) {
  if (state === 'fits') {
    const s = INSTALL_SAMPLE;
    return <div className={`lyr lyr-${platform} lyr-check`}>
      <p className="lyr-file"><FileArchive size={15} aria-hidden />{s.file} · {s.size}</p>
      <div className="lyr-verdict ok" role="status"><Check size={18} aria-hidden /><span><strong>Fits {BASE.title} {BASE.version}</strong><small>All 6 changes apply. It is turned on when added and goes last among the variants.</small></span></div>
      <h3 className="lyr-check-title">{s.title}</h3>
      <Facts s={s} fit={<span className="lyr-fit ok"><Check size={13} aria-hidden />you have {BASE.version}</span>} />
      <p className="lyr-hint">Variants change rules, so your {BASE.rosters} rosters on {BASE.title} will ask for a review the next time they open.</p>
      <div className="lyr-actions"><button type="button" className={btnClass(platform)} onClick={onCancel}>Cancel</button><button type="button" className={btnClass(platform, 'primary')} onClick={onAdd}>Add variant</button></div>
    </div>;
  }
  if (state === 'needs') {
    const s = NEEDS_SAMPLE;
    return <div className={`lyr lyr-${platform} lyr-check`}>
      <p className="lyr-file"><FileArchive size={15} aria-hidden />{s.file} · {s.size}</p>
      <div className="lyr-verdict warn" role="status"><AlertTriangle size={18} aria-hidden /><span><strong>Needs {BASE.title} 1.5 or later</strong><small>You have {BASE.version}. {BASE.title} {BASE.next} is available; update it first and this variant is added after.</small></span></div>
      <h3 className="lyr-check-title">{s.title}</h3>
      <Facts s={s} fit={<span className="lyr-fit warn"><AlertTriangle size={13} aria-hidden />you have {BASE.version}</span>} />
      <div className="lyr-actions"><button type="button" className={btnClass(platform)} onClick={onCancel}>Cancel</button><button type="button" className={btnClass(platform, 'primary')} onClick={onAdd}><ArrowUpCircle size={15} />Update {BASE.title}, then add</button></div>
    </div>;
  }
  const s = RULES_SAMPLE;
  return <div className={`lyr lyr-${platform} lyr-check`}>
    <p className="lyr-file"><FileArchive size={15} aria-hidden />{s.file} · {s.size}</p>
    <div className="lyr-verdict err" role="alert"><OctagonAlert size={18} aria-hidden /><span><strong>Can’t be added: this add-on changes rules</strong><small>An add-on may only change text. This one changes costs in 3 places. Ask its author to publish it as a variant.</small></span></div>
    <h3 className="lyr-check-title">{s.title}</h3>
    <Facts s={s} fit={<span className="lyr-fit ok"><Check size={13} aria-hidden />you have {BASE.version}</span>} />
    <details className="lyr-details"><summary>What it changes</summary><ul><li>Cost of Lancers: 90 → 80</li><li>Cost of Scout Riders: 60 → 55</li><li>Cost of Field Gun: 120 → 110</li></ul></details>
    <div className="lyr-actions"><button type="button" className={btnClass(platform, 'primary')} onClick={onCancel}>Close</button></div>
  </div>;
}

// ------------------------------------------------------------- roster open review

const lineIcon = (t: ReviewLine['tone']) => t === 'missing' ? <OctagonAlert size={16} aria-hidden /> : t === 'err' ? <OctagonAlert size={16} aria-hidden /> : t === 'warn' ? <AlertTriangle size={16} aria-hidden /> : t === 'info' ? <Info size={16} aria-hidden /> : <ArrowRightLeft size={16} aria-hidden />;
export function ReviewLines({ platform, lines, onAction }: { platform: LayerPlatform; lines: ReviewLine[]; onAction?: (l: ReviewLine) => void }) {
  return <>{lines.map(l => <div key={l.title} className="lyr-review-line" data-tone={l.tone}>
    <span className="lyr-edge" aria-hidden />{lineIcon(l.tone)}
    <span className="lyr-text"><strong>{l.title}</strong>{l.detail ? <small>{l.detail}</small> : null}</span>
    {l.action ? <button type="button" className={btnClass(platform, l.tone === 'missing' ? 'primary' : 'secondary')} onClick={() => onAction?.(l)}>{l.action}</button> : null}
  </div>)}</>;
}

/** "This roster was saved with different data": what changed, what's missing, what happened to selections. */
export function RosterReview({ platform, variant, onOpen, onKeep, notify }: { platform: LayerPlatform; variant: 'full' | 'missing'; onOpen?: () => void; onKeep?: () => void; notify?: (m: string) => void }) {
  const act = (l: ReviewLine) => notify?.(l.action === 'Show in roster' ? `Opens the roster at ${l.title.split(':')[0]}` : `${l.action} (prototype)`);
  return <div className={`lyr lyr-${platform} lyr-review`}>
    <p className="lyr-review-lede">{variant === 'full' ? <>Saved {REVIEW_ROSTER.saved} with other versions of its data. Nothing is lost: selections that no longer fit are kept and marked.</> : <>Saved with a variant that isn’t installed. Its selections are kept unresolved until you install it.</>}</p>
    {variant === 'full' ? <>
      <section className="lyr-review-group" aria-label="Missing"><h3>Missing</h3><ReviewLines platform={platform} lines={[REVIEW_MISSING]} onAction={act} /></section>
      <section className="lyr-review-group" aria-label="Data"><h3>Data</h3><ReviewLines platform={platform} lines={REVIEW_DATA} /></section>
      <section className="lyr-review-group" aria-label="Selections"><h3>Selections</h3><ReviewLines platform={platform} lines={REVIEW_SELECTIONS} onAction={act} /></section>
      <section className="lyr-review-group" aria-label="Add-ons"><h3>Add-ons · no review needed</h3><ReviewLines platform={platform} lines={[REVIEW_ADDONS]} /></section>
    </> : <section className="lyr-review-group" aria-label="Missing"><h3>Missing</h3><ReviewLines platform={platform} lines={MISSING_ONLY} onAction={act} /><p className="lyr-hint">The roster names the variant but never carries its files. Ask whoever shared the roster for the file, or install it from where you got it.</p></section>}
    <p className="lyr-hint"><b>{REVIEW_ACTIONS.open}:</b> {variant === 'full' ? REVIEW_ACTIONS.openNote : 'Its 5 selections stay unresolved, cost 0, until the variant is back.'} <b>{REVIEW_ACTIONS.keep}:</b> {REVIEW_ACTIONS.keepNote}</p>
    <div className="lyr-review-actions">
      <button type="button" className={btnClass(platform)} onClick={onKeep}>{REVIEW_ACTIONS.keep}</button>
      <button type="button" className={btnClass(platform, 'primary')} onClick={onOpen}>{REVIEW_ACTIONS.open}</button>
    </div>
  </div>;
}

/** Title line of the review, for the platform's sheet or dialog header. */
export const REVIEW_TITLE = 'This roster was saved with different data';

// ------------------------------------------------------------- base update (4) and roster info (5)

/** On the update card: what the update does to the layers, before the user presses Update. */
export function UpdateImpact({ platform }: { platform: LayerPlatform }) {
  return <div className={`lyr lyr-${platform} lyr-impact`}>
    <h3>Add-ons and variants after this update</h3>
    <ReviewLines platform={platform} lines={[
      { tone: 'warn', title: 'House rules: Skirmish will be turned off', detail: `It needs ${BASE.title} 1.4 (any 1.4.x). It stays installed; turn it on again with a newer file.` },
      { tone: 'info', title: 'Errata 2026 keeps working', detail: '3 entries it changes moved in 1.5; it follows them.' },
      { tone: 'info', title: '3 more fit 1.5', detail: 'Rules text, German text, Playtest: new detachments' },
    ]} />
  </div>;
}

/** The layers a roster recorded (roster info), with the Test mark when a test variant was on. */
export function RosterLayers({ platform, test }: { platform: LayerPlatform; test?: boolean }) {
  return <div className={`lyr lyr-${platform} lyr-roster-layers`}>
    <dl className="lyr-facts">
      <div><dt>Game data</dt><dd>{ROSTER_LAYERS.base}</dd></div>
      <div><dt>Variants</dt><dd>{ROSTER_LAYERS.variants.map(v => <span key={v} className="lyr-dd-line">{v}</span>)}{test ? <span className="lyr-dd-line">Playtest: new detachments 0.2.0 <TestMark /></span> : null}</dd></div>
      <div><dt>Add-ons</dt><dd>{ROSTER_LAYERS.addons.map(v => <span key={v} className="lyr-dd-line">{v}</span>)}</dd></div>
    </dl>
    <p className="lyr-hint">Recorded when the roster was last saved. Shared rosters name these but don’t include their files.</p>
  </div>;
}
