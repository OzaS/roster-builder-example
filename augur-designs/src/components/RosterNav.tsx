import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import type { RosterSection } from "../types";

type Props = {
  sections: RosterSection[];
  selectedSectionId: string;
  expandedSectionIds: string[];
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  compact?: boolean;
};

export function RosterNav({
  sections,
  selectedSectionId,
  expandedSectionIds,
  onSelectSection,
  onToggleSection,
  compact = false,
}: Props) {
  return (
    <nav className={`roster-nav ${compact ? "compact" : ""}`} aria-label="Roster sections">
      {sections.map((section) => {
        const expanded = expandedSectionIds.includes(section.id);
        return (
          <div className={`section-nav-item ${selectedSectionId === section.id ? "selected" : ""}`} key={section.id}>
            <button className="section-nav-main" type="button" onClick={() => onSelectSection(section.id)}>
              <span className="section-chevron">{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
              <span>
                <strong>{section.name}</strong>
                <small>{section.required ?? `${section.units.length} unit`}</small>
              </span>
              <span className="section-count">{section.units.length}</span>
            </button>
            <button className="section-add" type="button" onClick={() => onToggleSection(section.id)} aria-label={`Toggle ${section.name}`}>
              <Plus size={16} />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
