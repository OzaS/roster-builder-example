import type { CSSProperties, ReactNode } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Info, ShieldAlert } from "lucide-react";
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

export function Chip({ children, tone }: { children: ReactNode; tone?: "valid" | "warning" | "error" | "cool" | "neutral" }) {
  return <span className={`ux-chip ${tone ?? "neutral"}`}>{children}</span>;
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
  return `ux-scheme-${colorScheme ?? "generic"}`;
}

/** Combined root class helper: theme mode + game color scheme. */
export function shellClass(themeMode?: ThemeMode, colorScheme?: ColorScheme) {
  return `${themeClass(themeMode)} ${schemeClass(colorScheme)}`;
}
