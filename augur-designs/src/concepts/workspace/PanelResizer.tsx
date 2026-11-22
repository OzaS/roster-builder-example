import './workspace.css';

export type PanelLimits = { initial: number; min: number; max: number };
export const clampWidth = (v: number, limits: PanelLimits) => Math.round(Math.min(limits.max, Math.max(limits.min, v)));

/** Drag, arrow keys (Shift for bigger steps) or double-click to reset; the side panel width follows.
 *  The host passes the limits and the accessible label, and positions the handle through the pane width. */
export function PanelResizer({ side, width, limits, label, onWidth }: { side: 'left' | 'right'; width: number; limits: PanelLimits; label: string; onWidth: (w: number) => void }) {
  const sign = side === 'left' ? 1 : -1;
  return <div role="separator" aria-orientation="vertical" aria-label={label} aria-valuenow={width} aria-valuemin={limits.min} aria-valuemax={limits.max} tabIndex={0} title="Drag to resize · double-click to reset"
    className={`dt-resizer ${side}`} style={side === 'left' ? { left: width - 4 } : { right: width - 4 }}
    onDoubleClick={() => onWidth(limits.initial)}
    onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const step = (e.shiftKey ? 48 : 16) * (e.key === 'ArrowRight' ? 1 : -1) * sign; onWidth(clampWidth(width + step, limits)); } }}
    onPointerDown={e => {
      const startX = e.clientX; const start = width; const el = e.currentTarget; el.setPointerCapture(e.pointerId); el.classList.add('dragging');
      const move = (ev: PointerEvent) => onWidth(clampWidth(start + (ev.clientX - startX) * sign, limits));
      const up = () => { el.classList.remove('dragging'); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
    }} />;
}
