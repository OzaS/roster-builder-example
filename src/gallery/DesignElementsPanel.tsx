import { AlertTriangle, Archive, ArrowLeft, ArrowUp, BookOpen, Check, ChevronDown, Cog, Command, Copy, CornerDownLeft, Database, Download, Ellipsis, FileInput, Filter, Hammer, Layers, MessageCircle, PanelsTopLeft, Plus, Rows3, Search, Share2, Smartphone, Sparkles, StickyNote, Trash2, Zap } from "lucide-react";
import { PhoneStatusBar } from "../components/DeviceFrame";
import type { ColorScheme, PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode } from "../types";
import { BudgetMeter, Chip, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph } from "../concepts/ux/uxShared";
import type { GalleryConcept } from "./galleryTypes";

type Props = {
  concept: GalleryConcept;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
};

export function DesignElementsPanel({
  concept,
  platform,
  themeMode,
  colorScheme,
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  onSelectSection,
  onSelectUnit,
  onToggleOption,
}: Props) {
  const isWorkbench = concept.id === "ux-workbench";
  const rootClass = `design-elements-panel ux-screen ${isWorkbench ? "ux-workbench" : "ux-command"} ${shellClass(themeMode, colorScheme)} ${platform}`;

  return (
    <section className={rootClass}>
      <header className="elements-hero ux-elements-hero">
        <div>
          <small>{concept.eyebrow}</small>
          <h1>{concept.name} Elements</h1>
          <p>{isWorkbench ? "Reusable tree, detail, validation, and dense editing primitives for the master-detail direction." : "Reusable command, search, result, and assistant primitives for the search-first direction."}</p>
        </div>
        <div className="elements-hero-actions">
          <button type="button" aria-label="Search">
            <Search size={18} />
          </button>
          <button type="button" aria-label="Export">
            <Download size={18} />
          </button>
        </div>
      </header>

      <TokenSection />
      <TypographySection roster={roster} />
      <ElementSection title="Phone Status Bar">
        <div className={`ux-phone-status-preview theme-${themeMode} ux-scheme-${colorScheme} status-bar-design`}>
          <PhoneStatusBar />
        </div>
      </ElementSection>
      {isWorkbench ? (
        <WorkbenchElements roster={roster} selectedSection={selectedSection} selectedUnit={selectedUnit} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} onToggleOption={onToggleOption} />
      ) : (
        <QuickstrikeElements roster={roster} selectedSection={selectedSection} selectedUnit={selectedUnit} onSelectUnit={onSelectUnit} onToggleOption={onToggleOption} />
      )}
    </section>
  );
}

function TokenSection() {
  const tokens = [
    ["Accent", "var(--ux-accent)", "var(--ux-accent-ink)"],
    ["Accent 2", "var(--ux-accent-2)", "var(--ux-accent-ink)"],
    ["Surface", "var(--ux-surface)", "var(--ux-ink)"],
    ["Surface 2", "var(--ux-surface-2)", "var(--ux-ink)"],
    ["Surface 3", "var(--ux-surface-3)", "var(--ux-ink)"],
    ["Cool", "var(--ux-cool)", "var(--ux-accent-ink)"],
    ["Warning", "var(--ux-warn)", "#1b1303"],
    ["Error", "var(--ux-err)", "#fff7f5"],
  ];

  return (
    <ElementSection title="Color Tokens">
      <div className="token-grid ux-token-grid">
        {tokens.map(([label, bg, fg]) => (
          <div className="token-swatch ux-token-swatch" key={label} style={{ background: bg, color: fg }}>
            <strong>{label}</strong>
            <small>{bg}</small>
          </div>
        ))}
      </div>
    </ElementSection>
  );
}

function TypographySection({ roster }: { roster: Roster }) {
  return (
    <ElementSection title="Typography">
      <div className="type-stack ux-type-stack">
        <span className="type-display">{roster.pointsUsed} pts</span>
        <h2>{roster.name}</h2>
        <h3>{roster.faction}</h3>
        <p>Compact hierarchy tuned for fast roster edits, point checks, and table-side scanning.</p>
        <small>Metadata · status · helper text</small>
      </div>
    </ElementSection>
  );
}

