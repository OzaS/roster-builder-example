import { TrackChip, TrackSwitch } from "@designs/kit";
import { AppWindow, Blend, Component, Palette } from "lucide-react";
import type { ReactNode } from "react";
import { cogitatorNext, cogitatorTrack } from "./track";
import { go, hrefFor, pageOf, useSearch, type Page } from "./route";
import { DirectionScreen } from "./directions";
import type { DState } from "./directions/DirectionD";
import type { DirectionId } from "./directions/meta";
import { DirectionPage } from "./pages/DirectionPage";
import { LanguagePage } from "./pages/LanguagePage";
import { ElementsPage } from "./pages/ElementsPage";
import { E1Page } from "./pages/E1Page";
import { e1ScreenById } from "./e1/registry";

const dStates: DState[] = ["default", "collapsed", "panel", "focus", "focus-panel"];

/**
 * The Field Cogitator design gallery: Direction D (the entry editor the user chose, interactive), the design language
 * (tokens, type, density, layout) and the Elements view drawn from it, and the E1 screens (`src/e1/`, each registered in
 * `src/e1/registry.ts`). All approved by the user (2026-11-23) and on Next until the app builds them. The mood board
 * and directions A–C were removed then (tag `cogitator-directions-2026-11-22`).
 */
export function App() {
  const params = useSearch();
  const track = cogitatorTrack.useTrack();
  const page = pageOf(params);

  // `?view=frame&direction=d&mode=dark&state=…`: Direction D's window alone at its design width (captures).
  if (params.get("view") === "frame") {
    const e1 = e1ScreenById(params.get("screen"));
    if (e1) {
      const mode = params.get("mode") === "dark" ? "dark" : "light";
      const platform = params.get("platform") === "windows" ? "windows" : "mac";
      return <div className={`cg-frame-only ${mode}`}>{e1.render({ mode, platform, state: params.get("state") ?? undefined, interactive: true })}</div>;
    }
    const id: DirectionId = "d";
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
          <NavLink page="d" current={page} icon={<Blend size={16} />} label="Direction D · Entry editor" meta="Interactive, light and dark" />
          <h2>D4 · Design language</h2>
          <NavLink page="language" current={page} icon={<Palette size={16} />} label="Design language" meta="Tokens, type, density, layout" />
          <NavLink page="elements" current={page} icon={<Component size={16} />} label="Elements" meta="Primitives, macOS and Windows" />
          <h2>D4 · E1 screens</h2>
          <NavLink page="e1" current={page} icon={<AppWindow size={16} />} label="E1 screens" meta="Open, edit, references, diagnostics" />
        </nav>
        <a className="cg-back" href="../">All design galleries</a>
      </aside>
      <main className="cg-stage">
        {track === "current" ? <CurrentEmpty /> : page === "language" ? <LanguagePage /> : page === "elements" ? <ElementsPage /> : page === "e1" ? <E1Page screen={params.get("screen")} /> : <DirectionPage id={page} />}
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
      <TrackChip status="approved" />
    </a>
  );
}

/** Current is what the product ships: nothing yet. The approved designs are on Next until the app builds them. */
function CurrentEmpty() {
  return (
    <section className="cg-empty">
      <h1>Nothing ships yet</h1>
      <p>Current shows what Field Cogitator ships, and it has no released screens. Direction D, the design language, the Elements view and the E1 screens are approved designs on the Next track, waiting to be built.</p>
      <button type="button" className="cg-primary" onClick={() => cogitatorTrack.setTrack("next")}>Show Next: Direction D</button>
    </section>
  );
}
