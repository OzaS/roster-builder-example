import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Copy, Ellipsis, Pencil, Trash2, X } from "lucide-react";
import "./phone-names.css";

/*
 * R2-02 (F4b, approved 2026-11-07, DEC-051): names and the points limit on the phone. Synthetic names (DEC-001).
 * - Rename unit: the unit details ⋯ menu (and the tree row's unit menu, the same shared menu) lists Rename unit first, then
 *   Duplicate and Remove. It opens the one-field Rename sheet, the existing Rename roster sheet: the field is prefilled with the
 *   current name and selected, the hint says what an empty name does, a count up to 60, Cancel / Save. Save stays off while the
 *   name is unchanged; Enter saves; an empty name clears the custom name, so the entry name shows again. One Undo step.
 * - The roster bar's ⋯ menu adds Rename roster and Points limit…; the Points limit sheet lists app-core pointsLimit()'s choices
 *   (the tablet and desktop list) as the creation step's chips, Custom opens the numeric field, and "Use data limit" clears the
 *   override. A change applies at once (one Undo step). The configuration warning shows in the sheet and under the budget.
 */

const fmt = (n: number) => n.toLocaleString("en-US").replace(/,/g, " ");
export const pts = (n: number) => `${fmt(n)} pts`;
export const configurationWarning = (limit: number, allowance?: number) => allowance !== undefined && limit > allowance ? `The configuration allows ${pts(allowance)}` : undefined;

