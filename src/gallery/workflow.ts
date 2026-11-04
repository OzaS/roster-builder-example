import type { PrototypeScreen, WorkflowScreen } from "../types";

export const workflowScreens: Array<{ id: WorkflowScreen; label: string }> = [
  { id: "tablet-home", label: "Tablet · Home" },
  { id: "tablet-rosters", label: "Tablet · Rosters" },
  { id: "tablet-editor", label: "Tablet · Roster editor" },
  { id: "tablet-editor-issues", label: "Tablet · Roster editor · Issues" },
  { id: "tablet-editor-add", label: "Tablet · Roster editor · Add unit" },
  { id: "tablet-editor-forces", label: "Tablet · Roster editor · Several forces" },
  { id: "tablet-editor-add-force", label: "Tablet · Roster editor · Add force" },
  { id: "tablet-editor-readonly", label: "Tablet · Roster editor · Read-only roster" },
  { id: "tablet-editor-export", label: "Tablet · Roster editor · Export" },
  { id: "tablet-editor-shortcuts", label: "Tablet · Roster editor · Keyboard shortcuts" },
  { id: "tablet-editor-text-200", label: "Tablet · Roster editor · Text 200%" },
  { id: "tablet-editor-add-roles", label: "Tablet · Roster editor · Many unit roles" },
  { id: "tablet-editor-add-focus", label: "Tablet · Roster editor · Add unit, search focused" },
  { id: "tablet-editor-chip-caption", label: "Tablet · Roster editor · State chip caption" },
  { id: "tablet-editor-limit-caption", label: "Tablet · Roster editor · Limit reached, reason shown" },
  { id: "tablet-editor-separate-all", label: "Tablet · Roster editor · Separate 1 and Separate all (opt-in on)" },
  { id: "tablet-editor-chips-text-150", label: "Tablet · Roster editor · State chips, text 150%" },
  { id: "tablet-settings-advanced", label: "Tablet · Settings · Advanced" },
  { id: "tablet-settings-search", label: "Tablet · Settings · Search, results" },
  { id: "tablet-settings-search-no-results", label: "Tablet · Settings · Search, no results" },
  { id: "tablet-settings-search-developer", label: "Tablet · Settings · Search, Developer options unlocked" },
  { id: "tablet-rosters-text-200", label: "Tablet · Rosters · Text 200%" },
  { id: "tablet-sources-text-200", label: "Tablet · Sources · Text 200%" },
  { id: "tablet-settings-text-200", label: "Tablet · Settings · Text 200%" },
  { id: "tablet-editor-import-result", label: "Tablet · Import result" },
  { id: "tablet-lookup", label: "Tablet · Lookup" },
  { id: "tablet-lookup-legacy", label: "Archive · Earlier tablet Lookup" },
  { id: "tablet-lookup-1-0", label: "Tablet · Lookup 1.0" },
  { id: "tablet-lookup-1-0-force", label: "Tablet · Lookup 1.0 · Force" },
  { id: "tablet-lookup-1-0-loading", label: "Tablet · Lookup 1.0 · Loading" },
  { id: "tablet-lookup-1-0-failed", label: "Tablet · Lookup 1.0 · Failure, retry" },
  { id: "tablet-lookup-1-0-unavailable", label: "Tablet · Lookup 1.0 · Source unavailable" },
  { id: "tablet-lookup-1-0-long-text-200", label: "Tablet · Lookup 1.0 · Large text 200%" },
  { id: "tablet-lookup-1-0-start", label: "Tablet · Lookup 1.0 · Start, Recently viewed" },
  { id: "tablet-lookup-1-0-upgrade", label: "Tablet · Lookup 1.0 · Upgrade reference" },
  { id: "tablet-lookup-1-0-rule", label: "Tablet · Lookup 1.0 · Rule reference" },
  { id: "tablet-lookup-1-0-detachment", label: "Tablet · Lookup 1.0 · Detachment reference" },
  { id: "tablet-lookup-1-0-loading-empty", label: "Tablet · Lookup 1.0 · Loading, empty detail" },
  { id: "tablet-lookup-1-0-failed-empty", label: "Tablet · Lookup 1.0 · Failure, empty detail" },
  { id: "tablet-lookup-1-0-text-150", label: "Tablet · Lookup 1.0 · Text 150%" },
  { id: "tablet-lookup-1-0-long-text-150", label: "Tablet · Lookup 1.0 · Large text 150%" },
  { id: "tablet-tools", label: "Tablet · Tools" },
  { id: "tablet-library", label: "Tablet · Library" },
  { id: "tablet-sources", label: "Tablet · Sources" },
  { id: "tablet-settings", label: "Tablet · Settings" },
  { id: "tablet-home-first-run", label: "Tablet · Home · First run" },
  { id: "tablet-home-no-rosters", label: "Tablet · Home · No rosters" },
  { id: "tablet-home-many-systems", label: "Tablet · Home · Many game systems" },
  { id: "tablet-rosters-many", label: "Tablet · Rosters · Many rosters" },
  { id: "tablet-rosters-search", label: "Tablet · Rosters · Search" },
  { id: "tablet-rosters-status", label: "Tablet · Rosters · Status details" },
  { id: "tablet-rosters-empty", label: "Tablet · Rosters · Empty" },
  { id: "tablet-sources-add", label: "Tablet · Sources · Add game data" },
  { id: "tablet-sources-installing", label: "Tablet · Sources · Installing, every faction" },
  { id: "tablet-sources-choose-factions", label: "Tablet · Sources · Faction picker (Advanced installation)" },
  { id: "tablet-sources-update-report", label: "Tablet · Sources · Update report" },
  { id: "tablet-sources-collection", label: "Tablet · Sources · Collection" },
  { id: "tablet-sources-github", label: "Tablet · Sources · Search GitHub" },
  { id: "tablet-sources-add-collection", label: "Tablet · Sources · Add a collection" },
  { id: "tablet-sources-reinstall", label: "Tablet · Sources · Reinstall a kept version (DEC-060)" },
  { id: "tablet-settings-rosters", label: "Tablet · Settings · Rosters" },
  { id: "tablet-settings-game-data", label: "Tablet · Settings · Game data" },
  { id: "tablet-settings-shortcuts", label: "Tablet · Settings · Keyboard shortcuts" },
  { id: "tablet-create", label: "Tablet · New roster (guided creation)" },
  { id: "tablet-create-review", label: "Tablet · New roster · Name and summary" },
  { id: "tablet-settings-appearance-import", label: "Tablet · Settings · Appearance import" },
  { id: "tablet-editor-move-unit", label: "Tablet · Roster editor · Move unit" },
  { id: "tablet-confirm-delete", label: "Tablet · Confirm · Delete roster" },
  { id: "tablet-archive-sketch", label: "Archive · Earlier tablet sketch" },
  { id: "desktop-welcome", label: "Desktop · Welcome" },
  { id: "desktop-editor", label: "Desktop · Roster editor" },
  { id: "desktop-rosters", label: "Desktop · Rosters" },
  { id: "desktop-lookup", label: "Desktop · Lookup" },
  { id: "desktop-lookup-legacy", label: "Archive · Earlier desktop Lookup" },
  { id: "desktop-lookup-1-0", label: "Desktop · Lookup 1.0" },
  { id: "desktop-lookup-1-0-force", label: "Desktop · Lookup 1.0 · Force" },
  { id: "desktop-tools", label: "Desktop · Tools" },
  { id: "desktop-library", label: "Desktop · Library" },
  { id: "desktop-sources", label: "Desktop · Sources" },
  { id: "desktop-settings", label: "Desktop · Settings" },
  { id: "desktop-first-run", label: "Desktop · First run" },
  { id: "desktop-menus", label: "Desktop · Menu bar (macOS only)" },
  { id: "desktop-welcome-windows", label: "Desktop · Windows · Welcome (title bar row, no menu bar)" },
  { id: "desktop-editor-windows", label: "Desktop · Windows · Roster editor (title bar row)" },
  { id: "desktop-editor-unit-dialog", label: "Desktop · Roster editor · Unit dialog" },
  { id: "desktop-editor-unit-dialog-narrow", label: "Desktop · Roster editor · Unit dialog, narrow window" },
  { id: "desktop-editor-unit-dialog-nested", label: "Desktop · Roster editor · Unit dialog, nested element" },
  { id: "desktop-editor-unit-dialog-readonly", label: "Desktop · Roster editor · Unit dialog, read-only" },
  { id: "desktop-editor-unit-dialog-zoom-200", label: "Desktop · Roster editor · Unit dialog, page zoom 200%" },
  { id: "desktop-editor-unit-dialog-separated", label: "Desktop · Roster editor · Unit dialog, after Separate 1 (4 + 1)" },
  { id: "desktop-editor-catalogue-limit", label: "Desktop · Roster editor · Catalogue limit reached" },
  { id: "desktop-settings-advanced", label: "Desktop · Settings · Advanced" },
  { id: "desktop-lookup-1-0-loading", label: "Desktop · Lookup 1.0 · Loading" },
  { id: "desktop-lookup-1-0-failed", label: "Desktop · Lookup 1.0 · Search failed" },
  { id: "desktop-lookup-1-0-unavailable", label: "Desktop · Lookup 1.0 · Reference unavailable" },
  { id: "desktop-lookup-1-0-text-200", label: "Desktop · Lookup 1.0 · Text 200%" },
  { id: "desktop-settings-wide", label: "Desktop · Settings · Wide window (centred)" },
  { id: "desktop-settings-search", label: "Desktop · Settings · Search results" },
  { id: "desktop-settings-search-empty", label: "Desktop · Settings · Search, no match" },
  { id: "desktop-settings-scale", label: "Desktop · Settings · UI scale 150%" },
  { id: "desktop-settings-developer", label: "Desktop · Settings · Developer options" },
  { id: "desktop-lookup-1-0-no-data", label: "Desktop · Lookup 1.0 · No game data" },
  { id: "desktop-lookup-1-0-start", label: "Desktop · Lookup 1.0 · Recently viewed" },
  { id: "desktop-lookup-1-0-upgrade", label: "Desktop · Lookup 1.0 · Upgrade" },
  { id: "desktop-lookup-1-0-rule", label: "Desktop · Lookup 1.0 · Rule" },
  { id: "desktop-lookup-1-0-detachment", label: "Desktop · Lookup 1.0 · Detachment" },
  { id: "desktop-lookup-1-0-narrow", label: "Desktop · Lookup 1.0 · Narrow window, results" },
  { id: "desktop-lookup-1-0-narrow-entry", label: "Desktop · Lookup 1.0 · Narrow window, entry" },
  { id: "desktop-lookup-1-0-text-150", label: "Desktop · Lookup 1.0 · Text 150%" },
  { id: "library", label: "Lists" },
  { id: "library-v2", label: "Lists · V2" },
  { id: "library-filters", label: "Lists · Search, filters and grouping" },
  { id: "library-filters-search", label: "Lists · Search open with a query" },
  { id: "library-filters-no-match", label: "Lists · No match, Clear filters" },
  { id: "library-filters-keyboard", label: "Lists · Search with keyboard, long system name" },
  { id: "collections", label: "Library" },
  { id: "app", label: "App" },
  { id: "sources", label: "Sources" },
  { id: "add-source", label: "Add Sources" },
  { id: "install-job", label: "Install job" },
  { id: "source-detail", label: "Source detail" },
  { id: "migration-report", label: "Update report" },
  { id: "roster-read-only", label: "Read-only roster" },
  { id: "collection", label: "Collection" },
  { id: "search-github", label: "Search GitHub" },
  { id: "subscription-main", label: "Subscription · Main" },
  { id: "create-roster", label: "Create Roster" },
  { id: "drafts", label: "Drafts" },
  { id: "source", label: "Lookup" },
  { id: "source-legacy", label: "Archive · Earlier phone Lookup" },
  { id: "lookup-results", label: "Lookup · Results, grouped" },
  { id: "lookup-start", label: "Lookup · Before a search" },
  { id: "lookup-no-results", label: "Lookup · No results" },
  { id: "lookup-no-data", label: "Lookup · No game data" },
  { id: "lookup-unit", label: "Lookup · Unit" },
  { id: "lookup-force", label: "Lookup · Force" },
  { id: "lookup-detachment", label: "Lookup · Detachment" },
  { id: "lookup-upgrade", label: "Lookup · Upgrade" },
  { id: "lookup-rule", label: "Lookup · Rule" },
  { id: "lookup-loading", label: "Lookup · Loading" },
  { id: "lookup-failed", label: "Lookup · Failure, retry" },
  { id: "lookup-unavailable", label: "Lookup · Source unavailable" },
  { id: "lookup-large-text", label: "Lookup · Large text 200%" },
  { id: "lookup-results-text-150", label: "Lookup · Results, text 150%" },
  { id: "lookup-unit-text-150", label: "Lookup · Unit reference, text 150%" },
  { id: "tools", label: "Tools" },
  { id: "roster-analytics", label: "Roster Analytics" },
  { id: "comparison", label: "Comparison" },
  { id: "game-tracker", label: "Game Tracker" },
  { id: "dice-simulator", label: "Dice Simulator" },
  { id: "overview", label: "Overview" },
  { id: "subscription-edition", label: "Subscription · Edition" },
  { id: "smart-search", label: "Smart search" },
  { id: "add-detachment", label: "Add Detachment" },
  { id: "add-unit", label: "Add Unit" },
  { id: "add-unit-limit", label: "Add Unit · Limit reached, reason shown" },
  { id: "add-unit-focus-keyboard", label: "Add unit · Focus search on, keyboard shown" },
  { id: "add-unit-text-200", label: "Add unit · 200% text, limit reached" },
  { id: "unit-detail", label: "Unit Detail" },
  { id: "unit-options-mobile", label: "Unit detail · Mobile 5A + 5B + links" },
  { id: "unit-options-separate-all", label: "Unit detail · Separate 1 and Separate all (opt-in on)" },
  { id: "unit-options-separated", label: "Unit detail · After Separate 1 (4 + 1)" },
  { id: "option-drilldown", label: "Option Drilldown" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "settings", label: "Settings" },
  { id: "settings-search", label: "Settings · Search, results" },
  { id: "settings-search-no-results", label: "Settings · Search, no results" },
  { id: "settings-search-developer", label: "Settings · Search, Developer options unlocked" },
  { id: "app-developer-debug", label: "App · Developer options unlocked, debug build" },
  { id: "developer-options", label: "App · Developer options" },
  { id: "debug", label: "App · Debug (debug builds)" },
  { id: "export", label: "Export" },
];

