import { shownModes } from "../theme";
import { TrackChip } from "@designs/kit";
import { ScaledFrame } from "../frames";
import { directions, type DirectionId } from "../directions/meta";
import { DirectionScreen } from "../directions";

/** What to try in the interactive Direction D window. */
const tryIt: { what: string; how: string }[] = [
  { what: "Open a source", how: "click Iron Wardens, Frost Wardens, Demo Skirmish or a table in the sidebar: its entries open in the list beside it (× in the list header closes it)." },
  { what: "Switch entries", how: "click a row in the list (or press ↑ ↓ / j k with a row focused), a sidebar tree entry, or a mention on the page. Try Warden Squad, Warden Captain, Spear, Halberd, Ice Guard, frost-seer." },
  { what: "Focus mode", how: "double-click a source in the sidebar, press ⌘. (Ctrl+. on Windows), or use Focus in the toolbar or the ⤢ button in the list header. Exit with Esc, ⌘., Exit focus in the list header, or a double-click on the list header." },
  { what: "Helper box", how: "− collapses it to a pill (click the pill to bring it back); the panel button expands it into the right panel. Fix and Apply buttons resolve an item, with Undo." },
  { what: "Helper panel", how: "tabs Issues, Suggestions, Properties; This entry or Dataset; Go to opens the entry an issue is on; drag the left edge (or focus it and press ← →) to resize; the picture-in-picture button or Esc (outside focus mode) goes back to the box." },
  { what: "Page", how: "hover a mention for its peek, fold and unfold statements with the chevrons, click “Type / to insert a statement” for the / menu, “more properties” opens the Properties tab." },
];

/** Direction D: what it optimises for and what it costs, then the entry editor at 1440 px in light and dark (the rail's theme switch picks one or both). */
export function DirectionPage({ id }: { id: DirectionId }) {
  const direction = directions.find((candidate) => candidate.id === id) ?? directions[0];
  return (
    <article className="cg-page">
      <header className="cg-head">
        <p className="cg-kicker">Direction {direction.letter} <TrackChip status="approved" /></p>
        <h1>{direction.title}</h1>
        <p className="cg-lede">{direction.oneLine}</p>
      </header>
      <div className="cg-tradeoff">
        <section>
          <h2>What it optimises for</h2>
          <ul>{direction.optimises.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
        <section>
          <h2>What it costs</h2>
          <ul>{direction.costs.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      </div>
      {id === "d" ? (
        <section className="cg-try" aria-label="Try it">
          <h2>Try it</h2>
          <p>Both windows below are live and keep their own state; the keyboard goes to the window you clicked last.</p>
          <ul>{tryIt.map((item) => <li key={item.what}><strong>{item.what}:</strong> {item.how}</li>)}</ul>
        </section>
      ) : null}
      <p className="cg-note">The entry editor with <code>iron-wardens:warden-squad</code> open, its properties, references and the diagnostics area. In view at 1440 × 900: {direction.rows}. Synthetic sample dataset.</p>
      {shownModes().map((mode) => (
        <section key={mode} className="cg-shot" aria-label={`${direction.title}, ${mode}`}>
          <h2>{mode === "light" ? "Light" : "Dark"} <a href={`?view=frame&direction=${id}&mode=${mode}`}>Open at 1440 px</a></h2>
          <ScaledFrame interactive={id === "d"} label={`${direction.title} entry editor, ${mode} theme`}><DirectionScreen id={id} mode={mode} /></ScaledFrame>
        </section>
      ))}
    </article>
  );
}
