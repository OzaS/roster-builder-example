import type { RefObject } from "react";
import { Component, Moon, MonitorSmartphone, Palette, Rows3, Smartphone, Sun, TabletSmartphone } from "lucide-react";
import { DeviceFrame } from "../components/DeviceFrame";
import { ScreenshotButton } from "../components/v2/ScreenshotButton";
import { WorkflowScreenPicker } from "../components/v2/WorkflowScreenPicker";
import type { ColorScheme, ConceptId, NavigatorView, PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode, WorkflowScreen } from "../types";
import { colorSchemes } from "../types";
import { activeConcepts, uxConcepts } from "./conceptRegistry";
import type { GalleryConcept } from "./galleryTypes";
import { WorkflowBoard } from "./WorkflowBoard";
import { workflowToPrototypeScreen } from "./workflow";
import { DesignElementsPanel } from "./DesignElementsPanel";

type Props = {
  selectedConcept: ConceptId;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  navigatorView: NavigatorView;
  workflowScreen: WorkflowScreen;
  concept: GalleryConcept;
  captureRef: RefObject<HTMLElement | null>;
  children: React.ReactNode;
  boardProps: {
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
  onConceptChange: (id: ConceptId) => void;
  onPlatformChange: (platform: PlatformPreview) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  onNavigatorViewChange: (view: NavigatorView) => void;
  onWorkflowScreenChange: (screen: WorkflowScreen) => void;
  onCapture: () => void;
};

export function GalleryShell({
  selectedConcept,
  platform,
  themeMode,
  colorScheme,
  navigatorView,
  workflowScreen,
  concept,
  captureRef,
  children,
  boardProps,
  onConceptChange,
  onPlatformChange,
  onThemeModeChange,
  onColorSchemeChange,
  onNavigatorViewChange,
  onWorkflowScreenChange,
  onCapture,
}: Props) {
  return (
    <div className="app">
      <aside className="gallery-rail v2-gallery-rail">
        <div className="brand-lockup">
          <span className="brand-mark">RB</span>
          <span>
            <strong>Roster Builder</strong>
            <small>Concept gallery</small>
          </span>
        </div>
        <ConceptGroup title="Designs" concepts={uxConcepts} selectedConcept={selectedConcept} onConceptChange={onConceptChange} />
        <WorkflowScreenPicker active={workflowScreen} screens={concept.workflow} onSelect={onWorkflowScreenChange} />
        <ControlGroup title="View">
          <button className={navigatorView === "single" ? "active" : ""} type="button" onClick={() => onNavigatorViewChange("single")}>
            <Smartphone size={16} />
            Single
          </button>
          <button className={navigatorView === "all-screens" ? "active" : ""} type="button" onClick={() => onNavigatorViewChange("all-screens")}>
            <Rows3 size={16} />
            All Screens
          </button>
          <button className={navigatorView === "elements" ? "active" : ""} type="button" onClick={() => onNavigatorViewChange("elements")}>
            <Component size={16} />
            Elements
          </button>
        </ControlGroup>
        <ControlGroup title="Theme">
          <button className={themeMode === "dark" ? "active" : ""} type="button" onClick={() => onThemeModeChange("dark")}>
            <Moon size={16} />
            Dark
          </button>
          <button className={themeMode === "light" ? "active" : ""} type="button" onClick={() => onThemeModeChange("light")}>
            <Sun size={16} />
            Light
          </button>
        </ControlGroup>
        <ControlGroup title="Game scheme">
          {colorSchemes.map((scheme) => (
            <button key={scheme.id} className={colorScheme === scheme.id ? "active" : ""} type="button" onClick={() => onColorSchemeChange(scheme.id)}>
              <Palette size={16} />
              {scheme.label}
            </button>
          ))}
        </ControlGroup>
        <ScreenshotButton onCapture={onCapture} />
        <div className="platform-toggle" role="group" aria-label="Preview device">
          <button className={platform === "phone" ? "active" : ""} onClick={() => onPlatformChange("phone")} type="button">
            <MonitorSmartphone size={17} />
            Phone
          </button>
          <button className={platform === "tablet" ? "active" : ""} onClick={() => onPlatformChange("tablet")} type="button">
            <TabletSmartphone size={17} />
            Tablet
          </button>
        </div>
      </aside>
      <main className={`gallery-stage ${navigatorView !== "single" ? "board-mode" : ""}`}>
        <section className="preview-column" ref={captureRef}>
          {navigatorView === "all-screens" ? (
            <WorkflowBoard concept={concept} platform={platform} themeMode={themeMode} colorScheme={colorScheme} {...boardProps} />
          ) : navigatorView === "elements" ? (
            <DesignElementsPanel
              concept={concept}
              platform={platform}
              themeMode={themeMode}
              colorScheme={colorScheme}
              roster={boardProps.roster}
              selectedSection={boardProps.selectedSection}
              selectedUnit={boardProps.selectedUnit}
              selectedSectionId={boardProps.selectedSectionId}
              onSelectSection={boardProps.onSelectSection}
              onSelectUnit={boardProps.onSelectUnit}
              onToggleOption={boardProps.onToggleOption}
              onCountChange={boardProps.onCountChange}
            />
          ) : (
            <DeviceFrame platform={platform}>{children}</DeviceFrame>
          )}
        </section>
        <aside className="notes-panel">
          <span className="notes-kicker">{concept.eyebrow}</span>
          <h2>{concept.name}</h2>
          <dl>
            <div>
              <dt>Best use</dt>
              <dd>{concept.bestFor}</dd>
            </div>
            <div>
              <dt>Visual direction</dt>
              <dd>{concept.direction}</dd>
            </div>
            <div>
              <dt>Interaction idea</dt>
              <dd>{concept.interaction}</dd>
            </div>
            <div>
              <dt>Tradeoff</dt>
              <dd>{concept.tradeoff}</dd>
            </div>
          </dl>
        </aside>
      </main>
    </div>
  );
}

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="navigator-control-group">
      <h3>{title}</h3>
      <div className="navigator-control-buttons">{children}</div>
    </section>
  );
}

function ConceptGroup({
  title,
  concepts,
  selectedConcept,
  onConceptChange,
}: {
  title: string;
  concepts: GalleryConcept[];
  selectedConcept: ConceptId;
  onConceptChange: (id: ConceptId) => void;
}) {
  return (
    <section className="concept-group">
      <h3>{title}</h3>
      <div className="concept-tabs">
        {concepts.map((item) => {
          const Icon = item.icon;
          return (
            <button className={selectedConcept === item.id ? "active" : ""} key={item.id} onClick={() => onConceptChange(item.id)} type="button">
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function findConcept(id: ConceptId) {
  return activeConcepts.find((item) => item.id === id) ?? activeConcepts[0];
}
