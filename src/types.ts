import type { LucideIcon } from "lucide-react";

export type PlatformPreview = "phone" | "tablet";

export type RosterOption = {
  id: string;
  name: string;
  group: "weapon" | "upgrade" | "rule";
  points: number;
  selected: boolean;
  disabled?: boolean;
};

export type RosterUnit = {
  id: string;
  name: string;
  role: string;
  points: number;
  count: number;
  status?: "valid" | "warning" | "error";
  note?: string;
  options: RosterOption[];
};

export type RosterSection = {
  id: string;
  name: string;
  required?: string;
  units: RosterUnit[];
};

export type Roster = {
  name: string;
  faction: string;
  system: string;
  pointsUsed: number;
  pointsLimit: number;
  sections: RosterSection[];
};

export type ConceptId =
  | "command-deck"
  | "armory-glass"
  | "tactical-ledger"
  | "miniature-case"
  | "forge-workbench";

export type ConceptMeta = {
  id: ConceptId;
  name: string;
  eyebrow: string;
  icon: LucideIcon;
  bestFor: string;
  direction: string;
  interaction: string;
  tradeoff: string;
};