const workflowLabels: Record<WorkflowScreen, string> = workflowScreens.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.label }),
  {} as Record<WorkflowScreen, string>,
);

export function workflowScreenLabel(screen: WorkflowScreen): string {
  return workflowLabels[screen] ?? screen;
}

/** Resolve which workflow screens a concept exposes, falling back to the full flow. */
export function resolveWorkflow(workflow?: WorkflowScreen[]): Array<{ id: WorkflowScreen; label: string }> {
  if (workflow && workflow.length > 0) {
    return workflow.map((id) => ({ id, label: workflowScreenLabel(id) }));
  }
  return workflowScreens;
}

export function workflowToPrototypeScreen(screen: WorkflowScreen): PrototypeScreen {
  if (screen === "tablet-archive-sketch") return "overview";
  if (screen === "tablet-editor" || screen.startsWith("tablet-editor-") || screen === "tablet-editor-issues" || screen === "tablet-editor-add" || screen === "tablet-editor-forces" || screen === "tablet-editor-add-force" || screen === "tablet-editor-readonly" || screen === "tablet-editor-export" || screen === "tablet-editor-import-result" || screen === "tablet-editor-move-unit" || screen === "tablet-editor-shortcuts" || screen === "tablet-editor-text-200" || screen === "tablet-editor-add-roles" || screen === "tablet-editor-add-focus" || screen === "tablet-editor-chip-caption" || screen === "tablet-editor-limit-caption" || screen === "tablet-editor-chips-text-150") return "overview";
  if (screen.startsWith("tablet-")) return "library"; // every other tablet screen is a page or a state of one
  if (screen.startsWith("duo-")) return "library"; // Foldable screens: a pose, a page and a state (DuoWorkbench)
  if (screen === "tablet-home" || screen === "tablet-rosters" || screen === "tablet-lookup" || screen === "tablet-tools" || screen === "tablet-library" || screen === "tablet-sources" || screen === "tablet-settings") return "library";
  if (screen === "desktop-tools" || screen === "desktop-library") return "library";
  if (screen === "desktop-welcome" || screen === "desktop-welcome-windows") return "library";
  if (screen === "desktop-editor" || screen.startsWith("desktop-editor-")) return "overview";
  if (screen === "desktop-rosters") return "library";
  if (screen === "desktop-lookup-legacy" || screen === "desktop-lookup" || screen.startsWith("desktop-lookup-1-0")) return "catalogue";
  if (screen === "desktop-sources") return "sources";
  if (screen === "desktop-settings" || screen.startsWith("desktop-settings-")) return "settings";
  if (screen === "desktop-first-run") return "library";
  if (screen === "desktop-menus") return "overview";
  if (screen === "library-v2" || screen.startsWith("library-filters")) return "library";
  if (screen === "subscription-main") return "library";
  if (screen === "subscription-edition") return "overview";
  if (screen === "create-roster") return "system";
  if (screen === "drafts") return "library";
  if (screen === "source-legacy" || screen === "source" || screen.startsWith("lookup-")) return "catalogue";
  if (screen.startsWith("settings-search")) return "settings";
  if (screen === "app-developer-debug") return "app";
  if (screen === "add-detachment") return "detachment";
  if (screen === "add-unit-limit" || screen === "add-unit-focus-keyboard" || screen === "add-unit-text-200") return "add-unit";
  if (screen === "unit-options-separate-all" || screen === "unit-options-separated") return "unit-options-mobile";
  if (screen === "option-drilldown") return "unit-detail";
  if (screen === "diagnostics") return "validation";
  return screen as PrototypeScreen; // the tablet screens returned above are not narrowed away by startsWith
}

export function prototypeToWorkflowScreen(screen: PrototypeScreen): WorkflowScreen {
  if (screen === "system") return "create-roster";
  if (screen === "catalogue") return "source";
  if (screen === "detachment") return "add-detachment";
  if (screen === "validation") return "diagnostics";
  return screen;
}