function QuickstrikeElements({
  roster,
  selectedSection,
  selectedUnit,
  onSelectUnit,
  onToggleOption,
}: {
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
}) {
  const units = flattenUnits(roster);

  return (
    <>
      <ElementSection title="Command Header">
        <div className="ux-cmd-top">
          <div className="ux-cmd-title">
            <button type="button" className="ux-icon-btn" aria-label="Lists">
              <Layers size={18} />
            </button>
            <span>
              <strong>{roster.name}</strong>
              <small>{roster.faction}</small>
            </span>
            <button type="button" className="ux-icon-btn" aria-label="Share">
              <Share2 size={18} />
            </button>
          </div>
          <BudgetMeter roster={roster} />
          <div className="ux-cmd-stat-row">
            <Chip tone="valid">{units.length} units</Chip>
            <Chip tone="warning">{rosterChecks(roster).length} checks</Chip>
            <Chip tone="neutral">{roster.sections.length} slots</Chip>
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Command Input">
        <div className="ux-palette-query">
          <Command size={16} />
          <span>Add a legal objective holder for HQ</span>
          <kbd>
            <CornerDownLeft size={13} />
          </kbd>
        </div>
        <div className="ux-filter-row">
          {["Legal only", "Affordable", "Battleline", "Characters"].map((label, index) => (
            <button key={label} type="button" className={`ux-filter-pill ${index < 2 ? "on" : ""}`}>
              <Filter size={12} />
              {label}
            </button>
          ))}
        </div>
        <div className="ux-suggest">
          <Sparkles size={14} />
          <div className="ux-suggest-chips">
            {["objective holder under 120", "second battleline squad", "anti-tank for elites"].map((label) => (
              <button key={label} type="button" className="ux-suggest-chip">
                {label}
              </button>
            ))}
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Result Rows">
        {units.slice(0, 4).map((unit) => (
          <button key={unit.id} type="button" className="ux-result-row" onClick={() => onSelectUnit(unit.id)}>
            <span className="ux-result-icon" aria-hidden>
              <Zap size={15} />
            </span>
            <span className="ux-result-main">
              <strong>{unit.name}</strong>
              <small>{unit.sectionName} · {unit.role}</small>
            </span>
            <span className="ux-result-meta">
              <b>{unit.points}</b>
              <Chip tone={unit.availability === "available" ? "valid" : unit.availability === "limited" ? "warning" : "error"}>{unit.availability}</Chip>
            </span>
            <Plus size={16} />
          </button>
        ))}
      </ElementSection>

      <ElementSection title="Roster Rows">
        <div className="ux-cmd-group">
          <div className="ux-cmd-group-head">
            <strong>{selectedSection.name}</strong>
            <small>{selectedSection.required ?? selectedSection.units.length}</small>
          </div>
          {selectedSection.units.map((unit) => (
            <button key={unit.id} type="button" className={`ux-cmd-row ${unit.status ?? "valid"}`} onClick={() => onSelectUnit(unit.id)}>
              <span className="ux-cmd-row-main">
                <strong>{unit.name}</strong>
                <small>{unit.role} · x{unit.count}</small>
              </span>
              {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={14} /> : null}
              <b>{unit.points}</b>
            </button>
          ))}
        </div>
      </ElementSection>

      <OptionsSection selectedUnit={selectedUnit} onToggleOption={onToggleOption} />
      <ElementSection title="Thumb Command Bar">
        <div className="ux-elements-command-wrap">
          <div className="ux-cmd-bar">
            <button type="button" className="ux-cmd-tab" aria-label="Build">
              <Layers size={18} />
            </button>
            <button type="button" className="ux-cmd-input">
              <Command size={16} />
              <span>Add unit or ask for help...</span>
            </button>
            <button type="button" className="ux-cmd-send" aria-label="Run">
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </ElementSection>
    </>
  );
}

