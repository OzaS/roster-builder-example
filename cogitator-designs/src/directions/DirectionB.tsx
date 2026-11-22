import { ArrowDownLeft, Bell, EyeOff, ChevronDown, ChevronRight, Code2, FileText, GripVertical, Layers, Plus, Search, Table2 } from "lucide-react";
import type { ReactNode } from "react";
import { MacWindow, TrafficLights } from "../frames";
import { DiagIcon, KindIcon } from "../glyphs";
import { backlinks, diagnostics, entry } from "../sample";
import "./direction-b.css";

const M = ({ children, broken }: { children: ReactNode; broken?: boolean }) => <span className={`b-mention${broken ? " broken" : ""}`}>{children}</span>;
const Kw = ({ children }: { children: ReactNode }) => <span className="b-kw">{children}</span>;

/** Direction B, Notion-first: the entry as a document page with a properties block, blocks, mentions, / insert and backlinks. */
export function DirectionB({ mode }: { mode: "light" | "dark" }) {
  return (
    <MacWindow mode={mode} className="fc-b">
      <div className="b-grid">
        <aside className="b-side">
          <div className="b-side-top"><TrafficLights /></div>
          <button className="b-ws"><span className="b-ws-mark">D</span><strong>Demo Skirmish</strong><ChevronDown size={14} /></button>
          <button className="b-item"><Search size={15} />Search<kbd>⌘K</kbd></button>
          <button className="b-item"><Bell size={15} />Updates<span className="b-count">{diagnostics.length}</span></button>
          <button className="b-item"><Layers size={15} />Layers<span className="b-muted">3 of 4</span></button>

          <h3>Pages</h3>
          <button className="b-item"><ChevronRight size={13} className="b-tog" /><KindIcon kind="system" size={15} />Demo Skirmish</button>
          <button className="b-item"><ChevronDown size={13} className="b-tog" /><KindIcon kind="system" size={15} />Iron Wardens</button>
          <button className="b-item i1 active"><ChevronDown size={13} className="b-tog" /><KindIcon kind="unit" size={15} />Warden Squad</button>
          <button className="b-item i2"><ChevronRight size={13} className="b-tog" /><KindIcon kind="model" size={15} />Warden</button>
          <button className="b-item i1"><ChevronRight size={13} className="b-tog" /><KindIcon kind="unit" size={15} />Warden Captain</button>
          <button className="b-item i1"><span className="b-tog-space" /><KindIcon kind="upgrade" size={15} />Spear</button>
          <button className="b-item i1"><span className="b-tog-space" /><KindIcon kind="upgrade" size={15} />Halberd</button>
          <button className="b-item"><ChevronRight size={13} className="b-tog" /><KindIcon kind="system" size={15} />Frost Wardens<span className="b-muted">add-on</span></button>
          <button className="b-item b-add"><Plus size={14} />New entry</button>

          <h3>Tables</h3>
          <button className="b-item"><Table2 size={15} />All units<span className="b-muted">4</span></button>
          <button className="b-item"><Table2 size={15} />All upgrades<span className="b-muted">4</span></button>
          <button className="b-item"><FileText size={15} />Text pack · en</button>
        </aside>

        <main className="b-main">
          <header className="b-top">
            <span className="b-crumbs">Iron Wardens<span>/</span>Warden Squad</span>
            <span className="b-spacer" />
            <span className="b-muted">Edited just now</span>
            <button className="b-ghost"><DiagIcon kind="error" size={14} />1 error in dataset</button>
            <button className="b-ghost"><Code2 size={14} />Source</button>
          </header>

          <div className="b-scroll">
            <div className="b-doc">
              <article className="b-page">
                <div className="b-icon"><KindIcon kind="unit" size={28} /></div>
                <h1>{entry.name}</h1>
                <p className="b-backlinks"><ArrowDownLeft size={14} /><span className="b-muted">{backlinks.length} backlinks</span>{backlinks.map((link) => <M key={link.from}>{link.from === "demo-skirmish-house" ? "House rules · patch" : link.from}</M>)}</p>

                <dl className="b-props">
                  <div><dt><KindIcon kind="unit" size={14} />Kind</dt><dd>Unit<span className="b-muted mono">{entry.full}</span></dd></div>
                  <div><dt><ChevronDown size={14} />Categories</dt><dd><span className="b-tag t1">infantry</span><span className="b-tag t2">line</span><span className="b-muted">root, as line*</span></dd></div>
                  <div><dt><span className="b-hash">#</span>Cost</dt><dd><strong className="num">18 pts</strong><span className="b-muted">20 in Base · lowered by <M>House rules</M></span></dd></div>
                  <div><dt><KindIcon kind="rule" size={14} />Rules</dt><dd><M>Shield Wall</M></dd></div>
                  <div><dt><Layers size={14} />Layer</dt><dd>Base<span className="b-muted">1 patch</span></dd></div>
                  <div className="b-more"><dt><Plus size={14} />2 more properties</dt><dd /></div>
                </dl>

                <div className="b-blocks">
                  <div className="b-block flagged"><GripVertical size={14} className="b-grip" /><Kw>source key</Kw><span className="mono">{entry.extra.key}: {entry.extra.value}</span></div>
                  <h2 className="b-h">Models</h2>
                  <div className="b-block"><ChevronDown size={14} className="b-tog" /><Kw>model</Kw><strong>Warden</strong><span className="b-muted">5 to 10 models</span></div>
                  <div className="b-block i1"><span className="b-tog-space" /><Kw>cost</Kw><span>8 pts</span></div>
                  <div className="b-block i1 b-tableblock">
                    <span className="b-tog-space" />
                    <table>
                      <thead><tr><th>Profile</th><th>Type</th><th>Move</th><th>Attack</th><th>Wounds</th></tr></thead>
                      <tbody><tr><td>Warden</td><td><M>fighter</M></td><td className="num">5"</td><td className="num">3</td><td className="num">1</td></tr></tbody>
                    </table>
                  </div>
                  <div className="b-block i1"><ChevronRight size={14} className="b-tog" /><Kw>upgrade</Kw><strong>Banner</strong><span className="b-muted">up to 1 · 10 pts · hidden when no <M>Warden Captain</M> in force</span></div>
                  <div className="b-block i1"><ChevronDown size={14} className="b-tog" /><Kw>group</Kw><strong>Weapon</strong><span className="b-muted">choose 1, default</span><M>Spear</M></div>
                  <div className="b-block i2"><span className="b-tog-space" /><Kw>use</Kw><M>Spear</M><span className="b-muted num">0 pts</span></div>
                  <div className="b-block i2"><span className="b-tog-space" /><Kw>use</Kw><M>Halberd</M><span className="b-muted num">2 pts</span></div>
                  <div className="b-block i1 typing"><span className="b-tog-space" /><span className="b-slash">/</span><span className="b-caret" /><span className="b-placeholder">Type to filter statements</span></div>
                  <div className="b-slashmenu" role="presentation">
                    <p>Valid in <span className="mono">model warden</span></p>
                    <div className="sel"><KindIcon kind="upgrade" size={15} /><span><strong>Upgrade</strong><small className="mono">upgrade key range</small></span><kbd>↵</kbd></div>
                    <div><KindIcon kind="group" size={15} /><span><strong>Group</strong><small className="mono">group key n default ref</small></span></div>
                    <div><KindIcon kind="profile-type" size={15} /><span><strong>Profile</strong><small className="mono">profile key: type | values</small></span></div>
                    <div><span className="b-hash">#</span><span><strong>Cost</strong><small className="mono">cost type value</small></span></div>
                    <div><EyeOff size={15} /><span><strong>Hide when</strong><small className="mono">hide when condition</small></span></div>
                  </div>
                </div>

              </article>

              <aside className="b-margin" aria-label="Diagnostics on this page">
                <p className="b-margin-head">On this page · 2</p>
                <div className="b-note preservation">
                  <p><DiagIcon kind="preservation" size={14} /><strong>Preservation failure</strong></p>
                  <p>The source comment before this entry moves below <code>x-bs.exampleReviewState</code> on export.</p>
                  <button>Show diff</button>
                </div>
                <div className="b-note suggestion">
                  <p><DiagIcon kind="suggestion" size={14} /><strong>Suggestion</strong></p>
                  <p><code>x-bs.exampleReviewState</code> is read by no rule.</p>
                  <button>Move to envelope</button>
                </div>
                <p className="b-margin-foot">5 more in other pages · <a>Open updates</a></p>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </MacWindow>
  );
}
