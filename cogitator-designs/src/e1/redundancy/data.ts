import type { DSource } from "../../directions/direction-d-content";
import type { Kind } from "../../sample";

/**
 * Sample data for the Redundancy view (X1, Proposal): the X0 synthetic dataset of the Battle Augur docs
 * (`docs/06 DKLPO Format/examples/x0/`, "Lantern Marches"), with its planted copies R1–R10 as `augur dklpo clones` reports
 * them and the changes `augur dklpo extract --dry-run` plans (counts, bytes, lines and file names are the commands' own,
 * run on 2026-11-27). The large state is invented at the scale the plan reports for real data (counts only), with
 * invented names (DEC-001).
 */

export const X0_DIR = "~/Datasets/lantern-marches";

const units = (module: string, rows: [string, string, number?][]) => rows.map(([key, name, cost]) => ({ id: `${module}:${key}`, name, kind: "unit" as Kind, cost }));

/** The sidebar's sources: the system, the library, three factions and the sub-faction. */
export const x0Sources: DSource[] = [
  { id: "lantern-marches", name: "Lantern Marches", kind: "system", groups: [{ label: "Forces", rows: [{ id: "lantern-marches:patrol", name: "Patrol", kind: "force" }] }, { label: "Rules", rows: [{ id: "lantern-marches:steadfast", name: "Steadfast", kind: "rule" }] }] },
  { id: "common-kit", name: "Common Kit", kind: "catalogue", tag: "library", groups: [{ label: "Units", rows: units("common-kit", [["sellsword-band", "Sellsword Band", 45], ["war-hounds", "War Hounds", 30]]) }] },
  { id: "ember-guild", name: "Ember Guild", kind: "catalogue", groups: [{ label: "Units", rows: units("ember-guild", [["forge-master", "Forge Master", 70], ["levy-band", "Levy Band", 30], ["hearth-wardens", "Hearth Wardens", 20], ["shield-line", "Shield Line", 40], ["scout-riders", "Scout Riders", 60], ["standard-guard", "Standard Guard", 55], ["stalker-beast", "Stalker Beast", 50]]) }] },
  { id: "tide-compact", name: "Tide Compact", kind: "catalogue", groups: [{ label: "Units", rows: units("tide-compact", [["levy-band", "Levy Band", 30], ["shield-line", "Shield Line", 40], ["brine-guard", "Brine Guard", 30]]) }] },
  { id: "moss-covenant", name: "Moss Covenant", kind: "catalogue", groups: [{ label: "Units", rows: units("moss-covenant", [["grove-keeper", "Grove Keeper", 65], ["levy-band", "Levy Band", 30], ["shield-line", "Shield Line", 40]]) }] },
  { id: "ash-lodge", name: "Ash Lodge", kind: "catalogue", tag: "sub-faction", groups: [{ label: "Units", rows: units("ash-lodge", [["ash-seers", "Ash Seers", 35]]) }] },
];

/** The refused state's dataset: X0 with one patch module of its own (tide-errata), which changes a member. */
export const x0SourcesWithPatch: DSource[] = [...x0Sources, { id: "tide-errata", name: "Tide Errata", kind: "catalogue", tag: "patch", groups: [{ label: "Rules", rows: [] }] }];

export const x0Tables: DSource[] = [
  { id: "table:units", name: "All units", kind: "unit", table: true, groups: [{ label: "Units", rows: Array.from({ length: 31 }, (_, i) => ({ id: `t${i}`, name: "", kind: "unit" as Kind })) }] },
];

export const moduleName: Record<string, string> = {
  "lantern-marches": "Lantern Marches", "common-kit": "Common Kit", "ember-guild": "Ember Guild", "tide-compact": "Tide Compact", "moss-covenant": "Moss Covenant", "ash-lodge": "Ash Lodge",
};

