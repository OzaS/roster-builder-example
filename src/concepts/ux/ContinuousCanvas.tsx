import { ChevronRight, Download, FileUp, Layers, Minus, Plus, Search, Share2, SlidersHorizontal, Sparkles } from "lucide-react";
import { mockCatalogues, mockDetachments, mockSystems } from "../../data/mockRoster";
import type { ConceptProps } from "../shared";
import { BudgetMeter, Chip, flattenUnits, priceLabel, rosterChecks, StatusGlyph, themeClass } from "./uxShared";

/**
 * Continuous Canvas — "kill the wizard".
 * The whole roster is one vertical scroll. Adding units never leaves the page:
 * a slot-scoped sheet slides up. Budget + slot fill stay pinned at the top.
 */
export function ContinuousCanvas(props: ConceptProps) {
  return (
    <div className={`ux-screen ux-canvas ${themeClass(props.themeMode)}`}>
      <CanvasHeader props={props} />
      <Body props={props} />
    </div>
  );
}

function CanvasHeader({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster).length;
  return (
    <header className="ux-canvas-head">
      <div className="ux-canvas-titlebar">
        <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
          <Layers size={18} />
        </button>
        <div className="ux-canvas-title">
          <strong>{props.roster.name}</strong>
          <small>
            {props.roster.faction} · {props.roster.system}
          </small>
        </div>
        <button type="button" className="ux-icon-btn" aria-label="Export" onClick={() => props.onNavigate("export")}>
          <Share2 size={18} />
        </button>
      </div>
      <BudgetMeter roster={props.roster} />
      {checks > 0 ? (
        <button type="button" className="ux-canvas-flag" onClick={() => props.onNavigate("validation")}>
          <StatusGlyph status="warning" size={15} />
          {checks} roster {checks === 1 ? "check" : "checks"} to review
          <ChevronRight size={15} />
        </button>
      ) : null}
    </header>
  );
}

function Body({ props }: { props: ConceptProps }) {
  if (props.screen === "library") return <Library props={props} />;
  if (props.screen === "system" || props.screen === "catalogue" || props.screen === "detachment") return <StartFlow props={props} />;
  if (props.screen === "add-unit") return <AddSheet props={props} />;
  if (props.screen === "validation") return <Checks props={props} />;
  if (props.screen === "export") return <Export props={props} />;
  if (props.screen === "unit-detail") return <UnitConfig props={props} />;
  return <Canvas props={props} />;
}

function Canvas({ props }: { props: ConceptProps }) {
  return (
    <main className="ux-canvas-body">
      {props.roster.sections.map((section) => {
        const filled = section.units.length;
        return (
          <section className="ux-canvas-slot" key={section.id}>
            <div className="ux-slot-head">
              <span>
                <strong>{section.name}</strong>
                <small>{section.required ? `${section.required} required` : `${filled} selected`}</small>
              </span>
              <span className="ux-slot-count">{filled}</span>
            </div>
            <div className="ux-slot-units">
              {section.units.map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  className={`ux-canvas-unit ${unit.status ?? "valid"}`}
                  onClick={() => props.onSelectUnit(unit.id)}
                >
                  <span className="ux-unit-dot" aria-hidden />
                  <span className="ux-unit-main">
                    <strong>{unit.name}</strong>
                    <small>{unit.role} · ×{unit.count}</small>
                  </span>
                  {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={15} /> : null}
                  <b className="ux-unit-pts">{unit.points}</b>
                </button>
              ))}
              <button
                type="button"
                className="ux-add-inline"
                onClick={() => {
                  props.onSelectSection(section.id);
                  props.onNavigate("add-unit");
                }}
              >
                <Plus size={15} />
                Add to {section.name}
              </button>
            </div>
          </section>
        );
      })}
    </main>
  );
}

