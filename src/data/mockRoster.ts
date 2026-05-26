import type { Roster } from "../types";

export const mockRoster: Roster = {
  name: "Crusade Primary Detachment",
  faction: "Dark Angels",
  system: "10th Edition",
  pointsUsed: 840,
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
          id: "intercessors",
          name: "Intercessor Squad",
          role: "Troops",
          points: 95,
          count: 5,
          status: "valid",
          options: [
            { id: "auto-rifles", name: "Auto Bolt Rifles", group: "weapon", points: 0, selected: true },
            { id: "grenade-launcher", name: "Auxiliary Grenade Launcher", group: "weapon", points: 5, selected: false },
            { id: "objective-secured", name: "Objective Secured", group: "rule", points: 0, selected: true },
          ],
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
          options: [
            { id: "aura", name: "Guardian Aura", group: "rule", points: 0, selected: true },
            { id: "oath", name: "Oath-bound Bearer", group: "upgrade", points: 0, selected: true },
          ],
        },
      ],
    },
  ],
};
