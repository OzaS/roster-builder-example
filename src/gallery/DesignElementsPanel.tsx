import { AlertTriangle, Bell, Check, Download, FileJson, Plus, Search, Shield, Sun } from "lucide-react";
import { BottomDock } from "../components/v2/BottomDock";
import { ForceRibbon } from "../components/v2/ForceRibbon";
import { InlineUnitRow } from "../components/v2/InlineUnitRow";
import { RosterBudgetBar } from "../components/v2/RosterBudgetBar";
import { UnitConfigSheet } from "../components/v2/UnitConfigSheet";
import { ValidationRail } from "../components/v2/ValidationRail";
import { mockRoster } from "../data/mockRoster";
import { schemeToCssVars } from "../theme/materialThemeBridge";
import type { PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode } from "../types";

type Props = {
  platform: PlatformPreview;
  themeMode: ThemeMode;
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
  platform,
  themeMode,
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  onSelectSection,
  onSelectUnit,
  onToggleOption,
  onCountChange,
}: Props) {
  return (
    <section className={`design-elements-panel dock-variant dock-glass ${themeMode} ${platform}`} style={schemeToCssVars(themeMode)}>
      <header className="elements-hero">
        <div>
          <small>Dock Glass system</small>
          <h1>Design Elements</h1>
          <p>Reusable controls and surfaces separated from workflow pages.</p>
        </div>
        <div className="elements-hero-actions">
          <button type="button"><Sun size={18} /></button>
          <button type="button"><Bell size={18} /></button>
        </div>
      </header>

      <ElementSection title="Material Tokens">
        <div className="token-grid">
          {[
            ["Primary", "var(--md-primary)", "var(--md-on-primary)"],
            ["Primary Container", "var(--md-primary-container)", "var(--md-on-primary-container)"],
            ["Surface", "var(--md-surface)", "var(--md-on-surface)"],
            ["Container", "var(--md-surface-container)", "var(--md-on-surface)"],
            ["High Container", "var(--md-surface-container-high)", "var(--md-on-surface)"],
            ["Error", "var(--md-error-container)", "var(--md-on-error-container)"],
          ].map(([label, bg, fg]) => (
            <div className="token-swatch" key={label} style={{ background: bg, color: fg }}>
              <strong>{label}</strong>
              <small>{bg}</small>
            </div>
          ))}
        </div>
      </ElementSection>

      <ElementSection title="Typography">
        <div className="type-stack">
          <span className="type-display">840 pts</span>
          <h2>Dark Angels</h2>
          <h3>Crusade Primary Detachment</h3>
          <p>Compact roster editing copy with enough contrast for dense game-night use.</p>
          <small>Metadata · status · helper text</small>
        </div>
      </ElementSection>

      <ElementSection title="Primary Surfaces">
        <div className="elements-two-col">
          <RosterBudgetBar roster={roster} />
          <div className="elements-card">
            <strong>Roster checks</strong>
            <span><Shield size={15} /> 2 active diagnostics</span>
            <span><Check size={15} /> {roster.pointsLimit - roster.pointsUsed} points open</span>
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Navigation">
        <ForceRibbon sections={roster.sections} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} />
        <div className="elements-dock-wrap">
          <BottomDock active="overview" onNavigate={() => undefined} />
        </div>
      </ElementSection>

      <ElementSection title="Buttons And Actions">
        <div className="element-button-row">
          <button className="element-primary" type="button"><Plus size={16} />Add unit</button>
          <button className="element-tonal" type="button"><Search size={16} />Find</button>
          <button className="element-danger" type="button"><AlertTriangle size={16} />Check</button>
          <button className="element-icon" type="button" aria-label="Download"><Download size={17} /></button>
        </div>
      </ElementSection>

      <ElementSection title="Unit Rows">
        <div className="dock-unit-stream">
          {selectedSection.units.map((unit) => (
            <InlineUnitRow
              key={unit.id}
              unit={unit}
              selected={unit.id === selectedUnit.id}
              onOpen={onSelectUnit}
              onCountChange={onCountChange}
            />
          ))}
        </div>
      </ElementSection>

      <ElementSection title="Configuration Sheet">
        <div className="elements-sheet-preview">
          <UnitConfigSheet unit={selectedUnit} onToggleOption={onToggleOption} onValidate={() => undefined} />
        </div>
      </ElementSection>

      <ElementSection title="Diagnostics">
        <ValidationRail roster={roster} onOpenUnit={onSelectUnit} />
      </ElementSection>

      <ElementSection title="Forms And Export">
        <div className="elements-form-grid">
          <label>
            <span>List name</span>
            <input value={mockRoster.name} readOnly />
          </label>
          <label>
            <span>Cost limit</span>
            <input value={`${mockRoster.pointsLimit}`} readOnly />
          </label>
          <button type="button"><FileJson size={17} /> Export JSON</button>
          <button type="button"><Download size={17} /> Download .rosz</button>
        </div>
      </ElementSection>
    </section>
  );
}

function ElementSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="element-section">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
