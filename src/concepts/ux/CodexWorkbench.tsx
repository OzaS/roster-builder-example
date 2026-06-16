import { AlertTriangle, ChevronDown, Download, Layers, PanelsTopLeft, Plus, Search } from "lucide-react";
import type { ConceptProps } from "../shared";
import { BudgetMeter, Chip, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph } from "./uxShared";

/**
 * Codex Workbench — master/detail for power users.
 * The roster tree is always present (left on tablet). Selecting a unit edits it
 * live in the detail pane without losing the list context, and a validation rail
 * keeps roster legality visible. Deep nesting becomes one persistent tree.
 */
export function CodexWorkbench(props: ConceptProps) {
  const showingDetail = props.screen === "unit-detail";
  const showingChecks = props.screen === "validation";
  return (
    <div className={`ux-screen ux-workbench ${shellClass(props.themeMode, props.colorScheme)} ${showingDetail ? "show-detail" : ""} ${showingChecks ? "show-checks" : ""}`}>
      <header className="ux-wb-top">
        <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
          <Layers size={18} />
        </button>
        <div className="ux-wb-title">
          <strong>{props.roster.name}</strong>
          <small>{props.roster.faction} · {props.roster.system}</small>
        </div>
        <button type="button" className="ux-icon-btn" aria-label="Export" onClick={() => props.onNavigate("export")}>
          <Download size={18} />
        </button>
      </header>
      <div className="ux-wb-budget">
        <BudgetMeter roster={props.roster} />
      </div>
      <div className="ux-wb-layout">
        <Tree props={props} />
        <Detail props={props} />
        <Rail props={props} />
      </div>
    </div>
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
  return (
    <section className="ux-wb-detail">
      <div className="ux-wb-detail-head">
        <span>
          <small>Add to</small>
          <strong>{props.selectedSection.name}</strong>
        </span>
        <PanelsTopLeft size={20} />
      </div>
      <div className="ux-wb-search">
        <Search size={15} />
        <input placeholder={`Search ${props.selectedSection.name}`} readOnly />
      </div>
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
