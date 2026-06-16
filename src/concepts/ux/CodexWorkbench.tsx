import { AlertTriangle, ArrowLeft, ArrowUp, ChevronDown, Cog, Command, Download, Layers, PanelsTopLeft, Plus, Search, Sparkles, Wand2 } from "lucide-react";
import type { ConceptProps } from "../shared";
import { BudgetMeter, Chip, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph } from "./uxShared";

/**
 * Codex Workbench — master/detail for power users, now the single merged design.
 * The roster tree is always present (left on tablet). Selecting a unit edits it
 * live in the detail pane without losing the list context, and a validation rail
 * keeps roster legality visible.
 *
 * Folded in from the archived Quickstrike direction: a library entry screen, and
 * a "Smart search & suggestions" tier (suggestion chips + a floating command bar)
 * that the player turns on from Settings.
 */
export function CodexWorkbench(props: ConceptProps) {
  const shell = `ux-screen ux-workbench ${shellClass(props.themeMode, props.colorScheme)}`;

  if (props.screen === "library") {
    return (
      <div className={shell}>
        <Library props={props} />
      </div>
    );
  }

  if (props.screen === "settings") {
    return (
      <div className={shell}>
        <Settings props={props} />
      </div>
    );
  }

  const showingDetail = props.screen === "unit-detail";
  const showingChecks = props.screen === "validation";
  const smart = props.smartSearch ?? false;
  return (
    <div className={`${shell} ${showingDetail ? "show-detail" : ""} ${showingChecks ? "show-checks" : ""} ${smart ? "ux-smart" : ""}`}>
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
      {smart ? <CommandBar props={props} /> : null}
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
  const smart = props.smartSearch ?? false;
  const section = props.selectedSection.name;
  const suggestions = [`legal ${section.toLowerCase()} under 120`, "fills this slot", "best value pick"];
  return (
    <section className="ux-wb-detail">
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

/** Library / home entry screen, ported from the archived Quickstrike direction. */
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
        <button type="button" className="ux-new-roster" onClick={() => props.onNavigate("overview")}>
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

/** Settings screen housing the "Smart search & suggestions" toggle. */
function Settings({ props }: { props: ConceptProps }) {
  const smart = props.smartSearch ?? false;
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top reversed">
        <button type="button" className="ux-icon-btn" aria-label="Back" onClick={() => props.onNavigate("library")}>
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
          When on, a floating command bar appears in the workbench and the add-unit menu offers quick suggestions for the current slot.
        </p>
      </div>
    </>
  );
}

/** Floating command bar, ported from the archived Quickstrike direction. */
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
