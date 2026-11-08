import { useState, type ReactNode } from 'react';
import { Star } from 'lucide-react';
import './stars.css';

/*
 * R2-03 (F4c, approved 2026-11-08, DEC-051): starred entries. Synthetic names only (DEC-001).
 * - A star button before the name on every row of the faction picker (New roster), the Add force sheet or dialog and the
 *   unit catalogue. Outline (muted) = not starred; filled in the accent colour = starred (never the warning amber, which
 *   means Slot full).
 * - Touch (phone, tablet): always visible, a 20 px icon in a 44 pt target. Pointer (desktop): the outline star shows only on
 *   the hovered or keyboard-focused row; filled stars always show.
 * - Units: a Starred group at the top of the catalogue (accent heading with a star glyph and the count); starred rows are not
 *   repeated in their role group and keep their state. Factions and forces: starred rows first, then a divider, the rest.
 * - Kept per faction: unit and force stars per catalogue, faction stars per game system. A device preference (survives a
 *   restart, not in the roster file, not an Undo step). Stale stars are ignored silently and kept.
 * - Accessibility: the button reads "Star {name}" / "Unstar {name}" with its pressed state; screen readers announce Starred.
 */

/** The star toggle. `pointer`: the desktop variant (smaller, the outline shows on row hover or focus only). */
export function StarButton({ name, on, onToggle, pointer = false, forceShown = false, className = '' }: {
  name: string; on: boolean; onToggle?: () => void;
  pointer?: boolean;
  /** Gallery: draw the outline star as if the row were hovered or focused (desktop). */
  forceShown?: boolean;
  className?: string;
}) {
  return <button type="button" className={`ws-star ${on ? 'on' : ''} ${pointer ? 'pointer' : 'touch'} ${forceShown ? 'shown' : ''} ${className}`.trim()}
    aria-pressed={on} aria-label={on ? `Unstar ${name}` : `Star ${name}`} title={pointer ? (on ? 'Unstar' : 'Star') : undefined}
    onClick={e => { e.stopPropagation(); onToggle?.(); }} onPointerDown={e => e.stopPropagation()}>
    <Star size={pointer ? 16 : 20} fill={on ? 'currentColor' : 'none'} strokeWidth={1.9} aria-hidden="true" />
  </button>;
}

/** The Starred group heading's content: the filled star glyph, "Starred" and the count (inside the platform's heading). */
export function StarredHeadingContent({ count, glyph = 12 }: { count: number; glyph?: number }) {
  return <><span className="ws-starred-label"><Star size={glyph} fill="currentColor" aria-hidden="true" />Starred</span><span>{count}</span></>;
}

/** The divider between starred factions or forces and the rest. */
export function StarDivider() {
  return <div className="ws-star-divider" role="separator" aria-hidden="true" />;
}

/** A choice row (a button) with the star before its name: the star sits over the row's start, outside the row's own button. */
export function StarRow({ name, on, onToggle, pointer = false, forceShown = false, className = '', children }: {
  name: string; on: boolean; onToggle?: () => void; pointer?: boolean; forceShown?: boolean; className?: string; children: ReactNode;
}) {
  return <div className={`ws-star-row ${pointer ? 'pointer' : 'touch'} ${forceShown ? 'shown' : ''} ${className}`.trim()}>
    <StarButton name={name} on={on} onToggle={onToggle} pointer={pointer} forceShown={forceShown} />
    {children}
  </div>;
}

/** Starred rows first (in the data's order), then the rest; stars of entries no longer in the list are ignored and kept. */
export function starredFirst<T>(items: readonly T[], key: (item: T) => string, stars: readonly string[]) {
  const starred = items.filter(item => stars.includes(key(item)));
  const rest = items.filter(item => !stars.includes(key(item)));
  return { starred, rest };
}

/** The gallery's star state: a set of names toggled in place (the app keeps it on the device, per faction). */
export function useStars(initial: readonly string[] = []) {
  const [stars, setStars] = useState<string[]>([...initial]);
  const toggle = (name: string) => setStars(current => current.includes(name) ? current.filter(n => n !== name) : [...current, name]);
  return { stars, toggle, isStarred: (name: string) => stars.includes(name) };
}
