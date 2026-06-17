import { DeviceFrame } from "../components/DeviceFrame";
import { resolveWorkflow, workflowToPrototypeScreen } from "./workflow";
import type { GalleryConcept, WorkflowFlow } from "./galleryTypes";
import type { ColorScheme, NavStyle, PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode, WorkflowScreen } from "../types";
import type { WorkflowPickerSelection } from "../components/v2/WorkflowScreenPicker";

type Props = {
  concept: GalleryConcept;
  activeWorkflow: WorkflowPickerSelection;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  expandedSectionIds: string[];
  smartSearch: boolean;
  onToggleSmartSearch: () => void;
  navStyle: NavStyle;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
  onNavigate: (screen: ReturnType<typeof workflowToPrototypeScreen>) => void;
  onBack: () => void;
};

export function WorkflowBoard({
  concept,
  activeWorkflow,
  platform,
  themeMode,
  colorScheme,
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  expandedSectionIds,
  smartSearch,
  onToggleSmartSearch,
  navStyle,
  onSelectSection,
  onToggleSection,
  onSelectUnit,
  onToggleOption,
  onCountChange,
  onNavigate,
  onBack,
}: Props) {
  const Concept = concept.component;
  const groups = workflowGroups(concept, activeWorkflow);

  return (
    <section className={`workflow-board ${platform}`}>
      {groups.map((group) => (
        <section className="workflow-board-group" key={group.id}>
          <h2>{group.label}</h2>
          <div className="workflow-board-group-grid">
            {group.items.map((item) => {
              const screen = workflowToPrototypeScreen(item.screen);
              return (
                <article className="workflow-board-item" key={item.id}>
                  <div className="workflow-board-label">{item.label}</div>
                  <DeviceFrame platform={platform}>
                    <Concept
                      roster={roster}
                      selectedSection={selectedSection}
                      selectedUnit={selectedUnit}
                      selectedSectionId={selectedSectionId}
                      expandedSectionIds={expandedSectionIds}
                      screen={screen}
                      workflowScreen={item.screen}
                      themeMode={themeMode}
                      colorScheme={colorScheme}
                      smartSearch={smartSearch}
                      onToggleSmartSearch={onToggleSmartSearch}
                      navStyle={navStyle}
                      canGoBack={screen !== "overview"}
                      onSelectSection={onSelectSection}
                      onToggleSection={onToggleSection}
                      onSelectUnit={onSelectUnit}
                      onToggleOption={onToggleOption}
                      onCountChange={onCountChange}
                      onNavigate={onNavigate}
                      onBack={onBack}
                    />
                  </DeviceFrame>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </section>
  );
}

type WorkflowBoardItem = WorkflowFlow & { screen: WorkflowScreen };

function workflowGroups(concept: GalleryConcept, activeWorkflow: WorkflowPickerSelection): Array<{ id: string; label: string; items: WorkflowBoardItem[] }> {
  const items: WorkflowBoardItem[] =
    concept.flows && concept.flows.length > 0
      ? concept.flows
      : resolveWorkflow(concept.workflow).map((screen) => ({ id: screen.id, label: screen.label, screen: screen.id }));
  const filtered = activeWorkflow === "all" ? items : items.filter((item) => item.screen === activeWorkflow);

  return filtered.map((item) => ({ id: item.id, label: item.label, items: [item] }));
}
