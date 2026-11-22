import { TrackChip } from "@designs/kit";
import { ArrowRight, Check, X } from "lucide-react";
import { ScaledFrame } from "../frames";
import { directions } from "../directions/meta";
import { DirectionScreen } from "../directions";
import { patternGroups } from "../moodboard/patterns";
import { go, hrefFor } from "../route";

const questions = [
  { q: "Where does an author spend the day: triaging diagnostics across the dataset, or writing one entry at a time?", hint: "Triage favours A, writing favours B, both at once is C." },
  { q: "Should the entry body read as DKLPO statements (keyword, value, indentation) or as a form of fields?", hint: "A turns statements into fields; B and C keep them as lines or blocks." },
  { q: "Should Field Cogitator look like part of the Battle Augur family, or like its own tool?", hint: "Only C uses the Augur frames, tokens and status edges." },
  { q: "Diagnostics: one inbox for the whole dataset, inline on the page, or both?", hint: "A is inbox only, B is inline only, C does both." },
  { q: "Is a right-hand pane worth its width at 1440 and 1280 px, or should properties sit on the page?", hint: "A and C spend 260–300 px on it; B gives it to the page." },
];

/** The D4 mood board: patterns by source with a Borrow or Avoid mark, then the three directions and the questions to pick. */
export function MoodBoard() {
  const mode = useGalleryMode();
  const counts = patternGroups.flatMap((group) => group.patterns).reduce((acc, p) => ({ ...acc, [p.verdict]: (acc[p.verdict] ?? 0) + 1 }), {} as Record<string, number>);
  return (
    <article className="cg-page">
      <header className="cg-head">
        <p className="cg-kicker">D4 · Step 1 <TrackChip status="proposal" /></p>
        <h1>Mood board</h1>
        <p className="cg-lede">Patterns from three sources, drawn with Field Cogitator content, each marked Borrow or Avoid for a desktop dataset editor. Then three directions for the same screen. Pick a direction (or a mix) before the design language and the E1 screens.</p>
        <nav className="cg-jump" aria-label="On this page">
          {patternGroups.map((group) => <a key={group.id} href={`#${group.id}`}>{group.source}</a>)}
          <a href="#directions">Three directions</a>
          <a href="#pick">Questions to pick</a>
          <span className="cg-tally"><Check size={14} /> {counts.borrow ?? 0} borrow <X size={14} /> {counts.avoid ?? 0} avoid</span>
        </nav>
      </header>

      {patternGroups.map((group) => (
        <section key={group.id} id={group.id} className="cg-source">
          <header>
            <h2>{group.source}</h2>
            <p>{group.blurb}</p>
          </header>
          <ul className="cg-patterns">
            {group.patterns.map((pattern) => (
              <li key={pattern.id} className={`cg-pattern ${pattern.verdict}`}>
                <div className="cg-pattern-mock" aria-hidden>{pattern.mock}</div>
                <h3>{pattern.title}</h3>
                <p><span className={`cg-verdict ${pattern.verdict}`}>{pattern.verdict === "borrow" ? <Check size={13} /> : <X size={13} />}{pattern.verdict === "borrow" ? "Borrow" : "Avoid"}</span>{pattern.why}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section id="directions" className="cg-source">
        <header>
          <h2>Three directions</h2>
          <p>The same task each time: the entry editor with a dataset navigator, one entry open with its properties and references, and the diagnostics area. Open a direction for the full 1440 px screen in light and dark.</p>
        </header>
        <ul className="cg-directions">
          {directions.map((direction) => (
            <li key={direction.id}>
              <a className="cg-direction-shot" href={hrefFor(direction.id)} onClick={(event) => { event.preventDefault(); go(direction.id); }} aria-label={`Open direction ${direction.letter}, ${direction.title}`}>
                <ScaledFrame label={`${direction.title} preview`}><DirectionScreen id={direction.id} mode={mode} /></ScaledFrame>
              </a>
              <h3><span className="cg-letter">{direction.letter}</span>{direction.title}{direction.id === "c" ? <em className="cg-reco">Recommended</em> : null}</h3>
              <p>{direction.oneLine}</p>
              <dl>
                <dt>Optimises for</dt><dd>{direction.optimises[0]}</dd>
                <dt>Costs</dt><dd>{direction.costs[0]}</dd>
              </dl>
              <a className="cg-open" href={hrefFor(direction.id)} onClick={(event) => { event.preventDefault(); go(direction.id); }}>Open {direction.letter} <ArrowRight size={14} /></a>
            </li>
          ))}
        </ul>
      </section>

      <section id="pick" className="cg-source">
        <header>
          <h2>Questions to pick</h2>
          <p>Answers to these decide the direction; a mix is fine (for example C with B's table view).</p>
        </header>
        <ol className="cg-questions">
          {questions.map((item) => <li key={item.q}><strong>{item.q}</strong><span>{item.hint}</span></li>)}
        </ol>
      </section>
    </article>
  );
}

/** The gallery theme for the previews: `?theme=` wins, otherwise the OS setting. */
function useGalleryMode(): "light" | "dark" {
  const theme = document.documentElement.dataset.theme;
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
