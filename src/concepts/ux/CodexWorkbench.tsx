import { Fragment, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, ArrowUp, BookOpen, Check, ChevronDown, ClipboardList, Cog, Command, Database, Download, FileInput, Hammer, Layers, LibraryBig, PanelsTopLeft, Plus, Search, Share2, ShieldCheck, Sparkles, Star, StickyNote, Wand2 } from "lucide-react";
import { mockCatalogues } from "../../data/mockRoster";
import type { ConceptProps } from "../shared";
import { BackOrTitle, BudgetMeter, Chip, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph } from "./uxShared";

/**
 * Codex Workbench — the single merged design.
 * Master/detail workbench (tree + live detail + validation rail) with a library
 * entry, a roster-creation flow, and a Settings-gated smart-search tier. Main
 * navigation can be rendered as a top bar, a bottom tab bar, or a floating tab
 * bar so the directions can be compared side by side.
 */
export function CodexWorkbench(props: ConceptProps) {
  const navStyle = props.navStyle ?? "top";
  const hasTabs = navStyle !== "top";
  const smart = props.smartSearch ?? false;
  const screen = props.screen;
  const shell = `ux-screen ux-workbench ${shellClass(props.themeMode, props.colorScheme)} ${hasTabs ? "has-tabs" : ""}`.trim();

  let body: ReactNode;
  let modifier = "";

  if (screen === "library") {
    body = <Library props={props} />;
  } else if (screen === "catalogue") {
    body = <LookupScreen props={props} />;
  } else if (screen === "tools") {
    body = <ToolsScreen props={props} />;
  } else if (screen === "settings") {
    body = <SettingsScreen props={props} />;
  } else if (screen === "system") {
    body = <CreateScreen props={props} />;
  } else {
    const smartClass = !hasTabs && smart ? "ux-smart" : "";
    modifier = [screen === "unit-detail" ? "show-detail" : "", screen === "validation" ? "show-checks" : "", smartClass].filter(Boolean).join(" ");
    body = (
      <>
        <WorkbenchHeader props={props} />
        <div className="ux-wb-budget">
          <BudgetMeter roster={props.roster} />
        </div>
        <div className="ux-wb-layout">
          <Tree props={props} />
          <Detail props={props} />
          <Rail props={props} />
        </div>
      </>
    );
  }

  const isWorkbenchScreen = screen !== "library" && screen !== "catalogue" && screen !== "tools" && screen !== "settings" && screen !== "system";
  const showCommandBar = !hasTabs && smart && isWorkbenchScreen;

  return (
    <div className={`${shell} ${modifier}`.trim()}>
      {body}
      {hasTabs ? <TabBar props={props} /> : showCommandBar ? <CommandBar props={props} /> : null}
    </div>
  );
}

function WorkbenchHeader({ props }: { props: ConceptProps }) {
  return (
    <header className="ux-wb-top">
      <BackOrTitle
        props={props}
        fallback={
          <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
            <Layers size={18} />
          </button>
        }
      />
      <div className="ux-wb-title">
        <strong>{props.roster.name}</strong>
        <small>{props.roster.faction} · {props.roster.system}</small>
      </div>
      <button type="button" className="ux-icon-btn" aria-label="Export" onClick={() => props.onNavigate("export")}>
        <Download size={18} />
      </button>
    </header>
  );
}

