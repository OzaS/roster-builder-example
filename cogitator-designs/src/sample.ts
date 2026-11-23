/**
 * Synthetic sample content for every Field Cogitator mock: the invented "Demo Skirmish" dataset of the DKLPO examples
 * (Battle Augur docs, `06 DKLPO Format/examples/s0` and `a2`). Invented names only; no third-party game content.
 */

export const dataset = { id: "demo-skirmish", title: "Demo Skirmish", version: "3.2.0", checking: "lenient", dklpo: "1.0" };

export type Layer = { id: string; title: string; kind: string; version: string; on: boolean };
export const layers: Layer[] = [
  { id: "demo-skirmish", title: "Demo Skirmish", kind: "Base", version: "3.2.0", on: true },
  { id: "demo-skirmish-house", title: "House rules", kind: "Variant · rules", version: "1.0.0", on: true },
  { id: "demo-skirmish-frost", title: "Frost Wardens (homebrew)", kind: "Variant · content", version: "0.3.0", on: true },
  { id: "demo-skirmish-draft", title: "Draft points (trial)", kind: "Variant · test", version: "0.1.0", on: false },
];

export type Kind = "system" | "catalogue" | "unit" | "model" | "upgrade" | "group" | "rule" | "category" | "force" | "profile-type" | "cost-type";
export type DiagKind = "error" | "preservation" | "suggestion";

export type NavEntry = { path: string; name: string; kind: Kind; cost?: number; was?: number; diag?: DiagKind; layer?: string };
export type NavModule = { id: string; name: string; kind: "system" | "catalogue"; layer: string; groups: { label: string; entries: NavEntry[] }[] };

export const modules: NavModule[] = [
  {
    id: "demo-skirmish", name: "Demo Skirmish", kind: "system", layer: "demo-skirmish",
    groups: [
      { label: "Forces", entries: [{ path: "warband", name: "Warband", kind: "force" }] },
      { label: "Categories", entries: [
        { path: "leader", name: "Leader", kind: "category" },
        { path: "line", name: "Line", kind: "category" },
        { path: "infantry", name: "Infantry", kind: "category" },
      ] },
      { label: "Rules", entries: [{ path: "shield-wall", name: "Shield Wall", kind: "rule" }] },
    ],
  },
  {
    id: "iron-wardens", name: "Iron Wardens", kind: "catalogue", layer: "demo-skirmish",
    groups: [
      { label: "Units", entries: [
        { path: "warden-squad", name: "Warden Squad", kind: "unit", cost: 18, was: 20, diag: "preservation" },
        { path: "warden-captain", name: "Warden Captain", kind: "unit", cost: 45, diag: "suggestion" },
      ] },
      { label: "Upgrades", entries: [
        { path: "spear", name: "Spear", kind: "upgrade", cost: 0, diag: "suggestion" },
        { path: "halberd", name: "Halberd", kind: "upgrade", cost: 2 },
      ] },
    ],
  },
  {
    id: "frost-wardens", name: "Frost Wardens", kind: "catalogue", layer: "demo-skirmish-frost",
    groups: [
      { label: "Units", entries: [
        { path: "ice-guard", name: "Ice Guard", kind: "unit", cost: 24, diag: "error" },
        { path: "frost-seer", name: "frost-seer", kind: "unit", cost: 50, diag: "suggestion" },
      ] },
      { label: "Upgrades", entries: [{ path: "rime-blade", name: "Rime Blade", kind: "upgrade", cost: 3 }] },
    ],
  },
];