/** The one-field Rename sheet (roster or unit). `restores`: an empty name gives the unit its entry name back. */
export function PhoneRenameSheet({ title, label, value, restores, maxLength = 60, inline = false, initialDraft, onSave, onClose }: {
  title: string; label: string; value: string; restores?: string; maxLength?: number; inline?: boolean; initialDraft?: string;
  onSave?: (name: string) => void; onClose?: () => void;
}) {
  const [draft, setDraft] = useState(initialDraft ?? value);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { if (inline) return; field.current?.focus({ preventScroll: true }); if (initialDraft === undefined) field.current?.select(); }, [inline, initialDraft]);
  const name = draft.trim();
  const result = name || restores || "";
  const unchanged = result === value;
  const canSave = !unchanged && (name !== "" || restores !== undefined);
  const save = () => { if (canSave) onSave?.(name); };
  const sheet = (
    <section className={`ux-job-sheet ux-rn-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label={title}>
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head"><span><strong>{title}</strong></span></header>
      <label className="ux-rn-field">
        <span>{label}</span>
        <input ref={field} value={draft} maxLength={maxLength} enterKeyHint="done" aria-describedby="ux-rn-hint" onChange={(e) => setDraft(e.currentTarget.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onClose?.(); }} />
      </label>
      <p className="ux-rn-hint" id="ux-rn-hint">{restores !== undefined ? <span>Empty restores “{restores}”.</span> : <span />}<span className="ux-rn-count">{draft.length}/{maxLength}</span></p>
      <footer className="ux-job-footer"><button type="button" className="ux-job-btn" onClick={onClose}>Cancel</button><button type="button" className="ux-job-btn primary" disabled={!canSave} onClick={save}>Save</button></footer>
    </section>
  );
  return inline ? sheet : <div className="ux-job-scrim ux-rn-scrim" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>{sheet}</div>;
}

/** The configuration warning line: under the roster budget and in the Points limit sheet (the tablet and desktop string). */
export function LimitWarning({ text }: { text: string }) {
  return <p className="ux-limit-warning" role="status"><AlertTriangle size={14} />{text}</p>;
}

/** The phone Points limit sheet: pointsLimit()'s choices as chips with the current value selected, Custom, Use data limit. */
export function PhonePointsLimitSheet({ value, dataLimit, configurationLimit, presets = [500, 1000, 1500, 2000], inline = false, initialCustom = false, onPick, onClose }: {
  value: number; dataLimit?: number; configurationLimit?: number; presets?: number[]; inline?: boolean; initialCustom?: boolean;
  /** -1: use the data limit (or no limit when the data has none). */
  onPick?: (value: number) => void; onClose?: () => void;
}) {
  const [custom, setCustom] = useState(initialCustom);
  const [draft, setDraft] = useState(String(value > 0 ? value : ""));
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { if (custom && !inline) { field.current?.focus({ preventScroll: true }); field.current?.select(); } }, [custom, inline]);
  const values = [...new Set([...presets, ...(value > 0 ? [value] : []), ...(configurationLimit === undefined ? [] : [configurationLimit])])].sort((a, b) => a - b);
  const warning = value > 0 ? configurationWarning(value, configurationLimit) : undefined;
  const parsed = /^\d+$/.test(draft.trim()) ? Number(draft) : NaN;
  const sheet = (
    <section className={`ux-job-sheet ux-rn-sheet ux-pl-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label="Points limit">
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head"><span><strong>Points limit</strong></span><button type="button" className="ux-icon-btn" aria-label="Close" onClick={onClose}><X size={17} /></button></header>
      <div className="ux-filter-row ux-pl-chips" role="radiogroup" aria-label="Points limit">
        {values.map((v) => <button key={v} type="button" role="radio" aria-checked={!custom && v === value} className={`ux-filter-pill ${!custom && v === value ? "on" : ""}`} onClick={() => { setCustom(false); onPick?.(v); }}>{pts(v)}</button>)}
        <button type="button" role="radio" aria-checked={custom} className={`ux-filter-pill ${custom ? "on" : ""}`} onClick={() => setCustom(true)}>Custom</button>
        <button type="button" role="radio" aria-checked={!custom && value === -1} className={`ux-filter-pill ${!custom && value === -1 ? "on" : ""}`} onClick={() => { setCustom(false); onPick?.(-1); }}>{dataLimit === undefined ? "Unlimited" : `Use data limit (${pts(dataLimit)})`}</button>
      </div>
      {custom ? <form className="ux-pl-custom" onSubmit={(e) => { e.preventDefault(); if (parsed > 0) { onPick?.(parsed); setCustom(false); } }}>
        <label className="ux-custom-points"><input ref={field} value={draft} inputMode="numeric" aria-label="Custom points limit" onChange={(e) => setDraft(e.currentTarget.value.replace(/\D/g, "").slice(0, 6))} /><span>pts</span></label>
        <button type="submit" className="ux-job-btn primary" disabled={!(parsed > 0)}>Apply limit</button>
      </form> : null}
      {warning ? <LimitWarning text={warning} /> : null}
      <small className="ux-pl-note">Changes apply at once; one Undo step.</small>
    </section>
  );
  return inline ? sheet : <div className="ux-job-scrim ux-rn-scrim" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>{sheet}</div>;
}

/** The unit details ⋯ button and its menu: Rename unit first, then Duplicate and Remove (the shared unit menu). */
export function PhoneUnitMenu({ name, initialOpen = false, inline = false, onRename, onDuplicate, onRemove }: {
  name: string; initialOpen?: boolean; inline?: boolean; onRename?: () => void; onDuplicate?: () => void; onRemove?: () => void;
}) {
  const [open, setOpen] = useState(initialOpen || inline);
  const pick = (run?: () => void) => () => { if (!inline) setOpen(false); run?.(); };
  return (
    <div className={`ux-roster-more ux-unit-more ${inline ? "inline" : ""}`}>
      <button type="button" className="ux-icon-btn" aria-label={`Actions for ${name}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}><Ellipsis size={18} /></button>
      {open ? (
        <div className="ux-roster-more-menu" role="menu" aria-label={`Actions for ${name}`}>
          <button type="button" role="menuitem" onClick={pick(onRename)}><Pencil size={16} />Rename unit</button>
          <button type="button" role="menuitem" onClick={pick(onDuplicate)}><Copy size={16} />Duplicate</button>
          <button type="button" role="menuitem" className="destructive" onClick={pick(onRemove)}><Trash2 size={16} />Remove</button>
        </div>
      ) : null}
    </div>
  );
}
