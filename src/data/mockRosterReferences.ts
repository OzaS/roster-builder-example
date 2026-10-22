import type { RosterReferenceDefinition } from "../types";

export const mockRosterReferences: RosterReferenceDefinition[] = [
  { id: "chartered", label: "Chartered", kind: "trait", description: "This unit holds a charter from the Coalition and may use rules, detachments, and options restricted to Chartered forces.", relatedIds: ["free-cities"] },
  { id: "free-cities", label: "Free Cities", kind: "trait", description: "The unit belongs to the Free Cities League and gains access to its faction rules, equipment, and detachments.", relatedIds: ["chartered", "outrider"] },
  { id: "infantry", label: "Infantry", kind: "trait", aliases: ["Infantry Class", "Infantry Model Class"], description: "Infantry models move, embark, claim objectives, and interact with terrain using the standard Infantry rules.", relatedIds: ["sergeant", "hover"] },
  { id: "sergeant", label: "Sergeant", kind: "trait", aliases: ["Sergeant Sub-Class"], description: "A Sergeant is the unit leader. Rules that select or replace a unit leader apply to this model.", relatedIds: ["infantry"] },
  { id: "hover", label: "Hover", kind: "trait", aliases: ["Hover Sub-Class", "Hover Model Sub-Class"], description: "Hover models skim above the battlefield and use the movement and terrain interactions associated with their subtype.", relatedIds: ["infantry", "outrider"] },
  { id: "mobile", label: "Mobile", kind: "trait", description: "A Mobile weapon is intended for rapid engagements and follows the Mobile weapon restrictions for its system.", relatedIds: ["ranged", "pistol"] },
  { id: "ranged", label: "Ranged", kind: "trait", description: "This profile is used to resolve attacks made at range.", relatedIds: ["mobile", "pistol"] },
  { id: "serrated", label: "Serrated", kind: "trait", description: "A Serrated weapon uses powered teeth and may interact with rules that improve or modify serrated weapons.", relatedIds: ["tear"] },
  { id: "broad", label: "Broad (2)", kind: "rule", description: "Each model with Broad (2) counts as two models when determining transport capacity.", relatedIds: ["infantry"] },
  { id: "aerial-drop", label: "Aerial Drop", kind: "rule", description: "A unit with Aerial Drop may enter play from reserves using the Aerial Drop deployment procedure.", relatedIds: ["outrider"] },
  { id: "outrider", label: "Outrider (2)", kind: "rule", aliases: ["Outrider"], description: "Outrider allows this unit to make its pre-battle repositioning move up to the listed value.", relatedIds: ["aerial-drop", "hover"] },
  { id: "pistol", label: "Pistol", kind: "rule", description: "Pistol weapons are compact sidearms and use the Pistol firing restrictions when their bearer is engaged.", relatedIds: ["mobile", "ranged"] },
  { id: "tear", label: "Tear (6+)", kind: "rule", aliases: ["Tear"], description: "When resolving this attack, qualifying wound rolls at the listed value gain the benefit described by the Tear rule.", relatedIds: ["serrated"] },
  { id: "blast", label: "Blast (3\")", kind: "rule", aliases: ["Blast"], description: "Blast attacks can generate additional hits against tightly grouped targets according to the listed blast value.", relatedIds: ["ranged"] },
  { id: "shatter", label: "Shatter", kind: "rule", description: "Shatter changes how this weapon resolves its hit and damage effects against its target.", relatedIds: ["blast"] },
  { id: "line", label: "Line", kind: "category", description: "Line identifies the battlefield role used when organizing this unit in a roster.", relatedIds: ["forward-squad"] },
  { id: "forward-squad", label: "Forward Squad", kind: "category", description: "This category identifies rules and options that specifically affect Forward Squad units.", relatedIds: ["line", "infantry"] },
  { id: "no-default-charged-weapon", label: "No default Charged Weapon", kind: "category", description: "This catalogue marker indicates that a charged weapon is not included in the unit's default equipment.", relatedIds: ["forward-squad"] },
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
