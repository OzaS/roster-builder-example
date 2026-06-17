import { useEffect, useMemo, useRef, useState } from "react";
import { mockRoster } from "./data/mockRoster";
import { GalleryShell } from "./gallery/GalleryShell";
import { buildConceptGroups, bundledDesignData, designById, findConceptInData, firstScreenInDesign, normalizeDesignData, type DesignData } from "./design-data/designData";
import { prototypeToWorkflowScreen, workflowToPrototypeScreen } from "./gallery/workflow";
import { captureElementAsPng } from "./utils/captureStage";
import type { ColorScheme, ConceptId, NavigatorView, NavStyle, PlatformPreview, PrototypeScreen, Roster, ThemeMode, WorkflowScreen } from "./types";

const GALLERY_STATE_KEY = "roster-builder.gallery-state.v1";
const conceptIds = ["ux-workbench", "ux-command"] satisfies ConceptId[];
const platformIds = ["phone", "tablet"] satisfies PlatformPreview[];
const themeModes = ["dark", "light"] satisfies ThemeMode[];
const colorSchemeIds = ["generic", "wh40k", "horus-heresy", "age-of-sigmar", "old-world"] satisfies ColorScheme[];
const navigatorViews = ["single", "all-screens", "elements"] satisfies NavigatorView[];
const navStyles = ["top", "tabs", "floating"] satisfies NavStyle[];
const workflowScreenIds = [
  "library",
  "create-roster",
  "drafts",
  "source",
  "tools",
  "overview",
  "add-detachment",
  "add-unit",
  "unit-detail",
  "option-drilldown",
  "diagnostics",
  "settings",
  "export",
] satisfies WorkflowScreen[];
const prototypeScreenIds = [
  "library",
  "system",
  "catalogue",
  "detachment",
  "tools",
  "overview",
  "add-unit",
  "unit-detail",
  "validation",
  "settings",
  "export",
] satisfies PrototypeScreen[];

type PersistedGalleryState = {
  selectedConcept?: ConceptId;
  platform?: PlatformPreview;
  themeMode?: ThemeMode;
  colorScheme?: ColorScheme;
  navigatorView?: NavigatorView;
  workflowScreen?: WorkflowScreen;
  smartSearch?: boolean;
  navStyle?: NavStyle;
  screen?: PrototypeScreen;
};

