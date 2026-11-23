import { TrackChip } from "@designs/kit";
import { ScaledFrame } from "../frames";
import { e1Screens, e1ScreenById } from "../e1/registry";
import type { E1Mode, E1Platform, E1Screen } from "../e1/types";
import { hrefFor } from "../route";

/**
 * D4 step 3, the E1 screens: every screen of the first Field Cogitator scope in Direction D's language, in light and dark
 * (and Windows where it differs). `?page=e1` lists them all with an index; `&screen=<id>` shows one.
 */
export function E1Page({ screen }: { screen: string | null }) {
  const one = e1ScreenById(screen);
  const shown = one ? [one] : e1Screens;
  const groups = [...new Set(shown.map((s) => s.group))];
  return (
    <article className="cg-page">
      <header className="cg-head">
        <p className="cg-kicker">D4 step 3 · E1 screens <TrackChip status="proposal" /></p>
        <h1>{one ? one.title : "E1 screens"}</h1>
        <p className="cg-lede">{one ? one.summary : "The screens of the first scope (E1): open a dataset, edit it, follow references, read diagnostics. Direction D and the design language, synthetic sample data."}</p>
      </header>
      {one ? <p className="cg-note"><a href={hrefFor("e1")}>All E1 screens</a></p> : (
        <nav className="cg-e1-index" aria-label="E1 screens">
          {groups.map((group) => (
            <section key={group}>
              <h2>{group}</h2>
              <ul>{shown.filter((s) => s.group === group).map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ul>
            </section>
          ))}
          {shown.length ? null : <p className="cg-note">No E1 screens yet.</p>}
        </nav>
      )}
      {shown.map((s) => <ScreenSection key={s.id} screen={s} solo={Boolean(one)} />)}
    </article>
  );
}

function ScreenSection({ screen, solo }: { screen: E1Screen; solo: boolean }) {
  const states = screen.states?.length ? screen.states : [{ id: "", title: "" }];
  const platforms: E1Platform[] = screen.platforms?.length ? screen.platforms : ["mac"];
  const shots: { mode: E1Mode; platform: E1Platform; state: string; stateTitle: string }[] = [];
  for (const state of states) for (const platform of platforms) for (const mode of ["light", "dark"] as const) shots.push({ mode, platform, state: state.id, stateTitle: state.title });
  return (
    <section id={screen.id} className="cg-e1-screen" aria-label={screen.title}>
      {solo ? null : (
        <>
          <h2 className="cg-e1-title">{screen.title} <a href={`${hrefFor("e1")}&screen=${screen.id}`}>Only this screen</a></h2>
          <p className="cg-note">{screen.summary}</p>
        </>
      )}
      {screen.tryIt?.length ? (
        <section className="cg-try" aria-label="Try it">
          <h2>Try it</h2>
          <ul>{screen.tryIt.map((item) => <li key={item.what}><strong>{item.what}:</strong> {item.how}</li>)}</ul>
        </section>
      ) : null}
      {shots.map((shot) => {
        const label = [shot.stateTitle, shot.platform === "windows" ? "Windows" : platforms.length > 1 ? "macOS" : "", shot.mode === "light" ? "Light" : "Dark"].filter(Boolean).join(" · ");
        const query = new URLSearchParams({ view: "frame", screen: screen.id, mode: shot.mode });
        if (shot.state) query.set("state", shot.state);
        if (shot.platform === "windows") query.set("platform", "windows");
        return (
          <section key={`${shot.state}-${shot.platform}-${shot.mode}`} className="cg-shot" aria-label={`${screen.title}, ${label}`}>
            <h2>{label} <a href={`?${query}`}>Open at {screen.width ?? 1440} px</a></h2>
            <ScaledFrame width={screen.width ?? 1440} interactive={Boolean(screen.tryIt?.length)} label={`${screen.title}, ${label}`}>
              {screen.render({ mode: shot.mode, platform: shot.platform, state: shot.state || undefined, interactive: Boolean(screen.tryIt?.length) })}
            </ScaledFrame>
          </section>
        );
      })}
    </section>
  );
}
