/**
 * Lookup 1.0 synthetic reference data (game-neutral, DEC-001), shared by the phone, tablet and desktop Lookup designs.
 * Four result groups: Units, Detachments (force entries), Upgrades (entries picked inside a unit: weapons, gear,
 * unit upgrades) and Rules. A shared entry used by several factions is one entity listing every faction; separate
 * entries with the same name are separate entities, told apart by their source line (faction · system).
 */
export type LookupGroupId = "unit" | "detachment" | "upgrade" | "rule";

export const lookupGroups: Array<{ id: LookupGroupId; label: string; singular: string }> = [
  { id: "unit", label: "Units", singular: "Unit" },
  { id: "detachment", label: "Detachments", singular: "Detachment" },
  { id: "upgrade", label: "Upgrades", singular: "Upgrade" },
  { id: "rule", label: "Rules", singular: "Rule" },
];

export const lookupSystems = [
  { name: "Open Field", version: "v1.4" },
  { name: "Example System Two", version: "v3.0.2" },
] as const;

export type LookupProfile = { title: string; columns: string[]; rows: Array<{ name: string; values: string[] }>; text?: boolean };
export type LookupOptionGroup = { title: string; limit: string; items: Array<{ name: string; cost: string; id?: string }> };

export type LookupEntity = {
  id: string;
  group: LookupGroupId;
  name: string;
  system: string;
  /** Factions whose data contains this entry; empty = the system's core rules. */
  factions: string[];
  /** Kind line under the name: role and size for units, the entry's type for the others. */
  summary: string;
  /** Base cost from the data, without roster context. */
  cost?: string;
  /** How the cost scales or that a roster may change it; never an invented final value. */
  costNote?: string;
  /** D10: hidden by default or available only under conditions; the reason in plain words. */
  conditional?: string;
  text?: string;
  layout?: { models: string; rows: Array<{ name: string; count: string; cost: string }>; limits?: string[] };
  profiles?: LookupProfile[];
  rules?: string[];
  options?: LookupOptionGroup[];
  categories?: string[];
  slots?: Array<{ category: string; min: number; max: number; units: string[] }>;
  takenBy?: Array<{ id: string; cost: string; limit: string }>;
  usedBy?: string[];
};

const unitStats = ["Mv", "Df", "Rs", "Hp"];
const weaponStats = ["Range", "A", "S", "AP"];

