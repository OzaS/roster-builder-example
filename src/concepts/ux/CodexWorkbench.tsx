import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { AlertTriangle, ArrowLeft, ArrowUp, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Cog, Command, Copy, Database, Download, Ellipsis, FileInput, GripVertical, Hammer, Heart, Layers, LibraryBig, Maximize2, Minimize2, Minus, MoveRight, PanelsTopLeft, Pencil, Plus, RotateCcw, Search, Share2, ShieldCheck, Sparkles, Split, Star, StickyNote, Trash2, UserRound, UsersRound, Wand2, X } from "lucide-react";
import { mockCatalogues, mockDetachments } from "../../data/mockRoster";
import type { ConceptProps } from "../shared";
import { BackOrTitle, BudgetMeter, Chip, countSections, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph, SubscriptionGate } from "./uxShared";

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
  } else if (screen === "app") {
    body = <AppScreen props={props} />;
  } else if (screen === "settings") {
    body = <SettingsScreen props={props} />;
  } else if (screen === "system") {
    body = <CreateScreen props={props} />;
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
          <Tree props={props} query={rosterSearchQuery} onQueryChange={setRosterSearchQuery} creationOpen={forceCreationOpen} onCreationOpenChange={setForceCreationOpen} />
          <PaneDivider side="tree" props={props} layoutRef={layoutRef} />
          <Detail props={props} scrollRef={detailScrollRef} onOpenLoadoutSlot={openLoadoutSelector} />
          <PaneDivider side="rail" props={props} layoutRef={layoutRef} />
          <Rail props={props} />
        </div>
      </>
    );
  }

  const showCommandBar = navStyle === "top" && smart && isWorkbenchScreen && !isUnitDetail;
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
      {focusPane ? <EdgeHandle edge="top" expanded={focusChromeVisible} onReveal={() => setFocusChromeVisible(true)} /> : null}
      {forceCreationOpen && props.forceCreationMode !== "inline" ? <ForceSelector props={props} onClose={() => setForceCreationOpen(false)} /> : null}
      {activeLoadoutSlot ? <LoadoutSelector props={props} target={activeLoadoutSlot} onClose={closeLoadoutSelector} /> : null}
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
    <header className={`ux-wb-top workspace-header ${isUnitDetail ? "unit-detail" : ""} ${isOverview ? "roster-overview" : ""}`}>
      <BackOrTitle
        props={props}
        fallback={
          <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
            <Layers size={18} />
          </button>
        }
      />
      {searchOpen && isOverview ? (
        <label className="ux-navbar-search"><Search size={15} /><input value={searchQuery} onChange={(event) => onSearchQueryChange(event.currentTarget.value)} placeholder="Search roster" autoFocus /></label>
      ) : (
        <div className="ux-wb-title">
          <strong>{isUnitDetail ? unitDisplayName(props.selectedUnit) : props.roster.name}</strong>
          {isOverview ? <><small className="ux-phone-overview-subtitle">{props.roster.faction} · {props.roster.system}</small><small className="ux-tablet-overview-subtitle">{props.roster.faction} · {remainingLabel}</small></> : <small>{isUnitDetail ? `${props.selectedSection.name} · ${remainingLabel}` : `${props.roster.faction} · ${props.roster.system}`}</small>}
        </div>
      )}
      {isOverview ? <button type="button" className="ux-icon-btn ux-tablet-header-control" aria-label={searchOpen ? "Close roster search" : "Search roster"} onClick={() => onSearchOpenChange(!searchOpen)}>{searchOpen ? <X size={17} /> : <Search size={17} />}</button> : null}
      <button type="button" className="ux-icon-btn ux-tablet-header-control ux-tablet-layout-button" aria-label="Tablet layout" aria-expanded={layoutMenuOpen} onClick={() => onLayoutMenuOpenChange(!layoutMenuOpen)}><PanelsTopLeft size={17} /></button>
      {isUnitDetail ? (
        <span className="ux-wb-header-points" aria-label={`${props.selectedUnit.points} points`}>
          <b>{props.selectedUnit.points}</b>
          <small>pts</small>
        </span>
      ) : isOverview ? (
        <span className="ux-roster-header-points" aria-label={`${props.roster.pointsUsed} of ${props.roster.pointsLimit} points`}><b>{props.roster.pointsUsed}</b><small>/ {props.roster.pointsLimit}</small></span>
      ) : null}
      {!isUnitDetail ? (
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

function Tree({ props, query, onQueryChange, creationOpen, onCreationOpenChange }: { props: ConceptProps; query: string; onQueryChange: (query: string) => void; creationOpen: boolean; onCreationOpenChange: (open: boolean) => void }) {
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
      <div className="ux-wb-search ux-tree-search">
        <Search size={15} />
        <input placeholder="Filter units" value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} />
      </div>
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
                            {units.map((unit) => <SwipeableUnitRow key={unit.id} unit={unit} active={props.selectedUnit.id === unit.id} onSelect={() => props.onSelectUnit(unit.id)} onDelete={() => props.onDeleteUnit(unit.id)} onRename={() => setRenamingUnitId(unit.id)} onDuplicate={() => props.onDuplicateUnit(unit.id)} />)}
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

function SwipeableUnitRow({ unit, active, onSelect, onDelete, onRename, onDuplicate }: { unit: ConceptProps["selectedUnit"]; active: boolean; onSelect: () => void; onDelete: () => void; onRename: () => void; onDuplicate: () => void }) {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const startOffset = useRef(0);
  const dragged = useRef(false);
  const close = () => setOffset(0);
  return (
    <div className={`ux-swipe-unit ${offset < 0 ? "open" : ""}`}>
      <div className="ux-swipe-actions" aria-label={`Actions for ${unitDisplayName(unit)}`} aria-hidden={offset === 0}>
        <button type="button" tabIndex={offset < 0 ? 0 : -1} className="delete" onClick={() => { close(); onDelete(); }}><Trash2 size={14} /><span>Delete</span></button>
        <button type="button" tabIndex={offset < 0 ? 0 : -1} onClick={() => { close(); onRename(); }}><Pencil size={14} /><span>Rename</span></button>
        <button type="button" tabIndex={offset < 0 ? 0 : -1} onClick={() => { close(); onDuplicate(); }}><Copy size={14} /><span>Duplicate</span></button>
      </div>
      <button
        type="button"
        className={`ux-tree-unit ux-swipe-unit-content ${unit.status ?? "valid"} ${active ? "active" : ""}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={(event) => { startX.current = event.clientX; startOffset.current = offset; dragged.current = false; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          if (Math.abs(delta) > 6) dragged.current = true;
          setOffset(Math.max(-174, Math.min(0, startOffset.current + delta)));
        }}
        onPointerUp={() => { startX.current = null; setOffset((current) => current < -42 ? -174 : 0); }}
        onPointerCancel={() => { startX.current = null; setOffset((current) => current < -42 ? -174 : 0); }}
        onClick={(event) => { if (dragged.current) { event.preventDefault(); dragged.current = false; return; } if (offset < 0) close(); else onSelect(); }}
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

function Detail({ props, scrollRef, onOpenLoadoutSlot }: { props: ConceptProps; scrollRef: RefObject<HTMLElement | null>; onOpenLoadoutSlot: (groupId: string, slotId: string) => void }) {
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
      {props.unitDetailView === "profile" ? <UnitProfile props={props} /> : unit.detail ? <StructuredOptions props={props} onOpenLoadoutSlot={onOpenLoadoutSlot} /> : <FlatOptions props={props} />}
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

function UnitProfile({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
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
    <div className="ux-unit-profile">
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
          <ProfileTable table={modelTable} unitCount={unit.count} />
        </ProfileSection>
      ) : null}

      <ProfileSection title="Traits">
        <div className="ux-profile-tag-list">{detail.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
      </ProfileSection>

      {weaponTables.map((table) => (
        <ProfileSection title={table.title} key={table.id}>
          <ProfileTable table={table} unitCount={unit.count} />
        </ProfileSection>
      ))}

      <ProfileSection title="Wargear">
        <div className="ux-profile-copy-list">
          {detail.wargear.map((item) => (
            <article key={item.id}>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="Rules">
        <div className="ux-profile-tag-list">{detail.rules.map((rule) => <span key={rule}>{rule}</span>)}</div>
      </ProfileSection>

      <ProfileSection title="Categories">
        <div className="ux-profile-tag-list">{detail.categories.map((category) => <span key={category}>{category}</span>)}</div>
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

function ProfileTable({ table, unitCount }: { table: NonNullable<ConceptProps["selectedUnit"]["detail"]>["profileTables"][number]; unitCount: number }) {
  const rowName = (row: typeof table.rows[number]) => row.id === "assault-legionary" ? `Assault Legionary (x${unitCount - 1})` : row.name.replace("(x10)", `(x${unitCount})`);
  return (
    <div className="ux-profile-table-scroll">
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
                {row.tags ? <small>{row.tags.join(" · ")}</small> : null}
              </th>
            </tr>
            <tr className="ux-profile-row-stats">
              {row.values.map((value, index) => <td key={`${row.id}-${table.columns[index]}`}>{value}</td>)}
            </tr>
          </tbody>
        ))}
      </table>
    </div>
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
  const checks = rosterChecks(props.roster);
  const tools = [
    { icon: <ShieldCheck size={18} />, title: checks.length ? `${checks.length} checks to resolve` : "Roster is legal", sub: `${props.roster.pointsLimit - props.roster.pointsUsed} points open`, action: () => props.onNavigate("validation") },
    { icon: <Share2 size={18} />, title: "Export & share", sub: "Copy list, print, or hand off", action: () => props.onNavigate("export") },
    { icon: <StickyNote size={18} />, title: "Matchup notes", sub: "Game plan and reminders", action: undefined },
    { icon: <Star size={18} />, title: "Pinned rules", sub: "Oath of Moment, Deep Strike", action: () => props.onNavigate("catalogue") },
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
        <div className="ux-tools-summary">
          <BudgetMeter roster={props.roster} label="Current list" />
          <div>
            <strong>{flattenUnits(props.roster).length} units</strong>
            <small>{countSections(props.roster)} roster sections</small>
          </div>
        </div>
        <div className="ux-tools-grid">
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
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <ClipboardList size={15} />
            <strong>Table-side checklist</strong>
          </div>
          {["Confirm detachment rules", "Mark fixed secondary plan", "Review wargear swaps"].map((item, index) => (
            <button key={item} type="button" className={`ux-source-row ${index === 0 ? "on" : ""}`}>
              <span className="ux-opt-check" aria-hidden />
              <span>
                <strong>{item}</strong>
                <small>{index === 0 ? "Ready for review" : "Saved for later"}</small>
              </span>
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
