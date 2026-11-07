import { lookupById } from "../../data/lookupData";
import { fallbackSymbol, symbolFamilies, symbolPhrases, type SymbolFamily } from "../../data/categorySymbols";
import { ForceLayout, symbolIcons, type ForceLayoutState, type LayoutSlot } from "./ForceLayout";

/** Elements view samples for the force Layout (F2 sections 2–3): each part in its states, at phone width and at a 640 pt pane. */
const large = () => lookupById("d-grand-muster")?.slots ?? [];
/** A short sample: one required exact slot, repeated symbols (letters), no maximum, a six-ring cap and three base-zero categories. */
const short: LayoutSlot[] = [
  { category: "Command", min: 1, max: 1 }, { category: "Heroes", min: 0, max: -1 }, { category: "Troops", min: 2, max: 9 },
  { category: "Monster", min: 0, max: -1 }, { category: "Beasts", min: 0, max: -1 },
  { category: "Recon", min: 0, max: 0 }, { category: "Fortification", min: 0, max: 0 }, { category: "Allies: Glass Legion", min: 0, max: 0 },
];

function Sample({ label, note, wide = false, children }: { label: string; note?: string; wide?: boolean; children: React.ReactNode }) {
  return <figure className={`ux-fl-sample ${wide ? "wide" : ""}`}>
    <figcaption><strong>{label}</strong>{note ? <small>{note}</small> : null}</figcaption>
    <div className="ux-mobile-unit-options ux-lk-detail">{children}</div>
  </figure>;
}

export function ForceLayoutSamples() {
  const st = (s: ForceLayoutState) => s;
  return <div className="ux-fl-samples">
    <Sample label="Key folded (default) · chart · legend · Base limit 0" note="“Key · 15 categories”, the symbols in use and a chevron. Each tray is one group; the letter sits on its first ring."><ForceLayout slots={large()} /></Sample>
    <Sample label="Key open" note="Key rows: symbol with letter, full name, base range."><ForceLayout slots={large()} state={st({ keyOpen: true })} /></Sample>
    <Sample label="Tap detail (phone, tablet)" note="Outlines the group, highlights its key row and shows the full name, symbol, letter, what it allows and the base limit."><ForceLayout slots={large()} state={st({ keyOpen: true, tip: "Command - Veterans Only" })} /></Sample>
    <Sample label="Short detachment · Base limit 0 open" note="Required exact slot (spiked ring), letters only where a symbol repeats (Crown A/B, Paw A/B), a group over six rings (+3)."><ForceLayout slots={short} state={st({ zeroOpen: true })} /></Sample>
    <Sample label="Large text (150 % and up)" note="The range moves under the name; rings keep their size."><ForceLayout slots={short} large state={st({ keyOpen: true })} /></Sample>
    <Sample wide label="Pane 560 pt or wider (tablet, desktop) · hover detail" note="Key and Base limit 0 list in two columns, filled column by column. On the desktop the detail shows on hover and focus, toward the side with room."><ForceLayout slots={large()} state={st({ keyOpen: true, zeroOpen: true, hover: true, tip: "Transport" })} /></Sample>
  </div>;
}

/** The word-family table: symbol, family, phrases (in match order), and a neutral example category word. */
export function CategorySymbolTable() {
  const phrasesOf = (f: SymbolFamily) => symbolPhrases.filter((r) => r.family === f.id).flatMap((r) => r.phrases);
  const row = (f: SymbolFamily, phrases: string) => { const Icon = symbolIcons[f.icon]; return <tr key={f.id} className={f.id === "none" ? "fb" : ""}>
    <td><span className="ux-lk-ring ux-fl-ring sym"><Icon size={15} /></span></td>
    <th scope="row">{f.label}{f.added ? <small> added</small> : null}</th><td><code>{f.icon}</code> · {f.symbol}</td><td>{phrases}</td><td>{f.example}</td>
  </tr>; };
  return <div className="ux-fl-table-wrap"><table className="ux-fl-table">
    <thead><tr><th /><th>Word family</th><th>Lucide icon · spoken name</th><th>Whole-word phrases (head only)</th><th>Example</th></tr></thead>
    <tbody>{symbolFamilies.map((f) => row(f, phrasesOf(f).join(", ")))}{row(fallbackSymbol, "anything else; letters tell repeated symbols apart")}</tbody>
  </table></div>;
}
