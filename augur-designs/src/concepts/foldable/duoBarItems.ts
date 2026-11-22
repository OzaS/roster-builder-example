import { createContext, useContext, useLayoutEffect, type ComponentType } from 'react';

// Vertical bars of the passport foldable (HIG "Designing for iPhone Duo", Vertical controls). Screens do not draw their own
// toolbar when the bars are vertical: they declare items, as `ToolbarItem` placements do in SwiftUI, and the side bar lays
// them out in the system order (navigation, prominent, the rest), moves what does not fit into More and keeps the latest
// closures. Outside the Foldable library there is no registry and the hook does nothing.

export type BarIcon = ComponentType<{ size?: number; strokeWidth?: number }>;

/** `nav`: Back or Close, top of the axis. `primary`: the prominent action (New roster, Add unit). `secondary`: the rest, in
 *  their own group; lower `priority` stays visible longer (items overflow from the bottom up by default). */
export type BarItem = {
  id: string; label: string; icon: BarIcon; group: 'nav' | 'primary' | 'secondary';
  hint?: string; prominent?: boolean; pressed?: boolean; disabled?: boolean; priority?: number;
  onClick: () => void;
};
export type BarMenuItem = { id: string; label: string; icon: BarIcon; onClick: () => void; disabled?: boolean; danger?: boolean; divider?: boolean };
/** A screen's contribution: its items and the entries that always live in More (the system overflow menu). */
export type BarLayer = { items: BarItem[]; menu?: BarMenuItem[] };

type Entry = { seq: number; layer: BarLayer; sig: string };

const signature = (layer: BarLayer) => JSON.stringify([
  layer.items.map(i => [i.id, i.label, i.group, i.hint, i.prominent, i.pressed, i.disabled, i.priority, (i.icon as { displayName?: string }).displayName]),
  (layer.menu ?? []).map(m => [m.id, m.label, m.disabled, m.danger, m.divider]),
]);

/** The shell's registry. Layers are kept with their latest closures; subscribers hear only about visible changes. */
export class BarRegistry {
  private entries = new Map<string, Entry>();
  private listeners = new Set<() => void>();
  private seq = 0;
  private snapshot: { items: BarItem[]; menu: BarMenuItem[] } = { items: [], menu: [] };

  set(key: string, layer: BarLayer | null) {
    const old = this.entries.get(key);
    if (!layer) { if (old) { this.entries.delete(key); this.rebuild(); } return; }
    const sig = signature(layer);
    if (old && old.sig === sig) { old.layer = layer; return; }
    this.entries.set(key, { seq: old?.seq ?? ++this.seq, layer, sig });
    this.rebuild();
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getSnapshot = () => this.snapshot;
  /** Runs the newest closure of an item or menu entry (layers re-register on every render of their owner). */
  run(id: string) {
    for (const { layer } of this.entries.values()) {
      const hit = layer.items.find(i => i.id === id) ?? layer.menu?.find(m => m.id === id);
      if (hit) { hit.onClick(); return; }
    }
  }
  private rebuild() {
    const order = { nav: 0, primary: 1, secondary: 2 } as const;
    const layers = [...this.entries.values()].sort((a, b) => a.seq - b.seq);
    const items = layers.flatMap(e => e.layer.items.map((item, i) => ({ item, seq: e.seq, i })))
      .sort((a, b) => order[a.item.group] - order[b.item.group] || a.seq - b.seq || a.i - b.i).map(x => x.item);
    const menu = layers.flatMap(e => e.layer.menu ?? []);
    this.snapshot = { items, menu };
    this.listeners.forEach(l => l());
  }
}

export const BarRegistryContext = createContext<BarRegistry | null>(null);

/** Declares this component's bar items while it is shown. Pass null when the bars are horizontal (the component then draws
 *  its own toolbar as usual). Call it unconditionally. */
export function useBarItems(key: string, layer: BarLayer | null) {
  const registry = useContext(BarRegistryContext);
  useLayoutEffect(() => { registry?.set(key, layer); });
  useLayoutEffect(() => () => registry?.set(key, null), [registry, key]);
}
