import { type CSSProperties, type ReactNode, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronDown, Ellipsis, Heart, Info, LockKeyhole, Redo2, ShieldAlert, Sparkles, Undo2, Upload, X } from "lucide-react";
import type { ColorScheme, PrototypeScreen, Roster, RosterUnit, ThemeMode } from "../../types";
import type { ConceptProps } from "../shared";

export type FlatUnit = RosterUnit & { forceId: string; forceName: string; sectionId: string; sectionName: string };

export function flattenUnits(roster: Roster): FlatUnit[] {
  return roster.forces.flatMap((force) => force.sections.flatMap((section) =>
    section.units.map((unit) => ({ ...unit, forceId: force.id, forceName: force.name, sectionId: section.id, sectionName: section.name })),
  ));
}

export function countSections(roster: Roster) {
  return roster.forces.reduce((sum, force) => sum + force.sections.length, 0);
}

export function rosterChecks(roster: Roster): FlatUnit[] {
  return flattenUnits(roster).filter((unit) => unit.status && unit.status !== "valid");
}

export function budget(roster: Roster) {
  const used = roster.pointsUsed;
  const limit = roster.pointsLimit;
  const open = Math.max(0, limit - used);
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const over = used > limit;
  return { used, limit, open, percent, over };
}

export function statusTone(status?: RosterUnit["status"]) {
  if (status === "error") return "error";
  if (status === "warning") return "warning";
  return "valid";
}

export function StatusGlyph({ status, size = 16 }: { status?: RosterUnit["status"]; size?: number }) {
  if (status === "error") return <ShieldAlert size={size} />;
  if (status === "warning") return <AlertTriangle size={size} />;
  return <CheckCircle2 size={size} />;
}

/** A thin, always-visible points budget bar shared by several concepts. */
export function BudgetMeter({ roster, label }: { roster: Roster; label?: string }) {
  const b = budget(roster);
  return (
    <div className={`ux-meter ${b.over ? "over" : ""}`}>
      <div className="ux-meter-track">
        <span style={{ "--fill": `${b.percent}%` } as CSSProperties} />
      </div>
      <div className="ux-meter-readout">
        <strong>
          {b.used}
          <small> / {b.limit}</small>
        </strong>
        <em>{label ?? (b.over ? `${b.used - b.limit} over` : `${b.open} open`)}</em>
      </div>
    </div>
  );
}

/**
 * The roster's main budget; when the roster has other limited costs, tapping it expands them
 * (battle-augur plan 3C-2). Limits of 0 with nothing used are left out.
 */
/**
 * UX-020 (user decisions 2026-10-21): the phone roster bar keeps Back, a one-line roster name, this Share button
 * (Export or share, the most-used action, opens the export sheet) and the More button below. A read-only roster has
 * Share only. Tablet keeps its own Export button.
 */
export function RosterShareButton({ onExport }: { onExport?: () => void }) {
  return (
    <button type="button" className="ux-icon-btn ux-roster-share" aria-label="Export or share" onClick={() => onExport?.()}>
      <Upload size={18} />
    </button>
  );
}

/**
 * UX-020: the phone roster bar's More button, after Share. Its menu opens anchored to the button (iOS: the native bar
 * button menu; Android: a Material menu) and lists Undo and Redo with their availability. A read-only roster has no
 * Undo or Redo, so it has no More button at all. `inline`: drawn in the flow, for the Elements view.
 */
export function RosterMoreMenu({ open, onOpenChange, canUndo = false, canRedo = false, readOnly = false, inline = false }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  readOnly?: boolean;
  inline?: boolean;
}) {
  if (readOnly) return null;
  return (
    <div className={`ux-roster-more ${inline ? "inline" : ""}`}>
      <button type="button" className="ux-icon-btn" aria-label="More actions" aria-haspopup="menu" aria-expanded={open} onClick={() => onOpenChange(!open)}>
        <Ellipsis size={18} />
      </button>
      {open ? (
        <div className="ux-roster-more-menu" role="menu" aria-label="More actions">
          <button type="button" role="menuitem" disabled={!canUndo} onClick={() => onOpenChange(false)}><Undo2 size={16} />Undo</button>
          <button type="button" role="menuitem" disabled={!canRedo} onClick={() => onOpenChange(false)}><Redo2 size={16} />Redo</button>
        </div>
      ) : null}
    </div>
  );
}