/** What a group is (X1-1): identical, value-only (Apply), similar (listed only). Subjects: entries, groups, rules, profiles. */
export type CopyKind = "identical" | "value-only" | "similar";
export type Subject = "entry" | "group" | "rule" | "profile";
export type Member = { path: string; module: string; kind: Kind | "profile"; file: string; line: number; bytes: number; keeps?: string[] };
export type Difference = { place: string; values: string[]; base: number };
export type Group = {
  id: string; name: string; key: string; kind: CopyKind; subject: Subject; entryKind: Kind | "profile";
  members: Member[]; differences: Difference[]; extra?: { member: string; at: string; lines: string[]; bytes: number }[];
  saved: number; base?: string;
  /** `extract --dry-run`: overlay statements, text entries moved / removed, logic bytes after, files. */
  plan?: { overlays: number; moved: number; removed: number; after: number; files: number };
  /** Members beyond the ones listed (the large state). */
  total?: number; modules?: number;
};

const m = (module: string, key: string, kind: Member["kind"], file: string, line: number, bytes: number, keeps?: string[]): Member =>
  ({ path: `${module}:${key}`, module, kind, file: `${module}/${file}`, line, bytes, keeps });

export const LOGIC_BYTES = 12659;

/** The nine groups `augur dklpo clones` reports on X0, in its order (ranked by saved bytes within each kind). */
export const x0Groups: Group[] = [
  {
    id: "ember-guild:levy-band", name: "Levy Band", key: "levy-band", kind: "identical", subject: "entry", entryKind: "unit", saved: 287, base: "common-kit:levy-band",
    members: [m("ember-guild", "levy-band", "unit", "entries.dkl", 25, 214), m("moss-covenant", "levy-band", "unit", "entries.dkl", 26, 214), m("tide-compact", "levy-band", "unit", "entries.dkl", 22, 214)],
    differences: [], plan: { overlays: 0, moved: 3, removed: 9, after: 12373, files: 8 },
  },
  {
    id: "ember-guild:shield-line", name: "Shield Line", key: "shield-line", kind: "value-only", subject: "entry", entryKind: "unit", saved: 178, base: "common-kit:shield-line",
    members: [
      m("ember-guild", "shield-line", "unit", "entries.dkl", 54, 211, []),
      m("moss-covenant", "shield-line", "unit", "entries.dkl", 36, 212, ["max 1 in roster", "model shieldbearer 10..20"]),
      m("tide-compact", "shield-line", "unit", "entries.dkl", 32, 211, ["max 3 in roster", "model shieldbearer 5..15"]),
    ],
    differences: [
      { place: "max.roster", values: ["max 2 in roster", "max 1 in roster", "max 3 in roster"], base: 0 },
      { place: "shieldbearer header", values: ["model shieldbearer 5..10", "model shieldbearer 10..20", "model shieldbearer 5..15"], base: 0 },
    ],
    plan: { overlays: 4, moved: 2, removed: 6, after: 12481, files: 8 },
  },
  {
    id: "ember-guild:scout-riders", name: "Scout Riders", key: "scout-riders", kind: "value-only", subject: "entry", entryKind: "unit", saved: 83, base: "common-kit:scout-riders",
    members: [
      m("ember-guild", "scout-riders", "unit", "entries.dkl", 64, 165, []),
      m("moss-covenant", "scout-riders", "unit", "entries.dkl", 46, 165, ["cost pts 55", "rider: cost pts 13"]),
      m("tide-compact", "scout-riders", "unit", "entries.dkl", 42, 165, ["cost pts 65", "rider: cost pts 15"]),
    ],
    differences: [
      { place: "cost.pts", values: ["cost pts 60", "cost pts 55", "cost pts 65"], base: 0 },
      { place: "rider cost.pts", values: ["cost pts 14", "cost pts 13", "cost pts 15"], base: 0 },
    ],
    plan: { overlays: 4, moved: 2, removed: 6, after: 12577, files: 8 },
  },
  {
    id: "ember-guild:signal-horn", name: "Signal Horn", key: "signal-horn", kind: "identical", subject: "entry", entryKind: "upgrade", saved: 8, base: "common-kit:signal-horn",
    members: [m("ember-guild", "signal-horn", "upgrade", "entries.dkl", 106, 85), m("moss-covenant", "signal-horn", "upgrade", "entries.dkl", 92, 85), m("tide-compact", "signal-horn", "upgrade", "entries.dkl", 113, 85)],
    differences: [], plan: { overlays: 0, moved: 1, removed: 3, after: 12652, files: 8 },
  },
  {
    id: "ember-guild:stalker-beast", name: "Stalker Beast", key: "stalker-beast", kind: "value-only", subject: "entry", entryKind: "unit", saved: 0, base: "common-kit:stalker-beast",
    members: [m("ember-guild", "stalker-beast", "unit", "entries.dkl", 86, 137), m("moss-covenant", "stalker-beast", "unit", "entries.dkl", 67, 137), m("tide-compact", "stalker-beast", "unit", "entries.dkl", 96, 137)],
    differences: [{ place: "stalker/stalker header", values: ["profile stalker: fighter | 8\" | 4 | 5 | 4", "profile stalker: fighter | 8\" | 3 | 5 | 5", "profile stalker: fighter | 7\" | 4 | 6 | 4"], base: 0 }],
    plan: { overlays: 2, moved: 2, removed: 6, after: 12675, files: 8 },
  },
  {
    id: "ember-guild:rally", name: "Rally", key: "rally", kind: "identical", subject: "rule", entryKind: "rule", saved: 0, base: "common-kit:rally",
    members: [m("ember-guild", "rally", "rule", "entries.dkl", 1, 21), m("moss-covenant", "rally", "rule", "entries.dkl", 1, 21), m("tide-compact", "rally", "rule", "entries.dkl", 1, 21)],
    differences: [], plan: { overlays: 0, moved: 1, removed: 3, after: 12735, files: 8 },
  },
  {
    id: "ash-lodge:smoke-flask", name: "Smoke Flask", key: "smoke-flask", kind: "identical", subject: "profile", entryKind: "profile", saved: 0, base: "common-kit:smoke-flask",
    members: [m("ash-lodge", "smoke-flask", "profile", "module.dkl", 19, 33), m("tide-compact", "smoke-flask", "profile", "entries.dkl", 8, 33)],
    differences: [], plan: { overlays: 0, moved: 1, removed: 2, after: 12756, files: 6 },
  },
  {
    id: "ember-guild:throwing-axe", name: "Throwing Axe", key: "throwing-axe", kind: "identical", subject: "profile", entryKind: "profile", saved: 0, base: "common-kit:throwing-axe",
    members: [m("ember-guild", "throwing-axe", "profile", "entries.dkl", 7, 42), m("moss-covenant", "throwing-axe", "profile", "entries.dkl", 7, 42), m("tide-compact", "throwing-axe", "profile", "entries.dkl", 7, 42)],
    differences: [], plan: { overlays: 0, moved: 1, removed: 3, after: 12768, files: 8 },
  },
  {
    id: "ember-guild:standard-guard", name: "Standard Guard", key: "standard-guard", kind: "similar", subject: "entry", entryKind: "unit", saved: 0,
    members: [m("ember-guild", "standard-guard", "unit", "entries.dkl", 73, 299), m("tide-compact", "standard-guard", "unit", "entries.dkl", 63, 337)],
    differences: [], extra: [{ member: "tide-compact:standard-guard", at: "war-drum", lines: ["  upgrade war-drum ..1", "    cost pts 8"], bytes: 38 }],
  },
];

