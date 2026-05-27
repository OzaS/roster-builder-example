import { useMemo, useRef, useState } from "react";
import { mockRoster } from "./data/mockRoster";
import { activeConcepts } from "./gallery/conceptRegistry";
import { archiveConcepts } from "./gallery/archiveRegistry";
import { findConcept, GalleryShell } from "./gallery/GalleryShell";
import { workflowToPrototypeScreen } from "./gallery/workflow";
import { captureElementAsPng } from "./utils/captureStage";
import type { ConceptId, GalleryMode, NavigatorView, PlatformPreview, PrototypeScreen, Roster, ThemeMode, WorkflowScreen } from "./types";

function App() {
  const [galleryMode, setGalleryMode] = useState<GalleryMode>("current");
  const [selectedConcept, setSelectedConcept] = useState<ConceptId>("dock-glass");
  const [platform, setPlatform] = useState<PlatformPreview>("phone");
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [navigatorView, setNavigatorView] = useState<NavigatorView>("single");
  const [workflowScreen, setWorkflowScreen] = useState<WorkflowScreen>("overview");
  const [roster, setRoster] = useState<Roster>(mockRoster);
  const [selectedSectionId, setSelectedSectionId] = useState("hq");
  const [selectedUnitId, setSelectedUnitId] = useState("centurion");
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>(["hq", "battleline", "elites"]);
  const [screen, setScreen] = useState<PrototypeScreen>("library");
  const [screenHistory, setScreenHistory] = useState<PrototypeScreen[]>([]);

  const selectedSection = useMemo(
    () => roster.sections.find((section) => section.id === selectedSectionId) ?? roster.sections[0],
    [roster.sections, selectedSectionId],
  );

  const selectedUnit = useMemo(
    () => roster.sections.flatMap((section) => section.units).find((unit) => unit.id === selectedUnitId) ?? selectedSection.units[0],
    [roster.sections, selectedSection.units, selectedUnitId],
  );

  const concept = findConcept(selectedConcept, galleryMode);
  const Concept = concept.component;
  const captureRef = useRef<HTMLElement>(null);

  function changeGalleryMode(mode: GalleryMode) {
    setGalleryMode(mode);
    setSelectedConcept(mode === "archive" ? archiveConcepts[0].id : "dock-glass");
    setScreen("library");
    setWorkflowScreen("library");
    setScreenHistory([]);
  }

  function changeConcept(id: ConceptId) {
    setSelectedConcept(id);
    setScreen("library");
    setWorkflowScreen("library");
    setScreenHistory([]);
  }

  function selectWorkflowScreen(nextWorkflowScreen: WorkflowScreen) {
    setWorkflowScreen(nextWorkflowScreen);
    setScreen(workflowToPrototypeScreen(nextWorkflowScreen));
    setScreenHistory([]);
  }

  function navigate(screenId: PrototypeScreen) {
    setScreenHistory((current) => (screenId === screen ? current : [...current, screen]));
    setScreen(screenId);
  }

  function goBack() {
    setScreenHistory((current) => {
      const previous = current[current.length - 1];
      if (previous) {
        setScreen(previous);
        return current.slice(0, -1);
      }
      setScreen("overview");
      return current;
    });
  }

  function selectSection(id: string) {
    const section = roster.sections.find((item) => item.id === id);
    setSelectedSectionId(id);
    if (section?.units[0]) {
      setSelectedUnitId(section.units[0].id);
    }
    setExpandedSectionIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function toggleSection(id: string) {
    setExpandedSectionIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function selectUnit(id: string) {
    setSelectedUnitId(id);
    const parent = roster.sections.find((section) => section.units.some((unit) => unit.id === id));
    if (parent) {
      setSelectedSectionId(parent.id);
    }
    navigate("unit-detail");
  }

  function toggleOption(optionId: string) {
    setRoster((current) => {
      const pointsDelta = current.sections
        .flatMap((section) => section.units)
        .flatMap((unit) => unit.options)
        .filter((option) => option.id === optionId)
        .reduce((sum, option) => sum + (option.selected ? -option.points : option.points), 0);

      return {
        ...current,
        sections: current.sections.map((section) => ({
          ...section,
          units: section.units.map((unit) => {
            if (!unit.options.some((option) => option.id === optionId)) {
              return unit;
            }
            const option = unit.options.find((item) => item.id === optionId);
            const delta = option && !option.selected ? option.points : option ? -option.points : 0;
            return {
              ...unit,
              points: Math.max(0, unit.points + delta),
              options: unit.options.map((item) => (item.id === optionId ? { ...item, selected: !item.selected } : item)),
            };
          }),
        })),
        pointsUsed: Math.max(0, current.pointsUsed + pointsDelta),
      };
    });
  }

  function changeCount(unitId: string, delta: number) {
    setRoster((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        units: section.units.map((unit) =>
          unit.id === unitId ? { ...unit, count: Math.max(1, Math.min(10, unit.count + delta)) } : unit,
        ),
      })),
    }));
  }

  async function captureCurrentStage() {
    if (!captureRef.current) return;
    const screenName = navigatorView === "all-screens" ? "all-screens" : workflowScreen;
    await captureElementAsPng(captureRef.current, `dock-glass-${screenName}-${platform}-${themeMode}.png`);
  }

  return (
    <GalleryShell
      mode={galleryMode}
      selectedConcept={concept.id}
      platform={platform}
      themeMode={themeMode}
      navigatorView={navigatorView}
      workflowScreen={workflowScreen}
      concept={concept}
      captureRef={captureRef}
      onModeChange={changeGalleryMode}
      onConceptChange={changeConcept}
      onPlatformChange={setPlatform}
      onThemeModeChange={setThemeMode}
      onNavigatorViewChange={setNavigatorView}
      onWorkflowScreenChange={selectWorkflowScreen}
      onCapture={captureCurrentStage}
      boardProps={{
        roster,
        selectedSection,
        selectedUnit,
        selectedSectionId,
        expandedSectionIds,
        onSelectSection: selectSection,
        onToggleSection: toggleSection,
        onSelectUnit: selectUnit,
        onToggleOption: toggleOption,
        onCountChange: changeCount,
        onNavigate: navigate,
        onBack: goBack,
      }}
    >
      <Concept
        roster={roster}
        selectedSection={selectedSection}
        selectedUnit={selectedUnit}
        selectedSectionId={selectedSectionId}
        expandedSectionIds={expandedSectionIds}
        screen={screen}
        workflowScreen={workflowScreen}
        themeMode={themeMode}
        canGoBack={screenHistory.length > 0 || screen !== "overview"}
        onSelectSection={selectSection}
        onToggleSection={toggleSection}
        onSelectUnit={selectUnit}
        onToggleOption={toggleOption}
        onCountChange={changeCount}
        onNavigate={navigate}
        onBack={goBack}
      />
    </GalleryShell>
  );
}

export default App;