export type Diagnostic = { id: string; kind: DiagKind; code: string; where: string; message: string; fix?: string; layer: string };
export const diagnostics: Diagnostic[] = [
  { id: "d1", kind: "error", code: "ref-unknown", where: "frost-wardens:ice-guard/weapon", message: "Unknown reference `halbred`", fix: "Change to `halberd`", layer: "Frost Wardens" },
  { id: "d2", kind: "preservation", code: "order-changed", where: "iron-wardens:warden-squad", message: "Source comment moves below `x-bs.exampleReviewState` on export", fix: "Show diff", layer: "Base" },
  { id: "d3", kind: "preservation", code: "ns-prefix", where: "demo-skirmish", message: "Prefix of `ex:editorState` is not restored on export", fix: "Show diff", layer: "Base" },
  { id: "d4", kind: "suggestion", code: "unread-key", where: "iron-wardens:warden-squad", message: "`x-bs.exampleReviewState` is read by no rule", fix: "Move to envelope", layer: "Base" },
  { id: "d5", kind: "suggestion", code: "default-value", where: "iron-wardens:spear", message: "`cost pts 0` is the default", fix: "Remove line", layer: "Base" },
  { id: "d6", kind: "suggestion", code: "no-text", where: "frost-wardens:frost-seer", message: "No `en` text: the name shows as the path", fix: "Add name", layer: "Frost Wardens" },
  { id: "d7", kind: "suggestion", code: "label-default", where: "iron-wardens:warden-captain/leads", message: "`label $` repeats the default label", fix: "Remove line", layer: "Base" },
];

export const diagCounts = {
  error: diagnostics.filter((d) => d.kind === "error").length,
  preservation: diagnostics.filter((d) => d.kind === "preservation").length,
  suggestion: diagnostics.filter((d) => d.kind === "suggestion").length,
};

export const diagLabel: Record<DiagKind, string> = { error: "Errors", preservation: "Preservation", suggestion: "Suggestions" };
export const diagOne: Record<DiagKind, string> = { error: "Error", preservation: "Preservation failure", suggestion: "Suggestion" };

/** The entry every direction opens: iron-wardens:warden-squad. */
export const entry = {
  module: "iron-wardens",
  path: "warden-squad",
  full: "iron-wardens:warden-squad",
  name: "Warden Squad",
  kind: "unit" as Kind,
  categories: ["infantry", "line"],
  cost: 18,
  baseCost: 20,
  costLayer: "House rules",
  rules: ["shield-wall"],
  bsdataId: "1f0a-5e1e-0000-0001",
  textKey: "warden-squad",
  extra: { key: "x-bs.exampleReviewState", value: "draft" },
  ruleText: "While two or more models of this unit stand in base contact, attacks against them lose 1 attack.",
};

export const backlinks = [
  { from: "iron-wardens", where: "root use warden-squad", note: "Root entry, category line", layer: "Base" },
  { from: "iron-wardens:warden-captain/leads", where: "association leads 0..1 to warden-squad", note: "Warden Captain can lead it", layer: "Base" },
  { from: "demo-skirmish-house", where: "patch iron-wardens:warden-squad · cost pts 18", note: "House rules lower the cost", layer: "House rules" },
];

/** The entry body as DKLPO statements (for the blocks and the source view). */
export const body = [
  { depth: 0, kw: "x-bs.exampleReviewState:", rest: "draft", extra: true },
  { depth: 0, kw: "cat", rest: "infantry" },
  { depth: 0, kw: "use", rest: "shield-wall", ref: true },
  { depth: 0, kw: "cost", rest: "pts 20" },
  { depth: 0, kw: "model", rest: "warden 5..10" },
  { depth: 1, kw: "cost", rest: "pts 8" },
  { depth: 1, kw: "profile", rest: "warden: fighter | 5\" | 3 | 1" },
  { depth: 1, kw: "upgrade", rest: "banner ..1" },
  { depth: 2, kw: "hide when", rest: "no(warden-captain in force, deep)", ref: true },
  { depth: 2, kw: "cost", rest: "pts 10" },
  { depth: 1, kw: "group", rest: "weapon 1 default spear" },
  { depth: 2, kw: "use", rest: "spear", ref: true },
  { depth: 2, kw: "use", rest: "halberd", ref: true },
];
