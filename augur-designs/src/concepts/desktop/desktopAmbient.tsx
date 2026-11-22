import { useState } from 'react';

// Gallery switch for the desktop ambient gradient (top-left, theme colours). A class on <html>
// so every gallery view (single, board, glance, elements) and the standalone page pick it up.
const KEY = 'battle-augur.desktop.ambient';
export const ambientClass = 'dt-ambient-on';

export function applyStoredAmbient(force?: boolean) {
  let on = force;
  if (on === undefined) { try { on = localStorage.getItem(KEY) !== 'off'; } catch { on = true; } }
  document.documentElement.classList.toggle(ambientClass, on);
  return on;
}

export function DesktopAmbientSwitch() {
  const [on, setOn] = useState(() => applyStoredAmbient());
  const flip = () => { const next = !on; setOn(next); applyStoredAmbient(next); try { localStorage.setItem(KEY, next ? 'on' : 'off'); } catch { /* gallery only */ } };
  return <button className="display-switch-row" type="button" role="switch" aria-checked={on} onClick={flip}><span>Ambient gradient</span><span className="display-switch" aria-hidden="true" /></button>;
}