export const lookupEntities: LookupEntity[] = [
  /* ------------------------------ Units ------------------------------ */
  {
    id: "u-line-fc", group: "unit", name: "Line Infantry", system: "Open Field", factions: ["Frontier Coalition"], summary: "Core · 10–20 models",
    cost: "120 pts", costNote: "+12 pts per extra model",
    layout: { models: "10–20 models", rows: [{ name: "Line Trooper", count: "9–19", cost: "12 pts each" }, { name: "Sergeant", count: "1", cost: "Included" }], limits: ["Up to 3 per roster"] },
    profiles: [
      { title: "Unit", columns: unitStats, rows: [{ name: "Line Trooper", values: ['6"', "4+", "7", "1"] }, { name: "Sergeant", values: ['6"', "4+", "8", "2"] }] },
      { title: "Ranged weapons", columns: weaponStats, rows: [{ name: "Line rifle", values: ['24"', "1", "3", "0"] }, { name: "Sidearm", values: ['12"', "1", "3", "0"] }] },
      { title: "Abilities", columns: ["Description"], text: true, rows: [{ name: "Shoulder to shoulder", values: ["While this unit has 10 or more models, add 1 to its resolve."] }] },
    ],
    rules: ["r-hold-line", "r-steady"],
    options: [
      { title: "Sergeant weapon", limit: "Choose 1", items: [{ name: "Sidearm", cost: "Included", id: "up-sidearm" }, { name: "Officer blade", cost: "+5 pts", id: "up-blade" }] },
      { title: "Special weapons", limit: "Up to 2 per 10 models", items: [{ name: "Arc rifle", cost: "+10 pts", id: "up-arc" }, { name: "Heavy carbine", cost: "+5 pts", id: "up-carbine" }] },
      { title: "Unit upgrades", limit: "Up to 1 each", items: [{ name: "Line standard", cost: "+10 pts", id: "up-line-standard" }, { name: "Signal horn", cost: "+5 pts", id: "up-horn" }] },
    ],
    categories: ["Core", "Infantry", "Line"],
  },
  {
    id: "u-line-gl", group: "unit", name: "Line Infantry", system: "Example System Two", factions: ["Glass Legion"], summary: "Troops · 5–10 models",
    cost: "65 pts", costNote: "+11 pts per extra model",
    layout: { models: "5–10 models", rows: [{ name: "Legionary", count: "4–9", cost: "11 pts each" }, { name: "Decurion", count: "1", cost: "Included" }] },
    profiles: [{ title: "Unit", columns: ["Mv", "Sk", "Sv", "W"], rows: [{ name: "Legionary", values: ['5"', "4+", "5+", "1"] }, { name: "Decurion", values: ['5"', "3+", "5+", "1"] }] }],
    rules: ["r-unbroken"], categories: ["Troops", "Infantry"],
  },
  {
    id: "u-veteran-line", group: "unit", name: "Veteran Line", system: "Open Field", factions: ["Frontier Coalition", "Free Cities"], summary: "Elite · 5–10 models",
    cost: "95 pts", costNote: "May change in a roster",
    layout: { models: "5–10 models", rows: [{ name: "Veteran", count: "5–10", cost: "19 pts each" }] },
    profiles: [{ title: "Unit", columns: unitStats, rows: [{ name: "Veteran", values: ['6"', "3+", "8", "1"] }] }],
    rules: ["r-hold-line"], categories: ["Elite", "Infantry", "Line"],
  },
  {
    id: "u-line-breaker", group: "unit", name: "Line Breaker", system: "Open Field", factions: ["Free Cities"], summary: "Support · 1 model",
    cost: "150 pts", conditional: "Hidden by default. The data makes it available only under some conditions, which the roster decides.",
    layout: { models: "1 model", rows: [{ name: "Line Breaker", count: "1", cost: "Included" }], limits: ["Up to 1 per roster"] },
    profiles: [{ title: "Unit", columns: unitStats, rows: [{ name: "Line Breaker", values: ['8"', "3+", "8", "8"] }] }],
    categories: ["Support", "Vehicle"],
  },
  { id: "u-commander", group: "unit", name: "Force Commander", system: "Open Field", factions: ["Frontier Coalition"], summary: "Command · 1 model", cost: "90 pts", categories: ["Command", "Infantry"] },
  { id: "u-marshal", group: "unit", name: "Field Marshal", system: "Open Field", factions: ["Frontier Coalition"], summary: "Command · 1 model", cost: "110 pts", categories: ["Command", "Infantry"] },
  { id: "u-recon", group: "unit", name: "Recon Team", system: "Open Field", factions: ["Frontier Coalition"], summary: "Core · 5 models", cost: "85 pts", categories: ["Core", "Infantry"] },
  { id: "u-walker", group: "unit", name: "Patrol Walker", system: "Open Field", factions: ["Frontier Coalition"], summary: "Support · 1 model", cost: "145 pts", categories: ["Support", "Vehicle"] },
  { id: "u-harbour", group: "unit", name: "Harbour Guard", system: "Open Field", factions: ["Free Cities"], summary: "Core · 8 models", cost: "110 pts", categories: ["Core", "Infantry"] },

  /* --------------------------- Detachments --------------------------- */
  {
    id: "d-line-formation", group: "detachment", name: "Line Formation", system: "Open Field", factions: ["Frontier Coalition"], summary: "4 slots",
    rules: ["r-formation-drill", "r-hold-line"],
    slots: [
      { category: "Command", min: 1, max: 2, units: ["u-commander", "u-marshal"] },
      { category: "Core", min: 2, max: 6, units: ["u-line-fc", "u-recon"] },
      { category: "Elite", min: 0, max: 3, units: ["u-veteran-line"] },
      { category: "Support", min: 0, max: 2, units: ["u-walker"] },
    ],
  },
  {
    id: "d-battle-line", group: "detachment", name: "Battle Line", system: "Example System Two", factions: ["Glass Legion"], summary: "3 slots",
    rules: ["r-unbroken"],
    slots: [{ category: "Leaders", min: 1, max: 1, units: [] }, { category: "Troops", min: 2, max: 4, units: ["u-line-gl"] }, { category: "Support", min: 0, max: 2, units: [] }],
  },

  /* ----------------------------- Upgrades ----------------------------- */
  {
    id: "up-line-rifle", group: "upgrade", name: "Line rifle", system: "Open Field", factions: ["Frontier Coalition", "Free Cities"], summary: "Ranged weapon",
    cost: "Varies", costNote: "Depends on the unit",
    profiles: [{ title: "Ranged weapons", columns: weaponStats, rows: [{ name: "Line rifle", values: ['24"', "1", "3", "0"] }] }],
    takenBy: [{ id: "u-line-fc", cost: "Included", limit: "Every Line Trooper" }, { id: "u-veteran-line", cost: "Included", limit: "Every Veteran" }, { id: "u-harbour", cost: "+1 pts per model", limit: "Any number" }],
  },
  {
    id: "up-line-standard", group: "upgrade", name: "Line standard", system: "Open Field", factions: ["Frontier Coalition"], summary: "Unit upgrade",
    cost: "+10 pts", rules: ["r-rally"], takenBy: [{ id: "u-line-fc", cost: "+10 pts", limit: "Up to 1" }],
  },
  {
    id: "up-lineage", group: "upgrade", name: "Lineage of Glass", system: "Example System Two", factions: ["Glass Legion"], summary: "Command upgrade",
    cost: "+20 pts", conditional: "Available only under some conditions in a roster; the roster decides.", text: "The bearer may re-roll one failed save each round.",
  },
  { id: "up-sidearm", group: "upgrade", name: "Sidearm", system: "Open Field", factions: ["Frontier Coalition"], summary: "Ranged weapon", cost: "Included", profiles: [{ title: "Ranged weapons", columns: weaponStats, rows: [{ name: "Sidearm", values: ['12"', "1", "3", "0"] }] }], takenBy: [{ id: "u-line-fc", cost: "Included", limit: "Choose 1" }] },
  { id: "up-blade", group: "upgrade", name: "Officer blade", system: "Open Field", factions: ["Frontier Coalition"], summary: "Melee weapon", cost: "+5 pts", takenBy: [{ id: "u-line-fc", cost: "+5 pts", limit: "Choose 1" }] },
  { id: "up-arc", group: "upgrade", name: "Arc rifle", system: "Open Field", factions: ["Frontier Coalition"], summary: "Ranged weapon", cost: "+10 pts", takenBy: [{ id: "u-line-fc", cost: "+10 pts", limit: "Up to 2 per 10 models" }] },
  { id: "up-carbine", group: "upgrade", name: "Heavy carbine", system: "Open Field", factions: ["Frontier Coalition"], summary: "Ranged weapon", cost: "+5 pts", takenBy: [{ id: "u-line-fc", cost: "+5 pts", limit: "Up to 2 per 10 models" }] },
  { id: "up-horn", group: "upgrade", name: "Signal horn", system: "Open Field", factions: ["Frontier Coalition"], summary: "Unit upgrade", cost: "+5 pts", takenBy: [{ id: "u-line-fc", cost: "+5 pts", limit: "Up to 1" }] },

  /* ------------------------------ Rules ------------------------------ */
  { id: "r-hold-line", group: "rule", name: "Hold the line", system: "Open Field", factions: [], summary: "Unit ability", text: "While this unit is within 3\" of an objective it controls, it cannot be forced to fall back and adds 1 to its resolve.", usedBy: ["u-line-fc", "u-veteran-line", "d-line-formation"] },
  { id: "r-los", group: "rule", name: "Line of sight", system: "Open Field", factions: [], summary: "Core rule", text: "A model can see a target if a straight line can be drawn from any part of the model to any part of the target without passing through terrain that blocks sight." },
  { id: "r-unbroken", group: "rule", name: "Unbroken Line", system: "Example System Two", factions: ["Glass Legion"], summary: "Faction rule", text: "Units with this rule ignore the first failed morale test each battle.", usedBy: ["u-line-gl", "d-battle-line"] },
  { id: "r-steady", group: "rule", name: "Steady advance", system: "Open Field", factions: [], summary: "Unit ability", text: "This unit may make a normal move and keep its formation bonus while within range of its commander.", usedBy: ["u-line-fc"] },
  { id: "r-formation-drill", group: "rule", name: "Formation drill", system: "Open Field", factions: ["Frontier Coalition"], summary: "Detachment rule", text: "Once per round, one Core unit from this detachment may move again after it has shot, up to half its move.", usedBy: ["d-line-formation"] },
  { id: "r-rally", group: "rule", name: "Rally", system: "Open Field", factions: [], summary: "Upgrade rule", text: "Friendly units within 6\" of the bearer may re-roll failed resolve tests.", usedBy: ["up-line-standard"] },
];

export const lookupById = (id: string) => lookupEntities.find((e) => e.id === id);

/** "Frontier Coalition", "Frontier Coalition, Free Cities", "4 factions" or "Core rules". */
export function factionLabel(e: LookupEntity) {
  if (e.factions.length === 0) return "Core rules";
  return e.factions.length <= 2 ? e.factions.join(", ") : `${e.factions.length} factions`;
}

/** Source line: factions, plus the system when results span several systems. */
export function sourceLine(e: LookupEntity, withSystem: boolean) {
  return withSystem ? `${factionLabel(e)} · ${e.system}` : factionLabel(e);
}

export function systemVersion(name: string) {
  return lookupSystems.find((s) => s.name === name)?.version ?? "";
}

/** Name search (substring, case-insensitive) in the chosen systems; null = every system. */
export function searchLookup(query: string, systems: string[] | null) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return lookupEntities.filter((e) => e.name.toLowerCase().includes(q) && (systems === null || systems.includes(e.system)));
}
