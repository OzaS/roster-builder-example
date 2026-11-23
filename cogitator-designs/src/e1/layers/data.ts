import type { Kind } from "../../sample";
import { frostWardens, houseRules, ironWardens, type ModuleText } from "../editor/data";

/**
 * E1 screens part 2 (worker B): the layer stack, dataset search and the dataset runner. Synthetic "Demo Skirmish"
 * content only (DEC-001), the same dataset as the editor screens (`../editor/data.ts`, Direction D's sources) and the
 * DKLPO A2 examples (base, house rules, the Frost Wardens content variant, the draft points test variant, a text add-on).
 */

/* =====================================================================================================================
 * Layer stack
 * ===================================================================================================================== */

export type LayerKind = "dataset" | "addon" | "variant";
export type LayerStatus = "base" | "applied" | "refused" | "off";
export type OpOutcome = "applied" | "failed" | "moved" | "overridden" | "overrides";
export type LayerOp = { line: number; text: string; outcome: OpOutcome; entry?: string; note?: string };
export type LayerPatch = { key: string; title: string; target: string; after?: string; status: "applied" | "partial" | "rejected" | "skipped"; file: string; ops: LayerOp[] };
/** One value a layer changes: on which entry, what, the base value and the value after this layer. */
export type LayerChange = { entry: string; name: string; kind: Kind; what: string; base: string; value: string; overriddenBy?: string };

export type LayerDef = {
  key: string;
  title: string;
  short: string;
  kind: LayerKind;
  purpose: string[];
  version: string;
  folder: string;
  licence?: string;
  source?: string;
  requires?: { range: string; ok: boolean };
  status: LayerStatus;
  /** Why it isn't applied, with its code. */
  refused?: { code: string; message: string };
  modules?: string[];
  patches?: LayerPatch[];
  text?: { keys: number; overrides: number; unknown: number; note: string };
  changes: LayerChange[];
  /** Add-ons: the display-only check (logic hash with and without the add-on). */
  displayOnly?: { ok: boolean; hash: string; with: string; detail?: string };
};

export const BASE_VERSION = "3.2.0";
export const BUILT_AT = "14:06";

const base: LayerDef = {
  key: "demo-skirmish", title: "Demo Skirmish", short: "Base", kind: "dataset", purpose: [], version: BASE_VERSION, folder: "demo-skirmish/", licence: "CC0-1.0",
  status: "base", modules: ["demo-skirmish", "iron-wardens"], text: { keys: 41, overrides: 0, unknown: 0, note: "Text pack en, the base's own" }, changes: [],
};

const house: LayerDef = {
  key: "demo-skirmish-house", title: "House rules", short: "House rules", kind: "variant", purpose: ["rules"], version: "1.0.0", folder: "house-rules/", licence: "CC-BY-4.0",
  requires: { range: "^3.2", ok: true }, status: "applied",
  patches: [{
    key: "house", title: "House rules", target: "iron-wardens >=18", status: "applied", file: "house/patch.dkl",
    ops: [
      { line: 6, text: "set warden-squad.cost.pts 20 -> 18", outcome: "applied", entry: "iron-wardens:warden-squad" },
      { line: 8, text: "set warden-squad/warden/banner.cost.pts 10 -> 5", outcome: "applied", entry: "iron-wardens:warden-squad" },
    ],
  }],
  text: { keys: 1, overrides: 1, unknown: 0, note: "Overrides the base's rule text of Shield Wall" },
  changes: [
    { entry: "iron-wardens:warden-squad", name: "Warden Squad", kind: "unit", what: "cost pts", base: "20", value: "18" },
    { entry: "iron-wardens:warden-squad", name: "Banner", kind: "upgrade", what: "cost pts", base: "10", value: "5" },
    { entry: "demo-skirmish:shield-wall", name: "Shield Wall", kind: "rule", what: "rule text", base: "“lose 2 attacks”", value: "“lose 1 attack”" },
  ],
};

