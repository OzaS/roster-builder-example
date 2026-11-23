import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { KindIcon } from "../glyphs";
import { diagnostics, entry, type DiagKind, type Kind } from "../sample";

/**
 * Direction D content: the sources shown in the source column (A's grouped list), and the entry pages drawn in the
 * editor (B's document page). Synthetic "Demo Skirmish" data only; extends `sample.ts` with a few more invented entries.
 */

export type DRow = { id: string; name: string; kind: Kind; cost?: number; was?: number; diag?: DiagKind; changed?: string; noText?: boolean };
export type DSource = { id: string; name: string; kind: Kind; tag?: string; table?: boolean; groups: { label: string; rows: DRow[] }[] };

export const sources: DSource[] = [
  {
    id: "demo-skirmish", name: "Demo Skirmish", kind: "system",
    groups: [
      { label: "Cost types", rows: [{ id: "demo-skirmish:pts", name: "pts", kind: "cost-type" }] },
      { label: "Profile types", rows: [{ id: "demo-skirmish:fighter", name: "Fighter", kind: "profile-type" }, { id: "demo-skirmish:weapon", name: "Weapon", kind: "profile-type" }] },
      { label: "Forces", rows: [{ id: "demo-skirmish:warband", name: "Warband", kind: "force" }, { id: "demo-skirmish:warband/vanguard", name: "Vanguard", kind: "force" }] },
      { label: "Categories", rows: [{ id: "demo-skirmish:leader", name: "Leader", kind: "category" }, { id: "demo-skirmish:line", name: "Line", kind: "category" }, { id: "demo-skirmish:infantry", name: "Infantry", kind: "category" }] },
      { label: "Rules", rows: [{ id: "demo-skirmish:shield-wall", name: "Shield Wall", kind: "rule", changed: "House rules" }] },
    ],
  },
  {
    id: "iron-wardens", name: "Iron Wardens", kind: "catalogue",
    groups: [
      { label: "Units", rows: [
        { id: "iron-wardens:warden-squad", name: "Warden Squad", kind: "unit", cost: 18, was: 20, diag: "preservation", changed: "House rules" },
        { id: "iron-wardens:warden-captain", name: "Warden Captain", kind: "unit", cost: 45, diag: "suggestion" },
        { id: "iron-wardens:warden-archers", name: "Warden Archers", kind: "unit", cost: 22 },
        { id: "iron-wardens:shield-bearers", name: "Shield Bearers", kind: "unit", cost: 30 },
      ] },
      { label: "Models", rows: [
        { id: "iron-wardens:warden-squad/warden", name: "Warden", kind: "model", cost: 8 },
        { id: "iron-wardens:warden-captain/captain", name: "Captain", kind: "model" },
        { id: "iron-wardens:warden-archers/archer", name: "Archer", kind: "model", cost: 9 },
        { id: "iron-wardens:shield-bearers/bearer", name: "Bearer", kind: "model", cost: 10 },
      ] },
      { label: "Upgrades", rows: [
        { id: "iron-wardens:warden-squad/warden/banner", name: "Banner", kind: "upgrade", cost: 10 },
        { id: "iron-wardens:spear", name: "Spear", kind: "upgrade", cost: 0, diag: "suggestion" },
        { id: "iron-wardens:halberd", name: "Halberd", kind: "upgrade", cost: 2 },
        { id: "iron-wardens:longbow", name: "Longbow", kind: "upgrade", cost: 4 },
      ] },
      { label: "Groups", rows: [{ id: "iron-wardens:warden-squad/warden/weapon", name: "Weapon", kind: "group" }] },
    ],
  },
  {
    id: "frost-wardens", name: "Frost Wardens", kind: "catalogue", tag: "add-on",
    groups: [
      { label: "Units", rows: [
        { id: "frost-wardens:ice-guard", name: "Ice Guard", kind: "unit", cost: 24, diag: "error", changed: "Frost Wardens" },
        { id: "frost-wardens:frost-seer", name: "frost-seer", kind: "unit", cost: 50, diag: "suggestion", noText: true, changed: "Frost Wardens" },
      ] },
      { label: "Models", rows: [
        { id: "frost-wardens:ice-guard/guard", name: "Guard", kind: "model", cost: 9 },
        { id: "frost-wardens:frost-seer/seer", name: "Seer", kind: "model" },
      ] },
      { label: "Upgrades", rows: [{ id: "frost-wardens:rime-blade", name: "Rime Blade", kind: "upgrade", cost: 3 }] },
      { label: "Groups", rows: [{ id: "frost-wardens:ice-guard/weapon", name: "Weapon", kind: "group", diag: "error" }] },
    ],
  },
];

