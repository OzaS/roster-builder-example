import { Bug, ChevronRight, CircleCheck, Clock, Cog, Database, Gauge, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Chip } from "./uxShared";

/*
 * Built in Battle Augur plan 1A (DEC-021/022), added to the gallery in plan 2D:
 * the "coming soon" placeholder of tabs and features that are not built yet, and the
 * hidden developer options (7 quick taps on App → About → Version; always on in dev builds).
 */

/** The placeholder a tab root (Lookup, Tools, Library) or a pushed feature shows until it is built. Defaults to the Lookup text; the tablet passes its own. */
export function ComingSoonCard({ icon: Icon = Search, title = "Lookup", description = "Search the game data you installed without opening a roster: check a rule mid-game, compare costs, read a profile.", planned = "Planned for V1.x", covers = "Covers LK-1" }: { icon?: LucideIcon; title?: string; description?: string; planned?: string; covers?: string } = {}) {
  return (
    <section className="ux-cs-card">
      <span className="ux-cs-icon"><Icon size={26} /></span>
      <small className="ux-cs-overline">Coming soon</small>
      <strong>{title}</strong>
      <p>{description}</p>
      <div className="ux-src-chips ux-cs-chips"><Chip tone="cool"><Clock size={10} /> {planned}</Chip>{covers ? <Chip tone="neutral">{covers}</Chip> : null}</div>
      <small className="ux-cs-note">This part of Battle Augur is planned. It is switched on for testing, so you can see where it will live.</small>
    </section>
  );
}

/** App → About → Version (tap 7 times), the unlocked Developer row, and the Developer screen in brief. */
export function DeveloperOptionsPreview() {
  return (
    <div className="ux-dev-preview">
      <div className="ux-result-label">App · About</div>
      <div className="ux-src-group">
        <div className="ux-src-kv"><span>Version</span><b>0.4.0</b></div>
        <div className="ux-src-kv"><span>Build</span><b>ios · release</b></div>
      </div>
      <small className="ux-src-footer">Seven quick taps on Version (each within 1.5 s) unlock the options; dev builds always show them.</small>
      <div className="ux-job-toast ok"><CircleCheck size={17} /><span>Developer options are on</span></div>
      <div className="ux-result-label">App</div>
      <div className="ux-src-group">
        <button type="button" className="ux-col-nav"><Cog size={17} /><span><strong>Settings</strong><small>Appearance and language</small></span><ChevronRight size={16} /></button>
        <button type="button" className="ux-col-nav"><Database size={17} /><span><strong>Sources</strong><small>Installed game data and where it comes from</small></span><ChevronRight size={16} /></button>
        <button type="button" className="ux-col-nav"><Bug size={17} /><span><strong>Developer</strong><small>Feature flags, performance overlay, tools</small></span><ChevronRight size={16} /></button>
      </div>
      <div className="ux-result-label">Developer</div>
      <div className="ux-src-group">
        <div className="ux-setting-row on ux-dev-row"><span className="ux-setting-icon"><Gauge size={17} /></span><span className="ux-setting-text"><strong>Performance overlay</strong><small>UI frame drops and tap → view latency, per screen</small></span><span className="ux-switch" aria-hidden /></div>
        <div className="ux-src-kv"><span>Lookup tab</span><b><Chip tone="neutral">V1.x · placeholder</Chip></b></div>
        <div className="ux-src-kv"><span>Source updates</span><b><Chip tone="neutral">V1.x · placeholder</Chip></b></div>
        <div className="ux-src-kv"><span>Component gallery · Engine bench</span><b>Tools</b></div>
        <div className="ux-src-kv"><span>Hide developer options</span><b>Unlock again with 7 taps</b></div>
      </div>
    </div>
  );
}