const frost: LayerDef = {
  key: "demo-skirmish-frost", title: "Frost Wardens", short: "Frost Wardens", kind: "variant", purpose: ["content"], version: "0.3.0", folder: "frost-content/", licence: "CC-BY-4.0",
  requires: { range: "^3.0", ok: true }, status: "applied", modules: ["frost-wardens"],
  patches: [{ key: "frost-slots", title: "Room for Frost Wardens", target: "demo-skirmish", status: "applied", file: "frost-slots/patch.dkl", ops: [{ line: 5, text: "edit warband", outcome: "applied", entry: "demo-skirmish:warband", note: "slot line 1..6" }] }],
  text: { keys: 4, overrides: 0, unknown: 0, note: "Names for its own module" },
  changes: [
    { entry: "demo-skirmish:warband", name: "Warband", kind: "force", what: "slot line", base: "1..4", value: "1..6" },
    { entry: "frost-wardens:ice-guard", name: "Ice Guard", kind: "unit", what: "new entry", base: "–", value: "24 pts" },
    { entry: "frost-wardens:frost-seer", name: "frost-seer", kind: "unit", what: "new entry", base: "–", value: "50 pts" },
    { entry: "frost-wardens:rime-blade", name: "Rime Blade", kind: "upgrade", what: "new entry", base: "–", value: "3 pts" },
  ],
};

const names: LayerDef = {
  key: "demo-skirmish-names", title: "Short names", short: "Short names", kind: "addon", purpose: ["text"], version: "1.0.0", folder: "short-names/", licence: "CC-BY-4.0",
  requires: { range: "^3.2", ok: true }, status: "applied",
  text: { keys: 6, overrides: 0, unknown: 0, note: "Short names for Iron Wardens and Frost Wardens units" },
  changes: [
    { entry: "iron-wardens:warden-squad", name: "Warden Squad", kind: "unit", what: "short name", base: "absent", value: "Squad" },
    { entry: "iron-wardens:warden-captain", name: "Warden Captain", kind: "unit", what: "short name", base: "absent", value: "Captain" },
  ],
  displayOnly: { ok: true, hash: "5c3e 91a0", with: "5c3e 91a0" },
};

const draft: LayerDef = {
  key: "demo-skirmish-draft", title: "Draft points", short: "Draft points", kind: "variant", purpose: ["test"], version: "0.1.0", folder: "draft-points/",
  requires: { range: "^3.2", ok: true }, status: "off",
  patches: [{ key: "trial", title: "Trial points", target: "iron-wardens", after: "house", status: "skipped", file: "trial/patch.dkl", ops: [{ line: 6, text: "set warden-squad.cost.pts 18 -> 16", outcome: "applied", entry: "iron-wardens:warden-squad" }] }],
  changes: [{ entry: "iron-wardens:warden-squad", name: "Warden Squad", kind: "unit", what: "cost pts", base: "20", value: "16" }],
};

export type LayerState = "stack" | "refused" | "conflict" | "addon-rules" | "overlay";

/** The stack in each state: the base first, then the layers in their order (later wins), then the ones that are off. */
export function stackFor(state: LayerState): LayerDef[] {
  if (state === "refused") {
    return [
      base, house,
      { ...frost, version: "0.4.0", requires: { range: "^3.3", ok: false }, status: "refused", refused: { code: "requires-conflict", message: "requires `demo-skirmish ^3.3`; the base is 3.2.0" },
        changes: frost.changes.map((c) => ({ ...c, value: c.what === "new entry" ? "not in the build" : c.base })) },
      { ...names, text: { keys: 6, overrides: 0, unknown: 3, note: "3 keys for `frost-wardens`, a module that isn't in the build: not applied (text-unknown)" } },
      draft,
    ];
  }
  if (state === "conflict") {
    return [
      base,
      { ...house, changes: house.changes.map((c, i) => (i === 0 ? { ...c, overriddenBy: "Draft points" } : c)), patches: house.patches?.map((p) => ({ ...p, ops: p.ops.map((o, i) => (i === 0 ? { ...o, outcome: "overridden" as const, note: "Draft points' trial sets it again, later in the order" } : o)) })) },
      frost, names,
      { ...draft, status: "applied", patches: draft.patches?.map((p) => ({ ...p, status: "applied" as const, ops: p.ops.map((o) => ({ ...o, outcome: "overrides" as const, note: "Overrides House rules' set at house/patch.dkl:6 (patch-conflict, info): later wins" })) })),
        changes: [{ entry: "iron-wardens:warden-squad", name: "Warden Squad", kind: "unit", what: "cost pts, after House rules", base: "18", value: "16" }] },
    ];
  }
  if (state === "addon-rules") {
    return [
      base, house, frost,
      { ...names, version: "1.1.0", status: "refused", refused: { code: "addon-changes-rules", message: "its text reaches a logic field: declare it as a variant" },
        text: { keys: 7, overrides: 0, unknown: 0, note: "6 short names and `rally`, a value the base's logic reads" },
        changes: [...names.changes, { entry: "iron-wardens:warden-captain", name: "Warden Captain", kind: "unit", what: "attack += $rally", base: "absent (no effect)", value: "1" }],
        displayOnly: { ok: false, hash: "5c3e 91a0", with: "a71d 0c4f", detail: "first differing line: entity iron-wardens:warden-captain/captain, modifier attack, value 1 (absent without the add-on)" } },
      draft,
    ];
  }
  return [base, house, frost, names, draft];
}

