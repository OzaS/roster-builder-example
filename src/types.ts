import type { LucideIcon } from "lucide-react";

export type PlatformPreview = "phone" | "tablet";
export type ThemeMode = "dark" | "light";
export type NavigatorView = "single" | "all-screens" | "elements";

/** In-prototype main navigation style for the merged design. */
export type NavStyle = "top" | "tabs" | "floating";

export type ColorScheme = "generic" | "wh40k" | "horus-heresy" | "age-of-sigmar" | "old-world";

export const colorSchemes: Array<{ id: ColorScheme; label: string; short: string }> = [
  { id: "generic", label: "Generic", short: "GEN" },
  { id: "wh40k", label: "Warhammer 40,000", short: "40K" },
  { id: "horus-heresy", label: "Horus Heresy", short: "HH" },
  { id: "age-of-sigmar", label: "Age of Sigmar", short: "AoS" },
  { id: "old-world", label: "The Old World", short: "TOW" },
];

export type WorkflowScreen =
  | "library"
  | "create-roster"
  | "drafts"
  | "source"
  | "tools"
  | "overview"
  | "add-detachment"
  | "add-unit"
  | "unit-detail"
  | "option-drilldown"
  | "diagnostics"
  | "settings"
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
  | "ux-command"
  | "ux-workbench";

export type PrototypeScreen =
  | "library"
  | "system"
  | "catalogue"
  | "detachment"
  | "tools"
  | "overview"
  | "add-unit"
  | "unit-detail"
  | "validation"
  | "settings"
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
