import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Layers, Minus, Plus, Share2, Sparkles, X } from "lucide-react";
import type { CSSProperties } from "react";
import type { ConceptProps } from "../shared";
import { budget, Chip, flattenUnits, priceLabel, rosterChecks, StatusGlyph, themeClass } from "./uxShared";

/**
 * Field Cards — gesture-native, thumb-first.
 * Units are big cards. Swipe right to add, left to dismiss, tap to flip for
 * loadout. A radial budget arc anchors the top so points are always felt.
 * Minimises precise tapping on tiny rows.
 */
export function FieldCards(props: ConceptProps) {
  return (
    <div className={`ux-screen ux-deck ${themeClass(props.themeMode)}`}>
      <DeckHeader props={props} />
      <Body props={props} />
      <SectionPager props={props} />
    </div>
  );
}

function DeckHeader({ props }: { props: ConceptProps }) {
  const b = budget(props.roster);
  return (
    <header className="ux-deck-head">
      <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
        <Layers size={18} />
      </button>
      <div className="ux-deck-arc" style={{ "--pct": `${b.percent}` } as CSSProperties}>
        <div className="ux-deck-arc-inner">
          <strong>{b.used}</strong>
          <small>/ {b.limit}</small>
        </div>
      </div>
      <div className="ux-deck-titles">
        <strong>{props.roster.name}</strong>
        <small>{b.over ? `${b.used - b.limit} over budget` : `${b.open} pts open`}</small>
      </div>
      <button type="button" className="ux-icon-btn" aria-label="Export" onClick={() => props.onNavigate("export")}>
        <Share2 size={18} />
      </button>
    </header>
  );
}

function Body({ props }: { props: ConceptProps }) {
  if (props.screen === "unit-detail") return <FlippedCard props={props} />;
  if (props.screen === "add-unit") return <AddDeck props={props} />;
  if (props.screen === "validation") return <CheckDeck props={props} />;
  if (props.screen === "library" || props.screen === "system" || props.screen === "catalogue" || props.screen === "detachment" || props.screen === "export")
    return <ListDeck props={props} />;
  return <RosterDeck props={props} />;
}

function RosterDeck({ props }: { props: ConceptProps }) {
  const section = props.selectedSection;
  return (
    <main className="ux-deck-body">
      <div className="ux-deck-slot-label">
        <strong>{section.name}</strong>
        <small>{section.required ? `${section.required} required` : `${section.units.length} in list`}</small>
      </div>
      <div className="ux-card-stack">
        {section.units.map((unit, i) => (
          <article
            key={unit.id}
            className={`ux-card ${unit.status ?? "valid"}`}
            style={{ "--i": i } as CSSProperties}
            onClick={() => props.onSelectUnit(unit.id)}
          >
            <div className="ux-card-top">
              <Chip tone="neutral">{unit.role}</Chip>
              {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={16} /> : null}
            </div>
            <h2>{unit.name}</h2>
            <div className="ux-card-keywords">
              {unit.keywords.slice(0, 3).map((k) => (
                <span key={k}>{k}</span>
              ))}
            </div>
            <div className="ux-card-foot">
              <span className="ux-card-qty">
                <button
                  type="button"
                  aria-label="Remove one"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onCountChange(unit.id, -1);
                  }}
                >
                  <Minus size={14} />
                </button>
                <b>×{unit.count}</b>
                <button
                  type="button"
                  aria-label="Add one"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onCountChange(unit.id, 1);
                  }}
                >
                  <Plus size={14} />
                </button>
              </span>
              <strong className="ux-card-pts">{unit.points}</strong>
            </div>
          </article>
        ))}
        <button
          type="button"
          className="ux-deck-add-card"
          onClick={() => {
            props.onNavigate("add-unit");
          }}
        >
          <Plus size={20} />
          Add to {section.name}
        </button>
      </div>
    </main>
  );
}

