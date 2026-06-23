import { DeviceFrame } from "../components/DeviceFrame";
import type { MouseEvent as ReactMouseEvent } from "react";
import { resolveWorkflow, workflowToPrototypeScreen } from "./workflow";
import type { GalleryConcept, WorkflowFlow } from "./galleryTypes";
import type { ColorScheme, ForceCreationMode, NavStyle, PlatformPreview, Roster, RosterSection, RosterUnit, TabletPanelLayout, ThemeMode, UnitDetailView, WorkflowScreen } from "../types";
import type { WorkflowPickerSelection } from "../components/v2/WorkflowScreenPicker";
import type { GlancePlacement } from "./ScreenGlance";
import { screenLabel, type EditableDesign } from "../design-data/designData";

type Props = {
  concept: GalleryConcept;
  design?: EditableDesign;
  activeWorkflow: WorkflowPickerSelection;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  statusBarUsesDesignBackground: boolean;
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedForceId: string;
  expandedForceIds: string[];
  selectedSectionId: string;
  expandedSectionIds: string[];
  smartSearch: boolean;
  onToggleSmartSearch: () => void;
  navStyle: NavStyle;
  unitDetailView: UnitDetailView;
  forceCreationMode: ForceCreationMode;
  tabletPanelLayout: TabletPanelLayout;
  onTabletPanelLayoutChange: (layout: TabletPanelLayout) => void;
  onUnitDetailViewChange: (view: UnitDetailView) => void;
  onSelectForce: (id: string) => void;
  onToggleForce: (id: string) => void;
  onCreateForce: (catalogueId: string, detachmentId: string) => void;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
  onLoadoutGroupCountChange: (unitId: string, groupId: string, delta: number) => void;
  onSplitLoadoutGroup: (unitId: string, groupId: string) => void;
  onSelectLoadoutChoice: (unitId: string, groupId: string, slotId: string, choiceId: string) => void;
  onNavigate: (screen: ReturnType<typeof workflowToPrototypeScreen>) => void;
  onBack: () => void;
  onOpenGlance: (screen: WorkflowScreen, placement?: GlancePlacement) => void;
};

export function WorkflowBoard({
  concept,
  design,
  activeWorkflow,
  platform,
  themeMode,
  colorScheme,
  statusBarUsesDesignBackground,
  roster,
  selectedSection,
  selectedUnit,
  selectedForceId,
  expandedForceIds,
  selectedSectionId,
  expandedSectionIds,
  smartSearch,
  onToggleSmartSearch,
  navStyle,
  unitDetailView,
  forceCreationMode,
  tabletPanelLayout,
  onTabletPanelLayoutChange,
  onUnitDetailViewChange,
  onSelectForce,
  onToggleForce,
  onCreateForce,
  onSelectSection,
  onToggleSection,
  onSelectUnit,
  onToggleOption,
  onCountChange,
  onLoadoutGroupCountChange,
  onSplitLoadoutGroup,
  onSelectLoadoutChoice,
  onNavigate,
  onBack,
  onOpenGlance,
}: Props) {
  const Concept = concept.component;
  const groups = workflowGroups(concept, design, activeWorkflow);

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
                  <button type="button" className="workflow-board-label" onClick={() => onOpenGlance(item.screen)}>
                    {item.label}
                  </button>
                  <div className="workflow-screen-hitarea" onClick={(event) => handleScreenClick(event, item.screen, onOpenGlance)}>
                    <DeviceFrame platform={platform} themeMode={themeMode} colorScheme={colorScheme} statusBarUsesDesignBackground={statusBarUsesDesignBackground}>
                      <Concept
                        roster={roster}
                        selectedSection={selectedSection}
                        selectedUnit={selectedUnit}
                        selectedForceId={selectedForceId}
                        expandedForceIds={expandedForceIds}
                        selectedSectionId={selectedSectionId}
                        expandedSectionIds={expandedSectionIds}
                        screen={screen}
                        workflowScreen={item.screen}
                        themeMode={themeMode}
                        colorScheme={colorScheme}
                        smartSearch={smartSearch}
                        onToggleSmartSearch={onToggleSmartSearch}
                        navStyle={navStyle}
                        unitDetailView={unitDetailView}
                        forceCreationMode={forceCreationMode}
                        tabletPanelLayout={tabletPanelLayout}
                        onTabletPanelLayoutChange={onTabletPanelLayoutChange}
                        onUnitDetailViewChange={onUnitDetailViewChange}
                        onSelectForce={onSelectForce}
                        onToggleForce={onToggleForce}
                        onCreateForce={onCreateForce}
                        canGoBack={screen !== "overview"}
                        onSelectSection={onSelectSection}
                        onToggleSection={onToggleSection}
                        onSelectUnit={onSelectUnit}
                        onToggleOption={onToggleOption}
                        onCountChange={onCountChange}
                        onLoadoutGroupCountChange={onLoadoutGroupCountChange}
                        onSplitLoadoutGroup={onSplitLoadoutGroup}
                        onSelectLoadoutChoice={onSelectLoadoutChoice}
                        onNavigate={onNavigate}
                        onBack={onBack}
                      />
                    </DeviceFrame>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </section>
  );
}

function handleScreenClick(
  event: ReactMouseEvent<HTMLDivElement>,
  screen: WorkflowScreen,
  onOpenGlance: (screen: WorkflowScreen, placement?: GlancePlacement) => void,
) {
  if (!event.shiftKey) return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.preventDefault();
  event.stopPropagation();
  onOpenGlance(screen, {
    x: clampPercent(((event.clientX - rect.left) / rect.width) * 100),
    y: clampPercent(((event.clientY - rect.top) / rect.height) * 100),
    mode: "element",
    elementHint: elementHint(event.target),
  });
}

type WorkflowBoardItem = { id: string; label: string; screen: WorkflowScreen };

function workflowGroups(
  concept: GalleryConcept,
  design: EditableDesign | undefined,
  activeWorkflow: WorkflowPickerSelection,
): Array<{ id: string; label: string; items: WorkflowBoardItem[] }> {
  const flows: WorkflowFlow[] =
    concept.flows && concept.flows.length > 0
      ? concept.flows
      : resolveWorkflow(concept.workflow).map((screen) => ({ id: screen.id, label: screen.label, screens: [screen.id] }));
  const filtered = activeWorkflow === "all" ? flows : flows.filter((flow) => flow.id === activeWorkflow);

  return filtered.map((flow) => ({
    id: flow.id,
    label: flow.label,
    items: flow.screens.map((screen) => ({ id: `${flow.id}-${screen}`, label: screenLabel(design, screen), screen })),
  }));
}

function clampPercent(value: number) {
  return Math.max(2, Math.min(98, value));
}

function elementHint(target: EventTarget) {
  const element = target instanceof HTMLElement ? target : null;
  if (!element) return undefined;
  const label = element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 48);
  const className = typeof element.className === "string" ? element.className.split(" ").filter(Boolean).slice(0, 2).join(".") : "";
  return [element.tagName.toLowerCase(), className ? `.${className}` : "", label ? `"${label}"` : ""].join(" ").trim();
}