export const kindLabel = (l: LayerDef) => (l.kind === "dataset" ? "Base dataset" : `${l.kind === "addon" ? "Add-on" : "Variant"} · ${l.purpose.join(", ")}`);

/* =====================================================================================================================
 * Search
 * ===================================================================================================================== */

export type SearchField = "name" | "key" | "reference" | "statement" | "text";
/** One searchable line: `text` is what is matched (a text pack line's value; `prefix` is its key), `lines` the file for the preview. */
export type SearchDoc = { id: string; source: string; layer: string; entry?: string; entryName: string; kind: Kind; field: SearchField; file: string; line: number; text: string; prefix?: string; lines?: string[] };

/** Text packs, drawn as `key: value` lines (synthetic, matching the pages). */
const packs: { source: string; layer: string; file: string; lines: { key: string; text: string; entry?: string; kind: Kind }[] }[] = [
  { source: "Demo Skirmish", layer: "Base", file: "demo-skirmish/text/en.dkl", lines: [
    { key: "warband", text: "Warband", entry: "demo-skirmish:warband", kind: "force" },
    { key: "shield-wall", text: "Shield Wall", entry: "demo-skirmish:shield-wall", kind: "rule" },
    { key: "shield-wall.rule", text: "While two or more models of this unit stand in base contact, attacks against them lose 2 attacks.", entry: "demo-skirmish:shield-wall", kind: "rule" },
  ] },
  { source: "Iron Wardens", layer: "Base", file: "iron-wardens/text/en.dkl", lines: [
    { key: "warden-squad", text: "Warden Squad", entry: "iron-wardens:warden-squad", kind: "unit" },
    { key: "warden-captain", text: "Warden Captain", entry: "iron-wardens:warden-captain", kind: "unit" },
    { key: "warden-archers", text: "Warden Archers", entry: "iron-wardens:warden-archers", kind: "unit" },
    { key: "shield-bearers", text: "Shield Bearers", entry: "iron-wardens:shield-bearers", kind: "unit" },
    { key: "shield-bearers.note", text: "Counts as a Shield Wall for the unit it leads.", entry: "iron-wardens:shield-bearers", kind: "unit" },
    { key: "halberd", text: "Halberd", entry: "iron-wardens:halberd", kind: "upgrade" },
    { key: "spear", text: "Spear", entry: "iron-wardens:spear", kind: "upgrade" },
  ] },
  { source: "Frost Wardens", layer: "Frost Wardens", file: "frost-content/frost-wardens/text/en.dkl", lines: [
    { key: "ice-guard", text: "Ice Guard", entry: "frost-wardens:ice-guard", kind: "unit" },
    { key: "rime-blade", text: "Rime Blade", entry: "frost-wardens:rime-blade", kind: "upgrade" },
  ] },
  { source: "House rules", layer: "House rules", file: "house-rules/house/text/en.dkl", lines: [
    { key: "shield-wall.rule", text: "While two or more models of this unit stand in base contact, attacks against them lose 1 attack.", entry: "demo-skirmish:shield-wall", kind: "rule" },
  ] },
  { source: "Short names", layer: "Short names", file: "short-names/iron-wardens/text/en.dkl", lines: [
    { key: "warden-squad.short", text: "Squad", entry: "iron-wardens:warden-squad", kind: "unit" },
    { key: "warden-captain.short", text: "Captain", entry: "iron-wardens:warden-captain", kind: "unit" },
  ] },
];

