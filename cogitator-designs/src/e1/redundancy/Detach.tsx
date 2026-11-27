import { ArrowDownLeft, ChevronDown, CopyMinus, CornerDownLeft, Hash, Pencil, Unlink } from "lucide-react";
import { useState, type ReactNode } from "react";
import { KindIcon } from "../../glyphs";
import { useWindowKeys, type Mode } from "../editor/shell";
import { Toggle } from "../start/parts";
import { Sheet, previewWidth } from "../tools/common";
import { FileHunk, Gate, X0Editor } from "./RedundancyScreen";
import type { FileChange } from "./data";

/**
 * Round 2 (user 2026-11-27, Proposal): the inverse of an extraction. A derived entry (`extends` a base) is made
 * independent: what it inherits is copied into it and `extends` is dropped, its path and every reference to it kept.
 * Drawn on X0 after R5 (Shield Line) was extracted: Moss Covenant's Shield Line extends common-kit:shield-line and keeps
 * two values of its own. `Override here` is the lighter step for one statement.
 */
export type DetachState = "derived" | "sheet" | "last";

const MEMBER = "moss-covenant:shield-line";

/** One page row: own (written here) or inherited (muted, from the base: read-only, as built). */
function Row({ label, icon, value, own, menu }: { label: string; icon: ReactNode; value: ReactNode; own?: boolean; menu?: boolean }) {
  return (
    <div className={own ? "cg-rd-ownrow" : "cg-rd-inh"}>
      <dt>{icon}{label}</dt>
      <dd className={menu ? "is-hover" : undefined}>{value}{own ? <span className="cg-rd-own">own</span> : <span className="cg-rd-from" title="Inherited from Common Kit’s Shield Line: written there">Common Kit</span>}</dd>
    </div>
  );
}

function DerivedPage({ menu, last }: { menu?: boolean; last?: boolean }) {
  return (
    <div className="d-scroll helper-collapsed">
      <div className="d-doc">
        <article className="d-page">
          <div className="d-pageicon"><KindIcon kind="unit" size={28} /></div>
          <h1>Shield Line</h1>
          <p className="d-backlinks"><ArrowDownLeft size={14} /><span className="d-muted">1 backlink</span><span className="d-mention">Moss Covenant</span></p>
          <dl className="d-props cg-rd-derived">
            <div><dt><KindIcon kind="unit" size={14} />Kind</dt><dd>Unit<span className="d-muted"><span className="mono">{MEMBER}</span></span></dd></div>
            <div className="cg-rd-extends"><dt><CopyMinus size={14} />Extends</dt><dd><span className="d-mention">Shield Line</span><span className="d-muted">in Common Kit · 6 inherited, 2 own{last ? " · nothing else extends it" : ""}</span><button type="button" className="cg-linkbtn" title="Copy what it inherits into this entry and drop extends (Entry › Make Independent…)">Make independent…</button></dd></div>
            <Row label="Categories" icon={<ChevronDown size={14} />} value={<span className="d-tag t1">infantry</span>} />
            <Row label="Cost" icon={<Hash size={14} />} value={<strong className="num">40 pts</strong>} menu={menu} />
            <Row label="Limit" icon={<Hash size={14} />} value={<>up to 1 in a roster</>} own />
          </dl>
          {menu ? (
            <div className="cg-menu wide cg-rd-inhmenu" role="menu" aria-label="Inherited statement">
              <p className="cg-menu-label">cost pts 40 · inherited from Common Kit</p>
              <button type="button" role="menuitem" className="cg-menu-item two sel"><Pencil size={14} /><span><strong>Override here</strong><small className="d-muted"> copy this statement into this entry, then edit it</small></span></button>
              <button type="button" role="menuitem" className="cg-menu-item"><CornerDownLeft size={14} />Go to it in the base<span className="cg-menu-key">F12</span></button>
              <div className="cg-menu-sep" role="separator" />
              <button type="button" role="menuitem" className="cg-menu-item"><Unlink size={14} />Make the entry independent…</button>
            </div>
          ) : null}
          <div className="d-blocks">
            <h2 className="d-h">Models</h2>
            <div className="d-block i0 cg-rd-ownblock"><span className="d-tog-space" /><span className="d-kw">model</span><strong>Shieldbearer</strong><span className="d-muted">10 to 20 models</span><span className="cg-rd-own">own range</span></div>
            <div className="d-block i1 cg-rd-inh"><span className="d-tog-space" /><span className="d-kw">cost</span><span className="num">7 pts</span><span className="cg-rd-from">Common Kit</span></div>
            <div className="d-block i1 cg-rd-inh"><span className="d-tog-space" /><span className="d-kw">profile</span><span>Shieldbearer · fighter · 4" · 3 · 4 · 1</span><span className="cg-rd-from">Common Kit</span></div>
            <div className="d-block i1 cg-rd-inh"><span className="d-tog-space" /><span className="d-kw">use</span><span className="d-mention">Spear</span><span className="d-muted">1</span><span className="cg-rd-from">Common Kit</span></div>
            <div className="d-block i1 cg-rd-inh"><span className="d-tog-space" /><span className="d-kw">use</span><span className="d-mention">Wargear</span><span className="cg-rd-from">Common Kit</span></div>
          </div>
        </article>
      </div>
    </div>
  );
}

