import { useState } from 'react';
import { PointsLine, RosterSummary, SummaryToggle } from '../workspace/RosterSummary';
import { CatalogueRow, type CatalogueEntry } from './DesktopCatalogueRow';
import type { CatalogueState } from './DesktopEditorFlows';
import { SourceStatus, sourceStatusText, type SourceStatusKind } from './DesktopSourceFlows';

/** DD-18: freely edited roster limits alongside the data configuration's separate allowance. */
export function DesktopLimitElements() {
  const [override, setOverride] = useState(2055);
  const [open, setOpen] = useState(true);
  const limit = override || 2000;
  return <section className="dt-app ux-screen dark dt-limit-elements" aria-label="Custom limit and configuration warning">
    <div className="dt-limit-example-chrome"><SummaryToggle total={2055} limit={limit} configurationLimit={2000} open={open} onToggle={() => setOpen(value => !value)} /><PointsLine total={2055} limit={limit} configurationLimit={2000} /></div>
    {open && <RosterSummary name="Example roster" faction="Example faction" force="Main force" total={2055} limit={limit} configurationLimit={2000} customLimit issueCount={1} onLimit={setOverride} onShowIssues={() => {}} data={{ name: 'Example data', version: 'v1', onClick: () => {} }} actions={[]} />}
    <p className="dt-limit-example-hint">The data rule remains an error. Change the roster limit to see the warning above, at or below the 2,000 pts allowance. Custom accepts any positive value.</p>
  </section>;
}

/**
 * R0-08 (DEC-054): catalogue row states. Name and price keep full contrast in every state. A reached limit shows the quota
 * chip and an unavailable (dashed) Add that stays focusable and explains the limit; adds-over-limit and other unavailable
 * reasons keep the DEC-050 icon-only state chip. Hover or focus a row to see its explanation.
 */
export function DesktopCatalogueStateElements({ light = false }: { light?: boolean }) {
  const rows: Array<{ entry: CatalogueEntry; state: CatalogueState | null; open?: boolean }> = [
    { entry: { name: 'Line Infantry', role: 'Core', models: 10, points: 120, weapon: 'Service rifle' }, state: null },
    { entry: { name: 'Support Battery', role: 'Support', models: 3, points: 180, weapon: 'Field cannon' }, state: { tone: 'warn', caption: 'Adds over limit', reason: 'Slot full' } },
    { entry: { name: 'Patrol Walker', role: 'Support', models: 1, points: 145, weapon: 'Twin autocannon' }, state: { tone: 'err', caption: 'Unavailable', reason: 'Not allowed in a Patrol' } },
    { entry: { name: 'Force Commander', role: 'Command', models: 1, points: 90, weapon: 'Command blade' }, state: { tone: 'err', caption: 'Limit reached', reason: 'Limit reached: 1 of 1 selected. Remove the existing unit before adding another.', limit: { selected: 1, max: 1 } }, open: true },
  ];
  return <section className={`dt-app ux-screen ${light ? 'light' : 'dark'} dt-limit-elements dtc-elements`} aria-label={`Catalogue row states, ${light ? 'light' : 'dark'}`}>
    <aside className="dt-catalogue"><div className="dt-catalogue-list"><section><h3>Catalogue rows<span>{rows.length}</span></h3>
      {rows.map(r => <CatalogueRow key={r.entry.name} entry={r.entry} state={r.state} hintOpen={!!r.open && !light} onAdd={() => {}} />)}
    </section></div></aside>
    <p className="dt-limit-example-hint">Available · Adds over limit · Unavailable for another reason · Limit reached (quota 1 / 1, unavailable Add, reason on hover, focus or press). Nothing is dimmed.</p>
  </section>;
}

/** R0-08 (DEC-054): compact source status icons; the caption is the hint bubble on hover or focus (Update is shown open). */
export function DesktopSourceStatusElements({ light = false }: { light?: boolean }) {
  const kinds: Array<{ kind: SourceStatusKind; percent?: number }> = [{ kind: 'update' }, { kind: 'updating', percent: 42 }, { kind: 'installing', percent: 8 }, { kind: 'needs-you' }, { kind: 'failed' }, { kind: 'review' }, { kind: 'ready' }, { kind: 'file' }];
  const source = { name: 'Open Field', next: 'v1.5' };
  return <section className={`dt-app ux-screen ${light ? 'light' : 'dark'} dt-limit-elements dts-status-elements`} aria-label={`Source status icons, ${light ? 'light' : 'dark'}`}>
    <div className="dts-status-grid">{kinds.map(k => <div key={k.kind} className="dts-status-sample"><SourceStatus kind={k.kind} source={source} percent={k.percent} open={k.kind === 'update' && !light} onAction={() => {}} /><small>{sourceStatusText(k.kind, source, k.percent)}</small></div>)}</div>
  </section>;
}