const realSources = [...sources];
/** Table views in the sidebar open in the source column too: one group per source. */
const tableOf = (id: string, name: string, label: string): DSource => ({
  id, name, kind: "profile-type", table: true,
  groups: realSources.map((source) => ({ label: source.name, rows: source.groups.find((group) => group.label === label)?.rows ?? [] })).filter((group) => group.rows.length),
});
export const tables: DSource[] = [tableOf("table:units", "All units", "Units"), tableOf("table:upgrades", "All upgrades", "Upgrades")];

const rowIndex = new Map<string, { row: DRow; source: DSource }>();
for (const source of sources) for (const group of source.groups) for (const row of group.rows) rowIndex.set(row.id, { row, source });

export const lookupRow = (id: string) => rowIndex.get(id);
export const sourceById = (id: string) => [...sources, ...tables].find((source) => source.id === id);
export const sourceOfEntry = (id: string) => sources.find((source) => id.startsWith(`${source.id}:`));
export const rowCount = (source: DSource) => source.groups.reduce((sum, group) => sum + group.rows.length, 0);

/** Diagnostics that concern an entry: on the entry itself or on one of its children. */
export const issuesFor = (id: string) => diagnostics.filter((d) => d.where === id || d.where.startsWith(`${id}/`));
/** The entry a diagnostic opens with Go to: the top-level entry of its path, or nothing for a module-level one. */
export const entryOfDiag = (where: string) => {
  const top = where.split("/")[0];
  return top.includes(":") && rowIndex.has(top) ? top : undefined;
};

/* ---------- Page building blocks (B's page: blocks, toggles, mentions with peek) ---------- */

export type DCtx = { open: (id: string) => void; resolved: ReadonlySet<string> };
export const DContext = createContext<DCtx>({ open: () => undefined, resolved: new Set() });
const DepthContext = createContext(0);

/** A reference as a mention: hover or focus shows a peek, click opens the entry. A broken one is red until its fix is applied. */
export function M({ to, children, broken, fixedBy, fixedText, hint }: { to?: string; children: ReactNode; broken?: boolean; fixedBy?: string; fixedText?: string; hint?: string }) {
  const ctx = useContext(DContext);
  const [peek, setPeek] = useState(false);
  const fixed = Boolean(fixedBy && ctx.resolved.has(fixedBy));
  const isBroken = broken && !fixed;
  const target = to ? rowIndex.get(to) : undefined;
  const label = fixed && fixedText ? fixedText : children;
  const name = typeof label === "string" ? label : target?.row.name ?? "reference";
  return (
    <span className="d-mwrap" onMouseEnter={() => setPeek(true)} onMouseLeave={() => setPeek(false)}>
      <button
        type="button"
        className={`d-mention${isBroken ? " broken" : ""}`}
        aria-label={isBroken ? `Unknown reference ${name}` : target ? `Open ${name}` : name}
        onFocus={() => setPeek(true)}
        onBlur={() => setPeek(false)}
        onClick={() => { if (!isBroken && target && to) { setPeek(false); ctx.open(to); } }}
      >{label}</button>
      {peek ? (
        <span className="d-peek" role="tooltip">
          {isBroken ? (
            <><span className="d-peek-head"><strong>Unknown reference</strong><span className="mono">{children}</span></span><span>No entry has this key. Did you mean <span className="mono">halberd</span>?</span><span className="d-peek-foot">The fix is in the helper</span></>
          ) : target ? (
            <><span className="d-peek-head"><KindIcon kind={target.row.kind} size={14} /><strong>{target.row.name}</strong><span className="mono">{target.row.id}</span></span>{target.row.cost !== undefined ? <span><span className="d-kw">cost</span><span className="mono">pts {target.row.cost}</span></span> : null}<span className="d-peek-foot">Click to open · <kbd>F12</kbd></span></>
          ) : (
            <><span className="d-peek-head"><Layers size={14} /><strong>{name}</strong></span><span>{hint ?? "Not an entry"}</span></>
          )}
        </span>
      ) : null}
    </span>
  );
}

