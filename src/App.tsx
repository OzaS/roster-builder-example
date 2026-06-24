import { useEffect, useMemo, useRef, useState } from "react";
import { mockCatalogues, mockDetachments, mockRoster } from "./data/mockRoster";
import { GalleryShell } from "./gallery/GalleryShell";
import { buildConceptGroups, bundledDesignData, designById, findConceptInData, firstScreenInDesign, normalizeDesignData, type DesignData } from "./design-data/designData";
import { prototypeToWorkflowScreen, workflowToPrototypeScreen } from "./gallery/workflow";
import { captureElementAsPng } from "./utils/captureStage";
import type { ColorScheme, ConceptId, DetachmentFavorite, FavoriteLibrary, ForceCreationMode, NavigatorView, NavStyle, PlatformPreview, PrototypeScreen, Roster, RosterForce, RosterSection, RosterUnit, TabletPanelLayout, ThemeMode, UnitDetailView, UnitFavorite, WorkflowScreen } from "./types";

const GALLERY_STATE_KEY = "roster-builder.gallery-state.v1";
const FAVORITES_KEY = "roster-builder.favorites.v1";
const conceptIds = ["ux-workbench"] satisfies ConceptId[];
const platformIds = ["phone", "tablet"] satisfies PlatformPreview[];
const themeModes = ["dark", "light"] satisfies ThemeMode[];
const colorSchemeIds = ["generic", "wh40k", "horus-heresy", "age-of-sigmar", "old-world"] satisfies ColorScheme[];
const navigatorViews = ["single", "all-screens", "elements"] satisfies NavigatorView[];
const navStyles = ["top", "tabs", "floating"] satisfies NavStyle[];
const unitDetailViews = ["options", "profile"] satisfies UnitDetailView[];
const forceCreationModes = ["selector", "inline"] satisfies ForceCreationMode[];
const defaultTabletPanelLayout: TabletPanelLayout = { treeRatio: 0.3, railRatio: 0.26, treeVisible: true, railVisible: true };
const workflowScreenIds = [
  "library",
  "collections",
  "app",
  "subscription-main",
  "create-roster",
  "drafts",
  "source",
  "tools",
  "overview",
  "subscription-edition",
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
  "collections",
  "app",
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
  statusBarUsesDesignBackground?: boolean;
  unitDetailView?: UnitDetailView;
  forceCreationMode?: ForceCreationMode;
  tabletPanelLayout?: TabletPanelLayout;
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
  const [statusBarUsesDesignBackground, setStatusBarUsesDesignBackground] = useState(initialState.statusBarUsesDesignBackground ?? false);
  const [unitDetailView, setUnitDetailView] = useState<UnitDetailView>(initialState.unitDetailView ?? "options");
  const [forceCreationMode, setForceCreationMode] = useState<ForceCreationMode>(initialState.forceCreationMode ?? "selector");
  const [tabletPanelLayout, setTabletPanelLayout] = useState<TabletPanelLayout>(initialState.tabletPanelLayout ?? defaultTabletPanelLayout);
  const [roster, setRoster] = useState<Roster>(mockRoster);
  const [favorites, setFavorites] = useState<FavoriteLibrary>(() => readFavoriteLibrary());
  const [selectedForceId, setSelectedForceId] = useState("primary-force");
  const [expandedForceIds, setExpandedForceIds] = useState<string[]>(mockRoster.forces.map((force) => force.id));
  const [selectedSectionId, setSelectedSectionId] = useState("battleline");
  const [selectedUnitId, setSelectedUnitId] = useState("assault-squad");
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>(["hq", "battleline", "elites"]);
  const [screen, setScreen] = useState<PrototypeScreen>(initialState.screen ?? workflowToPrototypeScreen(initialState.workflowScreen ?? "library"));
  const [screenHistory, setScreenHistory] = useState<PrototypeScreen[]>([]);

  const selectedForce = useMemo(
    () => roster.forces.find((force) => force.id === selectedForceId) ?? roster.forces[0],
    [roster.forces, selectedForceId],
  );

  const selectedSection = useMemo(() => {
    const allSections = roster.forces.flatMap((force) => force.sections);
    return allSections.find((section) => section.id === selectedSectionId) ?? selectedForce.sections[0] ?? allSections[0];
  }, [roster.forces, selectedForce.sections, selectedSectionId]);

  const selectedUnit = useMemo(
    () => roster.forces.flatMap((force) => force.sections).flatMap((section) => section.units).find((unit) => unit.id === selectedUnitId)
      ?? selectedSection.units[0]
      ?? roster.forces.flatMap((force) => force.sections).flatMap((section) => section.units)[0],
    [roster.forces, selectedSection.units, selectedUnitId],
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
      statusBarUsesDesignBackground,
      unitDetailView,
      forceCreationMode,
      tabletPanelLayout,
      screen,
    });
  }, [selectedConcept, platform, themeMode, colorScheme, navigatorView, workflowScreen, smartSearch, navStyle, statusBarUsesDesignBackground, unitDetailView, forceCreationMode, tabletPanelLayout, screen]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Keep the in-memory library usable when storage is unavailable or full.
    }
  }, [favorites]);

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
    const force = roster.forces.find((item) => item.sections.some((section) => section.id === id));
    const section = force?.sections.find((item) => item.id === id);
    if (force) {
      setSelectedForceId(force.id);
      setExpandedForceIds((current) => current.includes(force.id) ? current : [...current, force.id]);
    }
    setSelectedSectionId(id);
    if (section?.units[0]) {
      setSelectedUnitId(section.units[0].id);
    }
    setExpandedSectionIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function selectForce(id: string) {
    const force = roster.forces.find((item) => item.id === id);
    if (!force) return;
    setSelectedForceId(id);
    setExpandedForceIds((current) => current.includes(id) ? current : [...current, id]);
    if (force.sections[0]) setSelectedSectionId(force.sections[0].id);
  }

  function toggleForce(id: string) {
    setExpandedForceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleSection(id: string) {
    setExpandedSectionIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function selectUnit(id: string) {
    setSelectedUnitId(id);
    const parentForce = roster.forces.find((force) => force.sections.some((section) => section.units.some((unit) => unit.id === id)));
    const parentSection = parentForce?.sections.find((section) => section.units.some((unit) => unit.id === id));
    if (parentForce && parentSection) {
      setSelectedForceId(parentForce.id);
      setSelectedSectionId(parentSection.id);
      setExpandedForceIds((current) => current.includes(parentForce.id) ? current : [...current, parentForce.id]);
    }
    navigate("unit-detail");
  }

  function toggleOption(optionId: string) {
    setRoster((current) => updateRosterUnits(current, (unit) => {
      if (unit.id !== selectedUnitId) return { unit };
      const option = unit.options.find((item) => item.id === optionId);
      if (!option) return { unit };
      const pointsDelta = option.selected ? -option.points : option.points;
      return {
        pointsDelta,
        unit: {
          ...unit,
          points: Math.max(0, unit.points + pointsDelta),
          options: unit.options.map((item) => item.id === optionId ? { ...item, selected: !item.selected } : item),
        },
      };
    }));
  }

  function changeCount(unitId: string, delta: number) {
    setRoster((current) => updateRosterUnits(current, (unit) => {
      if (unit.id !== unitId) return { unit };
      const nextCount = Math.max(unit.minCount ?? 1, Math.min(unit.maxCount ?? 10, unit.count + delta));
      const countDelta = nextCount - unit.count;
      const pointsDelta = countDelta * (unit.pointsPerAdditionalModel ?? 0);
      return { pointsDelta, unit: { ...unit, count: nextCount, points: unit.points + pointsDelta } };
    }));
  }

  function splitLoadoutGroup(unitId: string, groupId: string) {
    setRoster((current) => updateRosterUnits(current, (unit) => {
          if (unit.id !== unitId || !unit.detail) return { unit };
          const sourceIndex = unit.detail.loadoutGroups.findIndex((group) => group.id === groupId);
          const source = unit.detail.loadoutGroups[sourceIndex];
          if (!source || !source.canSplit || source.count <= 1) return { unit };
          const groupNumber = unit.detail.loadoutGroups.filter((group) => group.modelId === source.modelId).length + 1;
          const clone = {
            ...source,
            id: `${source.modelId}-group-${groupNumber}`,
            count: 1,
            slots: source.slots.map((slot) => ({ ...slot, choices: [...slot.choices] })),
          };
          const loadoutGroups = [...unit.detail.loadoutGroups];
          loadoutGroups[sourceIndex] = { ...source, count: source.count - 1 };
          loadoutGroups.splice(sourceIndex + 1, 0, clone);
          return { unit: { ...unit, detail: { ...unit.detail, loadoutGroups } } };
    }));
  }

  function changeLoadoutGroupCount(unitId: string, groupId: string, delta: number) {
    setRoster((current) => updateRosterUnits(current, (unit) => {
          if (unit.id !== unitId || !unit.detail) return { unit };
          const group = unit.detail.loadoutGroups.find((item) => item.id === groupId);
          if (!group || !group.canSplit) return { unit };
          const totalModels = unit.detail.loadoutGroups.reduce((sum, item) => sum + item.count, 0);
          const maximumModels = unit.maxCount ?? Number.POSITIVE_INFINITY;
          const requestedDelta = delta < 0 ? -1 : 1;
          if ((requestedDelta < 0 && group.count <= 1) || (requestedDelta > 0 && totalModels >= maximumModels)) return { unit };
          const selectedUpgradePoints = group.slots.reduce((sum, slot) => {
            const choice = slot.choices.find((item) => item.id === slot.selectedChoiceId);
            return sum + (choice?.points ?? 0);
          }, 0);
          const pointsDelta = requestedDelta * (group.basePointsPerModel + selectedUpgradePoints);
          return {
            pointsDelta,
            unit: {
              ...unit,
              count: unit.count + requestedDelta,
              points: unit.points + pointsDelta,
              detail: {
                ...unit.detail,
                loadoutGroups: unit.detail.loadoutGroups.map((item) => item.id === groupId ? { ...item, count: item.count + requestedDelta } : item),
              },
            },
          };
    }));
  }

  function selectLoadoutChoice(unitId: string, groupId: string, slotId: string, choiceId: string) {
    setRoster((current) => updateRosterUnits(current, (unit) => {
          if (unit.id !== unitId || !unit.detail) return { unit };
          const group = unit.detail.loadoutGroups.find((item) => item.id === groupId);
          const slot = group?.slots.find((item) => item.id === slotId);
          const previous = slot?.choices.find((choice) => choice.id === slot.selectedChoiceId);
          const next = slot?.choices.find((choice) => choice.id === choiceId);
          if (!group || !slot || !previous || !next || previous.id === next.id) return { unit };
          const pointsDelta = (next.points - previous.points) * group.count;
          return {
            pointsDelta,
            unit: {
              ...unit,
              points: unit.points + pointsDelta,
              detail: {
                ...unit.detail,
                loadoutGroups: unit.detail.loadoutGroups.map((item) => item.id === groupId ? {
                  ...item,
                  slots: item.slots.map((itemSlot) => itemSlot.id === slotId ? { ...itemSlot, selectedChoiceId: choiceId } : itemSlot),
                } : item),
              },
            },
          };
    }));
  }

  function createForce(catalogueId: string, detachmentId: string) {
    const catalogue = mockCatalogues.find((item) => item.id === catalogueId);
    const detachment = mockDetachments.find((item) => item.id === detachmentId);
    if (!catalogue || !detachment) return;
    const forceId = `force-${Date.now()}`;
    const sections = [
      { id: `${forceId}-hq`, name: "HQ", required: "0/2", units: [] },
      { id: `${forceId}-battleline`, name: "Battleline", required: "0/6", units: [] },
      { id: `${forceId}-elites`, name: "Elites", required: "0/3", units: [] },
      { id: `${forceId}-transport`, name: "Transport", required: "0/2", units: [] },
    ];
    setRoster((current) => ({
      ...current,
      forces: [...current.forces, { id: forceId, name: catalogue.name, detachment: detachment.name, kind: "auxiliary", points: 0, sections }],
    }));
    setSelectedForceId(forceId);
    setSelectedSectionId(sections[0].id);
    setExpandedForceIds((current) => [...current, forceId]);
    setExpandedSectionIds((current) => [...current, sections[0].id]);
  }

  function renameUnit(unitId: string, customName: string) {
    const location = findUnitLocation(roster, unitId);
    const trimmed = customName.trim();
    if (!location || !trimmed) return;
    const renamed = deepClone({ ...location.unit, customName: trimmed });
    setRoster(replaceUnit(roster, unitId, renamed));
    setFavorites((current) => ({
      ...current,
      units: [...current.units, { id: uniqueId("favorite-unit"), createdAt: new Date().toISOString(), sourceSectionName: location.section.name, unit: deepClone(renamed) }],
    }));
  }

  function renameForce(forceId: string, customName: string) {
    const force = roster.forces.find((item) => item.id === forceId);
    const trimmed = customName.trim();
    if (!force || !trimmed) return;
    const renamed = deepClone({ ...force, customName: trimmed });
    setRoster({ ...roster, forces: roster.forces.map((item) => item.id === forceId ? renamed : item) });
    setFavorites((current) => ({
      ...current,
      detachments: [...current.detachments, { id: uniqueId("favorite-detachment"), createdAt: new Date().toISOString(), force: deepClone(renamed) }],
    }));
  }

  function duplicateUnit(unitId: string) {
    const location = findUnitLocation(roster, unitId);
    if (!location) return;
    const clone = cloneUnit(location.unit);
    const forces = roster.forces.map((force) => force.id !== location.force.id ? force : {
      ...force,
      points: force.points + clone.points,
      sections: force.sections.map((section) => section.id !== location.section.id ? section : {
        ...section,
        units: insertAfter(section.units, unitId, clone),
      }),
    });
    setRoster({ ...roster, forces, pointsUsed: roster.pointsUsed + clone.points });
    setSelectedUnitId(clone.id);
  }

  function deleteUnit(unitId: string) {
    const location = findUnitLocation(roster, unitId);
    if (!location) return;
    const nextRoster = {
      ...roster,
      pointsUsed: roster.pointsUsed - location.unit.points,
      forces: roster.forces.map((force) => force.id !== location.force.id ? force : {
        ...force,
        points: force.points - location.unit.points,
        sections: force.sections.map((section) => section.id === location.section.id ? { ...section, units: section.units.filter((unit) => unit.id !== unitId) } : section),
      }),
    };
    setRoster(nextRoster);
    if (selectedUnitId === unitId) {
      const fallback = location.section.units.find((unit) => unit.id !== unitId)
        ?? nextRoster.forces.flatMap((force) => force.sections).flatMap((section) => section.units)[0];
      if (fallback) setSelectedUnitId(fallback.id);
      setScreen("overview");
      setWorkflowScreen("overview");
    }
  }

  function moveUnit(unitId: string, destinationSectionId: string) {
    const source = findUnitLocation(roster, unitId);
    const destination = findSectionLocation(roster, destinationSectionId);
    if (!source || !destination || source.section.id === destination.section.id || source.section.name !== destination.section.name) return;
    const forces = roster.forces.map((force) => {
      let points = force.points;
      if (force.id === source.force.id) points -= source.unit.points;
      if (force.id === destination.force.id) points += source.unit.points;
      return {
        ...force,
        points,
        sections: force.sections.map((section) => {
          if (section.id === source.section.id) return { ...section, units: section.units.filter((unit) => unit.id !== unitId) };
          if (section.id === destination.section.id) return { ...section, units: [...section.units, source.unit] };
          return section;
        }),
      };
    });
    setRoster({ ...roster, forces });
    setSelectedForceId(destination.force.id);
    setSelectedSectionId(destination.section.id);
    setExpandedForceIds((current) => current.includes(destination.force.id) ? current : [...current, destination.force.id]);
    setExpandedSectionIds((current) => current.includes(destination.section.id) ? current : [...current, destination.section.id]);
  }

  function reuseUnitFavorite(favoriteId: string, destinationSectionId: string) {
    const favorite = favorites.units.find((item) => item.id === favoriteId);
    const destination = findSectionLocation(roster, destinationSectionId);
    if (!favorite || !destination || destination.section.name !== favorite.sourceSectionName) return;
    const clone = cloneUnit(favorite.unit);
    setRoster({
      ...roster,
      pointsUsed: roster.pointsUsed + clone.points,
      forces: roster.forces.map((force) => force.id !== destination.force.id ? force : {
        ...force,
        points: force.points + clone.points,
        sections: force.sections.map((section) => section.id === destination.section.id ? { ...section, units: [...section.units, clone] } : section),
      }),
    });
    setSelectedForceId(destination.force.id);
    setSelectedSectionId(destination.section.id);
    setSelectedUnitId(clone.id);
    setExpandedForceIds((current) => current.includes(destination.force.id) ? current : [...current, destination.force.id]);
    setExpandedSectionIds((current) => current.includes(destination.section.id) ? current : [...current, destination.section.id]);
  }

  function reuseDetachmentFavorite(favoriteId: string) {
    const favorite = favorites.detachments.find((item) => item.id === favoriteId);
    if (!favorite) return;
    const clone = cloneForce(favorite.force);
    setRoster({ ...roster, forces: [...roster.forces, clone], pointsUsed: roster.pointsUsed + clone.points });
    setSelectedForceId(clone.id);
    setSelectedSectionId(clone.sections[0]?.id ?? "");
    setSelectedUnitId(clone.sections[0]?.units[0]?.id ?? selectedUnitId);
    setExpandedForceIds((current) => [...current, clone.id]);
    if (clone.sections[0]) setExpandedSectionIds((current) => [...current, clone.sections[0].id]);
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
      forceCreationMode={forceCreationMode}
      onForceCreationModeChange={setForceCreationMode}
      statusBarUsesDesignBackground={statusBarUsesDesignBackground}
      onStatusBarUsesDesignBackgroundChange={setStatusBarUsesDesignBackground}
      onCapture={captureCurrentStage}
      onDesignDataChange={updateDesignData}
      boardProps={{
        roster,
        unitFavorites: favorites.units,
        detachmentFavorites: favorites.detachments,
        selectedSection,
        selectedUnit,
        selectedForceId,
        expandedForceIds,
        selectedSectionId,
        expandedSectionIds,
        smartSearch,
        onToggleSmartSearch: () => setSmartSearch((value) => !value),
        navStyle,
        unitDetailView,
        onUnitDetailViewChange: setUnitDetailView,
        forceCreationMode,
        tabletPanelLayout,
        onTabletPanelLayoutChange: setTabletPanelLayout,
        onSelectForce: selectForce,
        onToggleForce: toggleForce,
        onCreateForce: createForce,
        onRenameUnit: renameUnit,
        onRenameForce: renameForce,
        onDuplicateUnit: duplicateUnit,
        onDeleteUnit: deleteUnit,
        onMoveUnit: moveUnit,
        onReuseUnitFavorite: reuseUnitFavorite,
        onReuseDetachmentFavorite: reuseDetachmentFavorite,
        onDeleteUnitFavorite: (id) => setFavorites((current) => ({ ...current, units: current.units.filter((item) => item.id !== id) })),
        onDeleteDetachmentFavorite: (id) => setFavorites((current) => ({ ...current, detachments: current.detachments.filter((item) => item.id !== id) })),
        onSelectSection: selectSection,
        onToggleSection: toggleSection,
        onSelectUnit: selectUnit,
        onToggleOption: toggleOption,
        onCountChange: changeCount,
        onLoadoutGroupCountChange: changeLoadoutGroupCount,
        onSplitLoadoutGroup: splitLoadoutGroup,
        onSelectLoadoutChoice: selectLoadoutChoice,
        onNavigate: navigate,
        onBack: goBack,
      }}
    >
      <Concept
        roster={roster}
        unitFavorites={favorites.units}
        detachmentFavorites={favorites.detachments}
        selectedSection={selectedSection}
        selectedUnit={selectedUnit}
        selectedForceId={selectedForceId}
        expandedForceIds={expandedForceIds}
        selectedSectionId={selectedSectionId}
        expandedSectionIds={expandedSectionIds}
        screen={screen}
        workflowScreen={workflowScreen}
        themeMode={themeMode}
        colorScheme={colorScheme}
        smartSearch={smartSearch}
        onToggleSmartSearch={() => setSmartSearch((value) => !value)}
        navStyle={navStyle}
        unitDetailView={unitDetailView}
        onUnitDetailViewChange={setUnitDetailView}
        forceCreationMode={forceCreationMode}
        tabletPanelLayout={tabletPanelLayout}
        onTabletPanelLayoutChange={setTabletPanelLayout}
        canGoBack={screenHistory.length > 0 || screen !== "overview"}
        onSelectSection={selectSection}
        onToggleSection={toggleSection}
        onSelectForce={selectForce}
        onToggleForce={toggleForce}
        onCreateForce={createForce}
        onRenameUnit={renameUnit}
        onRenameForce={renameForce}
        onDuplicateUnit={duplicateUnit}
        onDeleteUnit={deleteUnit}
        onMoveUnit={moveUnit}
        onReuseUnitFavorite={reuseUnitFavorite}
        onReuseDetachmentFavorite={reuseDetachmentFavorite}
        onDeleteUnitFavorite={(id) => setFavorites((current) => ({ ...current, units: current.units.filter((item) => item.id !== id) }))}
        onDeleteDetachmentFavorite={(id) => setFavorites((current) => ({ ...current, detachments: current.detachments.filter((item) => item.id !== id) }))}
        onSelectUnit={selectUnit}
        onToggleOption={toggleOption}
        onCountChange={changeCount}
        onLoadoutGroupCountChange={changeLoadoutGroupCount}
        onSplitLoadoutGroup={splitLoadoutGroup}
        onSelectLoadoutChoice={selectLoadoutChoice}
        onNavigate={navigate}
        onBack={goBack}
      />
    </GalleryShell>
  );
}

function updateRosterUnits(
  roster: Roster,
  update: (unit: RosterUnit) => { unit: RosterUnit; pointsDelta?: number },
): Roster {
  let rosterPointsDelta = 0;
  const forces = roster.forces.map((force) => {
    let forcePointsDelta = 0;
    const sections = force.sections.map((section) => ({
      ...section,
      units: section.units.map((unit) => {
        const result = update(unit);
        forcePointsDelta += result.pointsDelta ?? 0;
        return result.unit;
      }),
    }));
    rosterPointsDelta += forcePointsDelta;
    return { ...force, points: force.points + forcePointsDelta, sections };
  });
  return { ...roster, forces, pointsUsed: roster.pointsUsed + rosterPointsDelta };
}

function readFavoriteLibrary(): FavoriteLibrary {
  const empty: FavoriteLibrary = { version: 1, units: [], detachments: [] };
  if (typeof window === "undefined") return empty;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "null") as Partial<FavoriteLibrary> | null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.units) || !Array.isArray(parsed.detachments)) return empty;
    if (!parsed.units.every(isUnitFavorite) || !parsed.detachments.every(isDetachmentFavorite)) return empty;
    return { version: 1, units: parsed.units as UnitFavorite[], detachments: parsed.detachments as DetachmentFavorite[] };
  } catch {
    return empty;
  }
}

