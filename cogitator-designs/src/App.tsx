import { TrackChip, TrackSwitch } from "@designs/kit";
import { Columns3, FileText, LayoutGrid, PanelsTopLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cogitatorNext, cogitatorTrack } from "./track";
import { go, hrefFor, pageOf, useSearch, type Page } from "./route";
import { directions, type DirectionId } from "./directions/meta";
import { DirectionScreen } from "./directions";
import { MoodBoard } from "./pages/MoodBoard";
import { DirectionPage } from "./pages/DirectionPage";

const icons: Record<DirectionId, ReactNode> = { a: <Columns3 size={16} />, b: <FileText size={16} />, c: <PanelsTopLeft size={16} /> };

/**
 * The Field Cogitator design gallery. D4 step 1: the mood board (patterns from Linear, the Battle Augur desktop app and
 * Notion, each marked borrow or avoid) and three directions for the entry editor. Everything is a Proposal on Next.
 */
export function App() {
  const params = useSearch();
  const track = cogitatorTrack.useTrack();
  const page = pageOf(params);

  // `?view=frame&direction=a&mode=dark`: one direction's window alone at its design width (captures).
  if (params.get("view") === "frame") {
    const id = (["a", "b", "c"].includes(params.get("direction") ?? "") ? params.get("direction") : "c") as DirectionId;
    return <div className={`cg-frame-only ${params.get("mode") === "dark" ? "dark" : "light"}`}><DirectionScreen id={id} mode={params.get("mode") === "dark" ? "dark" : "light"} /></div>;
  }

  return (
    <div className="cg-gallery">
      <aside className="cg-rail" aria-label="Gallery">
        <div className="cg-brand"><span className="cg-mark" aria-hidden>FC</span><span><strong>Field Cogitator</strong><small>Desktop design library</small></span></div>
        <TrackSwitch store={cogitatorTrack} items={cogitatorNext.items} showItems={false} />
        <nav className="cg-nav" aria-label="Pages">
          <h2>D4 · Direction</h2>
          <NavLink page="board" current={page} icon={<LayoutGrid size={16} />} label="Mood board" meta="Patterns, borrow or avoid" />
          {directions.map((direction) => (
            <NavLink key={direction.id} page={direction.id} current={page} icon={icons[direction.id]} label={`${direction.letter} · ${direction.title}`} meta="Entry editor, light and dark" />
          ))}
        </nav>
        <a className="cg-back" href="../">All design galleries</a>
      </aside>
      <main className="cg-stage">
        {track === "current" ? <CurrentEmpty /> : page === "board" ? <MoodBoard /> : <DirectionPage id={page} />}
      </main>
    </div>
  );
}

function NavLink({ page, current, icon, label, meta }: { page: Page; current: Page; icon: ReactNode; label: string; meta: string }) {
  const active = page === current;
  return (
    <a
      className={active ? "active" : ""}
      href={hrefFor(page)}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        go(page);
      }}
    >
      {icon}
      <span><strong>{label}</strong><small>{meta}</small></span>
      <TrackChip status="proposal" />
    </a>
  );
}

/** Current is what the product ships: nothing yet. The mood board and the directions are Proposals on Next. */
function CurrentEmpty() {
  return (
    <section className="cg-empty">
      <h1>Nothing ships yet</h1>
      <p>Current shows what Field Cogitator ships, and it has no released screens. The mood board and the three directions for the entry editor are Proposals on the Next track.</p>
      <button type="button" className="cg-primary" onClick={() => cogitatorTrack.setTrack("next")}>Show Next: the mood board</button>
    </section>
  );
}
