import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './workspace.css';

// Small controls shared by the desktop and tablet workspaces. Platform-neutral: every action comes in as a prop.

/** Page actions render into a slot in the window chrome next to the tabs (the slot is the host's element). */
export function PageActions({ slot, children }: { slot: HTMLElement | null; children: ReactNode }) {
  return slot ? createPortal(children, slot) : null;
}

export type ChipTone = 'neutral' | 'ok' | 'warn' | 'err' | 'accent';

export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return <span className={`dtp-chip ${tone}`}>{children}</span>;
}

export function Switch({ label, detail, checked, onChange }: { label: string; detail?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={checked} className="dtp-setting-row" onClick={() => onChange(!checked)}>
    <span><strong>{label}</strong>{detail && <small>{detail}</small>}</span><i className="dtp-switch" aria-hidden="true" />
  </button>;
}

export function Segmented<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void }) {
  return <div className="dtp-segmented" role="radiogroup" aria-label={label}>{options.map(o => <button type="button" key={String(o.value)} role="radio" aria-checked={value === o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>{o.label}</button>)}</div>;
}

export function IconButton({ label, children, onClick, active = false }: { label: string; children: ReactNode; onClick?: () => void; active?: boolean }) {
  return <button type="button" className={`dt-icon ${active ? 'active' : ''}`} aria-label={label} title={label} onClick={onClick}>{children}</button>;
}
