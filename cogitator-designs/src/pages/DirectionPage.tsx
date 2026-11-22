import { TrackChip } from "@designs/kit";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScaledFrame } from "../frames";
import { directions, type DirectionId } from "../directions/meta";
import { DirectionScreen } from "../directions";
import { go, hrefFor } from "../route";

/** One direction: what it optimises for and what it costs, then the entry editor at 1440 px in light and dark. */
export function DirectionPage({ id }: { id: DirectionId }) {
  const index = directions.findIndex((direction) => direction.id === id);
  const direction = directions[index];
  const previous = directions[index - 1];
  const next = directions[index + 1];
  return (
    <article className="cg-page">
      <header className="cg-head">
        <p className="cg-kicker">Direction {direction.letter} <TrackChip status="proposal" /></p>
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
      <p className="cg-note">Same task in every direction: the entry editor with <code>iron-wardens:warden-squad</code> open, its properties, references and the diagnostics area. In view at 1440 × 900: {direction.rows}. Synthetic sample dataset.</p>
      {(["light", "dark"] as const).map((mode) => (
        <section key={mode} className="cg-shot" aria-label={`${direction.title}, ${mode}`}>
          <h2>{mode === "light" ? "Light" : "Dark"} <a href={`?view=frame&direction=${id}&mode=${mode}`}>Open at 1440 px</a></h2>
          <ScaledFrame label={`${direction.title} entry editor, ${mode} theme`}><DirectionScreen id={id} mode={mode} /></ScaledFrame>
        </section>
      ))}
      <nav className="cg-pager" aria-label="Directions">
        {previous ? <a href={hrefFor(previous.id)} onClick={(event) => { event.preventDefault(); go(previous.id); }}><ArrowLeft size={14} /> {previous.letter} · {previous.title}</a> : <a href={hrefFor("board")} onClick={(event) => { event.preventDefault(); go("board"); }}><ArrowLeft size={14} /> Mood board</a>}
        {next ? <a href={hrefFor(next.id)} onClick={(event) => { event.preventDefault(); go(next.id); }}>{next.letter} · {next.title} <ArrowRight size={14} /></a> : <a href={hrefFor("board")} onClick={(event) => { event.preventDefault(); go("board", "pick"); }}>Questions to pick <ArrowRight size={14} /></a>}
      </nav>
    </article>
  );
}
