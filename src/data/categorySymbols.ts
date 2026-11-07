/**
 * F2 section 3 (approved 2026-11-07): semantic symbols for force-layout categories, by word family.
 *
 * DEC-001 clarification (user, 2026-11-07): these family words are generic category vocabulary, used as display hints only.
 * The app ships this table in app-core as a separate config (plain data, not logic), so a later version can let users or
 * the library add or change icons. The gallery keeps the same split: this file is the data, `matchCategorySymbol` below is
 * the rule.
 *
 * Rules:
 * 1. Normalise: lower case, punctuation and hyphens to spaces, collapse spaces (the name is still shown as the data has it).
 * 2. Match the head only: the text before the first " - " or ":" ("Recon - Outriders Only" → "recon").
 * 3. Ordered whole-word phrases, most specific first ("fast attack", "heavy support", "heavy assault", "heavy transport"
 *    before "fast", "support", "transport"). The first phrase that matches wins.
 * 4. Display hints only: a symbol never affects validity, limits or grouping.
 * No match → the hexagon (unmatched names are told apart by letters, like every repeated symbol).
 */
export type SymbolIcon =
  | "feather" | "target" | "swords" | "package" | "crown" | "users" | "shield" | "star" | "gem" | "compass"
  | "bot" | "truck" | "paw-print" | "castle" | "handshake" | "venetian-mask" | "scroll-text" | "hexagon";

export type SymbolFamily = { id: string; label: string; icon: SymbolIcon; /** Spoken and shown name of the symbol. */ symbol: string; added?: boolean; example: string };

/** The 17 word families (9 from the investigation, 8 added) and the fallback, in table order. `example`: a neutral category word. */
export const symbolFamilies: SymbolFamily[] = [
  { id: "fast", label: "Fast / mounted", icon: "feather", symbol: "Feather", example: "Fast Attack" },
  { id: "heavy-support", label: "Heavy support / artillery", icon: "target", symbol: "Target", example: "Heavy Support" },
  { id: "assault", label: "Assault", icon: "swords", symbol: "Swords", added: true, example: "Heavy Assault" },
  { id: "transport", label: "Transport / logistics", icon: "package", symbol: "Package", example: "Transport" },
  { id: "command", label: "Command / leader", icon: "crown", symbol: "Crown", example: "Command" },
  { id: "retinue", label: "Retinue / bodyguard", icon: "users", symbol: "People", added: true, example: "Retinue" },
  { id: "troops", label: "Troops / core / line", icon: "shield", symbol: "Shield", example: "Troops" },
  { id: "elite", label: "Elite / veteran", icon: "star", symbol: "Star", example: "Elites" },
  { id: "rare", label: "Rare", icon: "gem", symbol: "Gem", added: true, example: "Rare" },
  { id: "recon", label: "Recon / scout", icon: "compass", symbol: "Compass", example: "Recon" },
  { id: "automata", label: "Automata / war engine", icon: "bot", symbol: "Robot", example: "War engine" },
  { id: "armour", label: "Armour / vehicle", icon: "truck", symbol: "Truck", example: "Armour" },
  { id: "monster", label: "Monster / beast", icon: "paw-print", symbol: "Paw", added: true, example: "Monster" },
  { id: "fortification", label: "Fortification / terrain", icon: "castle", symbol: "Castle", added: true, example: "Fortification" },
  { id: "allies", label: "Allies / mercenaries", icon: "handshake", symbol: "Handshake", added: true, example: "Allies" },
  { id: "operative", label: "Operative / agent", icon: "venetian-mask", symbol: "Mask", added: true, example: "Operative" },
  { id: "army-rules", label: "Army rules / configuration", icon: "scroll-text", symbol: "Scroll", added: true, example: "Order of Battle" },
];
export const fallbackSymbol: SymbolFamily = { id: "none", label: "No match → fallback", icon: "hexagon", symbol: "Hexagon", example: "anything else; letters tell them apart" };

/** Ordered whole-word phrases (most specific first); a family can appear twice to put its general words after others. */
export const symbolPhrases: Array<{ family: string; phrases: string[] }> = [
  { family: "fast", phrases: ["fast attack"] },
  { family: "heavy-support", phrases: ["heavy support"] },
  { family: "assault", phrases: ["heavy assault", "assault"] },
  { family: "transport", phrases: ["dedicated transport", "heavy transport", "transport", "transports", "logistics"] },
  { family: "command", phrases: ["high command", "command", "hq", "headquarters", "leader", "leaders", "warlord", "character", "characters", "hero", "heroes"] },
  { family: "retinue", phrases: ["retinue", "bodyguard", "escort"] },
  { family: "troops", phrases: ["troops", "troop", "core", "line", "battleline", "infantry"] },
  { family: "elite", phrases: ["elite", "elites", "veteran", "veterans", "special"] },
  { family: "rare", phrases: ["rare"] },
  { family: "recon", phrases: ["recon", "reconnaissance", "scout", "scouts"] },
  { family: "fast", phrases: ["fast", "cavalry", "mounted"] },
  { family: "heavy-support", phrases: ["artillery", "support", "war machine"] },
  { family: "automata", phrases: ["war engine", "automata", "automaton", "robot", "robots", "drone", "drones"] },
  { family: "armour", phrases: ["armour", "armor", "vehicle", "vehicles", "tank", "tanks"] },
  { family: "monster", phrases: ["monster", "monsters", "beast", "beasts", "swarm"] },
  { family: "fortification", phrases: ["fortification", "fortifications", "terrain", "asset", "assets"] },
  { family: "allies", phrases: ["allies", "allied", "ally", "mercenaries", "mercenary"] },
  { family: "operative", phrases: ["operative", "operatives", "agent", "agents", "assassin"] },
  { family: "army-rules", phrases: ["configuration", "composition", "reference", "order of battle", "allegiance", "doctrine"] },
];

const normalise = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]|_/gu, " ").replace(/\s+/g, " ").trim();
/** The head of a category name: the text before the first " - " or ":". */
export const categoryHead = (name: string) => name.split(/\s+-\s+|:/)[0];

/** The symbol family for a category name (the fallback hexagon when nothing matches). */
export function matchCategorySymbol(name: string): SymbolFamily {
  const head = ` ${normalise(categoryHead(name))} `;
  for (const rule of symbolPhrases) {
    if (rule.phrases.some((p) => head.includes(` ${p} `))) return symbolFamilies.find((f) => f.id === rule.family) ?? fallbackSymbol;
  }
  return fallbackSymbol;
}
