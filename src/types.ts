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
  keywords: string[];
  availability: "available" | "limited" | "locked";
  slotImpact: string;
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
  | "armory-future"
  | "curved-command"
  | "roster-dock"
  | "force-ribbon"
  | "glass-ledger"
  | "build-timeline"
  | "archive-command-deck"
  | "archive-armory-glass"
  | "archive-tactical-ledger"
  | "archive-miniature-case"
  | "archive-forge-workbench";

export type GalleryMode = "current" | "archive";

export type PrototypeScreen =
  | "library"
  | "system"
  | "catalogue"
  | "detachment"
  | "overview"
  | "add-unit"
  | "unit-detail"
  | "validation"
  | "export";

export type PrototypeAction =
  | "openRoster"
  | "createRoster"
  | "selectSystem"
  | "selectCatalogue"
  | "selectDetachment"
  | "selectSection"
  | "addUnit"
  | "configureUnit"
  | "toggleOption"
  | "validateRoster"
  | "exportRoster";

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
