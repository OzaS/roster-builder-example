import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import './workspace.css';

// DEC-054 (R0-08): a catalogue entry whose limit is reached keeps its name and price fully readable (no dimming). The state is a
// quota chip ("1 / 1": selected / maximum) and an unavailable Add button: visibly disabled, still focusable and pressable, and a
// press explains the reason in the hint bubble. Shared by the tablet and desktop catalogues (the phone Add unit sheet has its own row).

export const limitReason = (selected: number, max: number) => `Limit reached: ${selected} of ${max} selected. Remove the existing unit before adding another.`;

/** "1 / 1": how many are selected of the maximum. Not a control; the accessible text says it in words. */
export function QuotaChip({ selected, max }: { selected: number; max: number }) {
  return <span className={`ws-quota-chip ${selected >= max ? 'full' : ''}`} role="img" aria-label={`${selected} selected, maximum ${max}`}>{selected} / {max}</span>;
}

/**
 * The unavailable Add button. `aria-disabled`, not `disabled`, so it stays in the focus order and can explain itself: a press (or,
 * with a pointer, hover and focus) shows the reason in the hint bubble. `open` forces the bubble (gallery state) or lets the row
 * show it when its own target is pressed; `onPress` toggles it there.
 */
export function LimitAddButton({ name, points, selected, max, input, open = false, onPress, side = 'below' }: {
  name: string; points: number; selected: number; max: number; input: 'touch' | 'pointer'; open?: boolean; onPress?: () => void; side?: 'left' | 'top' | 'below';
}) {
  const [hover, setHover] = useState(false);
  const id = useId();
  const shown = open || hover;
  return <span className="tb-hint-wrap ws-limit-add-wrap">
    <button type="button" className={`ws-limit-add ${shown ? 'open' : ''}`} aria-disabled="true" aria-describedby={shown ? id : undefined}
      aria-label={`Add ${name}, ${points} points. Unavailable: limit reached, ${selected} of ${max} selected`}
      onClick={event => { event.stopPropagation(); onPress?.(); }}
      onPointerEnter={() => { if (input === 'pointer') setHover(true); }} onPointerLeave={() => setHover(false)}
      onFocus={event => { if (input === 'pointer' || event.currentTarget.matches(':focus-visible')) setHover(true); }} onBlur={() => setHover(false)}
      onKeyDown={event => { if (event.key === 'Escape' && shown) { event.stopPropagation(); setHover(false); if (open) onPress?.(); } }}>
      <i aria-hidden="true"><Plus size={18} /></i>
    </button>
    {shown && <span id={id} role="tooltip" className={`tb-hint-bubble ws-chip-bubble ws-limit-bubble ${side}`}>{limitReason(selected, max)}</span>}
  </span>;
}
