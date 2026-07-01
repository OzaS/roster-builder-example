import { AlertTriangle, Archive, ArrowLeft, ArrowUp, BarChart3, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Cog, Coins, Command, Copy, Database, Dice5, Download, Ellipsis, FileInput, Gamepad2, GripVertical, Hammer, Heart, ImagePlus, Languages, Layers, LibraryBig, Maximize2, MessageCircle, Minus, Moon, MoveRight, Palette, PanelsTopLeft, Pencil, Plus, RotateCcw, Rows3, Scale, Search, Smartphone, Sparkles, Split, Trash2, Upload, UserRound, Wand2, X } from "lucide-react";
import { createContext, useContext } from "react";
import { PhoneStatusBar } from "../components/DeviceFrame";
import { mockRosterReferences, referenceById } from "../data/mockRosterReferences";
import type { DesignElementGroup, DesignElements } from "../design-data/designData";
import type { ColorScheme, PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode } from "../types";
import { BudgetMeter, Chip, countSections, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph, SubscriptionGate } from "../concepts/ux/uxShared";
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
  elements: DesignElements;
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
  elements,
}: Props) {
  const rootClass = `design-elements-panel ux-screen ux-workbench ${shellClass(themeMode, colorScheme)} ${platform}`;

  return (
    <ElementCatalogContext.Provider value={elements}>
    <section className={rootClass}>
      <header className="elements-hero ux-elements-hero">
        <div>
          <small>{concept.eyebrow} · {elements.release}</small>
          <h1>{concept.name} Component Catalog</h1>
          <p>React Native product specifications, separated from the web-only tools used to review them.</p>
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

      <CatalogSummary groups={elements.groups} />
      <CatalogGroup groupId="product-ui">
      <TokenSection />
      <TypographySection roster={roster} />
      <ElementSection title="Phone Status Bar">
        <div className={`ux-phone-status-preview theme-${themeMode} ux-scheme-${colorScheme} status-bar-design`}>
          <PhoneStatusBar />
        </div>
      </ElementSection>
      </CatalogGroup>
      <WorkbenchElements roster={roster} selectedSection={selectedSection} selectedUnit={selectedUnit} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} onToggleOption={onToggleOption} />
    </section>
    </ElementCatalogContext.Provider>
  );
}