export function ExpandableBudget({ roster }: { roster: Roster }) {
  const [open, setOpen] = useState(false);
  const limits = (roster.limits ?? []).filter((limit) => limit.limit !== 0 || limit.used !== 0);
  if (!limits.length) return <BudgetMeter roster={roster} />;
  return (
    <button type="button" className={`ux-budget-toggle ${open ? "open" : ""}`} aria-expanded={open} aria-label={open ? "Hide other limits" : `Show ${limits.length} other limits`} onClick={() => setOpen((value) => !value)}>
      <BudgetMeter roster={roster} />
      <ChevronDown size={14} className="ux-budget-caret" aria-hidden />
      {open ? (
        <ul className="ux-budget-limits">
          {limits.map((limit) => <li key={limit.id} className={limit.used > limit.limit ? "over" : ""}><b>{limit.used}</b> / {limit.limit} {limit.label}</li>)}
        </ul>
      ) : null}
    </button>
  );
}

/** A tree unit's name line: ×count only above 1, non-point cost in accent, configuration summary below. */
export function TreeUnitMain({ unit, name }: { unit: RosterUnit; name: string }) {
  return (
    <span className={`ux-tree-unit-main ${unit.summary ? "with-summary" : ""}`}>
      <span>{name}</span>
      {unit.extraCost ? <em className="ux-tree-unit-cost">· {unit.extraCost}</em> : null}
      {unit.count > 1 ? <small>×{unit.count}</small> : null}
      {unit.summary ? <small className="ux-tree-unit-summary">{unit.summary}</small> : null}
    </span>
  );
}

export function Chip({ children, tone }: { children: ReactNode; tone?: "valid" | "warning" | "error" | "cool" | "neutral" }) {
  return <span className={`ux-chip ${tone ?? "neutral"}`}>{children}</span>;
}

export function SubscriptionGate({ variant = "edition", onClose }: { variant?: "main" | "edition"; onClose?: () => void }) {
  const isMain = variant === "main";
  return (
    <div className="ux-subscription-layer">
      <section className="ux-subscription-card" role="dialog" aria-modal="true" aria-labelledby={`subscription-title-${variant}`}>
        {onClose ? <button type="button" className="ux-subscription-close" aria-label="Close" onClick={onClose}><X size={17} /></button> : null}
        <div className="ux-subscription-art" aria-hidden>
          <span><LockKeyhole size={24} /></span>
          <Sparkles size={17} />
        </div>
        <div className="ux-subscription-kicker"><Heart size={12} /> Supporter feature</div>
        <h2 id={`subscription-title-${variant}`}>{isMain ? "Keep your rosters close" : "Build smarter, faster"}</h2>
        <p>
          {isMain
            ? "Cloud sync and cross-device access are included with a supporter subscription."
            : "Smart roster suggestions and advanced building tools are included with a supporter subscription."}
        </p>
        <div className="ux-subscription-benefits">
          <span><Check size={13} />{isMain ? "Sync every list" : "Context-aware suggestions"}</span>
          <span><Check size={13} />Help fund ongoing development</span>
        </div>
        <button type="button" className="ux-subscription-primary"><Heart size={16} />Support development</button>
        <button type="button" className="ux-subscription-secondary" onClick={onClose}>Maybe later</button>
        <small>Cancel anytime. The core roster builder stays free.</small>
      </section>
    </div>
  );
}

export function BackOrTitle({ props, fallback }: { props: ConceptProps; fallback: ReactNode }) {
  if (props.canGoBack) {
    return (
      <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}>
        <ArrowLeft size={18} />
      </button>
    );
  }
  return <>{fallback}</>;
}

export function priceLabel(points: number) {
  return points > 0 ? `+${points}` : "incl.";
}

/** Helper text block used in guided concepts to explain the "why". */
export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="ux-hint">
      <Info size={14} />
      <span>{children}</span>
    </p>
  );
}

export function screenIsBuild(screen: PrototypeScreen) {
  return screen === "overview" || screen === "unit-detail";
}

export function themeClass(themeMode?: ThemeMode) {
  return themeMode === "light" ? "light" : "dark";
}

export function schemeClass(colorScheme?: ColorScheme) {
  return `ux-scheme-${colorScheme ?? "default"}`;
}

/** Combined root class helper: theme mode + game color scheme. */
export function shellClass(themeMode?: ThemeMode, colorScheme?: ColorScheme) {
  return `${themeClass(themeMode)} ${schemeClass(colorScheme)}`;
}
