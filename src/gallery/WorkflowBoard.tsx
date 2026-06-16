import { DeviceFrame } from "../components/DeviceFrame";
import { resolveWorkflow, workflowToPrototypeScreen } from "./workflow";
import type { GalleryConcept } from "./galleryTypes";
import type { ColorScheme, PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode } from "../types";

type Props = {
  concept: GalleryConcept;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  expandedSectionIds: string[];
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
  platform,
  themeMode,
  colorScheme,
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  expandedSectionIds,
  onSelectSection,
  onToggleSection,
  onSelectUnit,
  onToggleOption,
  onCountChange,
  onNavigate,
  onBack,
}: Props) {
  const Concept = concept.component;

  return (
    <section className={`workflow-board ${platform}`}>
      {resolveWorkflow(concept.workflow).map((item) => {
        const screen = workflowToPrototypeScreen(item.id);
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
                workflowScreen={item.id}
                themeMode={themeMode}
                colorScheme={colorScheme}
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
    </section>
  );
}
