import { useEffect, useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { StateChip } from '../workspace/StateChip';
import type { CatalogueState } from './DesktopEditorFlows';
import { StarButton } from '../workspace/Stars';

export type CatalogueEntry = { name: string; role: string; models: number; points: number; weapon: string };

/**
 * One desktop catalogue row (DEC-050, revised by R0-08 / DEC-054). The row's Add button covers the row.
 * - Available: name, models · weapon, price and +.
 * - Adds over limit / other unavailable reasons: the icon-only state chip (caption on hover or focus) and the reason line.
 * - Limit reached: a quota chip "1 / 1" on the meta line (the name keeps the row's width) and an unavailable Add (dashed +). The button stays focusable (aria-disabled);
 *   hover, focus or a press explains the limit. Name and price are never dimmed (text keeps >= 4.5:1).
 */
/**
 * R2-03 (F4c, approved 2026-11-08): `star` puts the star before the name, its own Tab stop before the row's Add. The outline
 * star shows only on the hovered or keyboard-focused row (the slot stays, so names line up); a filled star always shows.
 * `hovered`: the gallery draws this row as hovered with its star focused.
 */
export function CatalogueRow({ entry, state, onAdd, hintOpen = false, star, hovered = false }: { entry: CatalogueEntry; state: CatalogueState | null; onAdd: () => void; hintOpen?: boolean; star?: { on: boolean; onToggle: () => void }; hovered?: boolean }) {
  const [hint, setHint] = useState(hintOpen);
  const id = useId();
  useEffect(() => { setHint(hintOpen); }, [hintOpen]);
  const unavailable = state?.tone === 'err';
  const limit = state?.limit;
  const models = <small>{entry.models} {entry.models === 1 ? 'model' : 'models'}<span className="dt-wide-only"> · {entry.weapon}</span></small>;
  const label = limit ? `Add ${entry.name}: unavailable. ${limit.selected} selected, maximum ${limit.max}. ${state.reason}` : `Add ${entry.name}${state ? `, ${state.caption}, ${state.reason}` : ''}`;
  return <div data-cat-entry={entry.name} className={`dt-catalogue-unit ${state?.tone ?? ''} ${unavailable ? 'unavailable' : ''} ${limit ? 'limit' : ''} ${star ? 'with-star' : ''} ${hovered ? 'hovered' : ''}`}>
    {star && <StarButton pointer name={entry.name} on={star.on} onToggle={star.onToggle} forceShown={hovered} />}
    <button type="button" className="dt-catalogue-add" aria-disabled={unavailable || undefined} aria-label={label} aria-describedby={limit && hint ? id : undefined}
      onClick={() => { if (limit) setHint(v => !v); else if (!unavailable) onAdd(); }}
      onPointerEnter={() => limit && setHint(true)} onPointerLeave={() => limit && !hintOpen && setHint(false)}
      onFocus={() => limit && setHint(true)} onBlur={() => limit && !hintOpen && setHint(false)}
      onKeyDown={e => { if (e.key === 'Escape' && hint && !hintOpen) { e.stopPropagation(); setHint(false); } }}>
      <span><strong>{entry.name}</strong>{state && !limit ? <small className="dt-catalogue-reason">{state.reason}</small> : limit ? <span className="dtc-meta"><span className="dtc-quota" role="img" aria-label={`${limit.selected} selected, maximum ${limit.max}`}>{limit.selected} / {limit.max}</span>{models}</span> : models}</span>
    </button>
    {state && !limit && <StateChip tone={state.tone} caption={state.caption} input="pointer" open={hintOpen} />}
    <span className="dt-catalogue-price" aria-hidden="true">{entry.points}{limit || unavailable ? <i className="dtc-add-off"><Plus size={13} /></i> : <Plus size={15} />}</span>
    {limit && hint && <span id={id} role="tooltip" className="tb-hint-bubble dtc-limit-bubble">Limit reached: {limit.selected} of {limit.max} selected.<small>Remove the existing unit before adding another.</small></span>}
  </div>;
}