function UnitConfig({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
  return (
    <main className="ux-canvas-body ux-config">
      <div className="ux-config-card">
        <div className="ux-config-top">
          <span>
            <small>{props.selectedSection.name}</small>
            <strong>{unit.name}</strong>
          </span>
          <div className="ux-stepper">
            <button type="button" aria-label="Fewer" onClick={() => props.onCountChange(unit.id, -1)}>
              <Minus size={15} />
            </button>
            <b>{unit.count}</b>
            <button type="button" aria-label="More" onClick={() => props.onCountChange(unit.id, 1)}>
              <Plus size={15} />
            </button>
          </div>
        </div>
        <div className="ux-keywords">
          {unit.keywords.map((k) => (
            <Chip key={k} tone="cool">
              {k}
            </Chip>
          ))}
        </div>
        {unit.note ? <p className="ux-config-note">{unit.note}</p> : null}
      </div>

      <div className="ux-opt-groups">
        {(["weapon", "upgrade", "rule"] as const).map((group) => {
          const opts = unit.options.filter((o) => o.group === group);
          if (opts.length === 0) return null;
          return (
            <section className="ux-opt-group" key={group}>
              <h4>{group === "weapon" ? "Wargear" : group === "upgrade" ? "Upgrades" : "Special rules"}</h4>
              {opts.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`ux-opt-row ${opt.selected ? "on" : ""}`}
                  onClick={() => props.onToggleOption(opt.id)}
                >
                  <span className="ux-opt-check" aria-hidden />
                  <span>{opt.name}</span>
                  <em>{priceLabel(opt.points)}</em>
                </button>
              ))}
            </section>
          );
        })}
      </div>

      <button type="button" className="ux-primary" onClick={props.onBack}>
        Done
      </button>
    </main>
  );
}

