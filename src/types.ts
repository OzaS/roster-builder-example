import type { LucideIcon } from "lucide-react";

export type PlatformPreview = "phone" | "tablet";
export type ThemeMode = "dark" | "light";
export type NavigatorView = "single" | "all-screens";

export type WorkflowScreen =
  | "library"
  | "create-roster"
  | "drafts"
  | "source"
  | "overview"
  | "add-detachment"
  | "add-unit"
  | "unit-detail"
  | "option-drilldown"
  | "diagnostics"
  | "export";

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
  | "dock-efficiency"
  | "dock-balanced"
  | "dock-focus"
  | "dock-glass"
  | "dock-showcase"
  | "archive-command-deck"
  | "archive-armory-glass"
  | "archive-tactical-ledger"
  | "archive-miniature-case"
  | "archive-forge-workbench"
  | "archive-armory-future"
  | "archive-curved-command"
  | "archive-force-ribbon"
  | "archive-glass-ledger"
  | "archive-build-timeline"
  | "archive-dock-efficiency"
  | "archive-dock-balanced"
  | "archive-dock-focus"
  | "archive-dock-showcase";

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
