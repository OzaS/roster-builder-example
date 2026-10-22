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
  { id: "tablet-rosters-text-200", label: "Tablet · Rosters · Text 200%" },
  { id: "tablet-editor-import-result", label: "Tablet · Import result" },
  { id: "tablet-lookup", label: "Tablet · Lookup" },
  { id: "tablet-tools", label: "Tablet · Tools" },
  { id: "tablet-library", label: "Tablet · Library" },
  { id: "tablet-sources", label: "Tablet · Sources" },
  { id: "tablet-settings", label: "Tablet · Settings" },
  { id: "tablet-home-first-run", label: "Tablet · Home · First run" },
  { id: "tablet-home-no-rosters", label: "Tablet · Home · No rosters" },
  { id: "tablet-rosters-many", label: "Tablet · Rosters · Many rosters" },
  { id: "tablet-rosters-search", label: "Tablet · Rosters · Search" },
  { id: "tablet-rosters-empty", label: "Tablet · Rosters · Empty" },
  { id: "tablet-sources-add", label: "Tablet · Sources · Add game data" },
  { id: "tablet-sources-installing", label: "Tablet · Sources · Installing, every faction" },
  { id: "tablet-sources-choose-factions", label: "Tablet · Sources · Installing, Advanced installation" },
  { id: "tablet-sources-update-report", label: "Tablet · Sources · Update report" },
  { id: "tablet-sources-collection", label: "Tablet · Sources · Collection" },
  { id: "tablet-sources-github", label: "Tablet · Sources · Search GitHub" },
  { id: "tablet-sources-add-collection", label: "Tablet · Sources · Add a collection" },
  { id: "tablet-settings-game-data", label: "Tablet · Settings · Game data" },
  { id: "tablet-settings-shortcuts", label: "Tablet · Settings · Keyboard shortcuts" },
  { id: "tablet-archive-sketch", label: "Archive · Earlier tablet sketch" },
  { id: "desktop-welcome", label: "Desktop · Welcome" },
  { id: "desktop-editor", label: "Desktop · Roster editor" },
  { id: "desktop-rosters", label: "Desktop · Rosters" },
  { id: "desktop-lookup", label: "Desktop · Lookup" },
  { id: "desktop-tools", label: "Desktop · Tools" },
  { id: "desktop-library", label: "Desktop · Library" },
  { id: "desktop-sources", label: "Desktop · Sources" },
  { id: "desktop-settings", label: "Desktop · Settings" },
  { id: "desktop-first-run", label: "Desktop · First run" },
  { id: "desktop-menus", label: "Desktop · Menu bar" },
  { id: "library", label: "Lists" },
  { id: "library-v2", label: "Lists · V2" },
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
  { id: "unit-detail", label: "Unit Detail" },
  { id: "unit-options-mobile", label: "Unit detail · Mobile 5A + 5B + links" },
  { id: "option-drilldown", label: "Option Drilldown" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "settings", label: "Settings" },
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
  if (screen === "tablet-editor" || screen === "tablet-editor-issues" || screen === "tablet-editor-add" || screen === "tablet-editor-forces" || screen === "tablet-editor-add-force" || screen === "tablet-editor-readonly" || screen === "tablet-editor-export" || screen === "tablet-editor-shortcuts" || screen === "tablet-editor-text-200" || screen === "tablet-editor-import-result") return "overview";
  if (screen.startsWith("tablet-")) return "library"; // every other tablet screen is a page or a state of one
  if (screen === "tablet-home" || screen === "tablet-rosters" || screen === "tablet-lookup" || screen === "tablet-tools" || screen === "tablet-library" || screen === "tablet-sources" || screen === "tablet-settings") return "library";
  if (screen === "desktop-tools" || screen === "desktop-library") return "library";
  if (screen === "desktop-welcome") return "library";
  if (screen === "desktop-editor") return "overview";
  if (screen === "desktop-rosters") return "library";
  if (screen === "desktop-lookup") return "catalogue";
  if (screen === "desktop-sources") return "sources";
  if (screen === "desktop-settings") return "settings";
  if (screen === "desktop-first-run") return "library";
  if (screen === "desktop-menus") return "overview";
  if (screen === "library-v2") return "library";
  if (screen === "subscription-main") return "library";
  if (screen === "subscription-edition") return "overview";
  if (screen === "create-roster") return "system";
  if (screen === "drafts") return "library";
  if (screen === "source") return "catalogue";
  if (screen === "add-detachment") return "detachment";
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