function isUnitFavorite(value: unknown): value is UnitFavorite {
  if (!value || typeof value !== "object") return false;
  const favorite = value as Partial<UnitFavorite>;
  return typeof favorite.id === "string"
    && typeof favorite.createdAt === "string"
    && typeof favorite.sourceSectionName === "string"
    && isRosterUnit(favorite.unit);
}

function isDetachmentFavorite(value: unknown): value is DetachmentFavorite {
  if (!value || typeof value !== "object") return false;
  const favorite = value as Partial<DetachmentFavorite>;
  const force = favorite.force as Partial<RosterForce> | undefined;
  return typeof favorite.id === "string"
    && typeof favorite.createdAt === "string"
    && Boolean(force)
    && typeof force?.id === "string"
    && typeof force.name === "string"
    && typeof force.detachment === "string"
    && typeof force.points === "number"
    && Array.isArray(force.sections)
    && force.sections.every((section) => section && typeof section.id === "string" && typeof section.name === "string" && Array.isArray(section.units) && section.units.every(isRosterUnit));
}

function isRosterUnit(value: unknown): value is RosterUnit {
  if (!value || typeof value !== "object") return false;
  const unit = value as Partial<RosterUnit>;
  return typeof unit.id === "string"
    && typeof unit.name === "string"
    && typeof unit.role === "string"
    && typeof unit.points === "number"
    && typeof unit.count === "number"
    && Array.isArray(unit.options)
    && Array.isArray(unit.keywords);
}

