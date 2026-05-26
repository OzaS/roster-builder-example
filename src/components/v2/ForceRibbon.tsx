import type { RosterSection } from "../../types";

type Props = {
  sections: RosterSection[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
};

export function ForceRibbon({ sections, selectedSectionId, onSelectSection }: Props) {
  return (
    <nav className="v2-force-ribbon" aria-label="Force organization">
      {sections.map((section) => (
        <button className={section.id === selectedSectionId ? "active" : ""} key={section.id} type="button" onClick={() => onSelectSection(section.id)}>
          <strong>{section.name}</strong>
          <small>{section.required ?? `${section.units.length}`}</small>
        </button>
      ))}
    </nav>
  );
}
