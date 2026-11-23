import { ArrowRight, CircleAlert, PencilLine, Users } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { useWindowKeys, type Mode } from "../editor/shell";
import { Toggle } from "../start/parts";
import { keyRule, renamePlan, structuralPlan, takenKeys, type RenameState } from "./data";
import { EditorBehind, Hunk, Sheet, previewWidth, type SheetAction } from "./common";

/**
 * Screen 5: Rename (F2, or Rename… on an entry, a list row or a key in the text) with its preview, as a sheet over the
 * editor. It is `augur dklpo move` with `--dry-run` while you type, then without it on Apply: every file and line the
 * rename changes (grouped by file, before and after), the move records it appends to `moves.dkl`, the classification
 * (parent-preserving: a minor change; structural: a new major, `--bump-major`), and what rosters do on open (followed, or
 * kept unresolved for review). A new key that is taken or a reference the planner can't place refuses, and nothing is written.
 */

export function RenameScreen({ mode, state = "rename", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["rename", "structural", "conflict"].includes(state) ? state : "rename") as RenameState;
  const structural = s === "structural";
  const [key, setKey] = useState(s === "conflict" ? "halberd" : "short-spear");
  const [bump, setBump] = useState(true);
  const [open, setOpen] = useState(true);
  const [applied, setApplied] = useState(false);
  const keys = useRef({ esc: () => undefined as void });
  keys.current = { esc: () => setOpen(false) };
  const claim = useWindowKeys(interactive, (event) => { if (event.key === "Escape") keys.current.esc(); });

  const bad = !structural && !keyRule.test(key);
  const taken = !structural && key in takenKeys;
  const same = !structural && key === "spear";
  const refused = bad || taken || same;
  const plan = structural ? structuralPlan : renamePlan(key);
  const version = structural ? (bump ? "4.0.0" : "3.2.0") : "3.2.0";
  const records = structural ? plan.records.map((r) => r.replace(/^4\.0\.0/, version)) : plan.records;

  let problem: ReactNode = null;
  if (taken) {
    problem = (
      <div className="cg-tl-errline">
        <p><DiagIcon kind="error" size={13} /><strong>The key is taken</strong><span className="mono d-muted">move/new-exists</span></p>
        <p><code>iron-wardens:{key}</code> exists: the upgrade {key.charAt(0).toUpperCase() + key.slice(1)} (iron-wardens/module.dkl:{takenKeys[key]}). The uses named after Spear would collide too: <code>warden-squad/warden/weapon/{key}</code> and <code>warden-captain/captain/weapon/{key}</code> exist.</p>
        <p className="d-muted">Pick another key. Nothing would be written.</p>
      </div>
    );
  } else if (bad) {
    problem = <p className="cg-tl-help cg-err"><CircleAlert size={12} /> A key is lower-case letters, digits and single hyphens (<code>short-spear</code>).</p>;
  } else if (same) {
    problem = <p className="cg-tl-help">Type the new key; the preview follows as you type.</p>;
  }

  const actions: SheetAction[] = [
    { label: "Cancel", cancel: true, onClick: () => setOpen(false) },
    {
      label: structural ? "Apply move" : "Apply rename", kind: "primary",
      disabled: refused || (structural && !bump),
      title: refused ? (taken ? "Refused (move/new-exists): pick another key" : "Type a valid new key") : structural && !bump ? "A structural move needs a new major version (move/structural)" : "Write every file below, all or none",
      onClick: () => { setApplied(true); setOpen(false); },
    },
  ];
  const note = refused ? (taken ? "Refused: nothing would be written." : undefined)
    : structural && !bump ? <span className="cg-tl-sheet-note warn">A structural move needs a new major version (<code>move/structural</code>): raise the version to apply.</span>
      : "Nothing is written until Apply. Apply writes every file or none; ⌘Z undoes it.";

  const sheet = (
    <Sheet label={structural ? "Move Banner" : "Rename Spear"} icon={<PencilLine size={18} />} width={previewWidth} note={note} actions={actions}
      title={structural ? "Move Banner to another parent" : "Rename Spear"} target={structural ? "iron-wardens:warden-squad/warden/banner" : "iron-wardens:spear · upgrade"}>
      <div className="cg-tl-rows">
        <div className="cg-tl-row"><span>{structural ? "New path" : "New key"}</span><div>
          <span className={`cg-tl-field mono ${refused && !same ? "bad" : "focus"}`}>
            <span className="cg-tl-prefix">iron-wardens:</span>
            {structural ? <span>warden-squad/banner</span> : <input value={key} onChange={(event) => setKey(event.target.value)} aria-label="New key" spellCheck={false} aria-invalid={refused && !same} />}
          </span>
          {structural ? <p className="cg-tl-help cg-tl-parents">Parent: <strong>Warden</strong> (model)<ArrowRight size={12} /><strong>Warden Squad</strong> (unit)</p> : taken ? null : problem}
          {structural ? <p className="cg-tl-help cg-tl-ahead"><CircleAlert size={12} /><span>Drawn ahead of the command line: <code>augur dklpo move</code> refuses another parent today (<code>move/relocate</code>), and the editor shows that refusal until it is built.</span></p> : null}
        </div></div>
      </div>

      {refused ? (taken ? problem : null) : (
        <>
          <div className={`cg-tl-classify ${structural ? "structural" : "preserving"}`}>
            <p className="cg-tl-classify-head">
              <span className="cg-tl-kind">{structural ? "Structural" : "Parent-preserving"}</span>
              <span>{structural ? "A new parent selection: a minor version can’t carry it." : "Same parent: a minor change."}</span>
              <span className="d-muted">records at {version}</span>
            </p>
            {structural ? (
              <div className="cg-tl-opt">
                <Toggle platform="mac" on={bump} text="Raise the version to 4.0.0" onChange={setBump} title="--bump-major: the manifest's version becomes 4.0.0 and the record carries it" />
                <p className="cg-tl-help">The manifest’s <code>version:</code> 3.2.0 becomes 4.0.0 and the record carries it, as <code>--bump-major</code> does.</p>
              </div>
            ) : null}
            <p className="cg-tl-rosters"><Users size={14} />{structural
              ? <span><strong>Rosters keep it for review.</strong> A selection of Banner isn’t moved on open: it stays unresolved with “Banner: moved to Warden Squad › Banner ({version}): add it again”.</span>
              : <span><strong>Rosters follow it.</strong> On open, a selection of Spear is rewritten to the new path and listed as moved. Patches and references in other datasets follow the record too.</span>}</p>
          </div>

          <p className="cg-tl-counts cg-tl-planc">{plan.counts.map((c) => <span key={c.label}><strong>{c.n}</strong> {c.n === 1 ? c.label.replace(/s\b/, "") : c.label}</span>)}</p>

          <Hunk title={<><span className="mono">moves.dkl</span><span className="d-muted">{structural ? "created · 1 record" : "created · 3 records (the 2 uses named after Spear get their own)"}</span></>}
            edits={[{ line: 1, after: "moves" }, ...records.map((r, i) => ({ line: 2 + i, after: r }))]} />
          {plan.files.map((f) => <Hunk key={f.path} title={<><span className="mono">{f.path}</span><span className="d-muted">{f.change} · {f.what}</span></>} edits={f.edits} />)}
        </>
      )}
    </Sheet>
  );

  return (
    <EditorBehind mode={mode} interactive={interactive} onClaim={claim} modal={open} entry={structural ? "iron-wardens:warden-squad" : "iron-wardens:spear"}
      overlay={open ? <div className="cg-scrim cg-tl-scrim">{sheet}</div> : (
        <div className="e1s-toast cg-tl-toast" role="status"><span>{applied ? (structural ? "Moved Banner: 5 files, 1 record, version 4.0.0" : `Renamed Spear to ${key}: 4 files, 3 records`) : "Rename cancelled: nothing was written"}</span><button type="button" onClick={() => { setApplied(false); setOpen(true); }}>{applied ? "Undo" : "Show the sheet again"}</button></div>
      )} />
  );
}