function Tree({ props }: { props: ConceptProps }) {
  return (
    <nav className="ux-wb-tree" aria-label="Roster tree">
      <div className="ux-wb-search">
        <Search size={15} />
        <input placeholder="Filter units" readOnly />
      </div>
      {props.roster.sections.map((section) => {
        const open = props.expandedSectionIds.includes(section.id) || section.id === props.selectedSectionId;
        return (
          <div className={`ux-tree-branch ${open ? "open" : ""}`} key={section.id}>
            <button type="button" className="ux-tree-section" onClick={() => props.onSelectSection(section.id)}>
              <ChevronDown size={14} className="ux-tree-caret" />
              <strong>{section.name}</strong>
              <small>{section.required ?? section.units.length}</small>
            </button>
            {open ? (
              <div className="ux-tree-units">
                {section.units.map((unit) => (
                  <button
                    key={unit.id}
                    type="button"
                    className={`ux-tree-unit ${unit.status ?? "valid"} ${props.selectedUnit.id === unit.id ? "active" : ""}`}
                    onClick={() => props.onSelectUnit(unit.id)}
                  >
                    <span className="ux-tree-rail" aria-hidden />
                    <span className="ux-tree-unit-main">
                      <span>{unit.name}</span>
                      <small>×{unit.count}</small>
                    </span>
                    {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={13} /> : <b>{unit.points}</b>}
                  </button>
                ))}
                <button
                  type="button"
                  className="ux-tree-add"
                  onClick={() => {
                    props.onSelectSection(section.id);
                    props.onNavigate("add-unit");
                  }}
                >
                  <Plus size={13} />
                  Add unit
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function Detail({ props }: { props: ConceptProps }) {
  if (props.screen === "add-unit") return <AddPane props={props} />;
  const unit = props.selectedUnit;
  return (
    <section className="ux-wb-detail">
      <button type="button" className="ux-wb-back" onClick={props.onBack}>
        <ArrowLeft size={14} />
        Back to roster
      </button>
      <div className="ux-wb-detail-head">
        <span>
          <small>{props.selectedSection.name}</small>
          <strong>{unit.name}</strong>
        </span>
        <span className="ux-wb-detail-pts">
          <b>{unit.points}</b>
          <small>points</small>
        </span>
      </div>
      <div className="ux-keywords">
        {unit.keywords.map((k) => (
          <Chip key={k} tone="cool">
            {k}
          </Chip>
        ))}
      </div>
      {unit.note ? <p className="ux-config-note">{unit.note}</p> : null}
      <div className="ux-opt-groups">
        {(["weapon", "upgrade", "rule"] as const).map((group) => {
          const opts = unit.options.filter((o) => o.group === group);
          if (!opts.length) return null;
          return (
            <section className="ux-opt-group" key={group}>
              <h4>{group === "weapon" ? "Wargear" : group === "upgrade" ? "Upgrades" : "Special rules"}</h4>
              {opts.map((opt) => (
                <button key={opt.id} type="button" className={`ux-opt-row ${opt.selected ? "on" : ""}`} onClick={() => props.onToggleOption(opt.id)}>
                  <span className="ux-opt-check" aria-hidden />
                  <span>{opt.name}</span>
                  <em>{priceLabel(opt.points)}</em>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </section>
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
      <div className="ux-pool">
        {(pool.length ? pool : flattenUnits(props.roster)).map((unit) => (
          <button key={unit.id} type="button" className="ux-pool-row" onClick={() => props.onSelectUnit(unit.id)}>
            <span>
              <strong>{unit.name}</strong>
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
              <strong>{unit.name}</strong>
              <small>{unit.note ?? unit.slotImpact}</small>
            </span>
          </button>
        ))
      )}
      <div className="ux-wb-rail-foot">
        <span>{flattenUnits(props.roster).length} units</span>
        <span>{props.roster.sections.length} slots</span>
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
        <button type="button" className="ux-icon-btn" aria-label="Settings" onClick={() => props.onNavigate("settings")}>
          <Cog size={18} />
        </button>
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
  const systems: Array<[string, string]> = [
    ["Warhammer 40,000", "Strike Force · 2000 pts"],
    ["Horus Heresy", "Crusade · 3000 pts"],
    ["Age of Sigmar", "Spearhead · 1000 pts"],
  ];
  const factions = ["Adeptus Astartes", "Aeldari", "Necrons", "Death Guard"];
  const points = ["1000", "2000", "3000"];
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
          {systems.map(([name, sub], index) => (
            <button key={name} type="button" className={`ux-start-row ${index === 0 ? "on" : ""}`}>
              <span>
                <strong>{name}</strong>
                <small>{sub}</small>
              </span>
              {index === 0 ? <Check size={18} /> : null}
            </button>
          ))}
        </div>
        <div className="ux-start-group">
          <h4>Faction</h4>
          <div className="ux-filter-row">
            {factions.map((faction, index) => (
              <button key={faction} type="button" className={`ux-filter-pill ${index === 0 ? "on" : ""}`}>
                {faction}
              </button>
            ))}
          </div>
        </div>
        <div className="ux-start-group">
          <h4>Points limit</h4>
          <div className="ux-filter-row">
            {points.map((value, index) => (
              <button key={value} type="button" className={`ux-filter-pill ${index === 1 ? "on" : ""}`}>
                {value} pts
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="ux-primary" onClick={() => props.onNavigate("overview")}>
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
        <button type="button" className="ux-icon-btn" aria-label="Settings" onClick={() => props.onNavigate("settings")}>
          <Cog size={18} />
        </button>
      </header>
      <div className="ux-wb-home-body">
        <div className={`ux-wb-search ${props.smartSearch ? "smart" : ""}`}>
          {props.smartSearch ? <Command size={15} /> : <Search size={15} />}
          <input placeholder="Search Intercessors, Deep Strike, plasma..." readOnly />
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
                <strong>{unit.name}</strong>
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
        <button type="button" className="ux-icon-btn" aria-label="Roster" onClick={() => props.onNavigate("overview")}>
          <Layers size={18} />
        </button>
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-tools-summary">
          <BudgetMeter roster={props.roster} label="Current list" />
          <div>
            <strong>{flattenUnits(props.roster).length} units</strong>
            <small>{props.roster.sections.length} roster sections</small>
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
function TabBar({ props }: { props: ConceptProps }) {
  const floating = props.navStyle === "floating";
  const screen = props.screen;
  const items = [
    { id: "library", label: "Lists", icon: LibraryBig },
    { id: "catalogue", label: "Lookup", icon: Search },
    { id: "tools", label: "Tools", icon: Hammer },
    { id: "settings", label: "Settings", icon: Cog },
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
                onClick={() => props.onNavigate("add-unit")}
              >
                <Plus size={22} />
              </button>
            ) : null}
            <button key={item.id} type="button" className={`ux-tab ${isActive(item.id) ? "active" : ""}`} onClick={() => props.onNavigate(item.id)}>
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
