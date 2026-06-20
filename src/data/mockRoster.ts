import type { Roster } from "../types";

export const mockRoster: Roster = {
  name: "Crusade Primary Detachment",
  faction: "Dark Angels",
  system: "10th Edition",
  pointsUsed: 885,
  pointsLimit: 1000,
  sections: [
    {
      id: "hq",
      name: "HQ",
      required: "1/2",
      units: [
        {
          id: "centurion",
          name: "Centurion",
          role: "Commander",
          points: 80,
          count: 1,
          status: "valid",
          note: "Primary command squad",
          keywords: ["Leader", "Jump Pack", "Character"],
          availability: "available",
          slotImpact: "Fills 1 HQ slot",
          options: [
            { id: "jump-pack", name: "Jump Pack", group: "upgrade", points: 20, selected: true },
            { id: "bolt-pistol", name: "Bolt Pistol", group: "weapon", points: 0, selected: true },
            { id: "frag-grenades", name: "Frag Grenades", group: "rule", points: 0, selected: true },
            { id: "cyber-familiar", name: "Cyber-familiar", group: "upgrade", points: 10, selected: false },
          ],
        },
        {
          id: "chaplain",
          name: "Chaplain in Terminator Armour",
          role: "Leader",
          points: 110,
          count: 1,
          status: "warning",
          note: "Missing attached bodyguard",
          keywords: ["Leader", "Terminator", "Priest"],
          availability: "limited",
          slotImpact: "Needs compatible bodyguard",
          options: [
            { id: "crozius", name: "Crozius Arcanum", group: "weapon", points: 0, selected: true },
            { id: "relic-shield", name: "Relic Shield", group: "upgrade", points: 15, selected: false },
            { id: "rites", name: "Rites of Battle", group: "rule", points: 0, selected: true },
          ],
        },
      ],
    },
    {
      id: "battleline",
      name: "Battleline",
      required: "1/6",
      units: [
        {
          id: "assault-squad",
          name: "Assault Squad",
          role: "Troops",
          points: 140,
          count: 10,
          status: "valid",
          keywords: ["Troops", "Infantry", "Antigrav"],
          availability: "available",
          slotImpact: "Fills 1 Battleline slot",
          minCount: 2,
          maxCount: 20,
          pointsPerAdditionalModel: 12,
          options: [
            { id: "bolt-pistol", name: "Bolt pistol", group: "weapon", points: 0, selected: true },
            { id: "chainsword", name: "Chainsword", group: "weapon", points: 0, selected: true },
            { id: "combat-shields", name: "Unit swaps Bolt Pistols for Combat Shields", group: "upgrade", points: 20, selected: false },
            { id: "frag-grenades", name: "Frag grenades", group: "rule", points: 0, selected: true },
            { id: "krak-grenades", name: "Krak grenades", group: "rule", points: 0, selected: true },
            { id: "prime-unit", name: "Prime Unit", group: "rule", points: 0, selected: false },
          ],
          detail: {
            composition: [
              { id: "sergeant", name: "Sergeant", summary: "Bolt pistol, Chainsword", count: 1 },
              { id: "legionary", name: "Legionary", summary: "Chainsword, Bolt pistol", count: 9, countOffset: -1, editable: true, pointsPerModel: 12 },
            ],
            choiceGroups: [
              {
                id: "combat-shield-choice",
                title: "Every model may exchange its Bolt pistol for a combat shield",
                optionIds: ["combat-shields"],
              },
            ],
            standaloneOptionIds: ["frag-grenades", "krak-grenades", "prime-unit"],
            models: [
              { id: "sergeant", count: 1, name: "Sergeant", summary: "Bolt pistol, Chainsword" },
              { id: "legionary", count: 9, countOffset: -1, name: "Legionary", summary: "Chainsword, Bolt pistol" },
            ],
            profileTables: [
              {
                id: "model-profile",
                title: "Profile",
                columns: ["M", "WS", "BS", "S", "T", "W", "I", "A", "LD", "CL", "WP", "IN", "SAV", "INV"],
                rows: [
                  { id: "assault-sergeant", name: "Assault Sergeant", values: ["12", "4", "4", "4", "4", "1", "4", "2", "8", "7", "7", "7", "3+", "-"], tags: ["Infantry", "Sergeant", "Antigrav"] },
                  { id: "assault-legionary", name: "Assault Legionary (x9)", values: ["12", "4", "4", "4", "4", "1", "4", "2", "7", "7", "7", "7", "3+", "-"], tags: ["Infantry", "Antigrav"] },
                ],
              },
              {
                id: "ranged-weapon",
                title: "Ranged Weapon",
                columns: ["R", "FP", "RS", "AP", "D", "Special Rules", "Traits"],
                rows: [
                  { id: "bolt-pistol-profile", name: "Bolt pistol (x10)", values: ["12", "1", "4", "5", "1", "Pistol", "Assault, Ranged"] },
                  { id: "frag-grenades-profile", name: "Frag grenades", values: ["6", "1", "3", "6", "1", "Blast (3\")", "Assault"] },
                ],
              },
              {
                id: "melee-weapon",
                title: "Melee Weapon",
                columns: ["IM", "AM", "SM", "AP", "D", "Special Rules", "Traits"],
                rows: [
                  { id: "chainsword-profile", name: "Chainsword (x10)", values: ["I", "A", "S", "5", "1", "Shred (6+)", "Chain"] },
                  { id: "krak-grenades-profile", name: "Krak grenades", values: ["-3", "1", "6", "4", "2", "Detonation", "-"] },
                ],
              },
            ],
            traits: ["Loyalist", "Dark Angels"],
            wargear: [
              {
                id: "frag-grenade-wargear",
                name: "Frag grenades",
                description: "When making Volley Attacks during Step 4 of the Charge Procedure, a unit containing at least one model with frag grenades may make a single frag grenade attack instead of a normal Shooting Attack.",
              },
            ],
            rules: ["Bulky (2)", "Deep Strike", "Vanguard (2)", "Sergeant Sub-Type", "Infantry Type", "Antigrav Sub-Type", "Pistol", "Shred (6+)", "Blast (3\")", "Detonation"],
            categories: ["Troops", "Assault Squad", "No default Power Weapon", "Infantry Model Type", "Antigrav Model Sub-Type"],
          },
        },
      ],
    },
    {
      id: "elites",
      name: "Elites",
      required: "2/3",
      units: [
        {
          id: "terminators",
          name: "Terminator Squad",
          role: "Veterans",
          points: 185,
          count: 5,
          status: "valid",
          keywords: ["Terminator", "Veterans", "Deep Strike"],
          availability: "available",
          slotImpact: "Fills 1 Elite slot",
          options: [
            { id: "storm-bolters", name: "Storm Bolters", group: "weapon", points: 0, selected: true },
            { id: "chainfist", name: "Chainfist", group: "weapon", points: 10, selected: false },
            { id: "teleport-homer", name: "Teleport Homer", group: "upgrade", points: 0, selected: true },
          ],
        },
        {
          id: "bladeguard",
          name: "Bladeguard Veterans",
          role: "Veterans",
          points: 180,
          count: 6,
          status: "error",
          note: "Roster exceeds elite slot preference",
          keywords: ["Veterans", "Infantry", "Shield"],
          availability: "locked",
          slotImpact: "Elite preference exceeded",
          options: [
            { id: "master-crafted", name: "Master-crafted Power Swords", group: "weapon", points: 0, selected: true },
            { id: "storm-shield", name: "Storm Shields", group: "upgrade", points: 0, selected: true },
            { id: "ancient-vow", name: "Ancient Vow", group: "rule", points: 15, selected: false },
          ],
        },
      ],
    },
    {
      id: "transport",
      name: "Transport",
      required: "1/2",
      units: [
        {
          id: "rhino",
          name: "Rhino",
          role: "Dedicated Transport",
          points: 75,
          count: 1,
          status: "valid",
          keywords: ["Vehicle", "Transport", "Smoke"],
          availability: "available",
          slotImpact: "Fills 1 Transport slot",
          options: [
            { id: "hunter-killer", name: "Hunter-killer Missile", group: "weapon", points: 5, selected: false },
            { id: "smoke", name: "Smoke Launchers", group: "rule", points: 0, selected: true },
          ],
        },
      ],
    },
    {
      id: "enhancements",
      name: "Enhancements",
      required: "1/3",
      units: [
        {
          id: "lion-helm",
          name: "Lion Helm",
          role: "Relic",
          points: 30,
          count: 1,
          status: "valid",
          keywords: ["Relic", "Aura", "Enhancement"],
          availability: "limited",
          slotImpact: "Uses 1 Enhancement slot",
          options: [
            { id: "aura", name: "Guardian Aura", group: "rule", points: 0, selected: true },
            { id: "oath", name: "Oath-bound Bearer", group: "upgrade", points: 0, selected: true },
          ],
        },
      ],
    },
  ],
};

export const mockSystems = [
  { id: "wh40k-10", name: "Warhammer 40,000", edition: "10th Edition", catalogues: 24 },
  { id: "hh-2", name: "Horus Heresy", edition: "2.0", catalogues: 18 },
  { id: "aos-4", name: "Age of Sigmar", edition: "4th Edition", catalogues: 29 },
];

export const mockCatalogues = [
  { id: "dark-angels", name: "Dark Angels", updated: "v42", status: "Current" },
  { id: "space-marines", name: "Adeptus Astartes", updated: "v19", status: "Current" },
  { id: "chaos", name: "Heretic Astartes", updated: "v16", status: "Review" },
];

export const mockDetachments = [
  { id: "crusade", name: "Crusade Force Organization Chart", slots: "11 slots", fit: "Recommended" },
  { id: "unrestricted", name: "Unrestricted Collection", slots: "Open", fit: "Sandbox" },
  { id: "cohort", name: "Cohorts Vagus", slots: "8 slots", fit: "Narrative" },
];