/** The off layer (Draft points): searched only when it is on. */
export const offLayerDocs: SearchDoc[] = [
  { id: "off-1", source: "Draft points", layer: "Draft points", entry: "iron-wardens:warden-squad", entryName: "Warden Squad", kind: "unit", field: "statement", file: "draft-points/trial/patch.dkl", line: 6, text: "set warden-squad.cost.pts 18 -> 16" },
];

const declKinds: Record<string, Kind> = { unit: "unit", upgrade: "upgrade", model: "model", rule: "rule", group: "group" };

function moduleDocs(module: ModuleText, source: string, layer: string, entryName: (id: string) => string, entryKind: (id: string) => Kind): SearchDoc[] {
  const out: SearchDoc[] = [];
  let entry: string | undefined;
  module.lines.forEach((raw, i) => {
    const text = raw.trim();
    if (!text || text.startsWith("#")) return;
    const indent = raw.length - raw.trimStart().length;
    const [kw, key] = text.split(" ");
    if (indent === 0) entry = declKinds[kw] ? `${module.id}:${key}` : undefined;
    const field: SearchField = indent === 0 && declKinds[kw] ? "key" : /^(use|root use|association|hide|import|set|group)\b/.test(text) ? "reference" : "statement";
    out.push({ id: `${module.id}:${i + 1}`, source, layer, entry, entryName: entry ? entryName(entry) : module.name, kind: entry ? entryKind(entry) : "catalogue", field, file: module.path, line: i + 1, text, lines: module.lines });
  });
  return out;
}

/** The system module (as in the A2 example), for the preview of its lines. */
export const systemLines = [
  "## Synthetic system. Invented content only.",
  "system demo-skirmish",
  "  revision 3",
  "",
  "cost-type pts limit 500",
  "",
  "profile-type fighter",
  "  move",
  "  attack",
  "  wounds",
  "",
  "category leader",
  "",
  "force warband",
  "  slot leader 1",
  "  slot line 1..4",
  "",
  "rule shield-wall",
];

export function buildIndex(entryName: (id: string) => string, entryKind: (id: string) => Kind): SearchDoc[] {
  const docs: SearchDoc[] = [
    ...moduleDocs(ironWardens, "Iron Wardens", "Base", entryName, entryKind),
    ...moduleDocs(frostWardens, "Frost Wardens", "Frost Wardens", entryName, entryKind),
    ...moduleDocs({ ...houseRules, path: "house-rules/house/patch.dkl" }, "House rules", "House rules", entryName, entryKind),
    { id: "ds:force", source: "Demo Skirmish", layer: "Base", entry: "demo-skirmish:warband", entryName: "Warband", kind: "force", field: "key", file: "demo-skirmish/module.dkl", line: 14, text: "force warband", lines: systemLines },
    { id: "ds:rule", source: "Demo Skirmish", layer: "Base", entry: "demo-skirmish:shield-wall", entryName: "Shield Wall", kind: "rule", field: "key", file: "demo-skirmish/module.dkl", line: 18, text: "rule shield-wall", lines: systemLines },
  ];
  for (const pack of packs) {
    const lines = [`## ${pack.source} text, en (invented content only)`, ...pack.lines.map((l) => `${l.key}: ${l.text}`)];
    pack.lines.forEach((l, i) => docs.push({ id: `${pack.file}:${i}`, source: pack.source, layer: pack.layer, entry: l.entry, entryName: l.entry ? entryName(l.entry) : l.key, kind: l.kind, field: l.key.includes(".") ? "text" : "name", file: pack.file, line: i + 2, text: l.text, prefix: `${l.key}: `, lines }));
  }
  return docs;
}

/* =====================================================================================================================
 * Runner: the catalogue as the runner sees it (one build), the roster, reload scenarios
 * ===================================================================================================================== */