/** Density (X1-6, MQ-10): bytes of every member beyond one per identical or value-only group, over the logic bytes. */
export const x0Density = { cloneBytes: 1784, logicBytes: LOGIC_BYTES };
export const afterShieldLine = { cloneBytes: 1361, logicBytes: 12481 };

/** The change `extract ember-guild:shield-line --dry-run` plans, file by file (the base, the members' overlays, the names). */
/** A line of a planned file: removed, added, or kept as it is (shown for context). */
export type RdEdit = { line: number; before?: string; after?: string; keep?: string };
export type FileChange = { path: string; note: string; edits: RdEdit[] };
export const shieldLineChange: FileChange[] = [
  {
    path: "common-kit/module.dkl", note: "the abstract base, at the end",
    edits: [
      { line: 68, after: "" },
      { line: 69, after: "abstract unit shield-line" },
      { line: 70, after: "  cat infantry" },
      { line: 71, after: "  max 2 in roster" },
      { line: 72, after: "  cost pts 40" },
      { line: 73, after: "  model shieldbearer 5..10" },
      { line: 74, after: "    cost pts 7" },
      { line: 75, after: "    profile shieldbearer: fighter | 4\" | 3 | 4 | 1" },
      { line: 76, after: "    use common-kit:spear 1" },
      { line: 77, after: "    use common-kit:wargear" },
    ],
  },
  {
    path: "ember-guild/entries.dkl", note: "every value is the base's: no block",
    edits: [
      { line: 54, before: "unit shield-line", after: "unit shield-line extends common-kit:shield-line" },
      { line: 55, before: "  cat infantry" },
      { line: 56, before: "  max 2 in roster" },
      { line: 57, before: "  cost pts 40" },
      { line: 58, before: "  model shieldbearer 5..10" },
      { line: 59, before: "    cost pts 7" },
      { line: 60, before: "    profile shieldbearer: fighter | 4\" | 3 | 4 | 1" },
      { line: 61, before: "    use common-kit:spear 1" },
      { line: 62, before: "    use common-kit:wargear" },
    ],
  },
  {
    path: "moss-covenant/entries.dkl", note: "keeps its two values",
    edits: [
      { line: 36, before: "unit shield-line", after: "unit shield-line extends common-kit:shield-line" },
      { line: 37, before: "  cat infantry" },
      { line: 38, keep: "  max 1 in roster" },
      { line: 39, before: "  cost pts 40" },
      { line: 40, keep: "  model shieldbearer 10..20" },
      { line: 41, before: "    cost pts 7" },
      { line: 42, before: "    profile shieldbearer: fighter | 4\" | 3 | 4 | 1" },
      { line: 43, before: "    use common-kit:spear 1" },
      { line: 44, before: "    use common-kit:wargear" },
    ],
  },
  {
    path: "tide-compact/entries.dkl", note: "keeps its two values",
    edits: [
      { line: 32, before: "unit shield-line", after: "unit shield-line extends common-kit:shield-line" },
      { line: 33, before: "  cat infantry" },
      { line: 34, keep: "  max 3 in roster" },
      { line: 35, before: "  cost pts 40" },
      { line: 36, keep: "  model shieldbearer 5..15" },
      { line: 37, before: "    cost pts 7" },
      { line: 38, before: "    profile shieldbearer: fighter | 4\" | 3 | 4 | 1" },
      { line: 39, before: "    use common-kit:spear 1" },
      { line: 40, before: "    use common-kit:wargear" },
    ],
  },
];
/** The four text packs: two names move to the base module's pack. */
export const shieldLineText = {
  added: { path: "common-kit/text/en.dkl", lines: ["shield-line: Shield Line", "shield-line/shieldbearer: Shieldbearer"] },
  removed: ["ember-guild/text/en.dkl", "moss-covenant/text/en.dkl", "tide-compact/text/en.dkl"],
};