function TokenSection() {
  const tokens = [
    ["Accent", "var(--ux-accent)", "var(--ux-accent-ink)"],
    ["Accent 2", "var(--ux-accent-2)", "var(--ux-accent-ink)"],
    ["Accent · Secondary text", "var(--ux-accent)", "var(--ux-accent-ink-secondary)"],
    ["Accent · Tertiary text", "var(--ux-accent)", "var(--ux-accent-ink-tertiary)"],
    ["Surface", "var(--ux-surface)", "var(--ux-ink-primary)"],
    ["Surface · Secondary text", "var(--ux-surface)", "var(--ux-ink-secondary)"],
    ["Surface · Tertiary text", "var(--ux-surface)", "var(--ux-ink-tertiary)"],
    ["Surface 2", "var(--ux-surface-2)", "var(--ux-ink)"],
    ["Surface 3", "var(--ux-surface-3)", "var(--ux-ink)"],
    ["Cool", "var(--ux-cool)", "var(--ux-cool-ink)"],
    ["Warning", "var(--ux-warn)", "var(--ux-warn-ink)"],
    ["Error", "var(--ux-err)", "var(--ux-err-ink)"],
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
      <CatalogGroup groupId="product-ui" continuation>
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

      <ElementSection title="Subscription Gate">
        <div className="ux-elements-subscription-preview">
          <SubscriptionGate />
        </div>
      </ElementSection>

      <TabletWorkspaceElement roster={roster} />

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
        {roster.forces[0].sections.slice(0, 3).map((section) => (
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

      <ForceEntriesElement roster={roster} />

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

      <LoadoutEditorElement unit={profileUnit} />

      <UnitProfilesElement unit={profileUnit} />

      <ReferenceGlancesElement unit={profileUnit} />

      <ElementSection title="Unit Detail Toggle">
        <div className="ux-detail-mode-layer ux-elements-static">
          <div className="ux-detail-action-menu ux-elements-static" role="menu" aria-label="Unit actions">
            <button type="button" role="menuitem"><Pencil size={15} />Rename & favorite</button>
            <button type="button" role="menuitem"><Copy size={15} />Duplicate</button>
            <button type="button" role="menuitem"><MoveRight size={15} />Move</button>
          </div>
          <nav className="ux-detail-mode-bar ux-elements-static" aria-label="Unit detail view">
            <button type="button" className="ux-detail-mode-tab"><Cog size={18} /><span>Options</span></button>
            <button type="button" className="ux-detail-menu-fab" aria-label="More unit actions"><Ellipsis size={22} /></button>
            <button type="button" className="ux-detail-mode-tab active"><BookOpen size={18} /><span>Profile</span></button>
          </nav>
        </div>
      </ElementSection>

      <ElementSection title="Entry Action Menus">
        <div className="ux-force-action-menu" style={{ position: "static" }} role="menu"><button type="button"><Pencil size={14} />Rename & favorite</button></div>
      </ElementSection>

      <ElementSection title="Swipe Unit Actions">
        <div className="ux-swipe-unit open" style={{ maxWidth: 360 }}>
          <div className="ux-swipe-actions"><button type="button" className="delete"><Trash2 size={14} /><span>Delete</span></button><button type="button"><Pencil size={14} /><span>Rename</span></button><button type="button"><Copy size={14} /><span>Duplicate</span></button></div>
          <button type="button" className="ux-tree-unit ux-swipe-unit-content active" style={{ transform: "translateX(-200px)" }}><span className="ux-tree-rail" /><span className="ux-tree-unit-main"><span>{selectedUnit.customName ?? selectedUnit.name}</span><small>×{selectedUnit.count}</small></span><b>{selectedUnit.points}</b></button>
        </div>
      </ElementSection>

      <ElementSection title="Rename Dialog">
        <section className="ux-entry-dialog" style={{ borderRadius: 12 }}><header><span><strong>Rename unit</strong><small>A reusable snapshot will be saved to your Library.</small></span><button type="button"><X size={17} /></button></header><label><span>Custom name</span><input value="Veteran Spearhead" readOnly /></label><footer><button type="button">Cancel</button><button type="button" className="primary">Save favorite</button></footer></section>
      </ElementSection>

      <ElementSection title="Move Unit Dialog">
        <section className="ux-entry-dialog" style={{ borderRadius: 12 }}><header><span><strong>Move unit</strong><small>Compatible Battleline sections</small></span></header><div className="ux-destination-list"><button type="button"><span><strong>Dark Angels Auxiliary</strong><small>Unrestricted Collection · Battleline</small></span><MoveRight size={16} /></button></div></section>
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
          <span>{countSections(roster)} slots</span>
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

      <ElementSection title="Favorite Creation Sections">
        <section className="ux-favorite-creation"><div className="ux-result-label"><Heart size={13} />Favorite units</div><div><button type="button"><Heart size={14} /><span><strong>Veteran Spearhead</strong><small>{selectedUnit.points} pts · configured</small></span><Plus size={14} /></button></div></section>
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

      <ElementSection title="Preference Selectors">
        <div className="ux-preference-selector">
          <div className="ux-preference-row-wrap">
            <button type="button" className="ux-preference-row"><span className="ux-setting-icon"><Languages size={17} /></span><span className="ux-setting-text"><strong>Language</strong><small>English</small></span><ChevronDown size={17} /></button>
            <button type="button" className="ux-preference-upload" aria-label="Upload language pack"><Upload size={16} /></button>
          </div>
        </div>
        <div className="ux-preference-selector open">
          <div className="ux-preference-row-wrap"><button type="button" className="ux-preference-row" aria-expanded="true">
            <span className="ux-setting-icon"><Moon size={17} /></span>
            <span className="ux-setting-text"><strong>Dark mode</strong><small>System</small></span>
            <ChevronDown size={17} />
          </button></div>
          <div className="ux-preference-options" role="radiogroup" aria-label="Dark mode preview">
            <button type="button" role="radio" aria-checked="true" className="selected"><span>System</span><Check size={16} /></button>
            <button type="button" role="radio" aria-checked="false"><span>Light</span></button>
            <button type="button" role="radio" aria-checked="false"><span>Dark</span></button>
          </div>
        </div>
        <div className="ux-preference-selector"><div className="ux-preference-row-wrap">
          <button type="button" className="ux-preference-row"><span className="ux-setting-icon"><Palette size={17} /></span><span className="ux-setting-text"><strong>Color scheme</strong><small>Horus Heresy</small></span><ChevronDown size={17} /></button>
          <button type="button" className="ux-preference-upload" aria-label="Upload color scheme"><Upload size={16} /></button>
        </div></div>
      </ElementSection>

      <ElementSection title="Smart Search">
        <div className="ux-navbar-search ux-smart-search-input">
          <Wand2 size={15} />
          <input placeholder="Search units, upgrades, or ask…" readOnly />
        </div>
        <div className="ux-smart-segment">
          <button type="button" className="on"><Search size={14} />Find units</button>
          <button type="button"><Coins size={14} />Fill points</button>
        </div>
        <div className="ux-smart-scope">
          <button type="button" className="ux-smart-scope-pill on"><Layers size={14} />Roster</button>
          <button type="button" className="ux-smart-scope-pill"><LibraryBig size={14} />Library</button>
          <button type="button" className="ux-smart-scope-pill on"><Heart size={14} />Favorites</button>
        </div>
        <div className="ux-smart-cost-filter">
          <span className="ux-smart-cost-label">Cost</span>
          <div className="ux-smart-cost-pills">
            {["Any cost", "≤ 25", "≤ 50", "≤ 100"].map((label, index) => (
              <button key={label} type="button" className={`ux-filter-pill ${index === 0 ? "on" : ""}`}>{label}</button>
            ))}
          </div>
        </div>
        <button type="button" className="ux-smart-autoadd on">
          <span className="ux-smart-autoadd-dot" aria-hidden><Check size={11} /></span>
          Auto-add to roster
        </button>
        <div className="ux-pool ux-smart-results">
          <div className="ux-pool-row ux-smart-result">
            <span><strong>{selectedUnit.name}</strong><small>{selectedUnit.role} · {selectedSection.name}</small></span>
            <span className="ux-pool-meta"><b>{selectedUnit.points} pts</b></span>
            <button type="button" className="ux-smart-add" aria-label="Add"><Plus size={16} /></button>
          </div>
          <button type="button" className="ux-pool-row ux-smart-fill-row">
            <span><strong>Relic Shield</strong><small>{selectedUnit.name} · {selectedSection.name}</small></span>
            <span className="ux-pool-meta"><b>+15 pts</b></span>
            <ChevronRight size={16} />
          </button>
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

      <ElementSection title="Sources Management">
        <div className="ux-prototype-state"><small>Preview state</small><div><button type="button" className="active">Populated</button><button type="button">Empty</button></div></div>
        <button type="button" className="ux-add-source-primary"><Plus size={18} /><span><strong>Add sources</strong><small>Connect a repository or choose a popular source</small></span><ChevronRight size={17} /></button>
        <div className="ux-source-list ux-managed-source-list">
          <article className="ux-source-row on"><span><strong>{roster.faction}</strong><small>{roster.system} · Imported today</small></span><Chip tone="valid">v42</Chip></article>
        </div>
        <section className="ux-sources-empty"><span><Database size={25} /></span><strong>No sources installed</strong><small>Add a catalogue or rules repository to start building rosters.</small><button type="button"><Plus size={16} />Add sources</button></section>
      </ElementSection>

      <ElementSection title="Source Addition">
        <section className="ux-source-method">
          <div className="ux-source-method-heading"><span className="ux-setting-icon"><FileInput size={18} /></span><span><strong>Repository URL</strong><small>Enter a Git repository containing a source.</small></span></div>
          <div className="ux-source-url"><input aria-label="Repository URL example" placeholder="https://github.com/…" /><button type="button">Load</button></div>
        </section>
        <section className="ux-source-method">
          <div className="ux-result-label">Trusted repositories</div>
          <div className="ux-trusted-source-grid"><button type="button"><Database size={20} /><span><strong>BSData repositories</strong><small>Community catalogues</small></span><Plus size={16} /></button><button type="button"><Database size={20} /><span><strong>Official rules repository</strong><small>Verified catalogues</small></span><RotateCcw className="ux-spin" size={16} /></button></div>
        </section>
        <section className="ux-source-method"><div className="ux-result-label">Popular sources</div><div className="ux-popular-source-grid">{["Horus Heresy", "Warhammer 40,000", "Age of Sigmar", "The Old World"].map((source) => <button key={source} type="button"><Plus size={15} />{source}</button>)}</div></section>
      </ElementSection>

      <ElementSection title="Tools Workflow">
        <div className="ux-tools-grid ux-tools-grid-large">
          {[
            ["Roster analytics", "Shape, totals, and matchup posture", <BarChart3 size={18} />],
            ["Comparison", "Compare several entries side by side", <Scale size={18} />],
            ["Game tracker", "Roster game mode, rounds, and notes", <Gamepad2 size={18} />],
            ["Dice simulator", "Roll N dice with common side counts", <Dice5 size={18} />],
          ].map(([label, helper, icon]) => (
            <button key={label as string} type="button" className="ux-tool-tile">
              <span className="ux-setting-icon">
                {icon}
              </span>
              <span>
                <strong>{label}</strong>
                <small>{helper}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="ux-analytics-card">
          <svg className="ux-radar-chart" viewBox="0 0 184 184" role="img" aria-label="Roster analytics radar">
            <polygon points="92,22 158.6,70.4 133.1,148.6 50.9,148.6 25.4,70.4" className="ux-radar-ring" />
            <line x1="92" y1="92" x2="92" y2="22" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="158.6" y2="70.4" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="133.1" y2="148.6" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="50.9" y2="148.6" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="25.4" y2="70.4" className="ux-radar-axis" />
            <polygon points="92,47 132,79 120,130 60,136 52,79" className="ux-radar-fill" />
          </svg>
          <div className="ux-stat-grid">
            <div className="ux-tool-stat"><strong>{flattenUnits(roster).length}</strong><small>Units</small></div>
            <div className="ux-tool-stat"><strong>{countSections(roster)}</strong><small>Sections</small></div>
          </div>
        </div>
        <section className="ux-compare-table">
          <div className="ux-compare-head"><span>Entry</span><span>Pts</span><span>Models</span><span>Status</span></div>
          {[selectedUnit, roster.forces[0].sections[0].units[0]].filter(Boolean).map((unit) => (
            <button key={unit.id} type="button" className="ux-compare-row">
              <span><strong>{unit.name}</strong><small>{unit.role}</small></span>
              <b>{unit.points}</b>
              <b>{unit.count}</b>
              <Check size={15} />
            </button>
          ))}
        </section>
        <section className="ux-note-composer">
          <span><strong>Round note</strong><small>Pin a note and attach table photos</small></span>
          <button type="button" aria-label="Add image"><ImagePlus size={18} /></button>
        </section>
        <div className="ux-dice-stage">
          {[6, 2, 5].map((value, index) => <span key={`${value}-${index}`} className="ux-die">{value}</span>)}
        </div>
      </ElementSection>

      <ElementSection title="Favorite Library Cards">
        <section className="ux-favorite-library-section"><header><span className="ux-collection-icon"><Heart size={18} /></span><strong>Favorite units</strong></header><div className="ux-favorite-card-list"><article className="ux-favorite-card"><span><strong>Veteran Spearhead</strong><small>Battleline · {selectedUnit.points} pts</small></span><div><button type="button"><Plus size={14} />Add</button><button type="button"><Trash2 size={14} /></button></div></article></div></section>
      </ElementSection>

      <ElementSection title="App & Account">
        <section className="ux-account-card">
          <span className="ux-account-avatar"><UserRound size={22} /></span>
          <span>
            <strong>Alex Morgan</strong>
            <small>alex@example.com</small>
          </span>
        </section>
        <button type="button" className="ux-app-nav-row">
          <span className="ux-setting-icon"><Cog size={17} /></span>
          <span>
            <strong>Settings</strong>
            <small>Search, assistance, and sources</small>
          </span>
          <ChevronRight size={17} />
        </button>
        <div className="ux-app-footer ux-elements-app-footer">
          <strong>Roster Builder</strong>
          <small>Version 1.0.0</small>
        </div>
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
              <LibraryBig size={20} />
              <span>Library</span>
            </button>
          </nav>
        </div>
      </ElementSection>

      <StateMatrixElement />
      </CatalogGroup>

      <CatalogGroup groupId="gallery-ui">
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
      </CatalogGroup>
    </>
  );
}

function TabletWorkspaceElement({ roster }: { roster: Roster }) {
  const pointsLeft = Math.max(0, roster.pointsLimit - roster.pointsUsed);
  const progress = Math.min(100, (roster.pointsUsed / roster.pointsLimit) * 100);

  return (
    <ElementSection title="Tablet Workspace Controls">
      <div className="ux-elements-tablet-workspace">
        <header className="ux-elements-tablet-navbar">
          <button type="button" className="ux-icon-btn" aria-label="Lists"><Layers size={17} /></button>
          <label className="ux-navbar-search">
            <Search size={15} />
            <input value="terminator" aria-label="Search roster" readOnly />
            <X size={15} />
          </label>
          <span className="ux-roster-header-points"><b>{roster.pointsUsed} / {roster.pointsLimit}</b><small>{pointsLeft} pts left</small></span>
          <button type="button" className="ux-icon-btn" aria-label="Workspace layout"><PanelsTopLeft size={17} /></button>
          <span className="ux-elements-progress"><i style={{ width: `${progress}%` }} /></span>
        </header>

        <div className="ux-elements-workspace-body">
          <aside className="ux-elements-pane"><strong>Roster</strong><small>Forces and units</small></aside>
          <div className="ux-pane-divider" role="separator" aria-label="Resize roster panel">
            <GripVertical size={13} />
            <button type="button" aria-label="Hide roster panel"><ChevronLeft size={13} /></button>
          </div>
          <main className="ux-elements-pane detail"><strong>Detail</strong><small>Selected unit workspace</small></main>
          <div className="ux-pane-divider collapsed" role="separator" aria-label="Restore validation panel">
            <GripVertical size={13} />
            <button type="button" aria-label="Restore validation panel"><ChevronLeft size={13} /></button>
          </div>
          <aside className="ux-elements-pane collapsed"><strong>Validation</strong></aside>
        </div>

        <div className="ux-elements-layout-menu">
          <button type="button"><Maximize2 size={14} /> Focus Detail</button>
          <button type="button"><PanelsTopLeft size={14} /> Restore three panels</button>
          <button type="button"><RotateCcw size={14} /> Reset widths</button>
        </div>

        <div className="ux-elements-dock-preview">
          <button type="button" className="ux-dock-handle" aria-label="Show navigation"><span /></button>
          <nav className="ux-elements-mini-dock" aria-label="Tablet navigation">
            <button type="button"><Layers size={17} /><small>Lists</small></button>
            <button type="button"><Search size={17} /><small>Lookup</small></button>
            <button type="button"><Hammer size={17} /><small>Tools</small></button>
          </nav>
        </div>
      </div>
    </ElementSection>
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

function ReferenceGlancesElement({ unit }: { unit: RosterUnit }) {
  const reference = mockRosterReferences.find((item) => item.id === "pistol") ?? mockRosterReferences[0];
  const related = (reference.relatedIds ?? []).map(referenceById).filter(Boolean);
  return (
    <ElementSection title="Reference Glances">
      <div className="ux-reference-glance-stack ux-elements-static has-second">
        <section className="ux-reference-glance-card unit under" aria-hidden="true">
          <header><span><small>Unit profile</small><strong>{unit.customName ?? unit.name}</strong></span><button type="button" aria-label="Close unit glance"><X size={18} /></button></header>
          <div className="ux-reference-glance-body">
            <div className="ux-unit-profile in-glance">
              <details className="ux-profile-section" open><summary><strong>Traits</strong><ChevronDown size={15} /></summary><div className="ux-profile-section-body"><div className="ux-profile-tag-list">{unit.detail?.traits.slice(0, 3).map((trait) => <button type="button" className="ux-reference-tag" key={trait}>{trait}</button>)}</div></div></details>
              <details className="ux-profile-section" open><summary><strong>Rules</strong><ChevronDown size={15} /></summary><div className="ux-profile-section-body"><div className="ux-profile-tag-list">{unit.detail?.rules.slice(0, 5).map((rule) => <button type="button" className="ux-reference-tag" key={rule}>{rule}</button>)}</div></div></details>
            </div>
          </div>
        </section>
        <section className="ux-reference-glance-card reference active" role="dialog" aria-label={`${reference.label} reference glance`}>
          <header><span><small>{reference.kind}</small><strong>{reference.label}</strong></span><button type="button" aria-label="Close reference glance"><X size={18} /></button></header>
          <div className="ux-reference-glance-body"><article className="ux-reference-definition"><section><strong>Description</strong><p>{reference.description}</p></section><section><strong>Related</strong><div className="ux-profile-tag-list">{related.map((item) => item ? <button type="button" className="ux-reference-tag" key={item.id}>{item.label}</button> : null)}</div></section></article></div>
        </section>
      </div>
    </ElementSection>
  );
}

function LoadoutEditorElement({ unit }: { unit: RosterUnit }) {
  const group = unit.detail?.loadoutGroups.find((item) => item.canSplit) ?? unit.detail?.loadoutGroups[0];
  const slot = group?.slots.find((item) => item.id === "melee") ?? group?.slots[0];
  if (!group || !slot) return null;
  return (
    <ElementSection title="Loadout Groups & Selector">
      <article className="ux-loadout-group expanded">
        <header className="ux-loadout-group-head">
          <button type="button" className="ux-loadout-group-toggle" aria-expanded="true">
            <span><strong>{group.name} ×{group.count}</strong><small>Bolt pistol · Chainsword</small></span>
            <span className="ux-loadout-group-meta"><small>{group.count * group.basePointsPerModel} pts</small><ChevronDown size={15} /></span>
          </button>
          <div className="ux-loadout-group-actions">
            <div className="ux-loadout-count-controls">
              <button type="button" aria-label={`Decrease ${group.name} count`}><Minus size={13} /></button>
              <strong>{group.count}</strong>
              <button type="button" aria-label={`Increase ${group.name} count`}><Plus size={13} /></button>
            </div>
            <button type="button" className="ux-loadout-split" aria-label={`Split one ${group.name}`} title="Split one model into a new group"><Split size={14} /></button>
          </div>
        </header>
        <div className="ux-loadout-slots">
          {group.slots.map((item) => {
            const choice = item.choices.find((candidate) => candidate.id === item.selectedChoiceId);
            return choice ? (
              <button type="button" className="ux-loadout-slot" key={item.id}>
                <small>{item.label}</small><strong>{choice.name}</strong><em>{choice.points ? `+${choice.points} pts` : "Included"}</em><ChevronRight size={15} />
              </button>
            ) : null;
          })}
        </div>
      </article>
      <div className="ux-loadout-selector-layer ux-elements-static">
        <section className="ux-loadout-selector" role="dialog" aria-modal="true" aria-label={`Choose ${slot.label.toLowerCase()}`}>
          <header><span><strong>Choose {slot.label.toLowerCase()}</strong><small>{group.name} ×{group.count}</small></span><button type="button" aria-label="Close selector"><X size={18} /></button></header>
          <label className="ux-loadout-selector-search"><Search size={15} /><input placeholder={`Search ${slot.label.toLowerCase()} choices`} readOnly /></label>
          <div className="ux-loadout-choice-list">
            {slot.choices.map((choice) => {
              const selected = choice.id === slot.selectedChoiceId;
              return (
                <button type="button" className={`ux-loadout-choice ${selected ? "selected" : ""}`} key={choice.id}>
                  <span><strong>{choice.name}</strong><small>{choice.points ? `+${choice.points} pts per model` : "Included"}</small></span>
                  <span className="ux-loadout-choice-check" aria-hidden>{selected ? <Check size={15} /> : null}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </ElementSection>
  );
}

function ForceEntriesElement({ roster }: { roster: Roster }) {
  return (
    <ElementSection title="Force Entries & Creation">
      <div className="ux-force-list ux-elements-force-list">
        {roster.forces.map((force, index) => (
          <section className={`ux-force-entry ${index === 0 ? "open selected" : ""}`} key={force.id}>
            <button type="button" className="ux-force-summary" aria-expanded={index === 0}>
              <ChevronDown size={15} />
              <span><strong>{force.name}</strong><small>{force.detachment}</small></span>
              <b>{force.points} pts</b>
            </button>
          </section>
        ))}
      </div>
      <button type="button" className="ux-force-add"><Plus size={14} />Add force</button>
      <section className="ux-force-draft" aria-label="New force">
        <header><strong>New force</strong><button type="button" aria-label="Cancel force creation"><X size={15} /></button></header>
        <label><span>Force</span><select defaultValue="dark-angels"><option value="dark-angels">Dark Angels</option></select></label>
        <label><span>Organization</span><select defaultValue="crusade"><option value="crusade">Crusade Force Organization Chart</option></select></label>
        <div className="ux-force-draft-actions"><button type="button">Cancel</button><button type="button" className="primary">Add force</button></div>
      </section>
      <div className="ux-force-selector-layer ux-elements-static">
        <section className="ux-force-selector" role="dialog" aria-modal="true" aria-label="Add force">
          <header><span><strong>Add force</strong><small>Choose a source and organization</small></span><button type="button" aria-label="Close force selector"><X size={18} /></button></header>
          <div className="ux-force-selector-body">
            <label className="ux-loadout-selector-search"><Search size={15} /><input placeholder="Search forces" readOnly /></label>
            <div className="ux-force-choice-list"><button type="button" className="selected"><span><strong>Dark Angels</strong><small>v42 · Current</small></span><Check size={15} /></button><button type="button"><span><strong>Adeptus Astartes</strong><small>v19 · Current</small></span></button></div>
            <div className="ux-force-detachments"><strong>Organization</strong><button type="button" className="selected"><span><b>Crusade Force Organization Chart</b><small>11 slots · Recommended</small></span><Check size={15} /></button></div>
          </div>
          <footer><button type="button">Cancel</button><button type="button" className="primary">Add force</button></footer>
        </section>
      </div>
    </ElementSection>
  );
}

const ElementCatalogContext = createContext<DesignElements | null>(null);

function CatalogSummary({ groups }: { groups: DesignElementGroup[] }) {
  const product = groups.find((group) => group.id === "product-ui");
  const ready = product?.sections.filter((section) => section.status === "ready-for-rn").length ?? 0;
  const coveredScreens = new Set(product?.sections.flatMap((section) => section.screens) ?? []);
  return (
    <aside className="ux-catalog-summary" aria-label="V1 React Native handoff summary">
      <div><strong>{product?.sections.length ?? 0}</strong><small>Product specifications</small></div>
      <div><strong>{ready}</strong><small>Ready for RN</small></div>
      <div><strong>{coveredScreens.size}</strong><small>Screens covered</small></div>
      <div><strong>{groups.find((group) => group.id === "gallery-ui")?.sections.length ?? 0}</strong><small>Gallery-only tools</small></div>
    </aside>
  );
}

function CatalogGroup({ groupId, continuation = false, children }: { groupId: DesignElementGroup["id"]; continuation?: boolean; children: React.ReactNode }) {
  const catalog = useContext(ElementCatalogContext);
  const group = catalog?.groups.find((candidate) => candidate.id === groupId);
  return (
    <section className={`ux-catalog-group ${groupId}`} aria-label={group?.label}>
      {!continuation && group ? (
        <header className="ux-catalog-group-head">
          <span>{groupId === "product-ui" ? "React Native target" : "Web gallery only"}</span>
          <h2>{group.label}</h2>
          <p>{group.description}</p>
        </header>
      ) : null}
      {children}
    </section>
  );
}

function StateMatrixElement() {
  const states = [
    ["Loading", "Updating roster…", "loading"],
    ["Empty", "No units match these filters.", "empty"],
    ["Offline", "Showing saved roster data.", "offline"],
    ["Error", "Couldn’t update the roster.", "error"],
    ["Disabled", "Unavailable for this force.", "disabled"],
    ["Subscriber", "Supporter feature", "locked"],
  ];
  return (
    <ElementSection title="Component State Matrix">
      <div className="ux-state-matrix">
        {states.map(([title, copy, state]) => (
          <article className={`ux-state-card ${state}`} key={state}>
            <span className="ux-state-dot" aria-hidden />
            <strong>{title}</strong>
            <small>{copy}</small>
            {state === "error" || state === "offline" ? <button type="button">Try again</button> : null}
          </article>
        ))}
      </div>
    </ElementSection>
  );
}

function ElementSection({ title, children }: { title: string; children: React.ReactNode }) {
  const catalog = useContext(ElementCatalogContext);
  const specification = catalog?.groups.flatMap((group) => group.sections).find((section) => section.title === title);
  return (
    <article className="element-section ux-element-section" data-element-id={specification?.id}>
      <header className="ux-element-heading">
        <div>
          <h2>{title}</h2>
          {specification ? <code>{specification.id}</code> : null}
        </div>
        {specification ? (
          <div className="ux-element-badges" aria-label="Component specification status">
            <span>{specification.level}</span>
            <span className={`status-${specification.status}`}>{specification.status}</span>
            <span>{specification.platforms.join(" + ")}</span>
          </div>
        ) : null}
      </header>
      {specification ? (
        <details className="ux-element-spec">
          <summary>React Native handoff · {specification.states.length} states · {specification.screens.length || "shared"} screen{specification.screens.length === 1 ? "" : "s"}</summary>
          <div>
            <p><strong>States</strong><span>{specification.states.join(" · ")}</span></p>
            <p><strong>Coverage</strong><span>{specification.screens.length ? specification.screens.join(" · ") : "Shared foundation"}</span></p>
            {specification.reactNative ? <p><strong>Component</strong><span><code>{specification.reactNative.component}</code> — {specification.reactNative.behavior}</span></p> : <p><strong>Implementation</strong><span>Gallery-only; exclude from the mobile application.</span></p>}
            {specification.reactNative ? <p><strong>Accessibility</strong><span>{specification.reactNative.accessibility}</span></p> : null}
          </div>
        </details>
      ) : null}
      {children}
    </article>
  );
}