export type RunOption = { id: string; name: string; kind: "count" | "choice" | "toggle"; min: number; max: number; cost: number; per?: "model"; choices?: { id: string; name: string; cost: number }[]; def?: string; note?: string };
export type RunUnit = { id: string; name: string; category: string; cost: number; options: RunOption[]; profile: { head: string[]; rows: string[][] }; rules: { name: string; text: string }[] };

export const runCatalogue: RunUnit[] = [
  {
    id: "iron-wardens:warden-captain", name: "Warden Captain", category: "Leader", cost: 45,
    options: [
      { id: "captain", name: "Captain", kind: "count", min: 1, max: 1, cost: 0 },
      { id: "weapon", name: "Weapon", kind: "choice", min: 1, max: 1, cost: 0, def: "halberd", choices: [{ id: "halberd", name: "Halberd", cost: 2 }, { id: "spear", name: "Spear", cost: 0 }] },
    ],
    profile: { head: ["Profile", "Type", "Move", "Attack", "Wounds"], rows: [["Captain", "fighter", "6\"", "4", "2"], ["Halberd", "weapon", "1", "4", ""]] },
    rules: [],
  },
  {
    id: "iron-wardens:warden-squad", name: "Warden Squad", category: "Line", cost: 18,
    options: [
      { id: "warden", name: "Warden", kind: "count", min: 5, max: 10, cost: 8, per: "model" },
      { id: "weapon", name: "Weapon", kind: "choice", min: 1, max: 1, cost: 0, per: "model", def: "spear", choices: [{ id: "spear", name: "Spear", cost: 0 }, { id: "halberd", name: "Halberd", cost: 2 }] },
      { id: "banner", name: "Banner", kind: "toggle", min: 0, max: 1, cost: 10, note: "hidden when no Warden Captain in force" },
    ],
    profile: { head: ["Profile", "Type", "Move", "Attack", "Wounds"], rows: [["Warden", "fighter", "5\"", "3", "1"], ["Spear", "weapon", "2", "3", ""]] },
    rules: [{ name: "Shield Wall", text: "While two or more models of this unit stand in base contact, attacks against them lose 1 attack." }],
  },
  {
    id: "iron-wardens:warden-archers", name: "Warden Archers", category: "Infantry", cost: 22,
    options: [
      { id: "archer", name: "Archer", kind: "count", min: 5, max: 10, cost: 13, per: "model", note: "9 pts and a Longbow, 4 pts" },
    ],
    profile: { head: ["Profile", "Type", "Move", "Attack", "Wounds"], rows: [["Archer", "fighter", "5\"", "3", "1"], ["Longbow", "weapon", "24", "3", ""]] },
    rules: [],
  },
  {
    id: "iron-wardens:shield-bearers", name: "Shield Bearers", category: "Infantry", cost: 30,
    options: [{ id: "bearer", name: "Bearer", kind: "count", min: 3, max: 5, cost: 10, per: "model" }],
    profile: { head: ["Profile", "Type", "Move", "Attack", "Wounds"], rows: [["Bearer", "fighter", "4\"", "2", "2"]] },
    rules: [],
  },
];

export const runCategories = [
  { name: "Leader", slot: "1", min: 1, max: 1 },
  { name: "Line", slot: "1..4", min: 1, max: 4 },
  { name: "Infantry", slot: "", min: 0, max: Infinity },
];

/** A selection in the roster: a unit with its option values; `mark` is what the last reload did to it. */
export type RunSel = {
  uid: string; unit: string; label?: string; values: Record<string, number | string>;
  mark?: { kind: "changed" | "name" | "kept" | "moved"; text: string; option?: string };
};

export const startRoster = (): RunSel[] => [
  { uid: "s1", unit: "iron-wardens:warden-captain", values: { captain: 1, weapon: "halberd" } },
  { uid: "s2", unit: "iron-wardens:warden-squad", values: { warden: 5, weapon: "spear", banner: 1 } },
  { uid: "s3", unit: "iron-wardens:warden-squad", values: { warden: 4, weapon: "spear", banner: 0 } },
  { uid: "s4", unit: "iron-wardens:warden-archers", values: { archer: 5 } },
];