function AddSheet({ props }: { props: ConceptProps }) {
  const pool = props.selectedSection.units.length
    ? flattenUnits(props.roster).filter((u) => u.sectionId === props.selectedSectionId)
    : flattenUnits(props.roster);
  return (
    <main className="ux-canvas-body ux-sheet-body">
      <div className="ux-sheet">
        <div className="ux-sheet-grip" aria-hidden />
        <div className="ux-sheet-head">
          <strong>Add to {props.selectedSection.name}</strong>
          <small>{props.roster.pointsLimit - props.roster.pointsUsed} pts available</small>
        </div>
        <div className="ux-search">
          <Search size={16} />
          <input placeholder={`Search ${props.selectedSection.name} units`} readOnly />
        </div>
        <div className="ux-pool">
          {pool.map((unit) => (
            <button key={unit.id} type="button" className="ux-pool-row" onClick={() => props.onSelectUnit(unit.id)}>
              <span>
                <strong>{unit.name}</strong>
                <small>{unit.role}</small>
              </span>
              <span className="ux-pool-meta">
                <b>{unit.points} pts</b>
                <Chip tone={unit.availability === "available" ? "valid" : unit.availability === "limited" ? "warning" : "error"}>
                  {unit.availability}
                </Chip>
              </span>
              <Plus size={16} />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

function Checks({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster);
  return (
    <main className="ux-canvas-body">
      <div className="ux-section-label">Roster checks</div>
      {checks.length === 0 ? (
        <div className="ux-empty">
          <StatusGlyph status="valid" size={22} />
          <strong>All clear</strong>
          <small>This list is tournament-legal.</small>
        </div>
      ) : (
        checks.map((unit) => (
          <button key={unit.id} type="button" className={`ux-check-row ${unit.status}`} onClick={() => props.onSelectUnit(unit.id)}>
            <StatusGlyph status={unit.status} size={18} />
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.note ?? `${unit.sectionName} · ${unit.slotImpact}`}</small>
            </span>
            <ChevronRight size={16} />
          </button>
        ))
      )}
    </main>
  );
}

function Library({ props }: { props: ConceptProps }) {
  const rows = [
    { name: props.roster.name, sub: `${props.roster.faction} · ${props.roster.system}`, pts: `${props.roster.pointsUsed}/${props.roster.pointsLimit}` },
    { name: "Incursion Test List", sub: "Space Wolves · 10th", pts: "515/1000" },
    { name: "Narrative Boarding Patrol", sub: "Aeldari · 10th", pts: "490/500" },
  ];
  return (
    <main className="ux-canvas-body">
      <div className="ux-section-label">Your lists</div>
      <button type="button" className="ux-new-roster" onClick={() => props.onNavigate("system")}>
        <Plus size={18} />
        <span>
          <strong>New roster</strong>
          <small>Pick a system and start building</small>
        </span>
      </button>
      <button type="button" className="ux-new-roster ghost" onClick={() => props.onNavigate("system")}>
        <FileUp size={18} />
        <span>
          <strong>Import .rosz / .ros</strong>
          <small>From BattleScribe or a shared file</small>
        </span>
      </button>
      {rows.map((r) => (
        <button key={r.name} type="button" className="ux-list-card" onClick={() => props.onNavigate("overview")}>
          <span>
            <strong>{r.name}</strong>
            <small>{r.sub}</small>
          </span>
          <b>{r.pts}</b>
        </button>
      ))}
    </main>
  );
}

function StartFlow({ props }: { props: ConceptProps }) {
  return (
    <main className="ux-canvas-body">
      <div className="ux-section-label">Start a roster</div>
      <p className="ux-start-blurb">Three quick picks, then straight into building. No long wizard.</p>
      <StartGroup title="Game system">
        {mockSystems.map((s) => (
          <button key={s.id} type="button" className={`ux-start-row ${s.id === "wh40k-10" ? "on" : ""}`} onClick={() => props.onNavigate("catalogue")}>
            <span>
              <strong>{s.name}</strong>
              <small>{s.edition}</small>
            </span>
            <small>{s.catalogues} catalogues</small>
          </button>
        ))}
      </StartGroup>
      <StartGroup title="Catalogue">
        {mockCatalogues.map((c) => (
          <button key={c.id} type="button" className={`ux-start-row ${c.id === "dark-angels" ? "on" : ""}`} onClick={() => props.onNavigate("detachment")}>
            <span>
              <strong>{c.name}</strong>
              <small>{c.updated}</small>
            </span>
            <Chip tone={c.status === "Current" ? "valid" : "warning"}>{c.status}</Chip>
          </button>
        ))}
      </StartGroup>
      <StartGroup title="Detachment">
        {mockDetachments.map((d) => (
          <button key={d.id} type="button" className={`ux-start-row ${d.id === "crusade" ? "on" : ""}`} onClick={() => props.onNavigate("overview")}>
            <span>
              <strong>{d.name}</strong>
              <small>{d.slots}</small>
            </span>
            <Chip tone="cool">{d.fit}</Chip>
          </button>
        ))}
      </StartGroup>
      <button type="button" className="ux-primary" onClick={() => props.onNavigate("overview")}>
        <Sparkles size={16} />
        Build with smart defaults
      </button>
    </main>
  );
}

function StartGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ux-start-group">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function Export({ props }: { props: ConceptProps }) {
  const items = [
    { icon: Share2, label: "Share link", sub: "Read-only roster URL" },
    { icon: Download, label: "Export .rosz", sub: "BattleScribe-compatible" },
    { icon: SlidersHorizontal, label: "Print-ready brief", sub: "One-page summary" },
  ];
  return (
    <main className="ux-canvas-body">
      <div className="ux-export-card">
        <small>{props.roster.system}</small>
        <strong>{props.roster.name}</strong>
        <span>
          {props.roster.pointsUsed}/{props.roster.pointsLimit} pts · {props.roster.faction}
        </span>
      </div>
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button key={it.label} type="button" className="ux-list-card" onClick={() => props.onNavigate("overview")}>
            <span className="ux-export-row">
              <Icon size={18} />
              <span>
                <strong>{it.label}</strong>
                <small>{it.sub}</small>
              </span>
            </span>
            <ChevronRight size={16} />
          </button>
        );
      })}
    </main>
  );
}
