import { TrackChip, TrackSwitch } from "@designs/kit";
import { AppWindow, Blend, Columns3, Component, FileText, LayoutGrid, PanelsTopLeft, Palette } from "lucide-react";
import type { ReactNode } from "react";
import { cogitatorNext, cogitatorTrack } from "./track";
import { go, hrefFor, pageOf, useSearch, type Page } from "./route";
import { directions, type DirectionId } from "./directions/meta";
import { DirectionScreen } from "./directions";
import type { DState } from "./directions/DirectionD";
import { MoodBoard } from "./pages/MoodBoard";
import { DirectionPage } from "./pages/DirectionPage";
import { LanguagePage } from "./pages/LanguagePage";
import { ElementsPage } from "./pages/ElementsPage";
import { E1Page } from "./pages/E1Page";
import { e1ScreenById } from "./e1/registry";

const icons: Record<DirectionId, ReactNode> = { a: <Columns3 size={16} />, b: <FileText size={16} />, c: <PanelsTopLeft size={16} />, d: <Blend size={16} /> };
const dStates: DState[] = ["default", "collapsed", "panel", "focus", "focus-panel"];

/**
 * The Field Cogitator design gallery. D4 step 1: the mood board (patterns from Linear, the Battle Augur desktop app and
 * Notion, each marked borrow or avoid), three directions for the entry editor and the user's mix of them (D, interactive).
 * D4 step 2: the design language (tokens, type, density, layout) and the Elements view, drawn from Direction D.
 * D4 step 3: the E1 screens (`src/e1/`), each registered in `src/e1/registry.ts`.
 * Everything is a Proposal on Next.
 */
export function App() {
  const params = useSearch();
  const track = cogitatorTrack.useTrack();
  const page = pageOf(params);

  // `?view=frame&direction=a&mode=dark`: one direction's window alone at its design width (captures); D also takes `&state=`.
  if (params.get("view") === "frame") {
    const e1 = e1ScreenById(params.get("screen"));
    if (e1) {
      const mode = params.get("mode") === "dark" ? "dark" : "light";
      const platform = params.get("platform") === "windows" ? "windows" : "mac";
      return <div className={`cg-frame-only ${mode}`}>{e1.render({ mode, platform, state: params.get("state") ?? undefined, interactive: true })}</div>;
    }
    const id = (["a", "b", "c", "d"].includes(params.get("direction") ?? "") ? params.get("direction") : "c") as DirectionId;
    const state = dStates.includes(params.get("state") as DState) ? (params.get("state") as DState) : undefined;
    return <div className={`cg-frame-only ${params.get("mode") === "dark" ? "dark" : "light"}`}><DirectionScreen id={id} mode={params.get("mode") === "dark" ? "dark" : "light"} state={state} /></div>;
  }

  return (
    <div className="cg-gallery">
      <aside className="cg-rail" aria-label="Gallery">
        <div className="cg-brand"><span className="cg-mark" aria-hidden>FC</span><span><strong>Field Cogitator</strong><small>Desktop design library</small></span></div>
        <TrackSwitch store={cogitatorTrack} entries={cogitatorNext.entries} showItems={false} />
        <nav className="cg-nav" aria-label="Pages">
          <h2>D4 · Direction</h2>
          <NavLink page="board" current={page} icon={<LayoutGrid size={16} />} label="Mood board" meta="Patterns, borrow or avoid" />
          {directions.map((direction) => (
            <NavLink key={direction.id} page={direction.id} current={page} icon={icons[direction.id]} label={`${direction.letter} · ${direction.title}`} meta={direction.id === "d" ? "Interactive, light and dark" : "Entry editor, light and dark"} />
          ))}
          <h2>D4 · Design language</h2>
          <NavLink page="language" current={page} icon={<Palette size={16} />} label="Design language" meta="Tokens, type, density, layout" />
          <NavLink page="elements" current={page} icon={<Component size={16} />} label="Elements" meta="Primitives, macOS and Windows" />
          <h2>D4 · E1 screens</h2>
          <NavLink page="e1" current={page} icon={<AppWindow size={16} />} label="E1 screens" meta="Open, edit, references, diagnostics" />
        </nav>
        <a className="cg-back" href="../">All design galleries</a>
      </aside>
      <main className="cg-stage">
        {track === "current" ? <CurrentEmpty /> : page === "board" ? <MoodBoard /> : page === "language" ? <LanguagePage /> : page === "elements" ? <ElementsPage /> : page === "e1" ? <E1Page screen={params.get("screen")} /> : <DirectionPage id={page} />}
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
      <p>Current shows what Field Cogitator ships, and it has no released screens. The mood board, the directions for the entry editor, the design language and the Elements view are Proposals on the Next track.</p>
      <button type="button" className="cg-primary" onClick={() => cogitatorTrack.setTrack("next")}>Show Next: the mood board</button>
    </section>
  );
}