/** The refusal (a real one: X0 with a patch module `tide-errata` that sets the Tide Compact copy's cost 45 -> 40). */
export const refusal = {
  code: "extract/new-errors",
  message: "The rewritten dataset would have new errors (dklpo/patch-rejected, dklpo/patch-stale): nothing is written",
  errors: [
    { code: "dklpo/patch-stale", at: "tide-errata/module.dkl:4", text: "shield-line.cost.pts was expected to be 45, but it is 40: the operation fails" },
    { code: "dklpo/patch-rejected", at: "tide-errata/module.dkl:1", text: "patch tide-errata is rejected: an operation failed (line 4), so none of its operations is applied" },
  ],
};

/** The large state: invented names at the scale of the real data (a few hundred groups, one of about 800 members). */
const bigModules = ["ember-guild", "tide-compact", "moss-covenant", "ash-lodge", "reed-wardens", "iron-choir", "salt-reavers", "dusk-orchard", "glass-court", "hollow-keep", "amber-host", "frost-vigil", "cinder-pact", "lark-company", "quarry-kin", "veil-sisters", "copper-league", "thorn-march", "gale-riders"];
export const bigModuleCounts = [64, 58, 55, 52, 49, 47, 46, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 30, 28];
const bigName = (k: string) => k.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
export const bigModuleName = (k: string) => moduleName[k] ?? bigName(k);
const bigUnits = ["line-infantry", "levy-band", "shield-line", "watch-patrol", "pike-block", "archer-line", "skirmish-screen", "vanguard"];
export const bigGroup: Group = {
  id: "ember-guild:line-infantry/weapon-choice", name: "Weapon Choice", key: "weapon-choice", kind: "identical", subject: "group", entryKind: "group", saved: 96410, base: "common-kit:weapon-choice",
  members: bigUnits.map((u, i) => m(bigModules[i % 3], `${u}/weapon-choice`, "group", "entries.dkl", 30 + i * 37, 188)),
  differences: [], total: 804, modules: 19, plan: { overlays: 0, moved: 1, removed: 804, after: 6648120, files: 20 },
};
export const bigModulesList = bigModules.map((k, i) => ({ key: k, name: bigModuleName(k), n: bigModuleCounts[i] }));
export type BigRow = { name: string; key: string; kind: CopyKind; entryKind: Kind | "profile"; members: number; modules: string[]; saved: number; diffs?: number };
export const bigRows: { subject: Subject; title: string; groups: number; zero: number; rows: BigRow[] }[] = [
  {
    subject: "group", title: "Groups", groups: 212, zero: 31, rows: [
      { name: "Weapon Choice", key: "weapon-choice", kind: "identical", entryKind: "group", members: 804, modules: bigModules.slice(0, 19), saved: 96410 },
      { name: "Mount", key: "mount", kind: "identical", entryKind: "group", members: 212, modules: bigModules.slice(2, 14), saved: 21880 },
      { name: "Banner Choice", key: "banner-choice", kind: "value-only", entryKind: "group", members: 96, modules: bigModules.slice(0, 9), saved: 7420, diffs: 1 },
      { name: "Wargear", key: "wargear", kind: "identical", entryKind: "group", members: 64, modules: bigModules.slice(4, 12), saved: 5310 },
    ],
  },
  {
    subject: "entry", title: "Entries", groups: 140, zero: 22, rows: [
      { name: "Line Infantry", key: "line-infantry", kind: "value-only", entryKind: "unit", members: 19, modules: bigModules.slice(0, 2), saved: 4360, diffs: 1 },
      { name: "Watch Patrol", key: "watch-patrol", kind: "identical", entryKind: "unit", members: 12, modules: bigModules.slice(3, 15), saved: 3910 },
    ],
  },
  {
    subject: "profile", title: "Profiles", groups: 290, zero: 268, rows: [
      { name: "Hand Weapon", key: "hand-weapon", kind: "identical", entryKind: "profile", members: 165, modules: bigModules.slice(0, 19), saved: 2140 },
    ],
  },
];
export const bigTotals = { toExtract: 656, similar: 107, similarMembers: 345, cloneBytes: 355410, logicBytes: 6746150, modules: 46 };
