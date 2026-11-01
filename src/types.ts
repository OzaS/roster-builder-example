import type { LucideIcon } from "lucide-react";

export type PlatformPreview = "phone" | "tablet";
export type ThemeMode = "dark" | "light";
export type ThemePreference = "system" | ThemeMode;
export type AppLanguage = "en" | "fr";
export type NavigatorView = "single" | "all-screens" | "elements";
export type GalleryRelease = "V1" | "V2";

/** In-prototype main navigation style for the merged design. */
export type NavStyle = "top" | "tabs" | "floating";
export type UnitDetailView = "options" | "profile";
export type ForceCreationMode = "selector" | "inline";
export type TabletPanelLayout = {
  treeRatio: number;
  railRatio: number;
  treeVisible: boolean;
  railVisible: boolean;
};

export type ColorScheme = "default" | "crimson" | "gilded" | "azure" | "verdant";

export const colorSchemes: Array<{ id: ColorScheme; label: string; short: string }> = [
  { id: "default", label: "Default", short: "DEF" },
  { id: "crimson", label: "Crimson", short: "CRI" },
  { id: "gilded", label: "Gilded", short: "GIL" },
  { id: "azure", label: "Azure", short: "AZU" },
  { id: "verdant", label: "Verdant", short: "VER" },
];

export type WorkflowScreen =
  | "tablet-home"
  | "tablet-rosters"
  | "tablet-editor"
  | "tablet-editor-issues"
  | "tablet-editor-add"
  | "tablet-editor-forces"
  | "tablet-editor-add-force"
  | "tablet-editor-readonly"
  | "tablet-editor-export"
  | "tablet-editor-shortcuts"
  | "tablet-editor-text-200"
  | "tablet-editor-add-roles"
  | "tablet-editor-add-focus"
  | "tablet-editor-chip-caption"
  | "tablet-editor-limit-caption"
  | "tablet-editor-separate-all"
  | "tablet-editor-chips-text-150"
  | "tablet-settings-advanced"
  | "tablet-settings-search"
  | "tablet-settings-search-no-results"
  | "tablet-settings-search-developer"
  | "tablet-rosters-text-200"
  | "tablet-sources-text-200"
  | "tablet-settings-text-200"
  | "tablet-rosters-system"
  | "tablet-rosters-grouped"
  | "tablet-rosters-validation-error"
  | "tablet-rosters-validation-warning"
  | "tablet-rosters-status"
  | "tablet-editor-import-result"
  | "tablet-lookup"
  | "tablet-lookup-legacy"
  | "tablet-tools"
  | "tablet-library"
  | "tablet-sources"
  | "tablet-settings"
  | "tablet-home-first-run"
  | "tablet-home-no-rosters"
  | "tablet-home-many-systems"
  | "tablet-rosters-many"
  | "tablet-rosters-search"
  | "tablet-rosters-empty"
  | "tablet-sources-add"
  | "tablet-sources-installing"
  | "tablet-sources-choose-factions"
  | "tablet-sources-update-report"
  | "tablet-sources-collection"
  | "tablet-sources-github"
  | "tablet-sources-add-collection"
  | "tablet-settings-rosters"
  | "tablet-settings-game-data"
  | "tablet-settings-shortcuts"
  | "tablet-create"
  | "tablet-create-review"
  | "tablet-settings-appearance-import"
  | "tablet-editor-move-unit"
  | "tablet-confirm-delete"
  | "duo-closed-rosters"
  | "duo-closed-roster-detail"
  | "duo-closed-editor"
  | "duo-closed-unit"
  | "duo-closed-add"
  | "duo-closed-lookup"
  | "duo-closed-settings"
  | "duo-closed-landscape-rosters"
  | "duo-closed-landscape-editor"
  | "duo-open-rosters"
  | "duo-open-editor"
  | "duo-open-add"
  | "duo-open-lookup"
  | "duo-open-settings"
  | "duo-open-sources"
  | "duo-folded-rosters"
  | "duo-folded-editor"
  | "duo-portrait-rosters"
  | "duo-portrait-editor"
  | "tablet-archive-sketch"
  | "desktop-welcome"
  | "desktop-editor"
  | "desktop-rosters"
  | "desktop-lookup"
  | "desktop-lookup-legacy"
  | "desktop-tools"
  | "desktop-library"
  | "desktop-sources"
  | "desktop-settings"
  | "desktop-first-run"
  | "desktop-menus"
  | "library"
  | "library-v2"
  | "library-filters"
  | "library-filters-search"
  | "library-filters-no-match"
  | "library-filters-keyboard"
  | "tablet-lookup-1-0"
  | "tablet-lookup-1-0-force"
  | "tablet-lookup-1-0-loading"
  | "tablet-lookup-1-0-failed"
  | "tablet-lookup-1-0-unavailable"
  | "tablet-lookup-1-0-long-text-200"
  | "tablet-lookup-1-0-start"
  | "tablet-lookup-1-0-upgrade"
  | "tablet-lookup-1-0-rule"
  | "tablet-lookup-1-0-detachment"
  | "tablet-lookup-1-0-loading-empty"
  | "tablet-lookup-1-0-failed-empty"
  | "tablet-lookup-1-0-text-150"
  | "tablet-lookup-1-0-long-text-150"
  | "desktop-lookup-1-0"
  | "desktop-lookup-1-0-force"
  | "desktop-editor-unit-dialog"
  | "desktop-editor-unit-dialog-narrow"
  | "desktop-editor-unit-dialog-nested"
  | "desktop-editor-unit-dialog-readonly"
  | "desktop-editor-catalogue-limit"
  | "desktop-settings-advanced"
  | "desktop-lookup-1-0-loading"
  | "desktop-lookup-1-0-failed"
  | "desktop-lookup-1-0-unavailable"
  | "desktop-lookup-1-0-text-200"
  | "lookup-results"
  | "lookup-start"
  | "lookup-no-results"
  | "lookup-no-data"
  | "lookup-unit"
  | "lookup-force"
  | "lookup-detachment"
  | "lookup-upgrade"
  | "lookup-rule"
  | "lookup-loading"
  | "lookup-failed"
  | "lookup-unavailable"
  | "lookup-large-text"
  | "lookup-results-text-150"
  | "lookup-unit-text-150"
  | "collections"
  | "app"
  | "sources"
  | "add-source"
  | "install-job"
  | "source-detail"
  | "migration-report"
  | "roster-read-only"
  | "collection"
  | "search-github"
  | "subscription-main"
  | "create-roster"
  | "drafts"
  | "source"
  | "source-legacy"
  | "tools"
  | "roster-analytics"
  | "comparison"
  | "game-tracker"
  | "dice-simulator"
  | "overview"
  | "subscription-edition"
  | "smart-search"
  | "add-detachment"
  | "add-unit"
  | "add-unit-limit"
  | "add-unit-focus-keyboard"
  | "add-unit-text-200"
  | "unit-detail"
  | "unit-options-mobile"
  | "unit-options-separate-all"
  | "unit-options-separated"
  | "option-drilldown"
  | "diagnostics"
  | "settings"
  | "settings-search"
  | "settings-search-no-results"
  | "settings-search-developer"
  | "export";

