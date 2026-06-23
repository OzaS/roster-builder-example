import { useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { Archive, Component, MonitorSmartphone, Moon, Navigation, Palette, PanelBottom, Pencil, Plus, Rows3, Smartphone, Sun, TabletSmartphone, Trash2 } from "lucide-react";
import { DeviceFrame } from "../components/DeviceFrame";
import { ScreenshotButton } from "../components/v2/ScreenshotButton";
import { WorkflowScreenPicker, type WorkflowPickerSelection } from "../components/v2/WorkflowScreenPicker";
import type { ColorScheme, ConceptId, ForceCreationMode, NavigatorView, NavStyle, PlatformPreview, Roster, RosterSection, RosterUnit, TabletPanelLayout, ThemeMode, UnitDetailView, WorkflowScreen } from "../types";
import { colorSchemes } from "../types";
import type { GalleryConcept } from "./galleryTypes";
import { WorkflowBoard } from "./WorkflowBoard";
import { workflowToPrototypeScreen } from "./workflow";
import { DesignElementsPanel } from "./DesignElementsPanel";
import type { DesignData, DesignWorkflow, EditableDesign } from "../design-data/designData";
import { screenLabel } from "../design-data/designData";
import { ScreenGlance, type GlancePlacement } from "./ScreenGlance";

type Props = {
  selectedConcept: ConceptId;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  navigatorView: NavigatorView;
  workflowScreen: WorkflowScreen;
  navStyle: NavStyle;
  forceCreationMode: ForceCreationMode;
  statusBarUsesDesignBackground: boolean;
  concept: GalleryConcept;
  designData: DesignData;
  designDataWritable: boolean;
  activeConcepts: GalleryConcept[];
  archivedConcepts: GalleryConcept[];
  captureRef: RefObject<HTMLElement | null>;
  children: React.ReactNode;
  boardProps: {
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
    onUnitDetailViewChange: (view: UnitDetailView) => void;
    forceCreationMode: ForceCreationMode;
    tabletPanelLayout: TabletPanelLayout;
    onTabletPanelLayoutChange: (layout: TabletPanelLayout) => void;
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
  };
  onConceptChange: (id: ConceptId) => void;
  onPlatformChange: (platform: PlatformPreview) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  onNavigatorViewChange: (view: NavigatorView) => void;
  onWorkflowScreenChange: (screen: WorkflowScreen) => void;
  onNavStyleChange: (style: NavStyle) => void;
  onForceCreationModeChange: (mode: ForceCreationMode) => void;
  onStatusBarUsesDesignBackgroundChange: (enabled: boolean) => void;
  onCapture: () => void;
  onDesignDataChange: (data: DesignData) => void;
};

const navStyleOptions: Array<{ id: Exclude<NavStyle, "top">; label: string; icon: typeof PanelBottom }> = [
  { id: "tabs", label: "Bottom tabs", icon: PanelBottom },
  { id: "floating", label: "Floating tabs", icon: Navigation },
];

export function GalleryShell({
  selectedConcept,
  platform,
  themeMode,
  colorScheme,
  navigatorView,
  workflowScreen,
  navStyle,
  forceCreationMode,
  statusBarUsesDesignBackground,
  concept,
  designData,
  designDataWritable,
  activeConcepts,
  archivedConcepts,
  captureRef,
  children,
  boardProps,
  onConceptChange,
  onPlatformChange,
  onThemeModeChange,
  onColorSchemeChange,
  onNavigatorViewChange,
  onWorkflowScreenChange,
  onNavStyleChange,
  onForceCreationModeChange,
  onStatusBarUsesDesignBackgroundChange,
  onCapture,
  onDesignDataChange,
}: Props) {
  const [railWidth, setRailWidth] = useState(280);
  const [workflowSelection, setWorkflowSelection] = useState<WorkflowPickerSelection>("all");
  const [glance, setGlance] = useState<null | { screen: WorkflowScreen; placement?: GlancePlacement }>(null);
  const selectedDesign = designData.designs.find((design) => design.id === selectedConcept);
  const activeWorkflowSelection = navigatorView === "all-screens" ? workflowSelection : workflowIdForScreen(selectedDesign, workflowScreen);
  const visibleScreens = useMemo(() => visibleDesignScreens(selectedDesign), [selectedDesign]);

  function selectWorkflow(selection: WorkflowPickerSelection) {
    setWorkflowSelection(selection);
    if (selection === "all") {
      onNavigatorViewChange("all-screens");
      return;
    }
    const workflow = selectedDesign?.workflows.find((item) => item.id === selection);
    const firstScreen = workflow?.screens[0];
    if (firstScreen) {
      onWorkflowScreenChange(firstScreen);
    }
  }

  function selectNavigatorView(view: NavigatorView) {
    if (view === "all-screens") {
      setWorkflowSelection("all");
    }
    onNavigatorViewChange(view);
  }

  function updateSelectedDesign(updater: (design: EditableDesign) => EditableDesign, requireWritable = true) {
    if (!selectedDesign || (requireWritable && !designDataWritable)) return;
    onDesignDataChange({
      ...designData,
      designs: designData.designs.map((design) => (design.id === selectedDesign.id ? updater(design) : design)),
    });
  }

  function updateComments(comments: NonNullable<EditableDesign["comments"]>) {
    updateSelectedDesign((design) => ({ ...design, comments }), false);
  }

  function createWorkflow() {
    const label = window.prompt("Workflow name");
    if (!label?.trim()) return;
    const id = slugify(label);
    updateSelectedDesign((design) => ({
      ...design,
      workflows: [...design.workflows, { id: uniqueWorkflowId(design.workflows, id), label: label.trim(), screens: [] }],
    }));
  }

  function renameWorkflow(workflowId: string) {
    const workflow = selectedDesign?.workflows.find((item) => item.id === workflowId);
    const label = window.prompt("Workflow name", workflow?.label);
    if (!label?.trim()) return;
    updateSelectedDesign((design) => ({
      ...design,
      workflows: design.workflows.map((item) => (item.id === workflowId ? { ...item, label: label.trim() } : item)),
    }));
  }

  function deleteWorkflow(workflowId: string) {
    if (workflowId === "unsorted") return;
    updateSelectedDesign((design) => {
      const workflow = design.workflows.find((item) => item.id === workflowId);
      const movedScreens = workflow?.screens ?? [];
      const nextWorkflows = design.workflows
        .filter((item) => item.id !== workflowId)
        .map((item) => (item.id === "unsorted" ? { ...item, screens: [...item.screens, ...movedScreens] } : item));
      return { ...design, workflows: nextWorkflows };
    });
  }

  function moveScreen(screen: WorkflowScreen, workflowId: string) {
    updateSelectedDesign((design) => ({
      ...design,
      workflows: design.workflows.map((workflow) => ({
        ...workflow,
        screens: workflow.id === workflowId ? uniqueScreens([...workflow.screens, screen]) : workflow.screens.filter((item) => item !== screen),
      })),
    }));
  }

  function removeScreen(screen: WorkflowScreen) {
    updateSelectedDesign((design) => ({
      ...design,
      workflows: design.workflows.map((workflow) => ({ ...workflow, screens: workflow.screens.filter((item) => item !== screen) })),
      trash: { screens: uniqueScreens([...(design.trash?.screens ?? []), screen]) },
    }));
  }

  function restoreScreen(screen: WorkflowScreen) {
    updateSelectedDesign((design) => ({
      ...design,
      workflows: design.workflows.map((workflow) =>
        workflow.id === "unsorted" ? { ...workflow, screens: uniqueScreens([...workflow.screens, screen]) } : workflow,
      ),
      trash: { screens: (design.trash?.screens ?? []).filter((item) => item !== screen) },
    }));
  }

  function startRailResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = railWidth;

    function handlePointerMove(moveEvent: PointerEvent) {
      const nextWidth = Math.min(420, Math.max(232, startWidth + moveEvent.clientX - startX));
      setRailWidth(nextWidth);
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function openGlance(screen: WorkflowScreen, placement?: GlancePlacement) {
    setGlance({ screen, placement });
  }

  function handleSinglePreviewClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!event.shiftKey) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.preventDefault();
    event.stopPropagation();
    openGlance(workflowScreen, {
      x: clampPercent(((event.clientX - rect.left) / rect.width) * 100),
      y: clampPercent(((event.clientY - rect.top) / rect.height) * 100),
      mode: "element",
      elementHint: elementHint(event.target),
    });
  }

  return (
    <div className="app" style={{ "--rail-width": `${railWidth}px` } as CSSProperties}>
      <aside className="gallery-rail v2-gallery-rail">
        <div className="rail-resizer" role="separator" aria-orientation="vertical" aria-label="Resize designer panel" onPointerDown={startRailResize} />
        <div className="rail-topline">
          <div className="brand-lockup">
            <span className="brand-mark">RB</span>
            <span>
              <strong>Roster Builder</strong>
              <small>Concept gallery</small>
            </span>
          </div>
          <div className="rail-actions">
            <ScreenshotButton onCapture={onCapture} />
            {archivedConcepts.length > 0 ? (
              <details className="archive-menu">
                <summary className="rail-icon-button" aria-label="Open archive" title="Open archive">
                  <Archive size={17} />
                </summary>
                <ConceptGroup title="Archive" concepts={archivedConcepts} selectedConcept={selectedConcept} onConceptChange={onConceptChange} />
              </details>
            ) : null}
          </div>
        </div>
        <ConceptGroup title="Designs" concepts={activeConcepts} selectedConcept={selectedConcept} onConceptChange={onConceptChange} />
        <div className="view-icon-switch" role="group" aria-label="View">
          <button className={navigatorView === "single" ? "active" : ""} type="button" onClick={() => selectNavigatorView("single")} aria-label="Single" title="Single">
            <Smartphone size={18} />
          </button>
          <button className={navigatorView === "all-screens" ? "active" : ""} type="button" onClick={() => selectNavigatorView("all-screens")} aria-label="All screens" title="All screens">
            <Rows3 size={18} />
          </button>
          <button className={navigatorView === "elements" ? "active" : ""} type="button" onClick={() => selectNavigatorView("elements")} aria-label="Elements" title="Elements">
            <Component size={18} />
          </button>
        </div>
        <WorkflowScreenPicker active={activeWorkflowSelection} screens={concept.workflow} flows={concept.flows} onSelect={selectWorkflow} />
        <WorkflowEditor
          design={selectedDesign}
          screens={visibleScreens}
          writable={designDataWritable}
          onCreateWorkflow={createWorkflow}
          onRenameWorkflow={renameWorkflow}
          onDeleteWorkflow={deleteWorkflow}
          onMoveScreen={moveScreen}
          onRemoveScreen={removeScreen}
          onRestoreScreen={restoreScreen}
        />
        <details className="rail-disclosure">
          <summary>
            <h3>Display</h3>
          </summary>
          <ControlGroup title="Navigation">
            {navStyleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button key={option.id} className={navStyle === option.id ? "active" : ""} type="button" onClick={() => onNavStyleChange(option.id)}>
                  <Icon size={16} />
                  {option.label}
                </button>
              );
            })}
          </ControlGroup>
          <ControlGroup title="Force creation">
            <button className={forceCreationMode === "selector" ? "active" : ""} type="button" onClick={() => onForceCreationModeChange("selector")}><PanelBottom size={16} />Selector</button>
            <button className={forceCreationMode === "inline" ? "active" : ""} type="button" onClick={() => onForceCreationModeChange("inline")}><Rows3 size={16} />Inline</button>
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
          <ControlGroup title="Status bar">
            <button
              className="display-switch-row"
              type="button"
              role="switch"
              aria-checked={statusBarUsesDesignBackground}
              onClick={() => onStatusBarUsesDesignBackgroundChange(!statusBarUsesDesignBackground)}
            >
              <span>Design background</span>
              <span className="display-switch" aria-hidden="true" />
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
        </details>
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
            <WorkflowBoard
              concept={concept}
              design={selectedDesign}
              activeWorkflow={workflowSelection}
              platform={platform}
              themeMode={themeMode}
              colorScheme={colorScheme}
              statusBarUsesDesignBackground={statusBarUsesDesignBackground}
              onOpenGlance={openGlance}
              {...boardProps}
            />
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
            <div className="single-preview-shell" onClickCapture={handleSinglePreviewClick}>
              <DeviceFrame platform={platform} themeMode={themeMode} colorScheme={colorScheme} statusBarUsesDesignBackground={statusBarUsesDesignBackground}>{children}</DeviceFrame>
            </div>
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
      {glance ? (
        <ScreenGlance
          concept={concept}
          design={selectedDesign}
          screen={glance.screen}
          platform={platform}
          themeMode={themeMode}
          colorScheme={colorScheme}
          statusBarUsesDesignBackground={statusBarUsesDesignBackground}
          roster={boardProps.roster}
          selectedSection={boardProps.selectedSection}
          selectedUnit={boardProps.selectedUnit}
          selectedSectionId={boardProps.selectedSectionId}
          expandedSectionIds={boardProps.expandedSectionIds}
          smartSearch={boardProps.smartSearch}
          navStyle={navStyle}
          unitDetailView={boardProps.unitDetailView}
          onUnitDetailViewChange={boardProps.onUnitDetailViewChange}
          forceCreationMode={boardProps.forceCreationMode}
          tabletPanelLayout={boardProps.tabletPanelLayout}
          onTabletPanelLayoutChange={boardProps.onTabletPanelLayoutChange}
          selectedForceId={boardProps.selectedForceId}
          expandedForceIds={boardProps.expandedForceIds}
          initialPlacement={glance.placement}
          onClose={() => setGlance(null)}
          onScreenChange={(screen) => setGlance({ screen })}
          onCommentsChange={updateComments}
          onToggleSmartSearch={boardProps.onToggleSmartSearch}
          onSelectForce={boardProps.onSelectForce}
          onToggleForce={boardProps.onToggleForce}
          onCreateForce={boardProps.onCreateForce}
          onSelectSection={boardProps.onSelectSection}
          onToggleSection={boardProps.onToggleSection}
          onSelectUnit={boardProps.onSelectUnit}
          onToggleOption={boardProps.onToggleOption}
          onCountChange={boardProps.onCountChange}
          onLoadoutGroupCountChange={boardProps.onLoadoutGroupCountChange}
          onSplitLoadoutGroup={boardProps.onSplitLoadoutGroup}
          onSelectLoadoutChoice={boardProps.onSelectLoadoutChoice}
          onNavigate={boardProps.onNavigate}
          onBack={boardProps.onBack}
        />
      ) : null}
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