function uniqueId(prefix: string) {
  return `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function deepClone<T>(value: T): T {
  return structuredClone(value);
}

function cloneUnit(unit: RosterUnit): RosterUnit {
  return { ...deepClone(unit), id: uniqueId("unit") };
}

function cloneForce(force: RosterForce): RosterForce {
  const forceId = uniqueId("force");
  return {
    ...deepClone(force),
    id: forceId,
    kind: "auxiliary",
    sections: force.sections.map((section) => ({
      ...deepClone(section),
      id: uniqueId(`${forceId}-section`),
      units: section.units.map(cloneUnit),
    })),
  };
}

function findUnitLocation(roster: Roster, unitId: string): { force: RosterForce; section: RosterSection; unit: RosterUnit } | undefined {
  for (const force of roster.forces) {
    for (const section of force.sections) {
      const unit = section.units.find((item) => item.id === unitId);
      if (unit) return { force, section, unit };
    }
  }
}

function findSectionLocation(roster: Roster, sectionId: string): { force: RosterForce; section: RosterSection } | undefined {
  for (const force of roster.forces) {
    const section = force.sections.find((item) => item.id === sectionId);
    if (section) return { force, section };
  }
}

function replaceUnit(roster: Roster, unitId: string, replacement: RosterUnit): Roster {
  return {
    ...roster,
    forces: roster.forces.map((force) => ({
      ...force,
      sections: force.sections.map((section) => ({
        ...section,
        units: section.units.map((unit) => unit.id === unitId ? replacement : unit),
      })),
    })),
  };
}

function insertAfter(units: RosterUnit[], sourceId: string, unit: RosterUnit) {
  const index = units.findIndex((item) => item.id === sourceId);
  const next = [...units];
  next.splice(index < 0 ? next.length : index + 1, 0, unit);
  return next;
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
      statusBarUsesDesignBackground: typeof parsed.statusBarUsesDesignBackground === "boolean" ? parsed.statusBarUsesDesignBackground : undefined,
      unitDetailView: isOneOf(parsed.unitDetailView, unitDetailViews) ? parsed.unitDetailView : undefined,
      forceCreationMode: isOneOf(parsed.forceCreationMode, forceCreationModes) ? parsed.forceCreationMode : undefined,
      tabletPanelLayout: isTabletPanelLayout(parsed.tabletPanelLayout) ? parsed.tabletPanelLayout : undefined,
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

function isTabletPanelLayout(value: unknown): value is TabletPanelLayout {
  if (!value || typeof value !== "object") return false;
  const layout = value as Partial<TabletPanelLayout>;
  return typeof layout.treeRatio === "number"
    && layout.treeRatio >= 0.15
    && layout.treeRatio <= 0.45
    && typeof layout.railRatio === "number"
    && layout.railRatio >= 0.15
    && layout.railRatio <= 0.45
    && typeof layout.treeVisible === "boolean"
    && typeof layout.railVisible === "boolean";
}

export default App;
