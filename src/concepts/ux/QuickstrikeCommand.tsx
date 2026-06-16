import { ArrowUp, Command, CornerDownLeft, Filter, Layers, ListChecks, Plus, Share2, Sparkles, Wand2, Zap } from "lucide-react";
import type { ConceptProps } from "../shared";
import { BudgetMeter, Chip, flattenUnits, priceLabel, rosterChecks, StatusGlyph, themeClass } from "./uxShared";

/**
 * Quickstrike Command — search-first.
 * A persistent command bar lives in the thumb zone. Instead of drilling
 * system -> catalogue -> org -> category, you type to add any unit anywhere.
 */
export function QuickstrikeCommand(props: ConceptProps) {
  return (
    <div className={`ux-screen ux-command ${themeClass(props.themeMode)}`}>
      <Body props={props} />
      <CommandBar props={props} />
    </div>
  );
}

function Body({ props }: { props: ConceptProps }) {
  if (props.screen === "add-unit") return <Palette props={props} />;
  if (props.screen === "unit-detail") return <Detail props={props} />;
  if (props.screen === "validation") return <Checks props={props} />;
  if (props.screen === "library" || props.screen === "system" || props.screen === "catalogue" || props.screen === "detachment" || props.screen === "export")
    return <Home props={props} />;
  return <Roster props={props} />;
}

function Topline({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster).length;
  return (
    <header className="ux-cmd-top">
      <div className="ux-cmd-title">
        <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
          <Layers size={18} />
        </button>
        <span>
          <strong>{props.roster.name}</strong>
          <small>{props.roster.faction}</small>
        </span>
        <button type="button" className="ux-icon-btn" aria-label="Export" onClick={() => props.onNavigate("export")}>
          <Share2 size={18} />
        </button>
      </div>
      <BudgetMeter roster={props.roster} />
      <div className="ux-cmd-stat-row">
        <Chip tone="valid">{flattenUnits(props.roster).length} units</Chip>
        <Chip tone={checks ? "warning" : "valid"}>{checks ? `${checks} checks` : "legal"}</Chip>
        <Chip tone="neutral">{props.roster.sections.length} slots</Chip>
      </div>
    </header>
  );
}

function Roster({ props }: { props: ConceptProps }) {
  return (
    <main className="ux-cmd-body">
      <Topline props={props} />
      {props.roster.sections.map((section) => (
        <section className="ux-cmd-group" key={section.id}>
          <div className="ux-cmd-group-head">
            <strong>{section.name}</strong>
            <small>{section.required ?? `${section.units.length}`}</small>
          </div>
          {section.units.map((unit) => (
            <button key={unit.id} type="button" className={`ux-cmd-row ${unit.status ?? "valid"}`} onClick={() => props.onSelectUnit(unit.id)}>
              <span className="ux-cmd-row-main">
                <strong>{unit.name}</strong>
                <small>{unit.role} · ×{unit.count}</small>
              </span>
              {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={14} /> : null}
              <b>{unit.points}</b>
            </button>
          ))}
        </section>
      ))}
    </main>
  );
}

function Palette({ props }: { props: ConceptProps }) {
  const units = flattenUnits(props.roster);
  const suggestions = [
    "objective holder under 120",
    "second battleline squad",
    "anti-tank for elites",
  ];
  return (
    <main className="ux-cmd-body ux-palette">
      <div className="ux-palette-query">
        <Command size={16} />
        <span>Add a legal objective holder for HQ</span>
        <kbd>
          <CornerDownLeft size={13} />
        </kbd>
      </div>
      <div className="ux-filter-row">
        {["Legal only", "Affordable", "Battleline", "Characters"].map((f, i) => (
          <button key={f} type="button" className={`ux-filter-pill ${i < 2 ? "on" : ""}`}>
            <Filter size={12} />
            {f}
          </button>
        ))}
      </div>
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
      <div className="ux-result-label">Matches</div>
      {units.map((unit) => (
        <button key={unit.id} type="button" className="ux-result-row" onClick={() => props.onSelectUnit(unit.id)}>
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
    </main>
  );
}

function Detail({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
  return (
    <main className="ux-cmd-body">
      <div className="ux-cmd-detail-head">
        <span>
          <small>{props.selectedSection.name}</small>
          <strong>{unit.name}</strong>
        </span>
        <b>{unit.points} pts</b>
      </div>
      <div className="ux-keywords">
        {unit.keywords.map((k) => (
          <Chip key={k} tone="cool">
            {k}
          </Chip>
        ))}
      </div>
      <div className="ux-result-label">Loadout</div>
      {unit.options.map((opt) => (
        <button key={opt.id} type="button" className={`ux-opt-row ${opt.selected ? "on" : ""}`} onClick={() => props.onToggleOption(opt.id)}>
          <span className="ux-opt-check" aria-hidden />
          <span>{opt.name}</span>
          <em>{priceLabel(opt.points)}</em>
        </button>
      ))}
      <button type="button" className="ux-primary" onClick={props.onBack}>
        Save loadout
      </button>
    </main>
  );
}

function Checks({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster);
  return (
    <main className="ux-cmd-body">
      <div className="ux-cmd-detail-head">
        <span>
          <small>Diagnostics</small>
          <strong>{checks.length ? `${checks.length} to resolve` : "Roster is legal"}</strong>
        </span>
        <ListChecks size={20} />
      </div>
      {checks.map((unit) => (
        <button key={unit.id} type="button" className={`ux-cmd-row ${unit.status}`} onClick={() => props.onSelectUnit(unit.id)}>
          <StatusGlyph status={unit.status} size={16} />
          <span className="ux-cmd-row-main">
            <strong>{unit.name}</strong>
            <small>{unit.note ?? unit.slotImpact}</small>
          </span>
        </button>
      ))}
      {checks.length === 0 ? (
        <div className="ux-empty">
          <StatusGlyph status="valid" size={22} />
          <strong>No problems found</strong>
        </div>
      ) : null}
    </main>
  );
}

function Home({ props }: { props: ConceptProps }) {
  return (
    <main className="ux-cmd-body">
      <div className="ux-cmd-hero">
        <Wand2 size={20} />
        <h2>What do you want to build?</h2>
        <p>Type a system, a faction, or just a unit. The bar takes you straight there.</p>
      </div>
      <div className="ux-result-label">Recent</div>
      {[props.roster.name, "Incursion Test List", "Narrative Boarding Patrol"].map((r, i) => (
        <button key={r} type="button" className="ux-list-card" onClick={() => props.onNavigate("overview")}>
          <span>
            <strong>{r}</strong>
            <small>{i === 0 ? props.roster.faction : "Saved roster"}</small>
          </span>
          <b>{i === 0 ? `${props.roster.pointsUsed}/${props.roster.pointsLimit}` : "500/1000"}</b>
        </button>
      ))}
    </main>
  );
}

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
