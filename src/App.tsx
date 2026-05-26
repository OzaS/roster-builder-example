import { useMemo, useState } from "react";
import { Boxes, CircuitBoard, Gem, Hammer, Rows3 } from "lucide-react";
import { ConceptSwitcher } from "./components/ConceptSwitcher";
import { Shell } from "./components/Shell";
import { mockRoster } from "./data/mockRoster";
import type { ConceptId, ConceptMeta, PlatformPreview, PrototypeScreen, Roster } from "./types";
import { ArmoryGlass } from "./concepts/ArmoryGlass";
import { CommandDeck } from "./concepts/CommandDeck";
import { ForgeWorkbench } from "./concepts/ForgeWorkbench";
import { MiniatureCase } from "./concepts/MiniatureCase";
import { TacticalLedger } from "./concepts/TacticalLedger";

const concepts: ConceptMeta[] = [
  {
    id: "command-deck",
    name: "Command Deck",
    eyebrow: "Dark tactical console",
    icon: CircuitBoard,
    bestFor: "Players who want a powerful game-night command center.",
    direction: "Dark Material 3 surfaces, teal command rails, restrained neon validation.",
    interaction: "Fast section switching with command-style detail panels and a persistent point ring.",
    tradeoff: "Most atmospheric option; density needs careful restraint.",
  },
  {
    id: "armory-glass",
    name: "Armory Glass",
    eyebrow: "Soft universal product UI",
    icon: Gem,
    bestFor: "Broad usability across phone and tablet.",
    direction: "Light Material 3, frosted trays, soft neumorphic controls, role color accents.",
    interaction: "Equipment tray metaphor with friendly filters and large tap targets.",
    tradeoff: "Safest product direction, but less dramatic.",
  },
  {
    id: "tactical-ledger",
    name: "Tactical Ledger",
    eyebrow: "Power-user planning sheet",
    icon: Rows3,
    bestFor: "Experienced builders managing complex armies quickly.",
    direction: "Dense list/table structure with paper-like depth and sharp information hierarchy.",
    interaction: "Tap rows to inspect, with validation grouped in a bottom drawer.",
    tradeoff: "Functional first; less expressive than the themed concepts.",
  },
  {
    id: "miniature-case",
    name: "Miniature Case",
    eyebrow: "Skeuomorphic army case",
    icon: Boxes,
    bestFor: "A distinctive brand personality with a tactile collection feel.",
    direction: "Molded compartments, inset model slots, clipped unit cards.",
    interaction: "Roster sections behave like trays with empty slots and selected model cards.",
    tradeoff: "Most custom visual language; needs usability validation.",
  },
  {
    id: "forge-workbench",
    name: "Forge Workbench",
    eyebrow: "Assembly-oriented builder",
    icon: Hammer,
    bestFor: "Making roster construction feel like assembling equipment.",
    direction: "Workbench surfaces, raised tools, inset option vise, warm-neutral depth.",
    interaction: "Palette, assembly board, and configuration vise make the build flow explicit.",
    tradeoff: "Less conventional navigation, but strong for guided creation.",
  },
];

function App() {
  const [selectedConcept, setSelectedConcept] = useState<ConceptId>("command-deck");
  const [platform, setPlatform] = useState<PlatformPreview>("phone");
  const [roster, setRoster] = useState<Roster>(mockRoster);
  const [selectedSectionId, setSelectedSectionId] = useState("hq");
  const [selectedUnitId, setSelectedUnitId] = useState("centurion");
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>(["hq", "battleline", "elites"]);
  const [screen, setScreen] = useState<PrototypeScreen>("library");
  const [screenHistory, setScreenHistory] = useState<PrototypeScreen[]>([]);

  const selectedSection = useMemo(
    () => roster.sections.find((section) => section.id === selectedSectionId) ?? roster.sections[0],
    [roster.sections, selectedSectionId],
  );

  const selectedUnit = useMemo(
    () => roster.sections.flatMap((section) => section.units).find((unit) => unit.id === selectedUnitId) ?? selectedSection.units[0],
    [roster.sections, selectedSection.units, selectedUnitId],
  );

  const concept = concepts.find((item) => item.id === selectedConcept) ?? concepts[0];

  function navigate(screenId: PrototypeScreen) {
    setScreenHistory((current) => (screenId === screen ? current : [...current, screen]));
    setScreen(screenId);
  }

  function goBack() {
    setScreenHistory((current) => {
      const previous = current[current.length - 1];
      if (previous) {
        setScreen(previous);
        return current.slice(0, -1);
      }
      setScreen("overview");
      return current;
    });
  }

  function selectSection(id: string) {
    const section = roster.sections.find((item) => item.id === id);
    setSelectedSectionId(id);
    if (section?.units[0]) {
      setSelectedUnitId(section.units[0].id);
    }
    setExpandedSectionIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function toggleSection(id: string) {
    setExpandedSectionIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function selectUnit(id: string) {
    setSelectedUnitId(id);
    const parent = roster.sections.find((section) => section.units.some((unit) => unit.id === id));
    if (parent) {
      setSelectedSectionId(parent.id);
    }
    navigate("unit-detail");
  }

  function toggleOption(optionId: string) {
    setRoster((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        units: section.units.map((unit) => {
          if (!unit.options.some((option) => option.id === optionId)) {
            return unit;
          }
          const option = unit.options.find((item) => item.id === optionId);
          const delta = option && !option.selected ? option.points : option ? -option.points : 0;
          return {
            ...unit,
            points: Math.max(0, unit.points + delta),
            options: unit.options.map((item) => (item.id === optionId ? { ...item, selected: !item.selected } : item)),
          };
        }),
      })),
      pointsUsed: Math.max(
        0,
        current.pointsUsed +
          current.sections
            .flatMap((section) => section.units)
            .flatMap((unit) => unit.options)
            .filter((option) => option.id === optionId)
            .reduce((sum, option) => sum + (option.selected ? -option.points : option.points), 0),
      ),
    }));
  }

  function changeCount(unitId: string, delta: number) {
    setRoster((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        units: section.units.map((unit) =>
          unit.id === unitId ? { ...unit, count: Math.max(1, Math.min(10, unit.count + delta)) } : unit,
        ),
      })),
    }));
  }

  const props = {
    roster,
    selectedSection,
    selectedUnit,
    selectedSectionId,
    expandedSectionIds,
    screen,
    canGoBack: screenHistory.length > 0 || screen !== "overview",
    onSelectSection: selectSection,
    onToggleSection: toggleSection,
    onSelectUnit: selectUnit,
    onToggleOption: toggleOption,
    onCountChange: changeCount,
    onNavigate: navigate,
    onBack: goBack,
  };

  return (
    <div className="app">
      <ConceptSwitcher
        concepts={concepts}
        selectedConcept={selectedConcept}
        platform={platform}
        onConceptChange={setSelectedConcept}
        onPlatformChange={setPlatform}
      />
      <Shell concept={concept} platform={platform}>
        {selectedConcept === "command-deck" ? <CommandDeck {...props} /> : null}
        {selectedConcept === "armory-glass" ? <ArmoryGlass {...props} /> : null}
        {selectedConcept === "tactical-ledger" ? <TacticalLedger {...props} /> : null}
        {selectedConcept === "miniature-case" ? <MiniatureCase {...props} /> : null}
        {selectedConcept === "forge-workbench" ? <ForgeWorkbench {...props} /> : null}
      </Shell>
    </div>
  );
}

export default App;