function WorkflowEditor({
  design,
  screens,
  writable,
  onCreateWorkflow,
  onRenameWorkflow,
  onDeleteWorkflow,
  onMoveScreen,
  onRemoveScreen,
  onRestoreScreen,
}: {
  design?: EditableDesign;
  screens: WorkflowScreen[];
  writable: boolean;
  onCreateWorkflow: () => void;
  onRenameWorkflow: (workflowId: string) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onMoveScreen: (screen: WorkflowScreen, workflowId: string) => void;
  onRemoveScreen: (screen: WorkflowScreen) => void;
  onRestoreScreen: (screen: WorkflowScreen) => void;
}) {
  const trash = design?.trash?.screens ?? [];
  return (
    <details className="rail-disclosure workflow-editor">
      <summary>
        <h3>Workflow editor</h3>
      </summary>
      {!writable ? <p className="designer-note">Run the Vite dev server to save workflow edits back to JSON.</p> : null}
      <button className="workflow-add-button" type="button" onClick={onCreateWorkflow} disabled={!writable}>
        <Plus size={15} />
        Add workflow
      </button>
      <div className="workflow-edit-list">
        {design?.workflows.map((workflow) => (
          <div className="workflow-edit-row" key={workflow.id}>
            <span>
              <strong>{workflow.label}</strong>
              <small>{workflow.screens.length} screens</small>
            </span>
            <button type="button" onClick={() => onRenameWorkflow(workflow.id)} disabled={!writable}>
              <Pencil size={14} />
            </button>
            <button type="button" onClick={() => onDeleteWorkflow(workflow.id)} disabled={!writable || workflow.id === "unsorted"} aria-label={`Delete ${workflow.label}`}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="screen-move-list">
        {screens.map((screen) => (
          <div className="screen-move-row" key={screen}>
            <span>
              <strong>{screenLabel(design, screen)}</strong>
              <small>{screen}</small>
            </span>
            <select value={workflowIdForScreen(design, screen)} onChange={(event) => onMoveScreen(screen, event.currentTarget.value)} disabled={!writable}>
              {design?.workflows.map((workflow) => (
                <option value={workflow.id} key={workflow.id}>
                  {workflow.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => onRemoveScreen(screen)} disabled={!writable} aria-label={`Move ${screenLabel(design, screen)} to trash`}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <details className="trash-section">
        <summary>
          <h3>Trash</h3>
          <small>{trash.length}</small>
        </summary>
        {trash.length ? (
          trash.map((screen) => (
            <div className="screen-move-row" key={screen}>
              <span>
                <strong>{screenLabel(design, screen)}</strong>
                <small>{screen}</small>
              </span>
              <button type="button" onClick={() => onRestoreScreen(screen)} disabled={!writable}>
                Restore
              </button>
            </div>
          ))
        ) : (
          <p className="designer-note">Trash is empty.</p>
        )}
      </details>
    </details>
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
  throw new Error(`findConcept is deprecated; use design data in App instead (${id}).`);
}

function workflowIdForScreen(design: EditableDesign | undefined, screen: WorkflowScreen) {
  return design?.workflows.find((workflow) => workflow.screens.includes(screen))?.id ?? "unsorted";
}

function visibleDesignScreens(design: EditableDesign | undefined) {
  const trash = new Set(design?.trash?.screens ?? []);
  return design?.screens.map((screen) => screen.id).filter((screen) => !trash.has(screen)) ?? [];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "workflow";
}

function uniqueWorkflowId(workflows: DesignWorkflow[], preferred: string) {
  let id = preferred;
  let index = 2;
  while (workflows.some((workflow) => workflow.id === id)) {
    id = `${preferred}-${index}`;
    index += 1;
  }
  return id;
}

function uniqueScreens(screens: WorkflowScreen[]) {
  return Array.from(new Set(screens));
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