/** What `detach` plans for Moss Covenant's Shield Line: the inherited statements copied in, `extends` dropped. */
const memberChange: FileChange = {
  path: "moss-covenant/entries.dkl", note: "the inherited statements copied in, extends dropped",
  edits: [
    { line: 36, before: "unit shield-line extends common-kit:shield-line", after: "unit shield-line" },
    { line: 37, after: "  cat infantry" },
    { line: 38, keep: "  max 1 in roster" },
    { line: 39, after: "  cost pts 40" },
    { line: 40, keep: "  model shieldbearer 10..20" },
    { line: 41, after: "    cost pts 7" },
    { line: 42, after: "    profile shieldbearer: fighter | 4\" | 3 | 4 | 1" },
    { line: 43, after: "    use common-kit:spear 1" },
    { line: 44, after: "    use common-kit:wargear" },
  ],
};
const textChange: FileChange = {
  path: "moss-covenant/text/en.dkl", note: "the names it read from the base",
  edits: [{ line: 21, after: "shield-line: Shield Line" }, { line: 22, after: "shield-line/shieldbearer: Shieldbearer" }],
};
const baseRemoved: FileChange = {
  path: "common-kit/module.dkl", note: "the base, now unused, removed",
  edits: [
    { line: 68, before: "" }, { line: 69, before: "abstract unit shield-line" }, { line: 70, before: "  cat infantry" }, { line: 71, before: "  max 2 in roster" },
    { line: 72, before: "  cost pts 40" }, { line: 73, before: "  model shieldbearer 5..10" }, { line: 74, before: "    cost pts 7" },
    { line: 75, before: "    profile shieldbearer: fighter | 4\" | 3 | 4 | 1" }, { line: 76, before: "    use common-kit:spear 1" }, { line: 77, before: "    use common-kit:wargear" },
  ],
};

function DetachSheet({ last, onClose }: { last?: boolean; onClose: () => void }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set([memberChange.path, baseRemoved.path]));
  const [remove, setRemove] = useState(Boolean(last));
  const toggle = (p: string) => setOpen((cur) => { const n = new Set(cur); if (n.has(p)) n.delete(p); else n.add(p); return n; });
  const files = last && remove ? [memberChange, textChange, baseRemoved, { ...textChange, path: "common-kit/text/en.dkl", note: "the base’s names removed", edits: [{ line: 17, before: "shield-line: Shield Line" }, { line: 18, before: "shield-line/shieldbearer: Shieldbearer" }] }] : [memberChange, textChange];
  return (
    <Sheet label="Make Shield Line independent" icon={<Unlink size={18} />} width={previewWidth} title="Make Moss Covenant’s Shield Line independent" target={<><span className="mono">{MEMBER}</span> · extends <span className="mono">common-kit:shield-line</span></>}
      note="Nothing is written until you confirm. Every file or none; ⌘Z undoes it."
      actions={[{ label: "Cancel", cancel: true, onClick: onClose }, { label: "Make independent", kind: "primary", key: "⌘↵", onClick: onClose }]}>
      <p className="cg-rd-sheetp">Copies the 6 statements it inherits and the 2 names it reads from the base into the entry, and drops <code>extends</code>. Its path stays <code>{MEMBER}</code>, so references, links, rosters and the XML ids keep working; then every statement can be edited here.</p>
      <div className="cg-tl-opt cg-rd-sheetopt">
        <Toggle platform="mac" on={remove} disabled={!last} onChange={setRemove} text="Then remove the base, if nothing else extends it" title={last ? "common-kit:shield-line is extended by nothing else" : "Ember Guild’s and Tide Compact’s Shield Line still extend it"} />
        <p className="cg-tl-help">{last ? <>Nothing else extends <code>common-kit:shield-line</code> once this entry is independent: it is removed with its names.</> : <>The base stays: Ember Guild’s and Tide Compact’s Shield Line still extend it.</>}</p>
      </div>
      <Gate phase="ready" seconds="0.7 s" />
      {files.map((f) => <FileHunk key={f.path} file={f} open={open.has(f.path)} onToggle={() => toggle(f.path)} />)}
      <p className="cg-tl-help cg-rd-sheetp">To change one value only, <strong>Override here</strong> on that statement copies just it into the entry, which keeps extending the base. Command line: <code>augur dklpo detach ~/Datasets/lantern-marches {MEMBER}{last && remove ? " --remove-base" : ""}</code></p>
    </Sheet>
  );
}

export function DetachScreen({ mode, state = "derived", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["derived", "sheet", "last"].includes(state) ? state : "derived") as DetachState;
  const [open, setOpen] = useState(s !== "derived");
  const claim = useWindowKeys(interactive, (event) => { if (event.key === "Escape") setOpen(false); });
  return (
    <X0Editor mode={mode} interactive={interactive} onClaim={claim} entry={MEMBER} back="Redundancy" crumbs={<>Moss Covenant<span>/</span>Shield Line</>}
      page={<DerivedPage menu={s === "derived"} last={s === "last"} />}
      overlay={open ? <div className="cg-scrim cg-tl-scrim">{<DetachSheet last={s === "last"} onClose={() => setOpen(false)} />}</div> : undefined} />
  );
}