function FlippedCard({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
  return (
    <main className="ux-deck-body">
      <article className={`ux-card flipped ${unit.status ?? "valid"}`}>
        <div className="ux-card-top">
          <span>
            <small>{props.selectedSection.name}</small>
            <h2>{unit.name}</h2>
          </span>
          <strong className="ux-card-pts">{unit.points}</strong>
        </div>
        <div className="ux-flip-options">
          {unit.options.map((opt) => (
            <button key={opt.id} type="button" className={`ux-flip-opt ${opt.selected ? "on" : ""}`} onClick={() => props.onToggleOption(opt.id)}>
              <span className="ux-flip-check" aria-hidden>
                {opt.selected ? <Check size={13} /> : null}
              </span>
              <span>{opt.name}</span>
              <em>{priceLabel(opt.points)}</em>
            </button>
          ))}
        </div>
      </article>
      <button type="button" className="ux-primary" onClick={props.onBack}>
        Back to deck
      </button>
    </main>
  );
}

function AddDeck({ props }: { props: ConceptProps }) {
  const pool = props.selectedSection.units;
  return (
    <main className="ux-deck-body">
      <div className="ux-swipe-hint">
        <span className="dismiss">
          <X size={14} /> swipe to skip
        </span>
        <span className="keep">
          add <Check size={14} />
        </span>
      </div>
      <div className="ux-card-stack">
        {pool.map((unit, i) => (
          <article key={unit.id} className="ux-card pool" style={{ "--i": i } as CSSProperties}>
            <div className="ux-card-top">
              <Chip tone={unit.availability === "available" ? "valid" : unit.availability === "limited" ? "warning" : "error"}>{unit.availability}</Chip>
              <strong className="ux-card-pts">{unit.points}</strong>
            </div>
            <h2>{unit.name}</h2>
            <p className="ux-card-blurb">{unit.slotImpact}</p>
            <div className="ux-card-swipe-actions">
              <button type="button" className="dismiss" aria-label="Skip" onClick={() => props.onNavigate("overview")}>
                <X size={20} />
              </button>
              <span className="ux-card-swipe-mid">
                <ArrowLeftRight size={15} />
              </span>
              <button type="button" className="keep" aria-label="Add" onClick={() => props.onSelectUnit(unit.id)}>
                <Check size={20} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function CheckDeck({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster);
  return (
    <main className="ux-deck-body">
      <div className="ux-deck-slot-label">
        <strong>Roster checks</strong>
        <small>{checks.length ? `${checks.length} to resolve` : "all clear"}</small>
      </div>
      {checks.length === 0 ? (
        <div className="ux-empty">
          <StatusGlyph status="valid" size={24} />
          <strong>Legal list</strong>
        </div>
      ) : (
        <div className="ux-card-stack">
          {checks.map((unit, i) => (
            <article key={unit.id} className={`ux-card check ${unit.status}`} style={{ "--i": i } as CSSProperties} onClick={() => props.onSelectUnit(unit.id)}>
              <div className="ux-card-top">
                <StatusGlyph status={unit.status} size={18} />
                <Chip tone={unit.status === "error" ? "error" : "warning"}>{unit.status}</Chip>
              </div>
              <h2>{unit.name}</h2>
              <p className="ux-card-blurb">{unit.note ?? unit.slotImpact}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function ListDeck({ props }: { props: ConceptProps }) {
  const rows = [
    { name: props.roster.name, sub: props.roster.faction, pts: `${props.roster.pointsUsed}/${props.roster.pointsLimit}` },
    { name: "Incursion Test List", sub: "Space Wolves", pts: "515/1000" },
    { name: "Narrative Boarding Patrol", sub: "Aeldari", pts: "490/500" },
  ];
  return (
    <main className="ux-deck-body">
      <button type="button" className="ux-deck-add-card" onClick={() => props.onNavigate("overview")}>
        <Sparkles size={18} />
        New roster
      </button>
      {rows.map((r) => (
        <article key={r.name} className="ux-card flat" onClick={() => props.onNavigate("overview")}>
          <div className="ux-card-top">
            <span>
              <h2>{r.name}</h2>
              <small className="ux-card-sub">{r.sub}</small>
            </span>
            <strong className="ux-card-pts">{r.pts}</strong>
          </div>
        </article>
      ))}
    </main>
  );
}

function SectionPager({ props }: { props: ConceptProps }) {
  const sections = props.roster.sections;
  const idx = Math.max(0, sections.findIndex((s) => s.id === props.selectedSectionId));
  const go = (dir: number) => {
    const next = sections[(idx + dir + sections.length) % sections.length];
    if (next) props.onSelectSection(next.id);
  };
  return (
    <nav className="ux-deck-pager" aria-label="Sections">
      <button type="button" aria-label="Previous slot" onClick={() => go(-1)}>
        <ChevronLeft size={18} />
      </button>
      <div className="ux-deck-pager-dots">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={s.id === props.selectedSectionId ? "active" : ""}
            aria-label={s.name}
            onClick={() => props.onSelectSection(s.id)}
          />
        ))}
      </div>
      <button type="button" aria-label="Next slot" onClick={() => go(1)}>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
