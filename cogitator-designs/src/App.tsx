import { TrackSwitch } from "@designs/kit";
import { cogitatorNext, cogitatorTrack } from "./track";

/**
 * The Field Cogitator design gallery. Empty until D4: the first page will be the mood board (Linear structure,
 * Battle Augur desktop flavour, Notion content), then the design language and the E1 screens.
 */
export function App() {
  return (
    <div className="cg-gallery">
      <aside className="cg-rail" aria-label="Gallery">
        <div className="cg-brand"><span className="cg-mark" aria-hidden>FC</span><span><strong>Field Cogitator</strong><small>Desktop design library</small></span></div>
        <TrackSwitch store={cogitatorTrack} items={cogitatorNext.items} />
        <a className="cg-back" href="../">All design galleries</a>
      </aside>
      <main className="cg-stage">
        <h1>No designs yet</h1>
        <p>Field Cogitator is a desktop editor for datasets: open and save a dataset, edit text and structured fields, follow references, see diagnostics, run checks and export.</p>
        <p>The first page here will be a mood board: patterns from Linear (structure and speed), the Battle Augur desktop app (frames, panes, tokens) and Notion (entries as pages, mentions and backlinks), each marked borrow or avoid.</p>
      </main>
    </div>
  );
}
