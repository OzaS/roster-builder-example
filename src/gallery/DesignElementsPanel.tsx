import { AlertTriangle, ArrowUp, Command, CornerDownLeft, Download, Filter, Layers, PanelsTopLeft, Plus, Search, Share2, Sparkles, Zap } from "lucide-react";
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
        <BudgetMeter roster={roster} />
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
        <div className="ux-wb-detail-head">
          <span>
            <small>{selectedSection.name}</small>
            <strong>{selectedUnit.name}</strong>
          </span>
          <span className="ux-wb-detail-pts">
            <b>{selectedUnit.points}</b>
            <small>points</small>
          </span>
        </div>
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

function ElementSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="element-section ux-element-section">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
