import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { FORCE_TYPES, forceTypeBlocked, type Force } from '../desktop/DesktopEditorFlows';
import { TabletSheet } from './TabletSheet';

// The editor's form sheets (T1c): the desktop dialogs with the mobile controls inside. Synthetic data only (DEC-001).

const FACTIONS = ['Frontier Coalition', 'Free Cities', 'Northern Realms'];

/** Add force: faction, name and force type (types the roster cannot take say why). */
export function AddForceSheet({ forces, limit, faction, onAdd, onClose }: { forces: Force[]; limit: number; faction: string; onAdd: (force: Omit<Force, 'id'>) => void; onClose: () => void }) {
  const available = FORCE_TYPES.filter(t => !forceTypeBlocked(t, forces, limit));
  const [type, setType] = useState(available[0]?.name ?? '');
  const [chosenFaction, setFaction] = useState(faction);
  const [name, setName] = useState('');
  const suggested = `${type || 'New'} ${forces.filter(f => f.type === type).length + 1}`;
  return <TabletSheet title="Add force" sub={`Forces in this roster: ${forces.length}`} onClose={onClose}
    action={{ label: 'Add force', disabled: !type, onClick: () => onAdd({ name: name.trim() || suggested, type, faction: chosenFaction }) }}>
    <p className="tbs-hint">Each force has its own units and points.</p>
    <div className="tbs-field-row">
      <label className="tbs-field">Faction<select value={chosenFaction} onChange={e => setFaction(e.target.value)}>{FACTIONS.map(f => <option key={f}>{f}</option>)}</select></label>
      <label className="tbs-field">Name<input maxLength={40} placeholder={suggested} value={name} onChange={e => setName(e.target.value)} /></label>
    </div>
    <h3 className="tbs-label" id="tbs-force-type">Force type</h3>
    <div className="tbs-choices" role="radiogroup" aria-labelledby="tbs-force-type">
      {FORCE_TYPES.map(t => {
        const blocked = forceTypeBlocked(t, forces, limit);
        return <button type="button" role="radio" key={t.name} aria-checked={type === t.name} aria-disabled={!!blocked || undefined} className={`tbs-choice ${type === t.name ? 'active' : ''}`} data-autofocus={type === t.name ? true : undefined}
          onClick={() => { if (!blocked) setType(t.name); }}>
          <span><strong>{t.name}</strong><small>{t.detail}</small>{blocked && <small className="reason"><Lock size={13} />{blocked}</small>}</span>{type === t.name && <Check size={20} />}
        </button>;
      })}
    </div>
    <p className="tbs-hint">Leave the name empty to use “{suggested}”.</p>
  </TabletSheet>;
}

/** One text field: rename the roster or a force. Enter saves; Save stays off while the name is empty or unchanged. */
export function RenameSheet({ title, label, value, maxLength = 60, hint, onSave, onClose }: { title: string; label: string; value: string; maxLength?: number; hint?: string; onSave: (name: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  const name = draft.trim();
  return <TabletSheet title={title} onClose={onClose} action={{ label: 'Save', disabled: !name || name === value, onClick: () => onSave(name) }}>
    <label className="tbs-field">{label}<input data-autofocus maxLength={maxLength} value={draft} onChange={e => setDraft(e.target.value)} onFocus={e => e.currentTarget.select()} /><span className="tbs-count">{draft.length} / {maxLength}</span></label>
    {hint && <p className="tbs-hint">{hint}</p>}
  </TabletSheet>;
}
