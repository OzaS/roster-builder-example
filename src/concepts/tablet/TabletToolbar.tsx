import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { TabletInput } from './tabletDevices';
import { HintButton } from './TabletHint';

// 1.0 revision: iOS Liquid Glass icon buttons; Android icon buttons. Labels remain in hints and More.

/** The page heading for screen readers only: the rail already shows the page. */
export const PageTitle = ({ children }: { children: ReactNode }) => <h1 className="tb-visually-hidden">{children}</h1>;

export type ToolbarAction = {
  id: string;
  /** Accessible name; also the label in the More menu. */
  label: string;
  /** Short action name retained for gallery callers; visible names live in hints and More. */
  caption?: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  hint: string;
  /** Filled accent pill. The prominent action is the last to move into More. */
  prominent?: boolean;
  /** Toggle actions (Select) show the rail's active indicator while on. */
  pressed?: boolean;
  /** Menu buttons (More) say whether their menu is open. */
  expanded?: boolean;
  /** Lower numbers stay on the row longer; by default the row order. */
  priority?: number;
  onClick: () => void;
};

const Item = ({ action, input }: { action: ToolbarAction; input: TabletInput }) => {
  const Icon = action.icon;
  const on = action.pressed || action.expanded;
  return <HintButton hint={action.hint} input={input} side="bottom" aria-label={action.label} aria-pressed={action.pressed}
    aria-expanded={action.expanded} aria-haspopup={action.expanded === undefined ? undefined : 'menu'}
    className={`tb-tool-action ${action.prominent ? 'prominent' : ''} ${on ? 'active' : ''}`} onClick={action.onClick}>
    <span className="tb-tool-ind" aria-hidden="true"><Icon size={21} strokeWidth={on || action.prominent ? 2.3 : 2} /></span>
  </HintButton>;
};

const rank = (a: ToolbarAction, i: number) => a.prominent ? -1 : a.priority ?? i;

/**
 * The trailing actions of a page's top row. When the row cannot fit them beside the search at its minimum width, the
 * lower-priority actions move into a More (⋯) item, drawn the same way, whose menu lists them with their full names.
 */
export function ToolbarActions({ actions, input, label, reserve = 0 }: { actions: ToolbarAction[]; input: TabletInput; label: string; reserve?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [menu, setMenu] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const signature = actions.map(a => `${a.id}:${a.prominent ? 1 : 0}:${a.priority ?? ''}`).join('|');

  useLayoutEffect(() => {
    const row = wrap.current?.parentElement;
    const box = measure.current;
    if (!row || !box) return;
    const fit = () => {
      const widths = [...box.children].map(child => (child as HTMLElement).offsetWidth);
      const more = widths.pop() ?? 0;
      const gap = parseFloat(getComputedStyle(wrap.current!).columnGap) || 0;
      const rowGap = parseFloat(getComputedStyle(row).columnGap) || 0;
      // Room for the actions: the row minus the search at its minimum width (reserve) and the gap between them.
      const room = row.clientWidth - (reserve ? reserve + rowGap : 0);
      const total = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, widths.length - 1);
      let next: string[] = [];
      if (total > room) {
        let used = more;
        const keep = new Set<string>();
        actions.map((a, i) => ({ a, i, r: rank(a, i) })).sort((x, y) => x.r - y.r).forEach(({ a, i }) => {
          if (used + gap + widths[i] <= room) { used += gap + widths[i]; keep.add(a.id); }
        });
        next = actions.filter(a => !keep.has(a.id)).map(a => a.id);
        // More is no narrower than one action: a single overflowing action stays on the row (the search gives way instead).
        if (next.length === 1 && widths[actions.findIndex(a => a.id === next[0])] <= more + 24) next = [];
      }
      setHidden(prev => prev.join('|') === next.join('|') ? prev : next);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, reserve]);

  useEffect(() => {
    if (!menu) return;
    const away = (event: PointerEvent) => { if (!moreRef.current?.contains(event.target as Node)) setMenu(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [menu]);

  const shown = actions.filter(a => !hidden.includes(a.id));
  const overflow = actions.filter(a => hidden.includes(a.id));
  const more: ToolbarAction = { id: 'more', label: 'More actions', caption: 'More', icon: MoreHorizontal, hint: `More actions: ${overflow.map(a => a.label).join(', ')}`, expanded: menu, onClick: () => setMenu(!menu) };
  return <div ref={wrap} className="tb-tool-actions" role="group" aria-label={label}>
    {shown.map(a => <Item key={a.id} action={a} input={input} />)}
    {overflow.length > 0 && <div ref={moreRef} className="tb-tool-more" onKeyDown={e => { if (e.key === 'Escape' && menu) { e.stopPropagation(); setMenu(false); moreRef.current?.querySelector<HTMLButtonElement>('.tb-tool-action')?.focus(); } }}>
      <Item action={more} input={input} />
      {menu && <div className="tb-tool-menu" role="menu" aria-label="More actions">
        {overflow.map(a => <button key={a.id} type="button" role="menuitem" className={a.prominent ? 'prominent' : ''} onClick={() => { setMenu(false); a.onClick(); }}><a.icon size={18} />{a.label}</button>)}
      </div>}
    </div>}
    {/* Measuring copies: every action and More at their natural width, never seen or read. */}
    <div ref={measure} className="tb-tool-measure" aria-hidden="true">
      {[...actions, more].map(a => <span key={a.id} className={`tb-tool-action ${a.prominent ? 'prominent' : ''}`}><span className="tb-tool-ind"><a.icon size={21} /></span></span>)}
    </div>
  </div>;
}

/** Minimum width of the search before actions move into More. */
export const SEARCH_MIN = 200;

/**
 * The top row of a list page (DEC-050): a hidden page heading, the search filling the row and the actions at its trailing
 * end. Pages without a search or actions have no top row at all; they render `PageTitle` alone.
 */
export function TabletToolbar({ title, search, actions = [], input }: { title: string; search?: ReactNode; actions?: ToolbarAction[]; input: TabletInput }) {
  return <header className="tb-top-row">
    <PageTitle>{title}</PageTitle>
    {search && <div className="tb-top-search">{search}</div>}
    {actions.length > 0 && <ToolbarActions actions={actions} input={input} label={`${title} actions`} reserve={search ? SEARCH_MIN : 0} />}
  </header>;
}