/** One statement as a block. With `sub` it is a toggle: the chevron folds its children. `diag` flags it while that diagnostic is open. */
export function Blk({ kw, children, sub, closed, diag }: { kw?: string; children?: ReactNode; sub?: ReactNode; closed?: boolean; diag?: string }) {
  const depth = useContext(DepthContext);
  const { resolved } = useContext(DContext);
  const [open, setOpen] = useState(!closed);
  const flag = diag && !resolved.has(diag) ? diagnostics.find((d) => d.id === diag)?.kind : undefined;
  return (
    <>
      <div className={`d-block i${Math.min(depth, 3)}${flag ? ` flagged ${flag}` : ""}`}>
        {sub ? (
          <button type="button" className="d-tog" aria-label={open ? `Fold ${kw ?? "block"}` : `Unfold ${kw ?? "block"}`} aria-expanded={open} title={open ? "Fold" : "Unfold"} onClick={() => setOpen(!open)}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <span className="d-tog-space" />}
        {kw ? <span className="d-kw">{kw}</span> : null}
        {children}
      </div>
      {sub && open ? <DepthContext.Provider value={depth + 1}>{sub}</DepthContext.Provider> : null}
    </>
  );
}

export function TableBlk({ head, row }: { head: string[]; row: ReactNode[] }) {
  const depth = useContext(DepthContext);
  return (
    <div className={`d-block i${Math.min(depth, 3)} d-tableblock`}>
      <span className="d-tog-space" />
      <table>
        <thead><tr>{head.map((cell) => <th key={cell}>{cell}</th>)}</tr></thead>
        <tbody><tr>{row.map((cell, index) => <td key={index} className={typeof cell === "string" && /^[\d"]/.test(cell) ? "num" : undefined}>{cell}</td>)}</tr></tbody>
      </table>
    </div>
  );
}

const Muted = ({ children }: { children: ReactNode }) => <span className="d-muted">{children}</span>;
const Tag = ({ children, tone }: { children: ReactNode; tone: 1 | 2 | 3 }) => <span className={`d-tag t${tone}`}>{children}</span>;
const Hash = () => <span className="d-hash">#</span>;

/* ---------- Entry pages ---------- */

export type PageProp = { icon: ReactNode; label: string; value: ReactNode };
export type PageDef = {
  id: string;
  name: string;
  kind: Kind;
  noText?: boolean;
  layer: string;
  backlinks: { label: string; to?: string }[];
  props: PageProp[];
  /** Extra rows only the panel's Properties tab shows. */
  more: { label: string; value: ReactNode }[];
  blocks: ReactNode;
};

const kindLabel: Record<Kind, string> = { system: "System", catalogue: "Catalogue", unit: "Unit", model: "Model", upgrade: "Upgrade", group: "Group", rule: "Rule", category: "Category", force: "Force", "profile-type": "Profile type", "cost-type": "Cost type" };
const kindProp = (kind: Kind, id: string): PageProp => ({ icon: <KindIcon kind={kind} size={14} />, label: "Kind", value: <>{kindLabel[kind]}<Muted><span className="mono">{id}</span></Muted></> });

const pages: PageDef[] = [
  {
    id: entry.full, name: entry.name, kind: "unit", layer: "Base · 1 patch",
    backlinks: [{ label: "Iron Wardens", to: undefined }, { label: "Warden Captain", to: "iron-wardens:warden-captain" }, { label: "House rules · patch" }],
    props: [
      kindProp("unit", entry.full),
      { icon: <ChevronDown size={14} />, label: "Categories", value: <><Tag tone={1}>infantry</Tag><Tag tone={2}>line</Tag><Muted>root, as line*</Muted></> },
      { icon: <Hash />, label: "Cost", value: <><strong className="num">18 pts</strong><Muted>20 in Base · lowered by</Muted><M hint="Variant layer · rules, 1.0.0">House rules</M></> },
      { icon: <KindIcon kind="rule" size={14} />, label: "Rules", value: <M to="demo-skirmish:shield-wall">Shield Wall</M> },
      { icon: <Layers size={14} />, label: "Layer", value: <>Base<Muted>1 patch</Muted></> },
    ],
    more: [{ label: "BSData id", value: <span className="mono">{entry.bsdataId}</span> }, { label: "Text key", value: <span className="mono">{entry.textKey}</span> }, { label: "Extra", value: <span className="mono">{entry.extra.key}: {entry.extra.value}</span> }],
    blocks: (
      <>
        <Blk kw="source key" diag="d2"><span className="mono">{entry.extra.key}: {entry.extra.value}</span></Blk>
        <h2 className="d-h">Models</h2>
        <Blk kw="model" sub={<>
          <Blk kw="cost"><span className="num">8 pts</span></Blk>
          <TableBlk head={["Profile", "Type", "Move", "Attack", "Wounds"]} row={["Warden", <M key="t" to="demo-skirmish:fighter">fighter</M>, "5\"", "3", "1"]} />
          <Blk kw="upgrade" closed sub={<>
            <Blk kw="hide when"><span className="mono">no(</span><M to="iron-wardens:warden-captain">Warden Captain</M><span className="mono">in force, deep)</span></Blk>
            <Blk kw="cost"><span className="num">10 pts</span></Blk>
          </>}><strong>Banner</strong><Muted>up to 1 · 10 pts · hidden when no Warden Captain in force</Muted></Blk>
          <Blk kw="group" sub={<>
            <Blk kw="use"><M to="iron-wardens:spear">Spear</M><Muted>0 pts</Muted></Blk>
            <Blk kw="use"><M to="iron-wardens:halberd">Halberd</M><Muted>2 pts</Muted></Blk>
          </>}><strong>Weapon</strong><Muted>choose 1, default</Muted><M to="iron-wardens:spear">Spear</M></Blk>
        </>}><strong>Warden</strong><Muted>5 to 10 models</Muted></Blk>
      </>
    ),
  },
  {
    id: "iron-wardens:warden-captain", name: "Warden Captain", kind: "unit", layer: "Base",
    backlinks: [{ label: "Iron Wardens" }, { label: "Warden Squad", to: entry.full }],
    props: [
      kindProp("unit", "iron-wardens:warden-captain"),
      { icon: <ChevronDown size={14} />, label: "Categories", value: <><Tag tone={3}>leader</Tag><Muted>root, as leader*</Muted></> },
      { icon: <Hash />, label: "Cost", value: <><strong className="num">45 pts</strong><Muted>Base</Muted></> },
      { icon: <Layers size={14} />, label: "Layer", value: "Base" },
    ],
    more: [{ label: "BSData id", value: <span className="mono">1f0a-5e1e-0000-0002</span> }, { label: "Text key", value: <span className="mono">warden-captain</span> }],
    blocks: (
      <>
        <h2 className="d-h">Models</h2>
        <Blk kw="model" sub={<>
          <TableBlk head={["Profile", "Type", "Move", "Attack", "Wounds"]} row={["Captain", <M key="t" to="demo-skirmish:fighter">fighter</M>, "6\"", "4", "2"]} />
          <Blk kw="group" sub={<>
            <Blk kw="use"><M to="iron-wardens:halberd">Halberd</M><Muted>2 pts</Muted></Blk>
            <Blk kw="use"><M to="iron-wardens:spear">Spear</M><Muted>0 pts</Muted></Blk>
          </>}><strong>Weapon</strong><Muted>choose 1, default</Muted><M to="iron-wardens:halberd">Halberd</M></Blk>
        </>}><strong>Captain</strong><Muted>1 model</Muted></Blk>
        <h2 className="d-h">Associations</h2>
        <Blk kw="association" sub={<Blk kw="label" diag="d7"><span className="mono">$</span><Muted>the default label</Muted></Blk>}><strong>leads</strong><Muted>0 to 1</Muted><M to={entry.full}>Warden Squad</M></Blk>
      </>
    ),
  },
  {
    id: "iron-wardens:spear", name: "Spear", kind: "upgrade", layer: "Base",
    backlinks: [{ label: "Warden Squad · weapon", to: entry.full }, { label: "Warden Captain · weapon", to: "iron-wardens:warden-captain" }],
    props: [
      kindProp("upgrade", "iron-wardens:spear"),
      { icon: <Hash />, label: "Cost", value: <><strong className="num">0 pts</strong><Muted>same as the default</Muted></> },
      { icon: <Layers size={14} />, label: "Layer", value: "Base" },
    ],
    more: [{ label: "Text key", value: <span className="mono">spear</span> }],
    blocks: (
      <>
        <Blk kw="cost" diag="d5"><span className="mono">pts 0</span></Blk>
        <h2 className="d-h">Profile</h2>
        <TableBlk head={["Profile", "Type", "Reach", "Strength"]} row={["Spear", <M key="t" to="demo-skirmish:weapon">weapon</M>, "2", "3"]} />
      </>
    ),
  },
  {
    id: "iron-wardens:halberd", name: "Halberd", kind: "upgrade", layer: "Base",
    backlinks: [{ label: "Warden Squad · weapon", to: entry.full }, { label: "Warden Captain · weapon", to: "iron-wardens:warden-captain" }],
    props: [
      kindProp("upgrade", "iron-wardens:halberd"),
      { icon: <Hash />, label: "Cost", value: <><strong className="num">2 pts</strong><Muted>Base</Muted></> },
      { icon: <Layers size={14} />, label: "Layer", value: "Base" },
    ],
    more: [{ label: "Text key", value: <span className="mono">halberd</span> }],
    blocks: (
      <>
        <Blk kw="cost"><span className="mono">pts 2</span></Blk>
        <h2 className="d-h">Profile</h2>
        <TableBlk head={["Profile", "Type", "Reach", "Strength"]} row={["Halberd", <M key="t" to="demo-skirmish:weapon">weapon</M>, "1", "4"]} />
        <h2 className="d-h">Text</h2>
        <Blk kw="en"><span>Halberd</span></Blk>
      </>
    ),
  },
  {
    id: "frost-wardens:ice-guard", name: "Ice Guard", kind: "unit", layer: "Frost Wardens · add-on",
    backlinks: [{ label: "Frost Wardens" }],
    props: [
      kindProp("unit", "frost-wardens:ice-guard"),
      { icon: <ChevronDown size={14} />, label: "Categories", value: <><Tag tone={1}>infantry</Tag><Tag tone={2}>line</Tag></> },
      { icon: <Hash />, label: "Cost", value: <><strong className="num">24 pts</strong><Muted>Frost Wardens</Muted></> },
      { icon: <Layers size={14} />, label: "Layer", value: <>Frost Wardens<Muted>add-on, content 0.3.0</Muted></> },
    ],
    more: [{ label: "Text key", value: <span className="mono">ice-guard</span> }],
    blocks: (
      <>
        <h2 className="d-h">Models</h2>
        <Blk kw="model" sub={<>
          <Blk kw="cost"><span className="num">9 pts</span></Blk>
          <TableBlk head={["Profile", "Type", "Move", "Attack", "Wounds"]} row={["Guard", <M key="t" to="demo-skirmish:fighter">fighter</M>, "5\"", "3", "2"]} />
          <Blk kw="group" sub={<>
            <Blk kw="use"><M to="frost-wardens:rime-blade">Rime Blade</M><Muted>3 pts</Muted></Blk>
            <Blk kw="use" diag="d1"><M to="iron-wardens:halberd" broken fixedBy="d1" fixedText="Halberd">halbred</M><Muted>2 pts</Muted></Blk>
          </>}><strong>Weapon</strong><Muted>choose 1, default</Muted><M to="frost-wardens:rime-blade">Rime Blade</M></Blk>
        </>}><strong>Guard</strong><Muted>3 to 6 models</Muted></Blk>
      </>
    ),
  },
  {
    id: "frost-wardens:frost-seer", name: "frost-seer", kind: "unit", noText: true, layer: "Frost Wardens · add-on",
    backlinks: [{ label: "Frost Wardens" }],
    props: [
      kindProp("unit", "frost-wardens:frost-seer"),
      { icon: <Hash />, label: "Cost", value: <><strong className="num">50 pts</strong><Muted>Frost Wardens</Muted></> },
      { icon: <KindIcon kind="rule" size={14} />, label: "Rules", value: <M to="demo-skirmish:shield-wall">Shield Wall</M> },
      { icon: <Layers size={14} />, label: "Layer", value: <>Frost Wardens<Muted>add-on</Muted></> },
    ],
    more: [{ label: "Text key", value: <span className="mono">frost-seer · no en text</span> }],
    blocks: (
      <>
        <Blk kw="name" diag="d6"><Muted>No en text: the name shows as the key</Muted></Blk>
        <h2 className="d-h">Models</h2>
        <Blk kw="model" sub={<TableBlk head={["Profile", "Type", "Move", "Attack", "Wounds"]} row={["Seer", <M key="t" to="demo-skirmish:fighter">fighter</M>, "5\"", "2", "3"]} />}><strong>Seer</strong><Muted>1 model</Muted></Blk>
      </>
    ),
  },
  {
    id: "demo-skirmish:shield-wall", name: "Shield Wall", kind: "rule", layer: "Base · text patched",
    backlinks: [{ label: "Warden Squad", to: entry.full }, { label: "frost-seer", to: "frost-wardens:frost-seer" }],
    props: [
      kindProp("rule", "demo-skirmish:shield-wall"),
      { icon: <Layers size={14} />, label: "Layer", value: <>Base<Muted>text patched by</Muted><M hint="Variant layer · rules, 1.0.0">House rules</M></> },
    ],
    more: [{ label: "Text key", value: <span className="mono">shield-wall</span> }],
    blocks: (
      <>
        <h2 className="d-h">Text</h2>
        <Blk kw="en"><span className="d-prose">{entry.ruleText}</span></Blk>
        <Blk kw="patch"><Muted>House rules: “lose 1 attack” was “lose 2 attacks”</Muted></Blk>
      </>
    ),
  },
  {
    id: "frost-wardens:rime-blade", name: "Rime Blade", kind: "upgrade", layer: "Frost Wardens · add-on",
    backlinks: [{ label: "Ice Guard · weapon", to: "frost-wardens:ice-guard" }],
    props: [
      kindProp("upgrade", "frost-wardens:rime-blade"),
      { icon: <Hash />, label: "Cost", value: <><strong className="num">3 pts</strong><Muted>Frost Wardens</Muted></> },
      { icon: <Layers size={14} />, label: "Layer", value: <>Frost Wardens<Muted>add-on</Muted></> },
    ],
    more: [{ label: "Text key", value: <span className="mono">rime-blade</span> }],
    blocks: (
      <>
        <Blk kw="cost"><span className="mono">pts 3</span></Blk>
        <h2 className="d-h">Profile</h2>
        <TableBlk head={["Profile", "Type", "Reach", "Strength"]} row={["Rime Blade", <M key="t" to="demo-skirmish:weapon">weapon</M>, "1", "3"]} />
      </>
    ),
  },
];

/** The page for an entry: a written page, or a short generated one for entries this mock doesn't detail. */
export function pageFor(id: string): PageDef {
  const written = pages.find((page) => page.id === id);
  if (written) return written;
  const found = rowIndex.get(id);
  const row = found?.row ?? { id, name: id, kind: "unit" as Kind };
  return {
    id, name: row.name, kind: row.kind, layer: "Base",
    backlinks: [{ label: found?.source.name ?? "Dataset" }],
    props: [
      kindProp(row.kind, id),
      ...(row.cost !== undefined ? [{ icon: <Hash />, label: "Cost", value: <><strong className="num">{row.cost} pts</strong><Muted>{found?.source.name}</Muted></> }] : []),
      { icon: <Layers size={14} />, label: "Layer", value: found?.source.tag ? <>{found.source.name}<Muted>add-on</Muted></> : "Base" },
    ],
    more: [{ label: "Text key", value: <span className="mono">{id.split(/[:/]/).pop()}</span> }],
    blocks: row.cost !== undefined ? <Blk kw="cost"><span className="mono">pts {row.cost}</span></Blk> : <Blk><Muted>No statements of its own</Muted></Blk>,
  };
}