function WorkbenchElements({
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  onSelectSection,
  onSelectUnit,
  onToggleOption,
}: {
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
}) {
  const checks = rosterChecks(roster);
  const profileUnit = flattenUnits(roster).find((unit) => unit.detail) ?? selectedUnit;

  return (
    <>
      <ElementSection title="Workbench Chrome">
        <header className="ux-wb-top ux-elements-static">
          <button type="button" className="ux-icon-btn" aria-label="Lists">
            <Layers size={18} />
          </button>
          <div className="ux-wb-title">
            <strong>{roster.name}</strong>
            <small>{roster.faction} · {roster.system}</small>
          </div>
          <button type="button" className="ux-icon-btn" aria-label="Export">
            <Download size={18} />
          </button>
        </header>
        <header className="ux-wb-top unit-detail ux-elements-static">
          <button type="button" className="ux-icon-btn" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="ux-wb-title">
            <strong>{selectedUnit.name}</strong>
            <small>{selectedSection.name} · {Math.max(0, roster.pointsLimit - roster.pointsUsed)} pts left</small>
          </div>
          <span className="ux-wb-header-points" aria-label={`${selectedUnit.points} points`}>
            <b>{selectedUnit.points}</b>
            <small>pts</small>
          </span>
          <span className="ux-detail-progress" role="progressbar" aria-label="Roster points used" aria-valuemin={0} aria-valuemax={roster.pointsLimit} aria-valuenow={roster.pointsUsed}>
            <i style={{ width: `${Math.min(100, (roster.pointsUsed / roster.pointsLimit) * 100)}%` }} />
          </span>
        </header>
        <BudgetMeter roster={roster} />
      </ElementSection>

      <ElementSection title="Roster Creation">
        <button type="button" className="ux-start-row on">
          <span>
            <strong>Warhammer 40,000</strong>
            <small>Matched play · Incursion to Onslaught</small>
          </span>
          <Check size={18} />
        </button>
        <div className="ux-filter-row">
          {["1000 pts", "2000 pts", "Custom"].map((label) => (
            <button key={label} type="button" className={`ux-filter-pill ${label === "Custom" ? "on" : ""}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="ux-custom-points">
          <input value="1500" aria-label="Custom points limit" readOnly />
          <span>pts</span>
        </label>
        <div className="ux-select-field-wrap">
          <button type="button" className="ux-select-field open">
            <span>
              <strong>Select force</strong>
              <small>Choose from available armies</small>
            </span>
            <ChevronDown size={16} />
          </button>
          <div className="ux-select-popover" style={{ position: "relative", top: 8 }}>
            <div className="ux-wb-search">
              <Search size={15} />
              <input placeholder="Search forces" readOnly />
            </div>
            <details className="ux-force-group" open>
              <summary>
                <span>Imperium</span>
                <ChevronDown size={14} />
              </summary>
              <div>
                {["Adeptus Astartes", "Astra Militarum", "Adepta Sororitas"].map((force, index) => (
                  <button key={force} type="button" className={`ux-force-option ${index === 0 ? "on" : ""}`}>
                    <span>{force}</span>
                    {index === 0 ? <Check size={15} /> : null}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Roster Tree">
        <div className="ux-wb-search">
          <Search size={15} />
          <input placeholder="Filter units" readOnly />
        </div>
        {roster.sections.slice(0, 3).map((section) => (
          <div className={`ux-tree-branch ${section.id === selectedSectionId ? "open" : ""}`} key={section.id}>
            <button type="button" className="ux-tree-section" onClick={() => onSelectSection(section.id)}>
              <PanelsTopLeft size={14} />
              <strong>{section.name}</strong>
              <small>{section.required ?? section.units.length}</small>
            </button>
            {section.id === selectedSectionId ? (
              <div className="ux-tree-units">
                {section.units.map((unit) => (
                  <button key={unit.id} type="button" className={`ux-tree-unit ${unit.status ?? "valid"} ${selectedUnit.id === unit.id ? "active" : ""}`} onClick={() => onSelectUnit(unit.id)}>
                    <span className="ux-tree-rail" aria-hidden />
                    <span className="ux-tree-unit-main">
                      <span>{unit.name}</span>
                      <small>x{unit.count}</small>
                    </span>
                    {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={13} /> : <b>{unit.points}</b>}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </ElementSection>

      <ElementSection title="Detail Pane">
        <div className="ux-keywords">
          {selectedUnit.keywords.map((keyword) => (
            <Chip key={keyword} tone="cool">
              {keyword}
            </Chip>
          ))}
        </div>
        {selectedUnit.note ? <p className="ux-config-note">{selectedUnit.note}</p> : null}
      </ElementSection>

      <OptionsSection selectedUnit={selectedUnit} onToggleOption={onToggleOption} />

      <UnitProfilesElement unit={profileUnit} />

      <ElementSection title="Unit Detail Toggle">
        <div className="ux-detail-mode-layer ux-elements-static">
          <div className="ux-detail-action-menu ux-elements-static" role="menu" aria-label="Unit actions">
            <button type="button" role="menuitem"><Copy size={15} />Duplicate</button>
            <button type="button" role="menuitem"><StickyNote size={15} />Add note</button>
            <button type="button" role="menuitem"><Share2 size={15} />Share</button>
          </div>
          <nav className="ux-detail-mode-bar ux-elements-static" aria-label="Unit detail view">
            <button type="button" className="ux-detail-mode-tab"><Cog size={18} /><span>Options</span></button>
            <button type="button" className="ux-detail-menu-fab" aria-label="More unit actions"><Ellipsis size={22} /></button>
            <button type="button" className="ux-detail-mode-tab active"><BookOpen size={18} /><span>Profile</span></button>
          </nav>
        </div>
      </ElementSection>

      <ElementSection title="Validation Rail">
        <div className="ux-wb-rail-head">
          <AlertTriangle size={15} />
          <strong>Validation</strong>
          <span className="ux-wb-rail-count">{checks.length}</span>
        </div>
        {checks.map((unit) => (
          <button key={unit.id} type="button" className={`ux-rail-item ${unit.status}`} onClick={() => onSelectUnit(unit.id)}>
            <StatusGlyph status={unit.status} size={15} />
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.note ?? unit.slotImpact}</small>
            </span>
          </button>
        ))}
        <div className="ux-wb-rail-foot">
          <span>{flattenUnits(roster).length} units</span>
          <span>{roster.sections.length} slots</span>
        </div>
      </ElementSection>

      <ElementSection title="Add Pool Rows">
        <div className="ux-wb-search">
          <Search size={15} />
          <input placeholder={`Search ${selectedSection.name}`} readOnly />
        </div>
        {flattenUnits(roster).slice(0, 3).map((unit) => (
          <button key={unit.id} type="button" className="ux-pool-row" onClick={() => onSelectUnit(unit.id)}>
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
      </ElementSection>

      <ElementSection title="Smart Search (Settings)">
        <div className="ux-wb-search smart">
          <Command size={15} />
          <input placeholder={`Add a legal ${selectedSection.name} unit or ask…`} readOnly />
        </div>
        <div className="ux-suggest">
          <Sparkles size={14} />
          <div className="ux-suggest-chips">
            {["legal & affordable", "fills this slot", "best value pick"].map((label) => (
              <button key={label} type="button" className="ux-suggest-chip">
                {label}
              </button>
            ))}
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Lookup & Sources">
        <div className="ux-source-filters">
          {["All sources", roster.system, roster.faction].map((label, index) => (
            <button key={label} type="button" className={`ux-filter-pill ${index === 0 ? "on" : ""}`}>
              {label}
            </button>
          ))}
        </div>
        <section className="ux-lookup-group">
          <div className="ux-lookup-title">
            <Search size={15} />
            <strong>Units</strong>
          </div>
          {flattenUnits(roster).slice(0, 2).map((unit) => (
            <button key={unit.id} type="button" className="ux-lookup-row">
              <span>
                <strong>{unit.name}</strong>
                <small>{unit.role}</small>
              </span>
              <b>{unit.points} pts</b>
            </button>
          ))}
        </section>
        <details className="ux-source-section" open>
          <summary>
            <span>
              <Database size={16} />
              <strong>Sources</strong>
            </span>
          </summary>
          <button type="button" className="ux-import-source">
            <FileInput size={18} />
            <span>
              <strong>Import source</strong>
              <small>Add catalogue files or rules packs</small>
            </span>
          </button>
          <div className="ux-source-list">
            <button type="button" className="ux-source-row on">
              <span>
                <strong>{roster.faction}</strong>
                <small>{roster.system} · Imported today</small>
              </span>
              <Chip tone="valid">v42</Chip>
            </button>
          </div>
        </details>
      </ElementSection>

      <ElementSection title="Tools Hub">
        <div className="ux-tools-summary">
          <BudgetMeter roster={roster} label="Current list" />
          <div>
            <strong>{flattenUnits(roster).length} units</strong>
            <small>{roster.sections.length} roster sections</small>
          </div>
        </div>
        <div className="ux-tools-grid">
          {["Validation snapshot", "Export & share"].map((label) => (
            <button key={label} type="button" className="ux-tool-tile">
              <span className="ux-setting-icon">
                <Hammer size={18} />
              </span>
              <span>
                <strong>{label}</strong>
                <small>Roster utility</small>
              </span>
            </button>
          ))}
        </div>
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <Hammer size={15} />
            <strong>Checklist</strong>
          </div>
          <button type="button" className="ux-source-row on">
            <span className="ux-opt-check" aria-hidden />
            <span>
              <strong>Confirm detachment rules</strong>
              <small>Ready for review</small>
            </span>
          </button>
        </section>
      </ElementSection>

      <ElementSection title="Main Tab Bar">
        <div className="ux-elements-command-wrap">
          <nav className="ux-tabbar floating" aria-label="Main navigation">
            <button type="button" className="ux-tab active">
              <Layers size={20} />
              <span>Lists</span>
            </button>
            <button type="button" className="ux-tab">
              <Search size={20} />
              <span>Lookup</span>
            </button>
            <button type="button" className="ux-tab ux-tab-fab" aria-label="Add unit">
              <Plus size={22} />
            </button>
            <button type="button" className="ux-tab">
              <Hammer size={20} />
              <span>Tools</span>
            </button>
            <button type="button" className="ux-tab">
              <Database size={20} />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </ElementSection>

      <ElementSection title="Designer Rail Controls">
        <div className="rail-actions">
          <button className="rail-icon-button" type="button" aria-label="Screenshot">
            <Download size={17} />
          </button>
          <details className="archive-menu">
            <summary className="rail-icon-button">
              <Archive size={17} />
            </summary>
          </details>
        </div>
        <div className="view-icon-switch" role="group" aria-label="View">
          <button className="active" type="button" aria-label="Single">
            <Smartphone size={18} />
          </button>
          <button type="button" aria-label="All screens">
            <Rows3 size={18} />
          </button>
          <button type="button" aria-label="Elements">
            <PanelsTopLeft size={18} />
          </button>
        </div>
        <button className="display-switch-row" type="button" role="switch" aria-checked="true">
          <span>Design background</span>
          <span className="display-switch" aria-hidden="true" />
        </button>
        <details className="rail-disclosure workflow-editor" open>
          <summary>
            <h3>Workflow editor</h3>
          </summary>
          <button className="workflow-add-button" type="button">
            <Plus size={15} />
            Add workflow
          </button>
          <div className="screen-move-row">
            <span>
              <strong>Lookup</strong>
              <small>source</small>
            </span>
            <select value="lookup" onChange={() => undefined}>
              <option value="lookup">Lookup</option>
            </select>
            <button type="button" aria-label="Trash">
              <Trash2 size={14} />
            </button>
          </div>
        </details>
      </ElementSection>

      <ElementSection title="Workflow Board Group">
        <section className="workflow-board-group">
          <h2>Add & configure units</h2>
          <div className="workflow-board-label">Add unit</div>
        </section>
      </ElementSection>

      <ElementSection title="Glance Comments">
        <div className="glance-device-target" style={{ minHeight: 180, borderRadius: 18, background: "rgba(13, 17, 22, 0.94)" }}>
          <button type="button" className="comment-marker active" style={{ left: "42%", top: "38%" }}>
            C
          </button>
          <button type="button" className="comment-marker done" style={{ left: "62%", top: "62%" }}>
            E
          </button>
          <div className="comment-popover" style={{ left: "42%", top: "38%" }}>
            <textarea value="This is comment" onChange={() => undefined} />
            <small>button .ux-new-roster "New roster"</small>
            <div className="comment-actions">
              <button type="button">Save</button>
              <button type="button">Done</button>
              <button type="button" aria-label="Delete comment">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Comments List">
        <aside className="comments-drawer" style={{ maxHeight: "none" }}>
          <h3>Comments</h3>
          <article className="comment-list-row active">
            <button type="button" className="comment-row-head">
              <span>
                <MessageCircle size={14} />
              </span>
              <strong>Lists</strong>
              <small>point</small>
            </button>
            <textarea value="Clarify the empty state copy." onChange={() => undefined} />
            <div className="comment-actions">
              <button type="button">Done</button>
              <button type="button">Remove</button>
            </div>
          </article>
          <article className="comment-list-row done">
            <button type="button" className="comment-row-head">
              <span>
                <Check size={14} />
              </span>
              <strong>Tools</strong>
              <small>element</small>
            </button>
            <textarea value="Resolved visual spacing note." onChange={() => undefined} />
          </article>
        </aside>
      </ElementSection>

      <ElementSection title="Floating Command Bar">
        <div className="ux-elements-command-wrap">
          <div className="ux-cmd-bar">
            <button type="button" className="ux-cmd-tab" aria-label="Build">
              <Layers size={18} />
            </button>
            <button type="button" className="ux-cmd-input">
              <Command size={16} />
              <span>Add unit or ask for help...</span>
            </button>
            <button type="button" className="ux-cmd-send" aria-label="Run">
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </ElementSection>
    </>
  );
}

function OptionsSection({ selectedUnit, onToggleOption }: { selectedUnit: RosterUnit; onToggleOption: (id: string) => void }) {
  return (
    <ElementSection title="Options">
      <div className="ux-opt-groups">
        {(["weapon", "upgrade", "rule"] as const).map((group) => {
          const options = selectedUnit.options.filter((option) => option.group === group);
          if (!options.length) return null;
          return (
            <section className="ux-opt-group" key={group}>
              <h4>{group === "weapon" ? "Wargear" : group === "upgrade" ? "Upgrades" : "Special rules"}</h4>
              {options.map((option) => (
                <button key={option.id} type="button" className={`ux-opt-row ${option.selected ? "on" : ""}`} onClick={() => onToggleOption(option.id)}>
                  <span className="ux-opt-check" aria-hidden />
                  <span>{option.name}</span>
                  <em>{priceLabel(option.points)}</em>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </ElementSection>
  );
}

function UnitProfilesElement({ unit }: { unit: RosterUnit }) {
  const table = unit.detail?.profileTables[0];
  const row = table?.rows[0];
  if (!table || !row) return null;
  const compactColumns = table.columns.slice(0, 8);
  return (
    <ElementSection title="Unit Profiles">
      <div className="ux-profile-table-scroll">
        <table className="ux-profile-table">
          <thead>
            <tr>{compactColumns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr>
          </thead>
          <tbody className="ux-profile-row-group">
            <tr className="ux-profile-row-name">
              <th scope="rowgroup" colSpan={compactColumns.length}><strong>{row.name}</strong><small>{row.tags?.join(" · ")}</small></th>
            </tr>
            <tr className="ux-profile-row-stats">
              {row.values.slice(0, compactColumns.length).map((value, index) => <td key={compactColumns[index]}>{value}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </ElementSection>
  );
}

function ElementSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="element-section ux-element-section">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
