import { AlertTriangle, Copy, FileJson, FolderOpen, GitBranch, RotateCcw, Save, Trash2 } from "lucide-react";
import type { Roster, RosterUnit, ThemeMode, WorkflowScreen } from "../../types";
import { mockCatalogues, mockDetachments } from "../../data/mockRoster";
import { RosterBudgetBar } from "./RosterBudgetBar";
import { UnitConfigSheet } from "./UnitConfigSheet";

type Props = {
  screen: WorkflowScreen;
  roster: Roster;
  selectedUnit: RosterUnit;
  themeMode: ThemeMode;
  onToggleOption: (id: string) => void;
  onNavigateValidation: () => void;
};

export function WorkflowSurface({ screen, roster, selectedUnit, onToggleOption, onNavigateValidation }: Props) {
  if (screen === "drafts") return <DraftsWorkflow roster={roster} />;
  if (screen === "source") return <SourceWorkflow />;
  if (screen === "option-drilldown") return <OptionDrilldownWorkflow unit={selectedUnit} onToggleOption={onToggleOption} />;
  if (screen === "diagnostics") return <DiagnosticsWorkflow roster={roster} />;
  if (screen === "unit-detail") {
    return (
      <section className="workflow-full-sheet">
        <UnitConfigSheet unit={selectedUnit} onToggleOption={onToggleOption} onValidate={onNavigateValidation} />
      </section>
    );
  }
  return null;
}

function DraftsWorkflow({ roster }: { roster: Roster }) {
  const drafts = [
    { name: roster.name, updated: "Today 14:20", points: `${roster.pointsUsed}/${roster.pointsLimit}` },
    { name: "Plasma test branch", updated: "Yesterday 19:04", points: "910/1000" },
    { name: "Tournament backup", updated: "May 21 09:15", points: "995/1000" },
  ];

  return (
    <section className="workflow-surface">
      <div className="workflow-heading">
        <small>Open Draft</small>
        <h2>Roster drafts</h2>
      </div>
      <label className="workflow-input-row">
        <span>Draft name</span>
        <input value="Crusade Primary Detachment" readOnly />
      </label>
      <div className="workflow-action-grid">
        <button type="button"><Save size={16} />Save New</button>
        <button type="button"><FolderOpen size={16} />Load</button>
      </div>
      <div className="workflow-list">
        {drafts.map((draft) => (
          <div className="workflow-row" key={draft.name}>
            <span>
              <strong>{draft.name}</strong>
              <small>{draft.updated}</small>
            </span>
            <b>{draft.points}</b>
            <div className="workflow-row-actions">
              <button type="button">Overwrite</button>
              <button type="button">Rename</button>
              <button type="button" aria-label="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SourceWorkflow() {
  return (
    <section className="workflow-surface">
      <div className="workflow-heading">
        <small>Return to Source</small>
        <h2>BSData import source</h2>
      </div>
      <div className="workflow-list">
        {mockCatalogues.map((catalogue) => (
          <div className="workflow-row" key={catalogue.id}>
            <span>
              <strong>{catalogue.name}</strong>
              <small>{catalogue.updated} · {catalogue.status}</small>
            </span>
            <FileJson size={18} />
          </div>
        ))}
      </div>
      <div className="workflow-source-block">
        <strong>Force records</strong>
        {mockDetachments.map((detachment) => (
          <button key={detachment.id} type="button">
            <GitBranch size={15} />
            {detachment.name}
          </button>
        ))}
      </div>
      <button className="workflow-primary" type="button">
        <RotateCcw size={16} />
        Return to Simulator
      </button>
    </section>
  );
}

function OptionDrilldownWorkflow({ unit, onToggleOption }: { unit: RosterUnit; onToggleOption: (id: string) => void }) {
  return (
    <section className="workflow-surface">
      <div className="workflow-heading">
        <small>{unit.name} / Core Entities</small>
        <h2>Configure selections</h2>
      </div>
      <div className="workflow-count-row">
        <span>{unit.options.filter((option) => option.selected).length} selected</span>
        <span>{unit.options.length} available</span>
      </div>
      <div className="workflow-chip-row">
        {unit.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
      </div>
      <div className="workflow-list">
        {unit.options.map((option) => (
          <button className={`workflow-option-branch ${option.selected ? "selected" : ""}`} key={option.id} type="button" onClick={() => onToggleOption(option.id)}>
            <span>
              <strong>{option.name}</strong>
              <small>{option.group} · {option.points > 0 ? `+${option.points}` : "free"}</small>
            </span>
            <Copy size={15} />
          </button>
        ))}
      </div>
    </section>
  );
}

function DiagnosticsWorkflow({ roster }: { roster: Roster }) {
  const units = roster.sections.flatMap((section) => section.units.map((unit) => ({ ...unit, section: section.name })));
  const diagnostics = units.filter((unit) => unit.status !== "valid");

  return (
    <section className="workflow-surface">
      <div className="workflow-heading">
        <small>{diagnostics.length} active</small>
        <h2>Diagnostics</h2>
      </div>
      <RosterBudgetBar roster={roster} />
      <div className="workflow-list">
        {diagnostics.map((unit) => (
          <div className="workflow-diagnostic" key={unit.id}>
            <span className={`workflow-severity ${unit.status}`}>{unit.status}</span>
            <span>
              <strong>{unit.note ?? unit.name}</strong>
              <small>scope {unit.section} · code roster.slot · origin simulator</small>
            </span>
          </div>
        ))}
      </div>
      <div className="workflow-warning-block">
        <AlertTriangle size={17} />
        <span>
          <strong>Unsupported semantics</strong>
          <small>Some imported modifier conditions are approximated for preview.</small>
        </span>
      </div>
    </section>
  );
}
