import type { RosterReferenceDefinition } from "../types";

export const mockRosterReferences: RosterReferenceDefinition[] = [
  { id: "loyalist", label: "Loyalist", kind: "trait", description: "This unit remains loyal to the Imperium and may use rules, detachments, and options restricted to Loyalist forces.", relatedIds: ["dark-angels"] },
  { id: "dark-angels", label: "Dark Angels", kind: "trait", description: "The unit belongs to the Dark Angels Legion and gains access to its faction rules, wargear, and detachments.", relatedIds: ["loyalist", "vanguard"] },
  { id: "infantry", label: "Infantry", kind: "trait", aliases: ["Infantry Type", "Infantry Model Type"], description: "Infantry models move, embark, claim objectives, and interact with terrain using the standard Infantry rules.", relatedIds: ["sergeant", "antigrav"] },
  { id: "sergeant", label: "Sergeant", kind: "trait", aliases: ["Sergeant Sub-Type"], description: "A Sergeant is the unit leader. Rules that select or replace a unit leader apply to this model.", relatedIds: ["infantry"] },
  { id: "antigrav", label: "Antigrav", kind: "trait", aliases: ["Antigrav Sub-Type", "Antigrav Model Sub-Type"], description: "Antigrav models skim above the battlefield and use the movement and terrain interactions associated with their subtype.", relatedIds: ["infantry", "vanguard"] },
  { id: "assault", label: "Assault", kind: "trait", description: "An Assault weapon is intended for mobile engagements and follows the Assault weapon restrictions for its system.", relatedIds: ["ranged", "pistol"] },
  { id: "ranged", label: "Ranged", kind: "trait", description: "This profile is used to resolve attacks made at range.", relatedIds: ["assault", "pistol"] },
  { id: "chain", label: "Chain", kind: "trait", description: "A Chain weapon uses powered teeth and may interact with rules that improve or modify chain weapons.", relatedIds: ["shred"] },
  { id: "bulky", label: "Bulky (2)", kind: "rule", description: "Each model with Bulky (2) counts as two models when determining transport capacity.", relatedIds: ["infantry"] },
  { id: "deep-strike", label: "Deep Strike", kind: "rule", description: "A unit with Deep Strike may enter play from reserves using the Deep Strike deployment procedure.", relatedIds: ["vanguard"] },
  { id: "vanguard", label: "Vanguard (2)", kind: "rule", aliases: ["Vanguard"], description: "Vanguard allows this unit to make its pre-battle repositioning move up to the listed value.", relatedIds: ["deep-strike", "antigrav"] },
  { id: "pistol", label: "Pistol", kind: "rule", description: "Pistol weapons are compact sidearms and use the Pistol firing restrictions when their bearer is engaged.", relatedIds: ["assault", "ranged"] },
  { id: "shred", label: "Shred (6+)", kind: "rule", aliases: ["Shred"], description: "When resolving this attack, qualifying wound rolls at the listed value gain the benefit described by the Shred rule.", relatedIds: ["chain"] },
  { id: "blast", label: "Blast (3\")", kind: "rule", aliases: ["Blast"], description: "Blast attacks can generate additional hits against tightly grouped targets according to the listed blast value.", relatedIds: ["ranged"] },
  { id: "detonation", label: "Detonation", kind: "rule", description: "Detonation changes how this weapon resolves its hit and damage effects against its target.", relatedIds: ["blast"] },
  { id: "troops", label: "Troops", kind: "category", description: "Troops identifies the battlefield role used when organizing this unit in a roster.", relatedIds: ["assault-squad"] },
  { id: "assault-squad", label: "Assault Squad", kind: "category", description: "This category identifies rules and options that specifically affect Assault Squad units.", relatedIds: ["troops", "infantry"] },
  { id: "no-default-power-weapon", label: "No default Power Weapon", kind: "category", description: "This catalogue marker indicates that a power weapon is not included in the unit's default equipment.", relatedIds: ["assault-squad"] },
];

const referencesById = new Map(mockRosterReferences.map((reference) => [reference.id, reference]));
const referencesByName = new Map<string, RosterReferenceDefinition>();

mockRosterReferences.forEach((reference) => {
  [reference.label, ...(reference.aliases ?? [])].forEach((name) => referencesByName.set(normalizeReferenceName(name), reference));
});

function normalizeReferenceName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function referenceById(id: string): RosterReferenceDefinition | undefined {
  return referencesById.get(id);
}

export function resolveRosterReference(value: string): RosterReferenceDefinition | undefined {
  return referencesByName.get(normalizeReferenceName(value));
}