export type RosterOption = {
  id: string;
  name: string;
  group: "weapon" | "upgrade" | "rule";
  points: number;
  selected: boolean;
  disabled?: boolean;
};

export type RosterLoadoutChoice = {
  id: string;
  name: string;
  points: number;
  profileValues: string[];
};

export type RosterLoadoutSlot = {
  id: string;
  label: string;
  profileTableId: "ranged-weapon" | "melee-weapon";
  selectedChoiceId: string;
  choices: RosterLoadoutChoice[];
};

export type RosterLoadoutGroup = {
  id: string;
  modelId: string;
  name: string;
  count: number;
  basePointsPerModel: number;
  canSplit: boolean;
  slots: RosterLoadoutSlot[];
};

export type RosterProfileRow = {
  id: string;
  name: string;
  values: string[];
  tags?: string[];
};

export type RosterProfileTable = {
  id: string;
  title: string;
  columns: string[];
  rows: RosterProfileRow[];
};

export type RosterReferenceKind = "trait" | "rule" | "category";

export type RosterReferenceDefinition = {
  id: string;
  label: string;
  kind: RosterReferenceKind;
  description: string;
  aliases?: string[];
  relatedIds?: string[];
};

export type RosterUnitDetail = {
  loadoutGroups: RosterLoadoutGroup[];
  choiceGroups: Array<{
    id: string;
    title: string;
    helper?: string;
    optionIds: string[];
  }>;
  standaloneOptionIds: string[];
  profileTables: RosterProfileTable[];
  traits: string[];
  equipment: Array<{ id: string; name: string; description: string }>;
  rules: string[];
  categories: string[];
};

export type RosterUnit = {
  id: string;
  name: string;
  customName?: string;
  role: string;
  points: number;
  count: number;
  status?: "valid" | "warning" | "error";
  note?: string;
  keywords: string[];
  availability: "available" | "limited" | "locked";
  slotImpact: string;
  options: RosterOption[];
  minCount?: number;
  maxCount?: number;
  pointsPerAdditionalModel?: number;
  detail?: RosterUnitDetail;
  /** What was chosen inside it (configuration picks), shown under the name, New Recruit style. */
  summary?: string;
  /** A non-zero cost other than points, shown in accent text beside the name (e.g. "1 Formation Point"). */
  extraCost?: string;
};

export type RosterSection = {
  id: string;
  name: string;
  /** A force-level configuration section (picks that are not units); looks like any other section. */
  configuration?: boolean;
  required?: string;
  units: RosterUnit[];
};

export type RosterForce = {
  id: string;
  name: string;
  customName?: string;
  detachment: string;
  kind: "primary" | "auxiliary";
  points: number;
  sections: RosterSection[];
};

export type Roster = {
  name: string;
  faction: string;
  system: string;
  pointsUsed: number;
  pointsLimit: number;
  /** Other limited costs; shown when the budget block is expanded (limits of 0 with nothing used are left out). */
  limits?: Array<{ id: string; label: string; used: number; limit: number }>;
  forces: RosterForce[];
};

export type UnitFavorite = {
  id: string;
  createdAt: string;
  sourceSectionName: string;
  unit: RosterUnit;
};

export type DetachmentFavorite = {
  id: string;
  createdAt: string;
  force: RosterForce;
};

export type FavoriteLibrary = {
  version: 1;
  units: UnitFavorite[];
  detachments: DetachmentFavorite[];
};

export type ConceptId = "ux-workbench" | "tablet-workbench" | "desktop-workbench" | "duo-workbench";

export type PrototypeScreen =
  | "library"
  | "collections"
  | "app"
  | "sources"
  | "add-source"
  | "install-job"
  | "source-detail"
  | "migration-report"
  | "roster-read-only"
  | "collection"
  | "search-github"
  | "system"
  | "catalogue"
  | "detachment"
  | "tools"
  | "roster-analytics"
  | "comparison"
  | "game-tracker"
  | "dice-simulator"
  | "overview"
  | "smart-search"
  | "add-unit"
  | "unit-detail"
  | "unit-options-mobile"
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