function App() {
  const initialState = useMemo(readPersistedGalleryState, []);
  const [designData, setDesignData] = useState<DesignData>(bundledDesignData);
  const [designDataWritable, setDesignDataWritable] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<ConceptId>(initialState.selectedConcept ?? "ux-workbench");
  const [platform, setPlatform] = useState<PlatformPreview>(initialState.platform ?? "phone");
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialState.themeMode ?? "dark");
  const [colorScheme, setColorScheme] = useState<ColorScheme>(initialState.colorScheme ?? "generic");
  const [navigatorView, setNavigatorView] = useState<NavigatorView>(initialState.navigatorView ?? "single");
  const [workflowScreen, setWorkflowScreen] = useState<WorkflowScreen>(initialState.workflowScreen ?? "library");
  const [smartSearch, setSmartSearch] = useState(initialState.smartSearch ?? true);
  const [navStyle, setNavStyle] = useState<NavStyle>(initialState.navStyle ?? "floating");
  const [roster, setRoster] = useState<Roster>(mockRoster);
  const [selectedSectionId, setSelectedSectionId] = useState("hq");
  const [selectedUnitId, setSelectedUnitId] = useState("centurion");
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>(["hq", "battleline", "elites"]);
  const [screen, setScreen] = useState<PrototypeScreen>(initialState.screen ?? workflowToPrototypeScreen(initialState.workflowScreen ?? "library"));
  const [screenHistory, setScreenHistory] = useState<PrototypeScreen[]>([]);

  const selectedSection = useMemo(
    () => roster.sections.find((section) => section.id === selectedSectionId) ?? roster.sections[0],
    [roster.sections, selectedSectionId],
  );

  const selectedUnit = useMemo(
    () => roster.sections.flatMap((section) => section.units).find((unit) => unit.id === selectedUnitId) ?? selectedSection.units[0],
    [roster.sections, selectedSection.units, selectedUnitId],
  );

  useEffect(() => {
    let alive = true;
    fetch("/__design-data/roster-builder")
      .then((response) => {
        if (!response.ok) throw new Error("Design data endpoint unavailable");
        return response.json();
      })
      .then((data: DesignData) => {
        if (!alive) return;
        setDesignData(normalizeDesignData(data));
        setDesignDataWritable(true);
      })
      .catch(() => {
        if (!alive) return;
        setDesignDataWritable(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    persistGalleryState({
      selectedConcept,
      platform,
      themeMode,
      colorScheme,
      navigatorView,
      workflowScreen,
      smartSearch,
      navStyle,
      screen,
    });
  }, [selectedConcept, platform, themeMode, colorScheme, navigatorView, workflowScreen, smartSearch, navStyle, screen]);

  const conceptGroups = useMemo(() => buildConceptGroups(designData), [designData]);
  const concept = findConceptInData(designData, selectedConcept);
  const Concept = concept.component;
  const captureRef = useRef<HTMLElement>(null);

  function changeConcept(id: ConceptId) {
    setSelectedConcept(id);
    applyConceptEntryScreen(id);
  }

  function applyConceptEntryScreen(id: ConceptId) {
    const firstWorkflow = firstScreenInDesign(designById(designData, id));
    setWorkflowScreen(firstWorkflow);
    setScreen(workflowToPrototypeScreen(firstWorkflow));
    setScreenHistory([]);
  }

  function updateDesignData(nextData: DesignData) {
    const normalized = normalizeDesignData(nextData);
    setDesignData(normalized);
    if (!designDataWritable) return;
    fetch("/__design-data/roster-builder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    }).catch(() => setDesignDataWritable(false));
  }

  function selectWorkflowScreen(nextWorkflowScreen: WorkflowScreen) {
    setWorkflowScreen(nextWorkflowScreen);
    setScreen(workflowToPrototypeScreen(nextWorkflowScreen));
    setScreenHistory([]);
  }

  function navigate(screenId: PrototypeScreen) {
    setScreenHistory((current) => (screenId === screen ? current : [...current, screen]));
    setWorkflowScreen(prototypeToWorkflowScreen(screenId));
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
    const screenName = navigatorView === "all-screens" ? "all-screens" : navigatorView === "elements" ? "elements" : workflowScreen;
    await captureElementAsPng(captureRef.current, `${selectedConcept}-${colorScheme}-${screenName}-${platform}-${themeMode}.png`);
  }

  return (
    <GalleryShell
      selectedConcept={concept.id}
      platform={platform}
      themeMode={themeMode}
      colorScheme={colorScheme}
      navigatorView={navigatorView}
      workflowScreen={workflowScreen}
      concept={concept}
      designData={designData}
      designDataWritable={designDataWritable}
      activeConcepts={conceptGroups.activeConcepts}
      archivedConcepts={conceptGroups.archivedConcepts}
      captureRef={captureRef}
      onConceptChange={changeConcept}
      onPlatformChange={setPlatform}
      onThemeModeChange={setThemeMode}
      onColorSchemeChange={setColorScheme}
      onNavigatorViewChange={setNavigatorView}
      onWorkflowScreenChange={selectWorkflowScreen}
      navStyle={navStyle}
      onNavStyleChange={setNavStyle}
      onCapture={captureCurrentStage}
      onDesignDataChange={updateDesignData}
      boardProps={{
        roster,
        selectedSection,
        selectedUnit,
        selectedSectionId,
        expandedSectionIds,
        smartSearch,
        onToggleSmartSearch: () => setSmartSearch((value) => !value),
        navStyle,
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
        colorScheme={colorScheme}
        smartSearch={smartSearch}
        onToggleSmartSearch={() => setSmartSearch((value) => !value)}
        navStyle={navStyle}
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

function readPersistedGalleryState(): PersistedGalleryState {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(GALLERY_STATE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Partial<PersistedGalleryState>;
    return {
      selectedConcept: isOneOf(parsed.selectedConcept, conceptIds) ? parsed.selectedConcept : undefined,
      platform: isOneOf(parsed.platform, platformIds) ? parsed.platform : undefined,
      themeMode: isOneOf(parsed.themeMode, themeModes) ? parsed.themeMode : undefined,
      colorScheme: isOneOf(parsed.colorScheme, colorSchemeIds) ? parsed.colorScheme : undefined,
      navigatorView: isOneOf(parsed.navigatorView, navigatorViews) ? parsed.navigatorView : undefined,
      workflowScreen: isOneOf(parsed.workflowScreen, workflowScreenIds) ? parsed.workflowScreen : undefined,
      smartSearch: typeof parsed.smartSearch === "boolean" ? parsed.smartSearch : undefined,
      navStyle: isOneOf(parsed.navStyle, navStyles) ? parsed.navStyle : undefined,
      screen: isOneOf(parsed.screen, prototypeScreenIds) ? parsed.screen : undefined,
    };
  } catch {
    return {};
  }
}

function persistGalleryState(state: PersistedGalleryState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GALLERY_STATE_KEY, JSON.stringify(state));
  } catch {
    // Losing reload persistence should not block the gallery.
  }
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

export default App;
