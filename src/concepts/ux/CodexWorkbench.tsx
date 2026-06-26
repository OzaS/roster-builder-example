import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { Activity, AlertTriangle, ArrowLeft, ArrowUp, BarChart3, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, CircleDot, ClipboardList, Cog, Coins, Command, Copy, Database, Dice5, Download, Ellipsis, FileInput, Gamepad2, GripVertical, Hammer, Heart, ImagePlus, Layers, LibraryBig, Maximize2, Minimize2, Minus, MoveRight, PanelsTopLeft, Pencil, Plus, RotateCcw, Scale, Search, ShieldCheck, Sparkles, Split, Target, Timer, Trash2, UserRound, UsersRound, Wand2, X } from "lucide-react";
import { mockCatalogues, mockDetachments, mockSystemUnits } from "../../data/mockRoster";
import { referenceById, resolveRosterReference } from "../../data/mockRosterReferences";
import type { RosterReferenceDefinition, RosterUnit } from "../../types";
import type { ConceptProps } from "../shared";
import { BackOrTitle, BudgetMeter, Chip, countSections, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph, SubscriptionGate } from "./uxShared";

type ReferenceGlance =
  | { type: "unit"; unit: RosterUnit }
  | { type: "reference"; reference: RosterReferenceDefinition };

/**
 * Codex Workbench — the single merged design.
 * Master/detail workbench (tree + live detail + validation rail) with a library
 * entry, a roster-creation flow, and a Settings-gated smart-search tier. Main
 * navigation can be rendered as a top bar, a bottom tab bar, or a floating tab
 * bar so the directions can be compared side by side.
 */
export function CodexWorkbench(props: ConceptProps) {
  const navStyle = props.navStyle ?? "top";
  const usesTabNavigation = navStyle !== "top";
  const smart = props.smartSearch ?? false;
  const screen = props.screen;
  const isUnitDetail = screen === "unit-detail";
  const isMainTab = props.workflowScreen
    ? (["library", "subscription-main", "source", "tools", "collections"] as const).some((tab) => tab === props.workflowScreen)
    : screen === "library" || screen === "catalogue" || screen === "tools" || screen === "collections";
  const showTabBar = usesTabNavigation && isMainTab;
  const isWorkbenchScreen = screen !== "library" && screen !== "catalogue" && screen !== "tools" && screen !== "collections" && screen !== "app" && screen !== "settings" && screen !== "system";
  const [activeLoadoutSlot, setActiveLoadoutSlot] = useState<{ groupId: string; slotId: string } | null>(null);
  const [forceCreationOpen, setForceCreationOpen] = useState(false);
  const [rosterSearchOpen, setRosterSearchOpen] = useState(false);
  const [rosterSearchQuery, setRosterSearchQuery] = useState("");
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false);
  const [focusPane, setFocusPane] = useState<"tree" | "detail" | "rail" | null>(null);
  const [focusChromeVisible, setFocusChromeVisible] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const [smartGateOpen, setSmartGateOpen] = useState(false);
  const [referenceGlances, setReferenceGlances] = useState<ReferenceGlance[]>([]);
  const glanceTriggerRef = useRef<HTMLElement | null>(null);
  const detailScrollRef = useRef<HTMLElement>(null);
  const loadoutScrollTopRef = useRef(0);
  const layoutRef = useRef<HTMLDivElement>(null);
  const shell = `ux-screen ux-workbench ${shellClass(props.themeMode, props.colorScheme)} ${showTabBar ? "has-tabs" : ""} ${dockOpen ? "dock-open" : "dock-closed"} ${props.tabletPanelLayout.treeVisible ? "" : "tree-collapsed"} ${props.tabletPanelLayout.railVisible ? "" : "rail-collapsed"} ${focusPane ? `focus-mode focus-${focusPane}` : ""} ${focusChromeVisible ? "focus-chrome-open" : ""}`.trim();
  const panelStyle = {
    "--ux-tree-track": props.tabletPanelLayout.treeVisible ? `max(160px, calc((100% - 20px) * ${props.tabletPanelLayout.treeRatio}))` : "0px",
    "--ux-rail-track": props.tabletPanelLayout.railVisible ? `max(160px, calc((100% - 20px) * ${props.tabletPanelLayout.railRatio}))` : "0px",
  } as CSSProperties;

  const restoreDetailScroll = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (detailScrollRef.current) detailScrollRef.current.scrollTop = loadoutScrollTopRef.current;
    });
  }, []);

  const openLoadoutSelector = useCallback((groupId: string, slotId: string) => {
    loadoutScrollTopRef.current = detailScrollRef.current?.scrollTop ?? 0;
    setActiveLoadoutSlot({ groupId, slotId });
    restoreDetailScroll();
  }, [restoreDetailScroll]);

  const closeLoadoutSelector = useCallback(() => {
    setActiveLoadoutSlot(null);
    restoreDetailScroll();
  }, [restoreDetailScroll]);

  const rememberGlanceTrigger = useCallback(() => {
    if (!referenceGlances.length) glanceTriggerRef.current = document.activeElement as HTMLElement | null;
  }, [referenceGlances.length]);

  const openReferenceGlance = useCallback((reference: RosterReferenceDefinition) => {
    rememberGlanceTrigger();
    setReferenceGlances([{ type: "reference", reference }]);
  }, [rememberGlanceTrigger]);

  const openUnitGlance = useCallback((unit: RosterUnit) => {
    rememberGlanceTrigger();
    setReferenceGlances([{ type: "unit", unit }]);
  }, [rememberGlanceTrigger]);

  const openNestedReferenceGlance = useCallback((reference: RosterReferenceDefinition) => {
    setReferenceGlances((current) => current.length ? [current[0], { type: "reference", reference }] : [{ type: "reference", reference }]);
  }, []);

  const closeAllReferenceGlances = useCallback(() => {
    setReferenceGlances([]);
    window.requestAnimationFrame(() => glanceTriggerRef.current?.focus());
  }, []);

  const openSmartSearch = useCallback(() => {
    if (smart) props.onNavigate("smart-search");
    else setSmartGateOpen(true);
  }, [smart, props]);

  useEffect(() => {
    setActiveLoadoutSlot(null);
  }, [screen, props.selectedUnit.id, props.unitDetailView]);

  useEffect(() => {
    setFocusPane(null);
    setFocusChromeVisible(false);
    setRosterSearchOpen(false);
    setRosterSearchQuery("");
    setLayoutMenuOpen(false);
    setDockOpen(false);
    setSmartGateOpen(false);
  }, [screen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (rosterSearchOpen) {
        setRosterSearchOpen(false);
        setRosterSearchQuery("");
      }
      setLayoutMenuOpen(false);
      setDockOpen(false);
      if (focusPane) setFocusChromeVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusPane, rosterSearchOpen]);

  let body: ReactNode;
  let modifier = "";

  if (screen === "library") {
    body = <Library props={props} />;
  } else if (screen === "collections") {
    body = <CollectionsLibrary props={props} />;
  } else if (screen === "catalogue") {
    body = <LookupScreen props={props} />;
  } else if (screen === "tools") {
    body = <ToolsScreen props={props} />;
  } else if (screen === "roster-analytics") {
    body = <RosterAnalyticsScreen props={props} />;
  } else if (screen === "comparison") {
    body = <ComparisonScreen props={props} />;
  } else if (screen === "game-tracker") {
    body = <GameTrackerScreen props={props} />;
  } else if (screen === "dice-simulator") {
    body = <DiceSimulatorScreen props={props} />;
  } else if (screen === "app") {
    body = <AppScreen props={props} />;
  } else if (screen === "settings") {
    body = <SettingsScreen props={props} />;
  } else if (screen === "system") {
    body = <CreateScreen props={props} />;
  } else if (screen === "smart-search") {
    body = <SmartSearchScreen props={props} />;
  } else {
    const smartClass = navStyle === "top" && smart ? "ux-smart" : "";
    modifier = [isUnitDetail ? "show-detail has-detail-toggle" : "", screen === "overview" ? "roster-overview" : "", screen === "validation" ? "show-checks" : "", smartClass].filter(Boolean).join(" ");
    body = (
      <>
        <WorkbenchHeader
          props={props}
          searchOpen={rosterSearchOpen}
          searchQuery={rosterSearchQuery}
          layoutMenuOpen={layoutMenuOpen}
          focusPane={focusPane}
          onOpenSmartSearch={openSmartSearch}
          onSearchOpenChange={(open) => {
            setRosterSearchOpen(open);
            if (!open) setRosterSearchQuery("");
          }}
          onSearchQueryChange={setRosterSearchQuery}
          onLayoutMenuOpenChange={setLayoutMenuOpen}
          onFocusPaneChange={(pane) => {
            setFocusPane(pane);
            setFocusChromeVisible(false);
            setLayoutMenuOpen(false);
          }}
        />
        {!isUnitDetail ? (
          <div className={`ux-wb-budget ${screen === "overview" ? "tablet-overview-budget" : ""}`}>
            <BudgetMeter roster={props.roster} />
          </div>
        ) : null}
        <div className="ux-wb-layout" ref={layoutRef} style={panelStyle}>
          <Tree props={props} query={rosterSearchQuery} onQueryChange={setRosterSearchQuery} searchInNavbar={rosterSearchOpen} creationOpen={forceCreationOpen} onCreationOpenChange={setForceCreationOpen} onOpenUnitGlance={openUnitGlance} />
          <PaneDivider side="tree" props={props} layoutRef={layoutRef} />
          <Detail props={props} scrollRef={detailScrollRef} onOpenLoadoutSlot={openLoadoutSelector} onOpenReference={openReferenceGlance} />
          <PaneDivider side="rail" props={props} layoutRef={layoutRef} />
          <Rail props={props} />
        </div>
      </>
    );
  }

  const showCommandBar = navStyle === "top" && smart && isWorkbenchScreen && !isUnitDetail && screen !== "smart-search";
  const subscriptionVariant = props.workflowScreen === "subscription-main" ? "main" : props.workflowScreen === "subscription-edition" ? "edition" : null;

  const handleShellPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (dockOpen && !target.closest(".ux-tabbar, .ux-dock-handle")) setDockOpen(false);
    if (layoutMenuOpen && !target.closest(".ux-layout-menu, .ux-tablet-layout-button")) setLayoutMenuOpen(false);
    if (focusPane && focusChromeVisible && !target.closest(".ux-wb-top, .ux-focus-top-handle")) setFocusChromeVisible(false);
  };

  return (
    <div className={`${shell} ${modifier}`.trim()} onPointerDown={handleShellPointerDown}>
      {body}
      {subscriptionVariant ? <SubscriptionGate variant={subscriptionVariant} onClose={() => props.onNavigate(subscriptionVariant === "main" ? "library" : "overview")} /> : null}
      {smartGateOpen ? <SubscriptionGate variant="edition" onClose={() => setSmartGateOpen(false)} /> : null}
      {focusPane ? <EdgeHandle edge="top" expanded={focusChromeVisible} onReveal={() => setFocusChromeVisible(true)} /> : null}
      {forceCreationOpen && props.forceCreationMode !== "inline" ? <ForceSelector props={props} onClose={() => setForceCreationOpen(false)} /> : null}
      {activeLoadoutSlot ? <LoadoutSelector props={props} target={activeLoadoutSlot} onClose={closeLoadoutSelector} /> : null}
      {referenceGlances.length ? <ReferenceGlanceStack glances={referenceGlances} onOpenReference={openNestedReferenceGlance} onCloseTop={() => referenceGlances.length === 1 ? closeAllReferenceGlances() : setReferenceGlances((current) => current.slice(0, -1))} onCloseAll={closeAllReferenceGlances} /> : null}
      {showTabBar ? <><EdgeHandle edge="bottom" expanded={dockOpen} onReveal={() => setDockOpen(true)} /><TabBar props={props} onNavigate={(next) => { setDockOpen(false); props.onNavigate(next); }} /></> : isUnitDetail ? <DetailModeBar props={props} /> : showCommandBar ? <CommandBar props={props} /> : null}
    </div>
  );
}

