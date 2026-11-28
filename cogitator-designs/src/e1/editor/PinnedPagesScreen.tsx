import { ArrowDownLeft, ArrowLeft, ArrowRight, Check, ChevronDown, ClipboardPaste, Copy, CopyPlus, CornerDownLeft, PanelRightOpen, PencilLine, Pin, PinOff, Trash2 } from "lucide-react";
import { useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { HelperBox } from "../../directions/DirectionD";
import { lookupRow, sourceById, sourceOfEntry } from "../../directions/direction-d-content";
import { WinCaption } from "../../frames";
import { KindIcon } from "../../glyphs";
import { layout } from "../../language/layout";
import type { Kind } from "../../sample";
import { allDiagnostics, frostWardens, ironWardens, place, type ModuleText } from "./data";
import { flagsFrom, LinkedPage } from "./page";
import { Pill } from "./parts";
import { BackForward, Sidebar, SourceList, useWindowKeys, Win, type Mode } from "./shell";
import { PageTools, Tip } from "./toolbar";
import "./pins.css";

/**
 * TV-P6b pinned pages, option A (approved by the user 2026-11-27, review page battle-augur-captures/fb9-tables/review2):
 * no tabs in the top bar; a 36 px bar at the bottom of the page column, shown only when something is pinned. Pin page in
 * the page's ⋯ menu or an entry's context menu pins a page; ⌃1–⌃9 (Ctrl+1–9 on Windows) open the first nine pins; a pin's
 * context menu opens, moves or unpins it; pins are kept per dataset; the pinned page you're on is tinted; Recent ▾ lists
 * the last pages opened. The sidebar and the source list are untouched. States `recent`, `pin-menu`, `pin-command`,
 * `pin-entry`, `overflow` and `large` follow the approved text beyond the approved image (elaborations).
 */
export type PinsState = "bar" | "recent" | "pin-menu" | "pin-command" | "pin-entry" | "overflow" | "large";
export const pinsStates: PinsState[] = ["bar", "recent", "pin-menu", "pin-command", "pin-entry", "overflow", "large"];

type Platform = "mac" | "windows";
type PinRef = { id: string; name: string; kind: Kind; missing?: boolean };

const SQUAD = "iron-wardens:warden-squad";
const CAPTAIN = "iron-wardens:warden-captain";
const SPEAR = "iron-wardens:spear";
const HALBERD = "iron-wardens:halberd";
const ARCHERS = "iron-wardens:warden-archers";
const LONGBOW = "iron-wardens:longbow";
const ICE_GUARD = "frost-wardens:ice-guard";
/** A pinned entry that isn't in the dataset now (removed since it was pinned): the pin keeps its last title. */
const WAR_HORN: PinRef = { id: "iron-wardens:war-horn", name: "War Horn", kind: "upgrade", missing: true };
const MISSING_TIP = "Not in the dataset now";
/** The source list row the entry menu is opened on (Halberd, the third upgrade). */
const ENTRY_ROW = '.d-src [role="group"][aria-label="Upgrades"] > .d-row:nth-of-type(4)';

const ref = (id: string): PinRef => {
  const row = lookupRow(id)?.row;
  return { id, name: row?.name ?? id, kind: row?.kind ?? "unit" };
};
const modules: Record<string, ModuleText> = { "iron-wardens": ironWardens, "frost-wardens": frostWardens };
const moduleOf = (id: string) => modules[id.split(":")[0]];

/** The pins each state starts with, and the page shown. */
const startPins: Record<PinsState, PinRef[]> = {
  bar: [ref(SQUAD), ref(CAPTAIN), ref(SPEAR)],
  recent: [ref(SQUAD), ref(CAPTAIN), ref(SPEAR)],
  "pin-menu": [ref(SQUAD), ref(CAPTAIN), ref(SPEAR)],
  "pin-command": [ref(SQUAD), ref(CAPTAIN), ref(SPEAR)],
  "pin-entry": [ref(SQUAD), ref(CAPTAIN), ref(SPEAR)],
  overflow: [ref(SQUAD), WAR_HORN, ref(CAPTAIN), ref(SPEAR), ref(ARCHERS), ref(LONGBOW)],
  large: [ref(SQUAD), ref(CAPTAIN), ref(SPEAR)],
};
const startEntry: Record<PinsState, string> = {
  bar: SQUAD, recent: SQUAD, "pin-menu": SQUAD, "pin-command": HALBERD, "pin-entry": SQUAD, overflow: SQUAD, large: SQUAD,
};
/** The last distinct pages opened, newest first (up to 10); the first is the page shown. */
const startRecent = [SQUAD, SPEAR, HALBERD, CAPTAIN, ICE_GUARD, LONGBOW, ARCHERS];
/** The overflow state draws the page column narrow (a 1120 px window): this many chips fit before "n more ▾". */
const fitting = (_platform: Platform) => 2;
const OVERFLOW_WIDTH = 1120;

const ctrl = (platform: Platform, n: number) => (platform === "windows" ? `Ctrl+${n}` : `⌃${n}`);

type Open = { kind: "recent" } | { kind: "pin"; index: number } | { kind: "more" } | null;

/** One chip: kind icon, title, the key hint for the first nine. */
function Chip({ pin, index, current, platform, open, tip, onOpen, onMenu }: {
  pin: PinRef; index: number; current: boolean; platform: Platform; open?: boolean; tip?: boolean;
  onOpen: () => void; onMenu: (event: ReactMouseEvent) => void;
}) {
  const key = index < 9 ? ctrl(platform, index + 1) : null;
  const label = pin.missing ? `${pin.name}: ${MISSING_TIP.toLowerCase()}` : `Open ${pin.name}${key ? ` (${key})` : ""}`;
  return (
    <>
      <button type="button" className={`cg-pin${current ? " current" : ""}${pin.missing ? " missing" : ""}${open ? " is-open" : ""}`} aria-current={current ? "page" : undefined}
        aria-label={label} title={tip ? undefined : pin.missing ? MISSING_TIP : label} aria-keyshortcuts={key ? `Control+${index + 1}` : undefined}
        onClick={onOpen} onContextMenu={onMenu}>
        <KindIcon kind={pin.kind} size={15} /><span className="cg-pin-title">{pin.name}</span>{key ? <span className="cg-pin-key">{key}</span> : null}
      </button>
      {tip ? <Tip name={MISSING_TIP} className="cg-tip-up" /> : null}
    </>
  );
}

/** A pin's context menu (right-click, ⇧F10): Open, Move left, Move right, then Unpin. */
function PinMenu({ pin, index, count, platform, onOpen, onMove, onUnpin }: {
  pin: PinRef; index: number; count: number; platform: Platform; onOpen: () => void; onMove: (by: -1 | 1) => void; onUnpin: () => void;
}) {
  return (
    <div className="cg-menu cg-pin-pop" role="menu" aria-label={`Pin: ${pin.name}`}>
      <p className="cg-menu-label">{pin.name}</p>
      <button type="button" role="menuitem" className="cg-menu-item" disabled={pin.missing} title={pin.missing ? MISSING_TIP : undefined} onClick={onOpen}>
        <CornerDownLeft size={15} />Open<span className="cg-menu-key">{index < 9 ? ctrl(platform, index + 1) : platform === "windows" ? "Enter" : "↵"}</span>
      </button>
      <button type="button" role="menuitem" className="cg-menu-item" disabled={index === 0} title={index === 0 ? "The first pin already" : "Move before the pin on its left"} onClick={() => onMove(-1)}><ArrowLeft size={15} />Move left</button>
      <button type="button" role="menuitem" className="cg-menu-item" disabled={index === count - 1} title={index === count - 1 ? "The last pin already" : "Move after the pin on its right"} onClick={() => onMove(1)}><ArrowRight size={15} />Move right</button>
      <div className="cg-menu-sep" role="separator" />
      <button type="button" role="menuitem" className="cg-menu-item" onClick={onUnpin}><PinOff size={15} />Unpin</button>
    </div>
  );
}

/** Recent ▾: the last distinct pages opened, newest first; the page shown checked, pinned ones with the pin glyph. */
function RecentMenu({ recent, pins, shown, onOpen }: { recent: string[]; pins: PinRef[]; shown: string; onOpen: (id: string) => void }) {
  return (
    <div className="cg-menu cg-pin-pop cg-recent-menu" role="menu" aria-label="Recent pages">
      <p className="cg-menu-label">Recent pages</p>
      {recent.map((id) => {
        const page = ref(id);
        const pinned = pins.some((p) => p.id === id);
        const isShown = id === shown;
        return (
          <button type="button" role="menuitem" key={id} className={`cg-menu-item${isShown ? " shown" : ""}`} aria-current={isShown ? "page" : undefined} onClick={() => onOpen(id)}>
            <KindIcon kind={page.kind} size={15} /><span className="cg-recent-title">{page.name}</span><span className="cg-recent-mod">{sourceOfEntry(id)?.name}</span>
            <span className="cg-recent-end">
              {pinned ? <Pin size={13} aria-label="Pinned" /> : null}
              {isShown ? <Check size={14} className="cg-recent-shown" aria-label="The page you're on" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** "n more ▾": the pins that don't fit, with their keys. */
function MoreMenu({ pins, from, platform, shown, onOpen }: { pins: PinRef[]; from: number; platform: Platform; shown: string; onOpen: (id: string) => void }) {
  return (
    <div className="cg-menu cg-pin-pop" role="menu" aria-label="More pins">
      {pins.slice(from).map((pin, i) => (
        <button type="button" role="menuitem" key={pin.id} className={`cg-menu-item${pin.id === shown ? " sel" : ""}`} disabled={pin.missing} title={pin.missing ? MISSING_TIP : undefined} onClick={() => onOpen(pin.id)}>
          <KindIcon kind={pin.kind} size={15} />{pin.name}{from + i < 9 ? <span className="cg-menu-key">{ctrl(platform, from + i + 1)}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** The pinned pages bar (the Elements entry draws it alone). Shown only when something is pinned. */
export function PinBar({ pins, shown, platform, open, fit, tipMissing, onOpen, onMenu, onToggle, menu }: {
  pins: PinRef[]; shown: string; platform: Platform; open: Open; fit?: number; tipMissing?: boolean;
  onOpen: (id: string) => void; onMenu: (index: number) => void; onToggle: (what: "recent" | "more") => void; menu?: ReactNode;
}) {
  if (!pins.length) return null;
  const visible = fit !== undefined && fit < pins.length ? pins.slice(0, fit) : pins;
  const folded = pins.length - visible.length;
  return (
    <nav className="cg-pinbar" aria-label="Pinned pages">
      <span className="cg-pinbar-label"><Pin size={14} />Pinned</span>
      <span className="cg-pinbar-chips">
        {visible.map((pin, index) => (
          <span key={pin.id} className="cg-pinbar-at">
            <Chip pin={pin} index={index} current={pin.id === shown} platform={platform} open={open?.kind === "pin" && open.index === index} tip={tipMissing && pin.missing}
              onOpen={() => { if (!pin.missing) onOpen(pin.id); }} onMenu={(event) => { event.preventDefault(); onMenu(index); }} />
            {open?.kind === "pin" && open.index === index ? menu : null}
          </span>
        ))}
        {folded ? (
          <span className="cg-pinbar-at">
            <button type="button" className={`cg-pin more${open?.kind === "more" ? " is-open" : ""}`} aria-haspopup="menu" aria-expanded={open?.kind === "more"} onClick={() => onToggle("more")}
              title={`${folded} more pins that don't fit`}>{folded} more<ChevronDown size={13} /></button>
            {open?.kind === "more" ? menu : null}
          </span>
        ) : null}
      </span>
      <span className="cg-pinbar-at cg-pinbar-recent">
        <button type="button" className={`cg-pin${open?.kind === "recent" ? " is-open" : ""}`} aria-haspopup="menu" aria-expanded={open?.kind === "recent"} onClick={() => onToggle("recent")}
          title="The last pages opened">Recent<ChevronDown size={13} /></button>
        {open?.kind === "recent" ? menu : null}
      </span>
    </nav>
  );
}

/** The entry's context menu from a source list row, with Pin page (as the app's entry menu, `overlay.context-menu`). */
function EntryMenu({ name, platform, pinned, onPin, style }: { name: string; platform: Platform; pinned: boolean; onPin: () => void; style: { left: number; top: number } }) {
  const k = (mac: string, win: string) => (platform === "windows" ? win : mac);
  return (
    <div className="cg-menu cg-pin-entrymenu" role="menu" aria-label={name} style={style}>
      <p className="cg-menu-label">{name}</p>
      <button type="button" role="menuitem" className="cg-menu-item"><CornerDownLeft size={15} />Open<span className="cg-menu-key">{k("↵", "Enter")}</span></button>
      <button type="button" role="menuitem" className="cg-menu-item"><ArrowDownLeft size={15} />Show backlinks<span className="cg-menu-key">{k("⇧F12", "Shift+F12")}</span></button>
      <button type="button" role="menuitem" className="cg-menu-item is-hover" onClick={onPin}>{pinned ? <PinOff size={15} /> : <Pin size={15} />}{pinned ? "Unpin page" : "Pin page"}</button>
      <button type="button" role="menuitem" className="cg-menu-item"><PencilLine size={15} />Rename…<span className="cg-menu-key">F2</span></button>
      <button type="button" role="menuitem" className="cg-menu-item"><CopyPlus size={15} />Duplicate<span className="cg-menu-key">{k("⌘D", "Ctrl+D")}</span></button>
      <button type="button" role="menuitem" className="cg-menu-item"><Copy size={15} />Copy key<span className="cg-menu-key">{k("⌥⌘C", "Ctrl+Alt+C")}</span></button>
      <button type="button" role="menuitem" className="cg-menu-item" disabled title="Nothing copied yet"><ClipboardPaste size={15} />Paste statement<span className="cg-menu-key">{k("⌘V", "Ctrl+V")}</span></button>
      <div className="cg-menu-sep" role="separator" />
      <button type="button" role="menuitem" className="cg-menu-item"><PanelRightOpen size={15} />Open issues in the panel</button>
      <div className="cg-menu-sep" role="separator" />
      <button type="button" role="menuitem" className="cg-menu-item danger"><Trash2 size={15} />Delete {name}<span className="cg-menu-key">{k("⌘⌫", "Del")}</span></button>
    </div>
  );
}

export function PinnedPagesScreen({ mode, platform = "mac", state = "bar", interactive }: { mode: Mode; platform?: Platform; state?: string; interactive: boolean }) {
  const s = (pinsStates.includes(state as PinsState) ? state : "bar") as PinsState;
  const [pins, setPins] = useState<PinRef[]>(startPins[s]);
  const [entry, setEntry] = useState(startEntry[s]);
  const [recent, setRecent] = useState<string[]>(s === "pin-command" ? [HALBERD, ...startRecent.filter((id) => id !== HALBERD)] : startRecent);
  const [open, setOpen] = useState<Open>(s === "recent" ? { kind: "recent" } : s === "pin-menu" ? { kind: "pin", index: 0 } : null);
  const [entryMenu, setEntryMenu] = useState(s === "pin-entry");
  const overflow = s === "overflow";
  const width = overflow ? OVERFLOW_WIDTH : layout.windowDesign;

  const go = (id: string) => {
    if (!moduleOf(id)) return;
    setEntry(id);
    setRecent((list) => [id, ...list.filter((x) => x !== id)].slice(0, 10));
    setOpen(null);
    setEntryMenu(false);
  };
  const toggle = (what: "recent" | "more") => setOpen((o) => (o?.kind === what ? null : { kind: what }));
  const pinPage = (id: string) => setPins((list) => (list.some((p) => p.id === id) ? list.filter((p) => p.id !== id) : [...list, ref(id)]));
  const claim = useWindowKeys(interactive, (event) => {
    if (event.key === "Escape") { setOpen(null); setEntryMenu(false); return; }
    if (event.ctrlKey && /^[1-9]$/.test(event.key)) {
      const pin = pins[Number(event.key) - 1];
      if (pin && !pin.missing) { event.preventDefault(); go(pin.id); }
    }
  });

  const module = moduleOf(entry) ?? ironWardens;
  const placed = allDiagnostics.map((d) => place(d)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.module === module.id));
  const pageIssues = allDiagnostics.filter((d) => d.where === entry || d.where.startsWith(`${entry}/`));
  const listSource = sourceOfEntry(entry) ?? sourceById("iron-wardens")!;
  const pinned = pins.some((p) => p.id === entry);
  const current = lookupRow(entry)?.row.name ?? entry;

  let menu: ReactNode = null;
  if (open?.kind === "recent") menu = <RecentMenu recent={recent} pins={pins} shown={entry} onOpen={go} />;
  else if (open?.kind === "more") menu = <MoreMenu pins={pins} from={overflow ? fitting(platform) : pins.length} platform={platform} shown={entry} onOpen={go} />;
  else if (open?.kind === "pin" && pins[open.index]) {
    const index = open.index;
    menu = <PinMenu pin={pins[index]} index={index} count={pins.length} platform={platform} onOpen={() => go(pins[index].id)}
      onMove={(by) => { setPins((list) => { const next = [...list]; const [p] = next.splice(index, 1); next.splice(index + by, 0, p); return next; }); setOpen(null); }}
      onUnpin={() => { setPins((list) => list.filter((_, i) => i !== index)); setOpen(null); }} />;
  }

  const pill = platform === "windows" || overflow;
  const helper = pill
    ? <Pill issues={pageIssues} />
    : (
      <HelperBox noFixes issues={pageIssues} resolved={new Set()} elsewhere={allDiagnostics.length - pageIssues.length} checking="idle" onCollapse={() => undefined} onExpand={() => undefined}
        onFix={() => undefined} onUndo={() => undefined} onDiff={() => undefined} onAll={() => undefined} onChecks={() => undefined} onInsert={() => undefined} onProperties={() => undefined} />
    );

  const columns = `${layout.sidebar}px ${layout.sourceList}px minmax(${layout.pageMin}px, 1fr) 0px`;
  /* The entry menu opens at the pointer on the Halberd row of the source list (right-clicked), inside the grid. */
  const grid = useRef<HTMLDivElement>(null);
  const [entryMenuAt, setEntryMenuAt] = useState({ left: layout.sidebar + 168, top: 480 });
  useLayoutEffect(() => {
    if (!entryMenu || !grid.current) return;
    const row = grid.current.querySelector<HTMLElement>(ENTRY_ROW);
    if (!row) return;
    const g = grid.current.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const k = g.width / grid.current.offsetWidth || 1;
    setEntryMenuAt({ left: Math.round((r.left - g.left) / k + 150), top: Math.round((r.top - g.top) / k + r.height / k / 2) });
  }, [entryMenu, platform]);
  return (
    <Win mode={mode} width={width} large={s === "large"} interactive={interactive} onClaim={claim} platform={platform}>
      <div ref={grid} className={`d-grid cg-fb-grid${entryMenu ? " cg-pin-entrystate" : ""}`} style={{ gridTemplateColumns: columns }}
        onPointerDownCapture={(event) => { const t = event.target as HTMLElement; if (!t.closest(".cg-menu, .cg-pin")) { setOpen(null); setEntryMenu(false); } }}>
        <Sidebar width={layout.sidebar} source={listSource.id} entry={entry} updates={allDiagnostics.length} platform={platform} />
        <SourceList width={layout.sourceList} source={listSource} entry={entry} onEntry={go} platform={platform} />
        <main className="d-main" aria-label="Entry">
          <header className={`d-top${platform === "windows" ? " cg-pin-top-win" : ""}`}>
            <BackForward back={recent[1] ? lookupRow(recent[1])?.row.name : undefined} />
            <span className="d-crumbs">{listSource.name}<span>/</span>{current}</span>
            <span className="d-spacer" />
            <PageTools key={`${s}-${entry}`} interactive={interactive} menu={s === "pin-command"} tip={null} source={false} platform={platform}
              pin={pinned ? "unpin" : "pin"} onPin={() => pinPage(entry)} />
            {platform === "windows" ? <WinCaption /> : null}
          </header>
          <div className={`d-scroll${pill ? "" : " helper-floating"}`}>
            <div className="d-doc">
              <LinkedPage key={entry} id={entry} module={module} flags={flagsFrom(placed)} />
            </div>
          </div>
          {helper}
          <PinBar pins={pins} shown={entry} platform={platform} open={open} fit={overflow ? fitting(platform) : undefined} tipMissing={overflow}
            onOpen={go} onMenu={(index) => setOpen({ kind: "pin", index })} onToggle={toggle} menu={menu} />
        </main>
        <aside className="d-panel" aria-hidden />
        {entryMenu ? <EntryMenu name="Halberd" platform={platform} pinned={pins.some((p) => p.id === HALBERD)} onPin={() => { pinPage(HALBERD); setEntryMenu(false); }} style={entryMenuAt} /> : null}
      </div>
    </Win>
  );
}