function DetailModeBar({ props }: { props: ConceptProps }) {
  const active = props.unitDetailView ?? "options";
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"rename" | "move" | null>(null);
  return (
    <div className="ux-detail-mode-layer">
      {menuOpen ? (
        <div className="ux-detail-action-menu" role="menu" aria-label="Unit actions">
          <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setDialog("rename"); }}><Pencil size={15} />Rename & favorite</button>
          <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); props.onDuplicateUnit(props.selectedUnit.id); }}><Copy size={15} />Duplicate</button>
          <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setDialog("move"); }}><MoveRight size={15} />Move</button>
        </div>
      ) : null}
      <nav className="ux-detail-mode-bar" aria-label="Unit detail view">
        <button type="button" className={`ux-detail-mode-tab ${active === "options" ? "active" : ""}`} onClick={() => props.onUnitDetailViewChange?.("options")} aria-pressed={active === "options"}>
          <Cog size={18} />
          <span>Options</span>
        </button>
        <button type="button" className={`ux-detail-menu-fab ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen((open) => !open)} aria-label="More unit actions" aria-expanded={menuOpen}>
          <Ellipsis size={22} />
        </button>
        <button type="button" className={`ux-detail-mode-tab ${active === "profile" ? "active" : ""}`} onClick={() => props.onUnitDetailViewChange?.("profile")} aria-pressed={active === "profile"}>
          <BookOpen size={18} />
          <span>Profile</span>
        </button>
      </nav>
      {dialog === "rename" ? <RenameDialog title="Rename unit" description="A reusable snapshot will be saved to your Library." initialValue={unitDisplayName(props.selectedUnit)} onClose={() => setDialog(null)} onSave={(name) => { props.onRenameUnit(props.selectedUnit.id, name); setDialog(null); }} /> : null}
      {dialog === "move" ? <UnitDestinationDialog props={props} title="Move unit" sourceSectionName={props.selectedSection.name} excludeSectionId={props.selectedSectionId} onClose={() => setDialog(null)} onSelect={(sectionId) => { props.onMoveUnit(props.selectedUnit.id, sectionId); setDialog(null); }} /> : null}
    </div>
  );
}

function RenameDialog({ title, description, initialValue, onClose, onSave }: { title: string; description: string; initialValue: string; onClose: () => void; onSave: (name: string) => void }) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div className="ux-entry-dialog-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ux-entry-dialog" role="dialog" aria-modal="true" aria-labelledby="rename-entry-title">
        <header><span><strong id="rename-entry-title">{title}</strong><small>{description}</small></span><button type="button" onClick={onClose} aria-label="Close"><X size={17} /></button></header>
        <label><span>Custom name</span><input value={value} onChange={(event) => setValue(event.currentTarget.value)} autoFocus maxLength={80} onKeyDown={(event) => { if (event.key === "Enter" && trimmed) onSave(trimmed); }} /></label>
        {!trimmed ? <small className="ux-entry-dialog-error">Enter a name to continue.</small> : null}
        <footer><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary" disabled={!trimmed} onClick={() => onSave(trimmed)}>Save favorite</button></footer>
      </section>
    </div>
  );
}

function UnitDestinationDialog({ props, title, sourceSectionName, excludeSectionId, onClose, onSelect }: { props: ConceptProps; title: string; sourceSectionName: string; excludeSectionId?: string; onClose: () => void; onSelect: (sectionId: string) => void }) {
  const destinations = props.roster.forces.flatMap((force) => force.sections
    .filter((section) => section.name === sourceSectionName && section.id !== excludeSectionId)
    .map((section) => ({ force, section })));
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div className="ux-entry-dialog-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ux-entry-dialog" role="dialog" aria-modal="true" aria-labelledby="destination-title">
        <header><span><strong id="destination-title">{title}</strong><small>Compatible {sourceSectionName} sections</small></span><button type="button" onClick={onClose} aria-label="Close"><X size={17} /></button></header>
        <div className="ux-destination-list">
          {destinations.length ? destinations.map(({ force, section }) => <button key={section.id} type="button" onClick={() => onSelect(section.id)}><span><strong>{forceDisplayName(force)}</strong><small>{force.detachment} · {section.name}</small></span><MoveRight size={16} /></button>) : <div className="ux-favorite-empty"><MoveRight size={19} /><strong>No compatible destination</strong><small>Add another detachment with a {sourceSectionName} section first.</small></div>}
        </div>
        <footer><button type="button" onClick={onClose}>Cancel</button></footer>
      </section>
    </div>
  );
}

function ForceActionMenu({ props, forceId }: { props: ConceptProps; forceId: string }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const force = props.roster.forces.find((item) => item.id === forceId);
  if (!force) return null;
  return (
    <div className="ux-force-actions">
      <button type="button" aria-label={`Actions for ${forceDisplayName(force)}`} aria-expanded={open} onClick={() => setOpen((value) => !value)}><Ellipsis size={16} /></button>
      {open ? <div className="ux-force-action-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setOpen(false); setRenaming(true); }}><Pencil size={14} />Rename & favorite</button></div> : null}
      {renaming ? <RenameDialog title="Rename detachment" description="The configured detachment and its units will be saved to your Library." initialValue={forceDisplayName(force)} onClose={() => setRenaming(false)} onSave={(name) => { props.onRenameForce(force.id, name); setRenaming(false); }} /> : null}
    </div>
  );
}

function WorkbenchHeader({
  props,
  searchOpen,
  searchQuery,
  layoutMenuOpen,
  focusPane,
  onOpenSmartSearch,
  onSearchOpenChange,
  onSearchQueryChange,
  onLayoutMenuOpenChange,
  onFocusPaneChange,
}: {
  props: ConceptProps;
  searchOpen: boolean;
  searchQuery: string;
  layoutMenuOpen: boolean;
  focusPane: "tree" | "detail" | "rail" | null;
  onOpenSmartSearch: () => void;
  onSearchOpenChange: (open: boolean) => void;
  onSearchQueryChange: (query: string) => void;
  onLayoutMenuOpenChange: (open: boolean) => void;
  onFocusPaneChange: (pane: "tree" | "detail" | "rail" | null) => void;
}) {
  const isUnitDetail = props.screen === "unit-detail";
  const isOverview = props.screen === "overview";
  const pointsRemaining = props.roster.pointsLimit - props.roster.pointsUsed;
  const progress = Math.min(100, Math.max(0, (props.roster.pointsUsed / props.roster.pointsLimit) * 100));
  const remainingLabel = pointsRemaining >= 0 ? `${pointsRemaining} pts left` : `${Math.abs(pointsRemaining)} pts over`;

  return (
    <header className={`ux-wb-top workspace-header ${isUnitDetail ? "unit-detail" : ""} ${isOverview ? "roster-overview" : ""} ${isOverview && searchOpen ? "search-open" : ""}`}>
      <BackOrTitle
        props={props}
        fallback={
          <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
            <Layers size={18} />
          </button>
        }
      />
      {searchOpen && isOverview ? (
        <div className="ux-navbar-search ux-roster-navbar-search">
          <Search size={15} />
          <input value={searchQuery} onChange={(event) => onSearchQueryChange(event.currentTarget.value)} placeholder="Search roster" autoFocus />
          <button type="button" className="ux-navbar-search-smart" aria-label="Smart search" title="Smart search" onClick={onOpenSmartSearch}>
            <Wand2 size={15} />
          </button>
        </div>
      ) : (
        <div className="ux-wb-title">
          <strong>{isUnitDetail ? unitDisplayName(props.selectedUnit) : props.roster.name}</strong>
          {isOverview ? <><small className="ux-phone-overview-subtitle">{props.roster.faction} · {props.roster.system}</small><small className="ux-tablet-overview-subtitle">{props.roster.faction} · {remainingLabel}</small></> : <small>{isUnitDetail ? `${props.selectedSection.name} · ${remainingLabel}` : `${props.roster.faction} · ${props.roster.system}`}</small>}
        </div>
      )}
      {isOverview ? <button type="button" className="ux-icon-btn ux-roster-search-toggle" aria-label={searchOpen ? "Close roster search" : "Search roster"} onClick={() => onSearchOpenChange(!searchOpen)}>{searchOpen ? <X size={17} /> : <Search size={17} />}</button> : null}
      <button type="button" className="ux-icon-btn ux-tablet-header-control ux-tablet-layout-button" aria-label="Tablet layout" aria-expanded={layoutMenuOpen} onClick={() => onLayoutMenuOpenChange(!layoutMenuOpen)}><PanelsTopLeft size={17} /></button>
      {isUnitDetail ? (
        <span className="ux-wb-header-points" aria-label={`${props.selectedUnit.points} points`}>
          <b>{props.selectedUnit.points}</b>
          <small>pts</small>
        </span>
      ) : isOverview ? (
        <span className="ux-roster-header-points" aria-label={`${props.roster.pointsUsed} of ${props.roster.pointsLimit} points`}><b>{props.roster.pointsUsed}</b><small>/ {props.roster.pointsLimit}</small></span>
      ) : null}
      {!isUnitDetail && !(isOverview && searchOpen) ? (
        <button type="button" className="ux-icon-btn" aria-label="Export" onClick={() => props.onNavigate("export")}>
          <Download size={18} />
        </button>
      ) : null}
      {isUnitDetail || isOverview ? (
        <span className={`ux-detail-progress ${isOverview ? "ux-overview-progress" : ""}`} role="progressbar" aria-label="Roster points used" aria-valuemin={0} aria-valuemax={props.roster.pointsLimit} aria-valuenow={props.roster.pointsUsed}>
          <i style={{ width: `${progress}%` }} />
        </span>
      ) : null}
      {layoutMenuOpen ? (
        <div className="ux-layout-menu" role="menu" aria-label="Tablet layout options">
          <button type="button" role="menuitemcheckbox" aria-checked={props.tabletPanelLayout.treeVisible} onClick={() => props.onTabletPanelLayoutChange({ ...props.tabletPanelLayout, treeVisible: !props.tabletPanelLayout.treeVisible })}><span>{props.tabletPanelLayout.treeVisible ? <Check size={14} /> : null}</span>Roster panel</button>
          <button type="button" role="menuitemcheckbox" aria-checked={props.tabletPanelLayout.railVisible} onClick={() => props.onTabletPanelLayoutChange({ ...props.tabletPanelLayout, railVisible: !props.tabletPanelLayout.railVisible })}><span>{props.tabletPanelLayout.railVisible ? <Check size={14} /> : null}</span>Validation panel</button>
          <hr />
          <button type="button" role="menuitem" className={focusPane === "tree" ? "active" : ""} onClick={() => { props.onTabletPanelLayoutChange({ ...props.tabletPanelLayout, treeVisible: true }); onFocusPaneChange("tree"); }}><Layers size={14} />Focus roster</button>
          <button type="button" role="menuitem" className={focusPane === "detail" ? "active" : ""} onClick={() => onFocusPaneChange("detail")}><PanelsTopLeft size={14} />Focus details</button>
          <button type="button" role="menuitem" className={focusPane === "rail" ? "active" : ""} onClick={() => { props.onTabletPanelLayoutChange({ ...props.tabletPanelLayout, railVisible: true }); onFocusPaneChange("rail"); }}><ShieldCheck size={14} />Focus validation</button>
          <hr />
          <button type="button" role="menuitem" onClick={() => { props.onTabletPanelLayoutChange({ ...props.tabletPanelLayout, treeVisible: true, railVisible: true }); onFocusPaneChange(null); }}><Minimize2 size={14} />Restore panels</button>
          <button type="button" role="menuitem" onClick={() => { props.onTabletPanelLayoutChange({ treeRatio: 0.3, railRatio: 0.26, treeVisible: true, railVisible: true }); onFocusPaneChange(null); }}><RotateCcw size={14} />Reset widths</button>
        </div>
      ) : null}
    </header>
  );
}

function Tree({ props, query, onQueryChange, searchInNavbar, creationOpen, onCreationOpenChange, onOpenUnitGlance }: { props: ConceptProps; query: string; onQueryChange: (query: string) => void; searchInNavbar: boolean; creationOpen: boolean; onCreationOpenChange: (open: boolean) => void; onOpenUnitGlance: (unit: RosterUnit) => void }) {
  const [renamingUnitId, setRenamingUnitId] = useState<string | null>(null);
  const renamingUnit = flattenUnits(props.roster).find((unit) => unit.id === renamingUnitId);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleForces = props.roster.forces.map((force) => {
    const forceMatches = `${force.customName ?? ""} ${force.name} ${force.detachment}`.toLowerCase().includes(normalizedQuery);
    const sections = force.sections.map((section) => {
      const sectionMatches = section.name.toLowerCase().includes(normalizedQuery);
      const units = !normalizedQuery || forceMatches || sectionMatches
        ? section.units
        : section.units.filter((unit) => `${unit.customName ?? ""} ${unit.name} ${unit.role}`.toLowerCase().includes(normalizedQuery));
      return { section, units, matches: !normalizedQuery || forceMatches || sectionMatches || units.length > 0 };
    }).filter((item) => item.matches);
    return { force, sections, matches: !normalizedQuery || forceMatches || sections.length > 0 };
  }).filter((item) => item.matches);
  return (
    <nav className="ux-wb-tree" aria-label="Roster tree">
      {!searchInNavbar ? <div className="ux-wb-search ux-tree-search">
        <Search size={15} />
        <input placeholder="Filter units" value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} />
      </div> : null}
      <div className="ux-force-list">
        {visibleForces.map(({ force, sections }) => {
          const forceOpen = normalizedQuery ? true : props.expandedForceIds.includes(force.id);
          return (
            <section className={`ux-force-entry ${forceOpen ? "open" : ""} ${props.selectedForceId === force.id ? "selected" : ""}`} key={force.id}>
              <div className="ux-force-summary">
                <button type="button" className="ux-force-summary-main" aria-expanded={forceOpen} onClick={() => props.onToggleForce(force.id)}>
                  <ChevronDown size={15} />
                  <span>
                    <strong>{forceDisplayName(force)}</strong>
                    <small>{force.detachment}</small>
                  </span>
                  <b>{force.points} pts</b>
                </button>
                <ForceActionMenu props={props} forceId={force.id} />
              </div>
              {forceOpen ? (
                <div className="ux-force-sections">
                  {sections.map(({ section, units }) => {
                    const open = normalizedQuery ? true : props.expandedSectionIds.includes(section.id) || section.id === props.selectedSectionId;
                    return (
                      <div className={`ux-tree-branch ${open ? "open" : ""}`} key={section.id}>
                        <button type="button" className="ux-tree-section" onClick={() => props.onSelectSection(section.id)}>
                          <ChevronDown size={14} className="ux-tree-caret" />
                          <strong>{section.name}</strong>
                          <small>{section.required ?? section.units.length}</small>
                        </button>
                        {open ? (
                          <div className="ux-tree-units">
                            {units.map((unit) => <SwipeableUnitRow key={unit.id} unit={unit} active={props.selectedUnit.id === unit.id} onSelect={() => props.onSelectUnit(unit.id)} onOpenGlance={() => onOpenUnitGlance(unit)} onDelete={() => props.onDeleteUnit(unit.id)} onRename={() => setRenamingUnitId(unit.id)} onDuplicate={() => props.onDuplicateUnit(unit.id)} />)}
                            {!normalizedQuery ? <button
                              type="button"
                              className="ux-tree-add"
                              onClick={() => {
                                props.onSelectForce(force.id);
                                props.onSelectSection(section.id);
                                props.onNavigate("add-unit");
                              }}
                            >
                              <Plus size={13} />
                              Add unit
                            </button> : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
      {normalizedQuery && visibleForces.length === 0 ? <div className="ux-empty small"><Search size={18} /><small>No matching units</small></div> : null}
      {!normalizedQuery && (creationOpen && props.forceCreationMode === "inline" ? <InlineForceDraft props={props} onClose={() => onCreationOpenChange(false)} /> : (
        <button type="button" className="ux-force-add" onClick={() => onCreationOpenChange(true)}>
          <Plus size={14} />
          Add force
        </button>
      ))}
      {renamingUnit ? <RenameDialog title="Rename unit" description="A reusable snapshot will be saved to your Library." initialValue={unitDisplayName(renamingUnit)} onClose={() => setRenamingUnitId(null)} onSave={(name) => { props.onRenameUnit(renamingUnit.id, name); setRenamingUnitId(null); }} /> : null}
    </nav>
  );
}

const UNIT_SWIPE_ACTION_WIDTH = 58;
const UNIT_SWIPE_ACTION_GAP = 8;
const UNIT_SWIPE_ACTIONS_WIDTH = (UNIT_SWIPE_ACTION_WIDTH * 3) + (UNIT_SWIPE_ACTION_GAP * 2);
const UNIT_SWIPE_CONTENT_GAP = 10;
const UNIT_SWIPE_REVEAL = UNIT_SWIPE_ACTIONS_WIDTH + UNIT_SWIPE_CONTENT_GAP;

function SwipeableUnitRow({ unit, active, onSelect, onOpenGlance, onDelete, onRename, onDuplicate }: { unit: ConceptProps["selectedUnit"]; active: boolean; onSelect: () => void; onOpenGlance: () => void; onDelete: () => void; onRename: () => void; onDuplicate: () => void }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startOffset = useRef(0);
  const dragged = useRef(false);
  const longPressed = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearLongPress = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };
  const close = () => setOffset(0);
  useEffect(() => clearLongPress, []);
  const settle = () => {
    setDragging(false);
    clearLongPress();
    startX.current = null;
    startY.current = null;
    if (dragged.current) setOffset((current) => current < -(UNIT_SWIPE_REVEAL * 0.28) ? -UNIT_SWIPE_REVEAL : 0);
  };
  return (
    <div className={`ux-swipe-unit ${offset < 0 ? "open" : ""} ${dragging ? "dragging" : ""}`}>
      <div className="ux-swipe-actions" aria-label={`Actions for ${unitDisplayName(unit)}`} aria-hidden={offset === 0}>
        <button type="button" tabIndex={offset < 0 ? 0 : -1} className="delete" onClick={() => { close(); onDelete(); }}><Trash2 size={14} /><span>Delete</span></button>
        <button type="button" tabIndex={offset < 0 ? 0 : -1} onClick={() => { close(); onRename(); }}><Pencil size={14} /><span>Rename</span></button>
        <button type="button" tabIndex={offset < 0 ? 0 : -1} onClick={() => { close(); onDuplicate(); }}><Copy size={14} /><span>Duplicate</span></button>
      </div>
      <button
        type="button"
        className={`ux-tree-unit ux-swipe-unit-content ${unit.status ?? "valid"} ${active ? "active" : ""}`}
        aria-haspopup="dialog"
        title="Long press for unit glance"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={(event) => {
          startX.current = event.clientX;
          startY.current = event.clientY;
          startOffset.current = offset;
          setDragging(false);
          dragged.current = false;
          longPressed.current = false;
          clearLongPress();
          if (offset === 0) longPressTimer.current = window.setTimeout(() => {
            longPressed.current = true;
            onOpenGlance();
          }, 500);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          const deltaY = event.clientY - (startY.current ?? event.clientY);
          const horizontal = Math.abs(delta);
          const vertical = Math.abs(deltaY);
          if (!dragged.current && horizontal > 8 && horizontal > vertical) {
            clearLongPress();
            dragged.current = true;
            setDragging(true);
          }
          if (!dragged.current) {
            if (vertical > 8) clearLongPress();
            return;
          }
          event.preventDefault();
          setOffset(Math.max(-UNIT_SWIPE_REVEAL, Math.min(0, startOffset.current + delta)));
        }}
        onPointerUp={settle}
        onPointerCancel={settle}
        onContextMenu={(event) => { event.preventDefault(); clearLongPress(); longPressed.current = true; onOpenGlance(); }}
        onKeyDown={(event) => { if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); onOpenGlance(); } }}
        onClick={(event) => { if (longPressed.current || dragged.current) { event.preventDefault(); longPressed.current = false; dragged.current = false; return; } if (offset < 0) close(); else onSelect(); }}
      >
        <span className="ux-tree-rail" aria-hidden />
        <span className="ux-tree-unit-main"><span>{unitDisplayName(unit)}</span><small>×{unit.count}</small></span>
        {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={13} /> : <b>{unit.points}</b>}
      </button>
    </div>
  );
}

function PaneDivider({ side, props, layoutRef }: { side: "tree" | "rail"; props: ConceptProps; layoutRef: RefObject<HTMLDivElement | null> }) {
  const layout = props.tabletPanelLayout;
  const visible = side === "tree" ? layout.treeVisible : layout.railVisible;
  const ratio = side === "tree" ? layout.treeRatio : layout.railRatio;
  const updateRatio = (nextRatio: number) => {
    const rect = layoutRef.current?.getBoundingClientRect();
    if (!rect) return;
    const available = Math.max(1, rect.width - 20);
    const minimum = Math.min(0.35, 160 / available);
    const otherRatio = side === "tree" ? (layout.railVisible ? layout.railRatio : 0) : (layout.treeVisible ? layout.treeRatio : 0);
    const maximum = Math.min(0.45, Math.max(minimum, 1 - (220 / available) - otherRatio));
    const clamped = Math.max(minimum, Math.min(maximum, nextRatio));
    props.onTabletPanelLayoutChange({ ...layout, [side === "tree" ? "treeRatio" : "railRatio"]: Number(clamped.toFixed(3)) });
  };
  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!visible || (event.target as HTMLElement).closest("button")) return;
    const rect = layoutRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    const startX = event.clientX;
    const startRatio = ratio;
    const available = Math.max(1, rect.width - 20);
    const onMove = (moveEvent: PointerEvent) => {
      const delta = (moveEvent.clientX - startX) / available;
      updateRatio(startRatio + (side === "tree" ? delta : -delta));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    updateRatio(ratio + (side === "tree" ? direction : -direction) * 0.02);
  };
  const toggle = () => props.onTabletPanelLayoutChange({ ...layout, [side === "tree" ? "treeVisible" : "railVisible"]: !visible });
  return (
    <div className={`ux-pane-divider ${side} ${visible ? "" : "collapsed"}`} role="separator" aria-label={`Resize ${side === "tree" ? "roster" : "validation"} panel`} aria-orientation="vertical" tabIndex={0} onPointerDown={startResize} onKeyDown={onKeyDown} onDoubleClick={() => updateRatio(side === "tree" ? 0.3 : 0.26)}>
      <GripVertical size={12} />
      <button type="button" onClick={toggle} aria-label={`${visible ? "Hide" : "Show"} ${side === "tree" ? "roster" : "validation"} panel`} title={`${visible ? "Hide" : "Show"} panel`}>
        {side === "tree" ? (visible ? <ChevronLeft size={12} /> : <ChevronRight size={12} />) : (visible ? <ChevronRight size={12} /> : <ChevronLeft size={12} />)}
      </button>
    </div>
  );
}

function EdgeHandle({ edge, expanded, onReveal }: { edge: "top" | "bottom"; expanded: boolean; onReveal: () => void }) {
  const startY = useRef<number | null>(null);
  return (
    <button
      type="button"
      className={`ux-${edge === "top" ? "focus-top" : "dock"}-handle ${expanded ? "expanded" : ""}`}
      aria-label={edge === "top" ? "Show tablet navbar" : "Show main navigation"}
      onClick={onReveal}
      onPointerEnter={edge === "bottom" ? onReveal : undefined}
      onPointerDown={(event) => { startY.current = event.clientY; }}
      onPointerUp={(event) => {
        if (startY.current === null) return;
        const delta = event.clientY - startY.current;
        if ((edge === "bottom" && delta < -18) || (edge === "top" && delta > 18)) onReveal();
        startY.current = null;
      }}
    >
      <span aria-hidden />
    </button>
  );
}

function InlineForceDraft({ props, onClose }: { props: ConceptProps; onClose: () => void }) {
  const [catalogueId, setCatalogueId] = useState("");
  const [detachmentId, setDetachmentId] = useState("");
  const submit = () => {
    if (!catalogueId || !detachmentId) return;
    props.onCreateForce(catalogueId, detachmentId);
    onClose();
  };
  return (
    <section className="ux-force-draft" aria-label="New force">
      <header><strong>New force</strong><button type="button" aria-label="Cancel force creation" onClick={onClose}><X size={15} /></button></header>
      {props.detachmentFavorites.length ? <FavoriteCreationSection title="Favorite detachments">{props.detachmentFavorites.map((favorite) => <button type="button" key={favorite.id} onClick={() => { props.onReuseDetachmentFavorite(favorite.id); onClose(); }}><Heart size={14} /><span><strong>{forceDisplayName(favorite.force)}</strong><small>{favorite.force.points} pts</small></span><Plus size={14} /></button>)}</FavoriteCreationSection> : null}
      <label><span>Force</span><select value={catalogueId} onChange={(event) => setCatalogueId(event.currentTarget.value)}><option value="">Choose force</option>{mockCatalogues.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label><span>Organization</span><select value={detachmentId} onChange={(event) => setDetachmentId(event.currentTarget.value)}><option value="">Choose detachment</option>{mockDetachments.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <div className="ux-force-draft-actions"><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary" disabled={!catalogueId || !detachmentId} onClick={submit}>Add force</button></div>
    </section>
  );
}

function ForceSelector({ props, onClose }: { props: ConceptProps; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [catalogueId, setCatalogueId] = useState("");
  const [detachmentId, setDetachmentId] = useState("");
  const catalogues = mockCatalogues.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  const submit = () => {
    if (!catalogueId || !detachmentId) return;
    props.onCreateForce(catalogueId, detachmentId);
    onClose();
  };
  return (
    <div className="ux-force-selector-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ux-force-selector" role="dialog" aria-modal="true" aria-labelledby="force-selector-title">
        <header><span><strong id="force-selector-title">Add force</strong><small>Choose a source and organization</small></span><button type="button" aria-label="Close force selector" onClick={onClose}><X size={18} /></button></header>
        <div className="ux-force-selector-body">
          <label className="ux-loadout-selector-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search forces" autoFocus /></label>
          {props.detachmentFavorites.length ? <FavoriteCreationSection title="Favorite detachments">{props.detachmentFavorites.map((favorite) => <button type="button" key={favorite.id} onClick={() => { props.onReuseDetachmentFavorite(favorite.id); onClose(); }}><Heart size={14} /><span><strong>{forceDisplayName(favorite.force)}</strong><small>{favorite.force.points} pts · configured</small></span><Plus size={14} /></button>)}</FavoriteCreationSection> : null}
          <div className="ux-force-choice-list" aria-label="Available forces">
            {catalogues.length ? catalogues.map((item) => <button type="button" className={catalogueId === item.id ? "selected" : ""} key={item.id} onClick={() => setCatalogueId(item.id)}><span><strong>{item.name}</strong><small>{item.updated} · {item.status}</small></span>{catalogueId === item.id ? <Check size={15} /> : null}</button>) : <div className="ux-loadout-selector-empty"><strong>No matching forces</strong><small>Try another name.</small></div>}
          </div>
          <div className="ux-force-detachments"><strong>Organization</strong>{mockDetachments.map((item) => <button type="button" className={detachmentId === item.id ? "selected" : ""} key={item.id} onClick={() => setDetachmentId(item.id)}><span><b>{item.name}</b><small>{item.slots} · {item.fit}</small></span>{detachmentId === item.id ? <Check size={15} /> : null}</button>)}</div>
        </div>
        <footer><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary" disabled={!catalogueId || !detachmentId} onClick={submit}>Add force</button></footer>
      </section>
    </div>
  );
}

function Detail({ props, scrollRef, onOpenLoadoutSlot, onOpenReference }: { props: ConceptProps; scrollRef: RefObject<HTMLElement | null>; onOpenLoadoutSlot: (groupId: string, slotId: string) => void; onOpenReference: (reference: RosterReferenceDefinition) => void }) {
  if (props.screen === "add-unit") return <AddPane props={props} />;
  const unit = props.selectedUnit;
  return (
    <section className="ux-wb-detail" ref={scrollRef}>
      <div className="ux-keywords">
        {unit.keywords.map((k) => (
          <Chip key={k} tone="cool">
            {k}
          </Chip>
        ))}
      </div>
      {unit.note ? <p className="ux-config-note">{unit.note}</p> : null}
      {props.unitDetailView === "profile" ? <UnitProfile unit={unit} onOpenReference={onOpenReference} /> : unit.detail ? <StructuredOptions props={props} onOpenLoadoutSlot={onOpenLoadoutSlot} /> : <FlatOptions props={props} />}
    </section>
  );
}

function StructuredOptions({ props, onOpenLoadoutSlot }: { props: ConceptProps; onOpenLoadoutSlot: (groupId: string, slotId: string) => void }) {
  const unit = props.selectedUnit;
  const detail = unit.detail;
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(["sergeant-group"]);
  if (!detail) return <FlatOptions props={props} />;
  const totalModels = detail.loadoutGroups.reduce((sum, group) => sum + group.count, 0);

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((current) => current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]);
  };

  return (
    <div className="ux-unit-options">
      <section className="ux-unit-option-section">
        <h4>Model loadouts</h4>
        {detail.loadoutGroups.map((group) => {
          const slotChoices = group.slots.map((slot) => slot.choices.find((choice) => choice.id === slot.selectedChoiceId)).filter(Boolean);
          const groupPoints = group.count * (group.basePointsPerModel + slotChoices.reduce((sum, choice) => sum + (choice?.points ?? 0), 0));
          const groupName = group.count === 1 && group.name.endsWith("ies") ? `${group.name.slice(0, -3)}y` : group.name;
          const expanded = expandedGroupIds.includes(group.id);
          return (
            <article className={`ux-loadout-group ${expanded ? "expanded" : ""}`} key={group.id}>
              <header className="ux-loadout-group-head">
                <button type="button" className="ux-loadout-group-toggle" aria-expanded={expanded} onClick={() => toggleGroup(group.id)}>
                  <span>
                    <strong>{groupName} ×{group.count}</strong>
                    <small>{slotChoices.map((choice) => choice?.name).join(" · ")}</small>
                  </span>
                  <span className="ux-loadout-group-meta">
                    <small>{groupPoints} pts</small>
                    <ChevronDown size={15} />
                  </span>
                </button>
                {group.canSplit ? (
                  <div className="ux-loadout-group-actions">
                    <div className="ux-loadout-count-controls">
                      <button type="button" aria-label={`Decrease ${groupName} count`} disabled={group.count <= 1} onClick={() => props.onLoadoutGroupCountChange(unit.id, group.id, -1)}><Minus size={13} /></button>
                      <strong aria-label={`${group.count} models`}>{group.count}</strong>
                      <button type="button" aria-label={`Increase ${groupName} count`} disabled={totalModels >= (unit.maxCount ?? Number.POSITIVE_INFINITY)} onClick={() => props.onLoadoutGroupCountChange(unit.id, group.id, 1)}><Plus size={13} /></button>
                    </div>
                    <button type="button" className="ux-loadout-split" aria-label={`Split one ${groupName}`} title="Split one model into a new group" disabled={group.count <= 1} onClick={() => props.onSplitLoadoutGroup(unit.id, group.id)}>
                      <Split size={14} />
                    </button>
                  </div>
                ) : null}
              </header>
              {expanded ? <div className="ux-loadout-slots">
                {group.slots.map((slot) => {
                  const choice = slot.choices.find((item) => item.id === slot.selectedChoiceId);
                  if (!choice) return null;
                  return (
                    <button type="button" className="ux-loadout-slot" key={slot.id} onClick={() => onOpenLoadoutSlot(group.id, slot.id)}>
                      <small>{slot.label}</small>
                      <strong>{choice.name}</strong>
                      <em>{choice.points ? `+${choice.points} pts` : "Included"}</em>
                      <ChevronRight size={15} />
                    </button>
                  );
                })}
              </div> : null}
            </article>
          );
        })}
      </section>

      {detail.choiceGroups.map((group) => (
        <section className="ux-unit-option-section" key={group.id}>
          <div className="ux-option-section-title">
            <h4>{group.title}</h4>
            <small>{group.optionIds.filter((optionId) => unit.options.find((option) => option.id === optionId)?.selected).length}/{group.optionIds.length} selections</small>
          </div>
          {group.optionIds.map((optionId) => {
            const option = unit.options.find((item) => item.id === optionId);
            return option ? <OptionButton key={option.id} option={option} onToggle={props.onToggleOption} /> : null;
          })}
        </section>
      ))}

      <section className="ux-unit-option-section">
        <h4>Rules & equipment</h4>
        {detail.standaloneOptionIds.map((optionId) => {
          const option = unit.options.find((item) => item.id === optionId);
          return option ? <OptionButton key={option.id} option={option} onToggle={props.onToggleOption} /> : null;
        })}
      </section>
    </div>
  );
}

function LoadoutSelector({ props, target, onClose }: { props: ConceptProps; target: { groupId: string; slotId: string }; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const group = props.selectedUnit.detail?.loadoutGroups.find((item) => item.id === target.groupId);
  const slot = group?.slots.find((item) => item.id === target.slotId);
  const choices = slot?.choices.filter((choice) => choice.name.toLowerCase().includes(query.trim().toLowerCase())) ?? [];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!group || !slot) return null;
  const groupName = group.count === 1 && group.name.endsWith("ies") ? `${group.name.slice(0, -3)}y` : group.name;
  return (
    <div className="ux-loadout-selector-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ux-loadout-selector" role="dialog" aria-modal="true" aria-labelledby="loadout-selector-title">
        <header>
          <span>
            <strong id="loadout-selector-title">Choose {slot.label.toLowerCase()}</strong>
            <small>{groupName} ×{group.count}</small>
          </span>
          <button type="button" aria-label="Close selector" onClick={onClose}><X size={18} /></button>
        </header>
        <label className="ux-loadout-selector-search">
          <Search size={15} />
          <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={`Search ${slot.label.toLowerCase()} choices`} autoFocus />
        </label>
        <div className="ux-loadout-choice-list">
          {choices.length ? choices.map((choice) => {
            const selected = choice.id === slot.selectedChoiceId;
            return (
              <button type="button" className={`ux-loadout-choice ${selected ? "selected" : ""}`} key={choice.id} onClick={() => {
                props.onSelectLoadoutChoice(props.selectedUnit.id, group.id, slot.id, choice.id);
                onClose();
              }}>
                <span>
                  <strong>{choice.name}</strong>
                  <small>{choice.points ? `+${choice.points} pts per model` : "Included"}</small>
                </span>
                <span className="ux-loadout-choice-check" aria-hidden>{selected ? <Check size={15} /> : null}</span>
              </button>
            );
          }) : (
            <div className="ux-loadout-selector-empty">
              <Search size={18} />
              <strong>No matching choices</strong>
              <small>Try a different weapon name.</small>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FlatOptions({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
  return (
    <div className="ux-opt-groups">
      {(["weapon", "upgrade", "rule"] as const).map((group) => {
        const options = unit.options.filter((option) => option.group === group);
        if (!options.length) return null;
        return (
          <section className="ux-opt-group" key={group}>
            <h4>{group === "weapon" ? "Wargear" : group === "upgrade" ? "Upgrades" : "Special rules"}</h4>
            {options.map((option) => <OptionButton key={option.id} option={option} onToggle={props.onToggleOption} />)}
          </section>
        );
      })}
    </div>
  );
}

function OptionButton({ option, onToggle }: { option: ConceptProps["selectedUnit"]["options"][number]; onToggle: (id: string) => void }) {
  return (
    <button type="button" className={`ux-opt-row ${option.selected ? "on" : ""}`} onClick={() => onToggle(option.id)}>
      <span className="ux-opt-check" aria-hidden />
      <span>{option.name}</span>
      <em>{priceLabel(option.points)}</em>
    </button>
  );
}

function UnitProfile({ unit, onOpenReference, glance = false }: { unit: RosterUnit; onOpenReference: (reference: RosterReferenceDefinition) => void; glance?: boolean }) {
  const detail = unit.detail;
  if (!detail) {
    return (
      <div className="ux-empty small">
        <BookOpen size={18} />
        <strong>Profile unavailable</strong>
        <small>This unit only has configuration data in the draft.</small>
      </div>
    );
  }

  const modelTable = detail.profileTables.find((table) => table.id === "model-profile");
  const weaponTables = detail.profileTables.filter((table) => table.id !== "model-profile").map((table) => {
    const aggregated = new Map<string, { name: string; count: number; values: string[] }>();
    detail.loadoutGroups.forEach((group) => {
      group.slots.filter((slot) => slot.profileTableId === table.id).forEach((slot) => {
        const choice = slot.choices.find((item) => item.id === slot.selectedChoiceId);
        if (!choice) return;
        const current = aggregated.get(choice.id);
        aggregated.set(choice.id, { name: choice.name, count: (current?.count ?? 0) + group.count, values: choice.profileValues });
      });
    });
    return {
      ...table,
      rows: Array.from(aggregated.entries()).map(([id, entry]) => ({ id: `${table.id}-${id}`, name: `${entry.name} (x${entry.count})`, values: entry.values })),
    };
  });
  return (
    <div className={`ux-unit-profile ${glance ? "in-glance" : ""}`}>
      <ProfileSection title="Models" open>
        <div className="ux-profile-models">
          {detail.loadoutGroups.map((group) => {
            const summary = group.slots.map((slot) => slot.choices.find((choice) => choice.id === slot.selectedChoiceId)?.name).filter(Boolean).join(", ");
            const groupName = group.count === 1 && group.name.endsWith("ies") ? `${group.name.slice(0, -3)}y` : group.name;
            return (
              <div className="ux-profile-model" key={group.id}>
                <b>{group.count}x</b>
                <span>
                  <strong>{groupName}</strong>
                  <small>{summary}</small>
                </span>
              </div>
            );
          })}
        </div>
      </ProfileSection>

      {modelTable ? (
        <ProfileSection title="Profile" open>
          <ProfileTable table={modelTable} unitCount={unit.count} onOpenReference={onOpenReference} fitToWidth={glance} />
        </ProfileSection>
      ) : null}

      <ProfileSection title="Traits" open={glance}>
        <div className="ux-profile-tag-list">{detail.traits.map((trait) => <ReferenceTag key={trait} label={trait} onOpen={onOpenReference} />)}</div>
      </ProfileSection>

      {weaponTables.map((table) => (
        <ProfileSection title={table.title} key={table.id} open={glance}>
          <ProfileTable table={table} unitCount={unit.count} onOpenReference={onOpenReference} fitToWidth={glance} />
        </ProfileSection>
      ))}

      <ProfileSection title="Wargear" open={glance}>
        <div className="ux-profile-copy-list">
          {detail.wargear.map((item) => (
            <article key={item.id}>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="Rules" open={glance}>
        <div className="ux-profile-tag-list">{detail.rules.map((rule) => <ReferenceTag key={rule} label={rule} onOpen={onOpenReference} />)}</div>
      </ProfileSection>

      <ProfileSection title="Categories" open={glance}>
        <div className="ux-profile-tag-list">{detail.categories.map((category) => <ReferenceTag key={category} label={category} onOpen={onOpenReference} />)}</div>
      </ProfileSection>
    </div>
  );
}

function ProfileSection({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="ux-profile-section" open={open}>
      <summary>
        <strong>{title}</strong>
        <ChevronDown size={15} />
      </summary>
      <div className="ux-profile-section-body">{children}</div>
    </details>
  );
}

function ProfileTable({ table, unitCount, onOpenReference, fitToWidth = false }: { table: NonNullable<ConceptProps["selectedUnit"]["detail"]>["profileTables"][number]; unitCount: number; onOpenReference: (reference: RosterReferenceDefinition) => void; fitToWidth?: boolean }) {
  const rowName = (row: typeof table.rows[number]) => row.id === "assault-legionary" ? `Assault Legionary (x${unitCount - 1})` : row.name.replace("(x10)", `(x${unitCount})`);
  const tableElement = (
    <table className="ux-profile-table">
        <thead>
          <tr>
            {table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}
          </tr>
        </thead>
        {table.rows.map((row) => (
          <tbody className="ux-profile-row-group" key={row.id}>
            <tr className="ux-profile-row-name">
              <th scope="rowgroup" colSpan={table.columns.length}>
                <strong>{rowName(row)}</strong>
                {row.tags ? <small className="ux-profile-row-tags">{row.tags.map((tag) => <ReferenceTag key={tag} label={tag} onOpen={onOpenReference} compact />)}</small> : null}
              </th>
            </tr>
            <tr className="ux-profile-row-stats">
              {row.values.map((value, index) => <td key={`${row.id}-${table.columns[index]}`}><ProfileTableValue value={value} column={table.columns[index]} onOpenReference={onOpenReference} /></td>)}
            </tr>
          </tbody>
        ))}
    </table>
  );
  return fitToWidth ? <FitWidthTable>{tableElement}</FitWidthTable> : <div className="ux-profile-table-scroll">{tableElement}</div>;
}

function ReferenceTag({ label, onOpen, compact = false }: { label: string; onOpen: (reference: RosterReferenceDefinition) => void; compact?: boolean }) {
  const reference = resolveRosterReference(label);
  if (!reference) return <span className={compact ? "ux-reference-tag compact inert" : "ux-reference-tag inert"}>{label}</span>;
  return <button type="button" className={compact ? "ux-reference-tag compact" : "ux-reference-tag"} onClick={() => onOpen(reference)}>{label}</button>;
}

function ProfileTableValue({ value, column, onOpenReference }: { value: string; column: string; onOpenReference: (reference: RosterReferenceDefinition) => void }) {
  if (!/rules|traits/i.test(column)) return <>{value}</>;
  const tokens = value.split(",").map((token) => token.trim()).filter(Boolean);
  if (!tokens.some((token) => resolveRosterReference(token))) return <>{value}</>;
  return <span className="ux-profile-table-tags">{tokens.map((token) => <ReferenceTag key={token} label={token} onOpen={onOpenReference} compact />)}</span>;
}

function FitWidthTable({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ scale: 1, height: 0 });
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const naturalWidth = inner.scrollWidth;
      const scale = naturalWidth ? Math.min(1, outer.clientWidth / naturalWidth) : 1;
      setMetrics({ scale, height: inner.scrollHeight * scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [children]);
  return <div className="ux-fit-table" ref={outerRef} style={{ height: metrics.height || undefined }}><div className="ux-fit-table-inner" ref={innerRef} style={{ transform: `scale(${metrics.scale})` }}>{children}</div></div>;
}

function ReferenceGlanceStack({ glances, onOpenReference, onCloseTop, onCloseAll }: { glances: ReferenceGlance[]; onOpenReference: (reference: RosterReferenceDefinition) => void; onCloseTop: () => void; onCloseAll: () => void }) {
  const topCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    topCloseRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseTop();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [glances.length, onCloseTop]);
  return (
    <div className={`ux-reference-glance-layer ${glances.length === 2 ? "has-second" : ""}`}>
      <button type="button" className="ux-reference-glance-backdrop" aria-label="Close reference glance" onClick={onCloseAll} />
      <div className="ux-reference-glance-stack">
        {glances.map((glance, index) => {
          const active = index === glances.length - 1;
          const title = glance.type === "unit" ? unitDisplayName(glance.unit) : glance.reference.label;
          return (
            <section className={`ux-reference-glance-card ${glance.type} ${active ? "active" : "under"}`} role={active ? "dialog" : undefined} aria-modal={active ? "true" : undefined} aria-hidden={active ? undefined : true} aria-labelledby={`reference-glance-title-${index}`} key={`${glance.type}-${glance.type === "unit" ? glance.unit.id : glance.reference.id}`}>
              <header>
                <span>
                  <small>{glance.type === "unit" ? "Unit profile" : glance.reference.kind}</small>
                  <strong id={`reference-glance-title-${index}`}>{title}</strong>
                </span>
                <button type="button" ref={active ? topCloseRef : undefined} aria-label={`Close ${title} glance`} onClick={active ? onCloseTop : onCloseAll}><X size={18} /></button>
              </header>
              <div className="ux-reference-glance-body">
                {glance.type === "unit" ? (
                  glance.unit.detail ? <UnitProfile unit={glance.unit} onOpenReference={onOpenReference} glance /> : <div className="ux-reference-empty"><BookOpen size={20} /><strong>Profile unavailable</strong><small>This unit has no reference data in the prototype.</small></div>
                ) : (
                  <ReferenceDefinition reference={glance.reference} onOpenReference={onOpenReference} />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ReferenceDefinition({ reference, onOpenReference }: { reference: RosterReferenceDefinition; onOpenReference: (reference: RosterReferenceDefinition) => void }) {
  const related = (reference.relatedIds ?? []).map(referenceById).filter((item): item is RosterReferenceDefinition => Boolean(item));
  return (
    <article className="ux-reference-definition">
      <section>
        <strong>Description</strong>
        <p>{reference.description}</p>
      </section>
      {related.length ? <section><strong>Related</strong><div className="ux-profile-tag-list">{related.map((item) => <ReferenceTag key={item.id} label={item.label} onOpen={onOpenReference} />)}</div></section> : null}
    </article>
  );
}

function AddPane({ props }: { props: ConceptProps }) {
  const pool = flattenUnits(props.roster).filter((u) => u.sectionId === props.selectedSectionId);
  const smart = props.smartSearch ?? false;
  const section = props.selectedSection.name;
  const suggestions = [`legal ${section.toLowerCase()} under 120`, "fills this slot", "best value pick"];
  return (
    <section className="ux-wb-detail">
      <button type="button" className="ux-wb-back" onClick={props.onBack}>
        <ArrowLeft size={14} />
        Back to roster
      </button>
      <div className="ux-wb-detail-head">
        <span>
          <small>Add to</small>
          <strong>{section}</strong>
        </span>
        <PanelsTopLeft size={20} />
      </div>
      <div className={`ux-wb-search ${smart ? "smart" : ""}`}>
        {smart ? <Command size={15} /> : <Search size={15} />}
        <input placeholder={smart ? `Add a legal ${section} unit or ask…` : `Search ${section}`} readOnly />
      </div>
      {smart ? (
        <div className="ux-suggest">
          <Sparkles size={14} />
          <div className="ux-suggest-chips">
            {suggestions.map((s) => (
              <button key={s} type="button" className="ux-suggest-chip">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {props.unitFavorites.length ? <FavoriteCreationSection title="Favorite units">{props.unitFavorites.map((favorite) => {
        const compatible = favorite.sourceSectionName === section;
        return <button type="button" key={favorite.id} disabled={!compatible} title={compatible ? undefined : `Requires a ${favorite.sourceSectionName} section`} onClick={() => { props.onReuseUnitFavorite(favorite.id, props.selectedSectionId); props.onNavigate("unit-detail"); }}><Heart size={14} /><span><strong>{unitDisplayName(favorite.unit)}</strong><small>{compatible ? `${favorite.unit.points} pts · configured` : `Requires ${favorite.sourceSectionName}`}</small></span><Plus size={14} /></button>;
      })}</FavoriteCreationSection> : null}
      <div className="ux-pool">
        {(pool.length ? pool : flattenUnits(props.roster)).map((unit) => (
          <button key={unit.id} type="button" className="ux-pool-row" onClick={() => props.onSelectUnit(unit.id)}>
            <span>
              <strong>{unitDisplayName(unit)}</strong>
              <small>{unit.role}</small>
            </span>
            <span className="ux-pool-meta">
              <b>{unit.points} pts</b>
              <Chip tone={unit.availability === "available" ? "valid" : unit.availability === "limited" ? "warning" : "error"}>{unit.availability}</Chip>
            </span>
            <Plus size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}

function Rail({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster);
  return (
    <aside className="ux-wb-rail">
      <div className="ux-wb-rail-head">
        <AlertTriangle size={15} />
        <strong>Validation</strong>
        <span className="ux-wb-rail-count">{checks.length}</span>
      </div>
      {checks.length === 0 ? (
        <div className="ux-empty small">
          <StatusGlyph status="valid" size={18} />
          <small>Roster is legal</small>
        </div>
      ) : (
        checks.map((unit) => (
          <button key={unit.id} type="button" className={`ux-rail-item ${unit.status}`} onClick={() => props.onSelectUnit(unit.id)}>
            <StatusGlyph status={unit.status} size={15} />
            <span>
              <strong>{unitDisplayName(unit)}</strong>
              <small>{unit.note ?? unit.slotImpact}</small>
            </span>
          </button>
        ))
      )}
      <div className="ux-wb-rail-foot">
        <span>{flattenUnits(props.roster).length} units</span>
        <span>{countSections(props.roster)} slots</span>
      </div>
    </aside>
  );
}

/** Library / home entry screen ("Main screen"). */
function Library({ props }: { props: ConceptProps }) {
  const recents = [
    { name: props.roster.name, sub: props.roster.faction, pts: `${props.roster.pointsUsed}/${props.roster.pointsLimit}` },
    { name: "Incursion Test List", sub: "Saved roster", pts: "500/1000" },
    { name: "Narrative Boarding Patrol", sub: "Saved roster", pts: "490/500" },
  ];
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title">
          <strong>Roster Builder</strong>
          <small>{props.roster.system}</small>
        </div>
        <AppAvatarButton props={props} />
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-cmd-hero">
          <Wand2 size={20} />
          <h2>What do you want to build?</h2>
          <p>Open a recent list or start fresh. Tap a roster to drop into the workbench.</p>
        </div>
        <button type="button" className="ux-new-roster" onClick={() => props.onNavigate("system")}>
          <Plus size={22} />
          <span>
            <strong>New roster</strong>
            <small>Pick a system and faction</small>
          </span>
        </button>
        <div className="ux-result-label">Recent</div>
        {recents.map((r) => (
          <button key={r.name} type="button" className="ux-list-card" onClick={() => props.onNavigate("overview")}>
            <span>
              <strong>{r.name}</strong>
              <small>{r.sub}</small>
            </span>
            <b>{r.pts}</b>
          </button>
        ))}
      </div>
    </>
  );
}

/** Roster creation flow ("Roster creation"). */
function CreateScreen({ props }: { props: ConceptProps }) {
  const systems = [
    {
      name: "Warhammer 40,000",
      sub: "Matched play · Incursion to Onslaught",
      groups: [
        { label: "Imperium", forces: ["Adeptus Astartes", "Astra Militarum", "Adepta Sororitas", "Adeptus Custodes"] },
        { label: "Xenos", forces: ["Aeldari", "Necrons", "T'au Empire", "Tyranids"] },
        { label: "Chaos", forces: ["Chaos Space Marines", "Death Guard", "World Eaters", "Thousand Sons"] },
      ],
    },
    {
      name: "Horus Heresy",
      sub: "Age of Darkness · Crusade armies",
      groups: [
        { label: "Legiones Astartes", forces: ["Dark Angels", "Sons of Horus", "Imperial Fists", "Emperor's Children"] },
        { label: "Auxilia", forces: ["Solar Auxilia", "Mechanicum", "Talons of the Emperor"] },
      ],
    },
    {
      name: "Age of Sigmar",
      sub: "Battlepack · Spearhead to Battlehost",
      groups: [
        { label: "Grand Alliances", forces: ["Stormcast Eternals", "Soulblight Gravelords", "Orruk Warclans", "Seraphon"] },
        { label: "Chaos", forces: ["Slaves to Darkness", "Disciples of Tzeentch", "Blades of Khorne"] },
      ],
    },
  ];
  const points = ["1000", "2000", "3000"];
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<string | null>(null);
  const [customPoints, setCustomPoints] = useState("1500");
  const [selectedForce, setSelectedForce] = useState<string | null>(null);
  const [forceOpen, setForceOpen] = useState(false);
  const system = systems.find((item) => item.name === selectedSystem);
  const resolvedPoints = selectedPoints === "custom" ? customPoints : selectedPoints;
  const hasPoints = Boolean(resolvedPoints && Number(resolvedPoints) > 0);

  function chooseSystem(name: string) {
    setSelectedSystem(name);
    setSelectedPoints(null);
    setSelectedForce(null);
    setForceOpen(false);
  }

  function choosePoints(value: string) {
    setSelectedPoints(value);
    setSelectedForce(null);
    setForceOpen(false);
  }

  return (
    <>
      <header className="ux-wb-top ux-wb-home-top reversed">
        <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="ux-wb-title">
          <strong>New roster</strong>
          <small>Pick system, faction & size</small>
        </div>
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-start-group">
          <h4>Game system</h4>
          {systems.map(({ name, sub }) => (
            <button key={name} type="button" className={`ux-start-row ${selectedSystem === name ? "on" : ""}`} onClick={() => chooseSystem(name)}>
              <span>
                <strong>{name}</strong>
                <small>{sub}</small>
              </span>
              {selectedSystem === name ? <Check size={18} /> : null}
            </button>
          ))}
        </div>

        {selectedSystem ? (
          <div className="ux-start-group ux-start-step">
            <h4>Points limit</h4>
            <div className="ux-filter-row">
              {points.map((value) => (
                <button key={value} type="button" className={`ux-filter-pill ${selectedPoints === value ? "on" : ""}`} onClick={() => choosePoints(value)}>
                  {value} pts
                </button>
              ))}
              <button type="button" className={`ux-filter-pill ${selectedPoints === "custom" ? "on" : ""}`} onClick={() => choosePoints("custom")}>
                Custom
              </button>
            </div>
            {selectedPoints === "custom" ? (
              <label className="ux-custom-points">
                <input
                  value={customPoints}
                  inputMode="numeric"
                  aria-label="Custom points limit"
                  onChange={(event) => {
                    setCustomPoints(event.currentTarget.value.replace(/\D/g, "").slice(0, 5));
                    setSelectedForce(null);
                    setForceOpen(false);
                  }}
                />
                <span>pts</span>
              </label>
            ) : null}
          </div>
        ) : null}

        {system && hasPoints ? (
          <div className="ux-start-group ux-start-step">
            <h4>Force</h4>
            <div className="ux-select-field-wrap">
              <button type="button" className={`ux-select-field ${forceOpen ? "open" : ""}`} onClick={() => setForceOpen((value) => !value)}>
                <span>
                  <strong>{selectedForce ?? "Select force"}</strong>
                  <small>{selectedForce ? `${selectedSystem} · ${resolvedPoints} pts` : "Choose from available armies"}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              {forceOpen ? (
                <div className="ux-select-popover">
                  <div className="ux-wb-search">
                    <Search size={15} />
                    <input placeholder="Search forces" readOnly />
                  </div>
                  {system.groups.map((group, index) => (
                    <details key={group.label} className="ux-force-group" open={index === 0}>
                      <summary>
                        <span>{group.label}</span>
                        <ChevronDown size={14} />
                      </summary>
                      <div>
                        {group.forces.map((force) => (
                          <button
                            key={force}
                            type="button"
                            className={`ux-force-option ${selectedForce === force ? "on" : ""}`}
                            onClick={() => {
                              setSelectedForce(force);
                              setForceOpen(false);
                            }}
                          >
                            <span>{force}</span>
                            {selectedForce === force ? <Check size={15} /> : null}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <button type="button" className="ux-primary" disabled={!selectedSystem || !hasPoints || !selectedForce} onClick={() => props.onNavigate("overview")}>
          <Plus size={16} />
          Create roster
        </button>
      </div>
    </>
  );
}

type SmartScope = "roster" | "system" | "favorites";
type SmartMode = "find" | "fill";

/**
 * Smart search — a wizard-driven, gated companion to the roster edition screen.
 * Reuses the roster chrome (search pinned top) and layers cross-scope search,
 * auto-add, cost filtering, and a cost-filler mode that surfaces buyable upgrades.
 */
function SmartSearchScreen({ props }: { props: ConceptProps }) {
  const remaining = Math.max(0, props.roster.pointsLimit - props.roster.pointsUsed);
  const [scopes, setScopes] = useState<Record<SmartScope, boolean>>({ roster: true, system: true, favorites: false });
  const [mode, setMode] = useState<SmartMode>("find");
  const [query, setQuery] = useState("");
  const [costCap, setCostCap] = useState<number | null>(null);
  const [autoAdd, setAutoAdd] = useState(true);

  const normalized = query.trim().toLowerCase();
  const cap = costCap ?? Number.POSITIVE_INFINITY;
  const matches = (text: string) => text.toLowerCase().includes(normalized);

  const rosterResults = flattenUnits(props.roster).map((unit) => ({ id: unit.id, name: unitDisplayName(unit), role: unit.role, points: unit.points, sub: unit.sectionName }));
  const favoriteResults = props.unitFavorites.map((favorite) => ({ id: favorite.id, name: unitDisplayName(favorite.unit), role: favorite.unit.role, points: favorite.unit.points, sub: favorite.sourceSectionName }));
  const systemResults = mockSystemUnits.map((entry) => ({ id: entry.id, name: entry.name, role: entry.role, points: entry.points, sub: entry.source }));
  const selectedScopes = (Object.keys(scopes) as SmartScope[]).filter((item) => scopes[item]);
  const resultGroups: Record<SmartScope, Array<{ id: string; name: string; role: string; points: number; sub: string }>> = {
    roster: rosterResults,
    system: systemResults,
    favorites: favoriteResults,
  };
  const results = selectedScopes
    .flatMap((source) => resultGroups[source].map((item) => ({ ...item, source })))
    .filter((item) => item.points <= cap && matches(`${item.name} ${item.role}`));

  const fillResults = flattenUnits(props.roster)
    .flatMap((unit) => unit.options
      .filter((option) => !option.selected && option.points > 0)
      .map((option) => ({ unitId: unit.id, unitName: unitDisplayName(unit), optionId: option.id, optionName: option.name, points: option.points, sub: unit.sectionName })))
    .filter((item) => item.points <= cap && matches(`${item.optionName} ${item.unitName}`))
    .sort((a, b) => a.points - b.points);

  const costPills: Array<{ label: string; value: number | null }> = [
    { label: "Any cost", value: null },
    { label: "≤ 25", value: 25 },
    { label: "≤ 50", value: 50 },
    { label: "≤ 100", value: 100 },
    { label: `Fits ${remaining}`, value: remaining },
  ];

  const toggleScope = (scope: SmartScope) => {
    setScopes((value) => ({ ...value, [scope]: !value[scope] }));
  };

  const addFromScope = (source: SmartScope, id: string) => {
    if (source === "roster") {
      autoAdd ? props.onDuplicateUnit(id) : props.onSelectUnit(id);
      return;
    }
    if (source === "favorites") {
      const favorite = props.unitFavorites.find((item) => item.id === id);
      const destination = favorite
        ? flattenUnits(props.roster).find((unit) => unit.sectionName === favorite.sourceSectionName)?.sectionId
        : undefined;
      if (favorite && destination) {
        props.onReuseUnitFavorite(favorite.id, destination);
        props.onNavigate("overview");
      }
      return;
    }
    props.onNavigate("add-unit");
  };

  return (
    <>
      <header className="ux-wb-top workspace-header ux-smart-search-top">
        <button type="button" className="ux-icon-btn" aria-label="Back to roster" onClick={props.onBack}>
          <ArrowLeft size={18} />
        </button>
        <label className="ux-navbar-search ux-smart-search-input">
          <Wand2 size={15} />
          <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search units, upgrades, or ask…" autoFocus />
        </label>
        <span className="ux-smart-progress" role="progressbar" aria-label="Roster points used" aria-valuemin={0} aria-valuemax={props.roster.pointsLimit} aria-valuenow={props.roster.pointsUsed}>
          <i style={{ width: `${Math.min(100, Math.round((props.roster.pointsUsed / props.roster.pointsLimit) * 100))}%` }} />
        </span>
      </header>
      <div className="ux-smart-search-body">
        <div className="ux-smart-search-budget">
          <div className="ux-smart-budget-readout">
            <strong>{props.roster.pointsUsed}<small> / {props.roster.pointsLimit}</small></strong>
            <em>{remaining} pts open</em>
          </div>
        </div>

        <div className="ux-smart-segment" role="tablist" aria-label="Smart search mode">
          <button type="button" role="tab" aria-selected={mode === "find"} className={mode === "find" ? "on" : ""} onClick={() => setMode("find")}>
            <Search size={14} />Find units
          </button>
          <button type="button" role="tab" aria-selected={mode === "fill"} className={mode === "fill" ? "on" : ""} onClick={() => setMode("fill")}>
            <Coins size={14} />Fill points
          </button>
        </div>

        {mode === "find" ? (
          <>
            <div className="ux-smart-scope" aria-label="Search sources">
              <button type="button" role="checkbox" aria-checked={scopes.roster} className={`ux-smart-scope-pill ${scopes.roster ? "on" : ""}`} onClick={() => toggleScope("roster")}><Layers size={14} />Roster</button>
              <button type="button" role="checkbox" aria-checked={scopes.system} className={`ux-smart-scope-pill ${scopes.system ? "on" : ""}`} onClick={() => toggleScope("system")}><LibraryBig size={14} />Library</button>
              <button type="button" role="checkbox" aria-checked={scopes.favorites} className={`ux-smart-scope-pill ${scopes.favorites ? "on" : ""}`} onClick={() => toggleScope("favorites")}><Heart size={14} />Favorites</button>
            </div>
            <p className="ux-smart-scope-hint">
              Searching {selectedScopes.length ? selectedScopes.map((item) => item === "system" ? "library" : item).join(", ") : "no sources"}.
            </p>
          </>
        ) : (
          <p className="ux-smart-scope-hint"><Coins size={13} /> Buyable upgrades across the roster that fit the selected cost.</p>
        )}

        <div className="ux-smart-cost-filter">
          <span className="ux-smart-cost-label">Cost</span>
          <div className="ux-smart-cost-pills">
            {costPills.map((pill) => (
              <button key={pill.label} type="button" className={`ux-filter-pill ${costCap === pill.value ? "on" : ""}`} onClick={() => setCostCap(pill.value)}>
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "find" ? (
          <button type="button" className={`ux-smart-autoadd ${autoAdd ? "on" : ""}`} onClick={() => setAutoAdd((value) => !value)} role="switch" aria-checked={autoAdd}>
            <span className="ux-smart-autoadd-dot" aria-hidden>{autoAdd ? <Check size={11} /> : null}</span>
            Auto-add to roster
          </button>
        ) : null}

        {mode === "find" ? (
          results.length ? (
            <div className="ux-pool ux-smart-results">
              {results.map((item) => (
                <div key={`${item.source}-${item.id}`} className="ux-pool-row ux-smart-result">
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.role} · {item.sub}</small>
                  </span>
                  <span className="ux-pool-meta"><b>{item.points} pts</b></span>
                  <button type="button" className="ux-smart-add" aria-label={`Add ${item.name}`} onClick={() => addFromScope(item.source, item.id)}>
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="ux-empty small"><Search size={18} /><strong>No matching units</strong><small>Try another scope or raise the cost cap.</small></div>
          )
        ) : fillResults.length ? (
          <div className="ux-pool ux-smart-results">
            {fillResults.map((item) => (
              <button key={`${item.unitId}-${item.optionId}`} type="button" className="ux-pool-row ux-smart-fill-row" onClick={() => props.onSelectUnit(item.unitId)}>
                <span>
                  <strong>{item.optionName}</strong>
                  <small>{item.unitName} · {item.sub}</small>
                </span>
                <span className="ux-pool-meta"><b>+{item.points} pts</b></span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        ) : (
          <div className="ux-empty small"><Coins size={18} /><strong>Nothing fits the budget</strong><small>Raise the cost cap to see more upgrades.</small></div>
        )}
      </div>
    </>
  );
}

/** Quick source lookup for units, rules, wargear, and keywords. */
function LookupScreen({ props }: { props: ConceptProps }) {
  const units = flattenUnits(props.roster).slice(0, 4);
  const rules = [
    { name: "Oath of Moment", sub: "Army rule", tag: "Core" },
    { name: "Deep Strike", sub: "Deployment ability", tag: "Keyword" },
    { name: "Invulnerable Save", sub: "Defensive rule", tag: "Rule" },
  ];
  const wargear = flattenUnits(props.roster)
    .flatMap((unit) => unit.options.filter((option) => option.group !== "rule").map((option) => ({ ...option, unit: unit.name })))
    .slice(0, 3);

  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title">
          <strong>Lookup</strong>
          <small>Sources, units & rules</small>
        </div>
        <AppAvatarButton props={props} />
      </header>
      <div className="ux-wb-home-body">
        <div className={`ux-wb-search ${props.smartSearch ? "smart" : ""}`}>
          {props.smartSearch ? <Command size={15} /> : <Search size={15} />}
          <input placeholder="Search Assault Squad, Deep Strike, plasma..." readOnly />
        </div>
        <div className="ux-source-filters">
          {["All sources", props.roster.system, props.roster.faction, "Core rules"].map((filter, index) => (
            <button key={filter} type="button" className={`ux-filter-pill ${index === 0 ? "on" : ""}`}>
              {filter}
            </button>
          ))}
        </div>
        <LookupGroup title="Units" icon={<BookOpen size={15} />}>
          {units.map((unit) => (
            <button key={unit.id} type="button" className="ux-lookup-row" onClick={() => props.onSelectUnit(unit.id)}>
              <span>
                <strong>{unitDisplayName(unit)}</strong>
                <small>{unit.sectionName} · {unit.role}</small>
              </span>
              <b>{unit.points} pts</b>
            </button>
          ))}
        </LookupGroup>
        <LookupGroup title="Rules" icon={<ClipboardList size={15} />}>
          {rules.map((rule) => (
            <button key={rule.name} type="button" className="ux-lookup-row">
              <span>
                <strong>{rule.name}</strong>
                <small>{rule.sub}</small>
              </span>
              <Chip tone="cool">{rule.tag}</Chip>
            </button>
          ))}
        </LookupGroup>
        <LookupGroup title="Wargear" icon={<Hammer size={15} />}>
          {wargear.map((item) => (
            <button key={`${item.unit}-${item.id}`} type="button" className="ux-lookup-row">
              <span>
                <strong>{item.name}</strong>
                <small>{item.unit}</small>
              </span>
              <b>{priceLabel(item.points)}</b>
            </button>
          ))}
        </LookupGroup>
      </div>
    </>
  );
}

function LookupGroup({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="ux-lookup-group">
      <div className="ux-lookup-title">
        {icon}
        <strong>{title}</strong>
      </div>
      {children}
    </section>
  );
}

/** Utility hub for roster-building extras. */
function ToolsScreen({ props }: { props: ConceptProps }) {
  const tools = [
    { icon: <BarChart3 size={18} />, title: "Roster analytics", sub: "Shape, totals, and matchup posture", action: () => props.onNavigate("roster-analytics") },
    { icon: <Scale size={18} />, title: "Comparison", sub: "Compare several entries side by side", action: () => props.onNavigate("comparison") },
    { icon: <Gamepad2 size={18} />, title: "Game tracker", sub: "Roster game mode, rounds, and notes", action: () => props.onNavigate("game-tracker") },
    { icon: <Dice5 size={18} />, title: "Dice simulator", sub: "Roll N dice with any common side count", action: () => props.onNavigate("dice-simulator") },
  ];

  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title">
          <strong>Tools</strong>
          <small>{props.roster.name}</small>
        </div>
        <AppAvatarButton props={props} />
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-tools-grid ux-tools-grid-large">
          {tools.map((tool) => (
            <button key={tool.title} type="button" className="ux-tool-tile" onClick={tool.action}>
              <span className="ux-setting-icon">{tool.icon}</span>
              <span>
                <strong>{tool.title}</strong>
                <small>{tool.sub}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ToolScreenHeader({ props, title, subtitle }: { props: ConceptProps; title: string; subtitle: string }) {
  return (
    <header className="ux-wb-top ux-wb-home-top reversed">
      <button type="button" className="ux-icon-btn" aria-label="Back to tools" onClick={() => props.onNavigate("tools")}>
        <ArrowLeft size={18} />
      </button>
      <div className="ux-wb-title">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
    </header>
  );
}

function RosterAnalyticsScreen({ props }: { props: ConceptProps }) {
  const unitCount = flattenUnits(props.roster).length;
  const profiles = [
    { label: "Speed/Agility", value: 64 },
    { label: "Toughness", value: 56 },
    { label: "Swarm", value: 78 },
    { label: "Damage", value: 68 },
    { label: "Micro", value: 42 },
  ];

  return (
    <>
      <ToolScreenHeader props={props} title="Roster analytics" subtitle="Compare roster shape" />
      <div className="ux-wb-home-body ux-tool-page">
        <button type="button" className="ux-select-field">
          <span>
            <strong>{props.roster.name}</strong>
            <small>{props.roster.system} · {props.roster.faction}</small>
          </span>
          <ChevronDown size={16} />
        </button>
        <section className="ux-analytics-card">
          <RosterRadar values={profiles.map((item) => item.value)} />
          <div className="ux-radar-legend">
            {profiles.map((item) => (
              <span key={item.label}>
                <strong>{item.label}</strong>
                <small>{item.value}</small>
              </span>
            ))}
          </div>
        </section>
        <div className="ux-stat-grid">
          <ToolStat label="Units" value={unitCount} />
          <ToolStat label="Detachments" value={props.roster.forces.length} />
          <ToolStat label="Sections" value={countSections(props.roster)} />
          <ToolStat label="Open points" value={props.roster.pointsLimit - props.roster.pointsUsed} />
        </div>
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <Activity size={15} />
            <strong>Analysis queue</strong>
          </div>
          {["Damage by range band", "Objective control forecast", "Deployment footprint"].map((item) => (
            <button key={item} type="button" className="ux-source-row">
              <span>
                <strong>{item}</strong>
                <small>Placeholder metric</small>
              </span>
              <Chip tone="cool">Soon</Chip>
            </button>
          ))}
        </section>
      </div>
    </>
  );
}

function RosterRadar({ values }: { values: number[] }) {
  const center = 92;
  const radius = 70;
  const angles = [-90, -18, 54, 126, 198];
  const outer = angles.map((angle) => radarPoint(center, radius, angle));
  const filled = angles.map((angle, index) => radarPoint(center, radius * (values[index] / 100), angle));
  const rings = [0.33, 0.66, 1].map((scale) => angles.map((angle) => radarPoint(center, radius * scale, angle)).join(" "));

  return (
    <svg className="ux-radar-chart" viewBox="0 0 184 184" role="img" aria-label="Roster analytics radar">
      {rings.map((points) => <polygon key={points} points={points} className="ux-radar-ring" />)}
      {outer.map((point) => <line key={point} x1={center} y1={center} x2={point.split(",")[0]} y2={point.split(",")[1]} className="ux-radar-axis" />)}
      <polygon points={filled.join(" ")} className="ux-radar-fill" />
    </svg>
  );
}

function radarPoint(center: number, radius: number, angle: number) {
  const radians = (Math.PI / 180) * angle;
  return `${center + Math.cos(radians) * radius},${center + Math.sin(radians) * radius}`;
}

function ToolStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="ux-tool-stat">
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function ComparisonScreen({ props }: { props: ConceptProps }) {
  const entries = flattenUnits(props.roster).slice(0, 4);
  return (
    <>
      <ToolScreenHeader props={props} title="Comparison" subtitle={props.roster.system} />
      <div className="ux-wb-home-body ux-tool-page">
        <button type="button" className="ux-select-field">
          <span>
            <strong>{props.roster.system}</strong>
            <small>One game system per comparison set</small>
          </span>
          <ChevronDown size={16} />
        </button>
        <div className="ux-compare-selector">
          {entries.map((unit, index) => (
            <button key={unit.id} type="button" className={`ux-filter-pill ${index < 3 ? "on" : ""}`}>
              {unitDisplayName(unit)}
            </button>
          ))}
        </div>
        <section className="ux-compare-table" aria-label="Entry comparison">
          <div className="ux-compare-head">
            <span>Entry</span>
            <span>Pts</span>
            <span>Models</span>
            <span>Status</span>
          </div>
          {entries.slice(0, 3).map((unit) => (
            <button key={unit.id} type="button" className="ux-compare-row" onClick={() => props.onSelectUnit(unit.id)}>
              <span>
                <strong>{unitDisplayName(unit)}</strong>
                <small>{unit.role} · {unit.keywords.slice(0, 2).join(", ")}</small>
              </span>
              <b>{unit.points}</b>
              <b>{unit.count}</b>
              <StatusGlyph status={unit.status} size={15} />
            </button>
          ))}
        </section>
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <Target size={15} />
            <strong>Quick deltas</strong>
          </div>
          {["Lowest cost per model", "Most keywords", "Warnings to resolve"].map((item) => (
            <button key={item} type="button" className="ux-source-row">
              <span>
                <strong>{item}</strong>
                <small>Comparison insight</small>
              </span>
            </button>
          ))}
        </section>
      </div>
    </>
  );
}

function GameTrackerScreen({ props }: { props: ConceptProps }) {
  const units = flattenUnits(props.roster).slice(0, 4);
  return (
    <>
      <ToolScreenHeader props={props} title="Game tracker" subtitle="Game mode" />
      <div className="ux-wb-home-body ux-tool-page">
        <button type="button" className="ux-select-field">
          <span>
            <strong>{props.roster.name}</strong>
            <small>{props.roster.pointsUsed}/{props.roster.pointsLimit} pts · read-only roster</small>
          </span>
          <ChevronDown size={16} />
        </button>
        <button type="button" className="ux-primary ux-tool-launch" onClick={() => props.onNavigate("overview")}>
          <Gamepad2 size={17} />
          Open roster in game mode
        </button>
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <ShieldCheck size={15} />
            <strong>Unit state</strong>
          </div>
          {units.map((unit, index) => (
            <button key={unit.id} type="button" className={`ux-tracker-unit ${index === 2 ? "kia" : ""}`}>
              <span className="ux-opt-check" aria-hidden />
              <span>
                <strong>{unitDisplayName(unit)}</strong>
                <small>{index === 2 ? "KIA · 0 models left" : `${Math.max(1, unit.count - index)} / ${unit.count} models left`}</small>
              </span>
              <b>{unit.points}</b>
            </button>
          ))}
        </section>
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <ClipboardList size={15} />
            <strong>Game plan</strong>
          </div>
          {["Pre-game: confirm mission and terrain", "Round 1: command phase sequence", "Round 2: score primary and mark reserves"].map((item, index) => (
            <button key={item} type="button" className={`ux-source-row ${index < 2 ? "on" : ""}`}>
              <span className="ux-opt-check" aria-hidden />
              <span>
                <strong>{item}</strong>
                <small>{index < 2 ? "Checked" : "Ready"}</small>
              </span>
            </button>
          ))}
        </section>
        <section className="ux-note-composer">
          <span>
            <strong>Round note</strong>
            <small>Pin a note and attach table photos</small>
          </span>
          <button type="button" aria-label="Add image"><ImagePlus size={18} /></button>
        </section>
      </div>
    </>
  );
}

function DiceSimulatorScreen({ props }: { props: ConceptProps }) {
  const dice = [6, 2, 5, 4, 1, 6];
  return (
    <>
      <ToolScreenHeader props={props} title="Dice simulator" subtitle="Roll builder" />
      <div className="ux-wb-home-body ux-tool-page">
        <section className="ux-dice-controls">
          <label>
            <span>Dice</span>
            <input value="6" readOnly />
          </label>
          <label>
            <span>Sides</span>
            <select value="6" aria-label="Dice sides" onChange={() => undefined}>
              <option value="3">d3</option>
              <option value="6">d6</option>
              <option value="8">d8</option>
              <option value="12">d12</option>
              <option value="20">d20</option>
            </select>
          </label>
          <button type="button" className="ux-primary">
            <Dice5 size={17} />
            Roll
          </button>
        </section>
        <div className="ux-dice-stage" aria-label="Dice roll results">
          {dice.map((value, index) => (
            <span key={`${value}-${index}`} className="ux-die" style={{ "--die-delay": `${index * 70}ms` } as CSSProperties}>
              {value}
            </span>
          ))}
        </div>
        <div className="ux-stat-grid">
          <ToolStat label="Total" value={dice.reduce((sum, value) => sum + value, 0)} />
          <ToolStat label="Highest" value={Math.max(...dice)} />
          <ToolStat label="Successes 4+" value={dice.filter((value) => value >= 4).length} />
          <ToolStat label="Rerolls" value={2} />
        </div>
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <Timer size={15} />
            <strong>Recent rolls</strong>
          </div>
          {["6d6: 24 total", "2d12: 15 total", "4d3: 8 total"].map((item) => (
            <button key={item} type="button" className="ux-source-row">
              <span>
                <strong>{item}</strong>
                <small>Saved roll</small>
              </span>
              <CircleDot size={15} />
            </button>
          ))}
        </section>
      </div>
    </>
  );
}

function AppAvatarButton({ props }: { props: ConceptProps }) {
  return <button type="button" className="ux-avatar-btn" aria-label="App" onClick={() => props.onNavigate("app")}>AM</button>;
}

/** Collection space for reusable fan armies and roster building blocks. */
function CollectionsLibrary({ props }: { props: ConceptProps }) {
  const [unitDestination, setUnitDestination] = useState<string | null>(null);
  const unitFavorite = props.unitFavorites.find((item) => item.id === unitDestination);
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title">
          <strong>Library</strong>
          <small>Your collection</small>
        </div>
        <AppAvatarButton props={props} />
      </header>
      <div className="ux-wb-home-body ux-collections-body">
        <FavoriteLibrarySection title="Favorite units" icon={<Heart size={18} />} empty="Rename a configured unit to save it here.">
          {props.unitFavorites.map((favorite) => <article className="ux-favorite-card" key={favorite.id}><span><strong>{unitDisplayName(favorite.unit)}</strong><small>{favorite.sourceSectionName} · {favorite.unit.points} pts</small></span><div><button type="button" onClick={() => setUnitDestination(favorite.id)}><Plus size={14} />Add</button><button type="button" aria-label={`Delete ${unitDisplayName(favorite.unit)}`} onClick={() => window.confirm(`Delete ${unitDisplayName(favorite.unit)} from favorites?`) && props.onDeleteUnitFavorite(favorite.id)}><Trash2 size={14} /></button></div></article>)}
        </FavoriteLibrarySection>
        <FavoriteLibrarySection title="Favorite detachments" icon={<UsersRound size={18} />} empty="Rename a detachment to save its configured snapshot here.">
          {props.detachmentFavorites.map((favorite) => <article className="ux-favorite-card" key={favorite.id}><span><strong>{forceDisplayName(favorite.force)}</strong><small>{favorite.force.detachment} · {favorite.force.points} pts · {favorite.force.sections.reduce((sum, section) => sum + section.units.length, 0)} units</small></span><div><button type="button" onClick={() => { props.onReuseDetachmentFavorite(favorite.id); props.onNavigate("overview"); }}><Plus size={14} />Add</button><button type="button" aria-label={`Delete ${forceDisplayName(favorite.force)}`} onClick={() => window.confirm(`Delete ${forceDisplayName(favorite.force)} from favorites?`) && props.onDeleteDetachmentFavorite(favorite.id)}><Trash2 size={14} /></button></div></article>)}
        </FavoriteLibrarySection>
      </div>
      {unitFavorite ? <UnitDestinationDialog props={props} title={`Add ${unitDisplayName(unitFavorite.unit)}`} sourceSectionName={unitFavorite.sourceSectionName} onClose={() => setUnitDestination(null)} onSelect={(sectionId) => { props.onReuseUnitFavorite(unitFavorite.id, sectionId); setUnitDestination(null); props.onNavigate("overview"); }} /> : null}
    </>
  );
}

function FavoriteLibrarySection({ icon, title, empty, children }: { icon: ReactNode; title: string; empty: string; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="ux-favorite-library-section">
      <header><span className="ux-collection-icon">{icon}</span><strong>{title}</strong></header>
      {hasChildren ? <div className="ux-favorite-card-list">{children}</div> : <div className="ux-favorite-empty"><Heart size={18} /><strong>Nothing saved yet</strong><small>{empty}</small></div>}
    </section>
  );
}

function FavoriteCreationSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="ux-favorite-creation"><div className="ux-result-label"><Heart size={13} />{title}</div><div>{children}</div></section>;
}

/** Account and application-level navigation. */
function AppScreen({ props }: { props: ConceptProps }) {
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top reversed">
        <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="ux-wb-title">
          <strong>App</strong>
          <small>Account & preferences</small>
        </div>
      </header>
      <div className="ux-wb-home-body ux-app-body">
        <section className="ux-account-card">
          <span className="ux-account-avatar"><UserRound size={22} /></span>
          <span>
            <strong>Alex Morgan</strong>
            <small>alex@example.com</small>
          </span>
        </section>
        <button type="button" className="ux-app-nav-row" onClick={() => props.onNavigate("settings")}>
          <span className="ux-setting-icon"><Cog size={17} /></span>
          <span>
            <strong>Settings</strong>
            <small>Search, assistance, and sources</small>
          </span>
          <ChevronRight size={17} />
        </button>
        <footer className="ux-app-footer">
          <strong>Roster Builder</strong>
          <small>Version 1.0.0</small>
        </footer>
      </div>
    </>
  );
}

/** Settings screen housing the "Smart search & suggestions" toggle and sources. */
function SettingsScreen({ props }: { props: ConceptProps }) {
  const smart = props.smartSearch ?? false;
  const sources = mockCatalogues.map((source, index) => ({
    ...source,
    system: index === 0 ? props.roster.system : "Warhammer 40,000",
    imported: index === 0 ? "Imported today" : index === 1 ? "Updated 2 days ago" : "Needs review",
  }));
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top reversed">
        <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="ux-wb-title">
          <strong>Settings</strong>
          <small>Tune your builder</small>
        </div>
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-result-label">Search & assistance</div>
        <button type="button" className={`ux-setting-row ${smart ? "on" : ""}`} onClick={props.onToggleSmartSearch}>
          <span className="ux-setting-icon">
            <Sparkles size={17} />
          </span>
          <span className="ux-setting-text">
            <strong>Smart search & suggestions</strong>
            <small>Type-to-add command bar, fuzzy results, and AI suggestion chips in the add-unit menu.</small>
          </span>
          <span className="ux-switch" aria-hidden />
        </button>
        <p className="ux-hint">
          <Sparkles size={14} />
          When on, the add-unit menu offers quick suggestions for the current slot. With the top-bar layout it also shows a floating command bar.
        </p>
        <details className="ux-source-section" open>
          <summary>
            <span>
              <Database size={16} />
              <strong>Sources</strong>
            </span>
            <ChevronDown size={16} />
          </summary>
          <button type="button" className="ux-import-source">
            <FileInput size={18} />
            <span>
              <strong>Import source</strong>
              <small>Add catalogue files or rules packs</small>
            </span>
          </button>
          <div className="ux-source-list">
            {sources.map((source) => (
              <button key={source.id} type="button" className={`ux-source-row ${source.status === "Current" ? "on" : ""}`}>
                <span>
                  <strong>{source.name}</strong>
                  <small>{source.system} · {source.imported}</small>
                </span>
                <Chip tone={source.status === "Current" ? "valid" : "warning"}>{source.updated}</Chip>
              </button>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}

/** Bottom / floating main tab bar. */
function TabBar({ props, onNavigate }: { props: ConceptProps; onNavigate?: ConceptProps["onNavigate"] }) {
  const floating = props.navStyle === "floating";
  const navigate = onNavigate ?? props.onNavigate;
  const screen = props.screen;
  const items = [
    { id: "library", label: "Lists", icon: LibraryBig },
    { id: "catalogue", label: "Lookup", icon: Search },
    { id: "tools", label: "Tools", icon: Hammer },
    { id: "collections", label: "Library", icon: LibraryBig },
  ] as const;

  const isActive = (id: string) => {
    if (id === "library") return screen === "library" || screen === "overview" || screen === "unit-detail" || screen === "system" || screen === "add-unit" || screen === "validation";
    return screen === id;
  };

  return (
    <nav className={`ux-tabbar ${floating ? "floating" : ""}`} aria-label="Main navigation">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Fragment key={item.id}>
            {index === 2 ? (
              <button
                type="button"
                className={`ux-tab ux-tab-fab ${screen === "add-unit" ? "active" : ""}`}
                aria-label="Add unit"
                onClick={() => navigate("add-unit")}
              >
                <Plus size={22} />
              </button>
            ) : null}
            <button key={item.id} type="button" className={`ux-tab ${isActive(item.id) ? "active" : ""}`} onClick={() => navigate(item.id)}>
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Floating command bar, shown only with the top-bar layout when smart search is on. */
function CommandBar({ props }: { props: ConceptProps }) {
  return (
    <div className="ux-cmd-bar">
      <button type="button" className="ux-cmd-tab" aria-label="Build" onClick={() => props.onNavigate("overview")}>
        <Layers size={18} />
      </button>
      <button type="button" className="ux-cmd-input" onClick={() => props.onNavigate("add-unit")}>
        <Command size={16} />
        <span>Add unit or ask for help…</span>
      </button>
      <button type="button" className="ux-cmd-send" aria-label="Run" onClick={() => props.onNavigate("add-unit")}>
        <ArrowUp size={18} />
      </button>
    </div>
  );
}

function unitDisplayName(unit: ConceptProps["selectedUnit"]) {
  return unit.customName?.trim() || unit.name;
}

function forceDisplayName(force: ConceptProps["roster"]["forces"][number]) {
  return force.customName?.trim() || force.name;
}
