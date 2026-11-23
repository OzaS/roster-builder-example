import { ArrowRightLeft, FileArchive, FileInput, FileWarning, Folder, FolderOpen, HardDrive, Save, SquareX, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { DirectionD } from "../../directions/DirectionD";
import { KindIcon } from "../../glyphs";
import type { Kind } from "../../sample";
import type { E1Mode } from "../types";
import { Dialog } from "./parts";

/**
 * Window-level dialogs over the editor: drawn over a static Direction D window (D itself is unchanged). The dataset
 * switcher popover from the sidebar's "Demo Skirmish ▾", Save / Don't save / Cancel when closing or switching with unsaved
 * changes, a module changed by another program (without and with unsaved edits), and a save that failed. macOS (D's frame).
 */
export type EditorDialog = "switcher" | "unsaved" | "changed-on-disk" | "changed-on-disk-edits" | "save-failed";

const changed: { kind: Kind; name: string; where: string; what: string }[] = [
  { kind: "unit", name: "Warden Squad", where: "Iron Wardens", what: "cost, rule text" },
  { kind: "upgrade", name: "Halberd", where: "Iron Wardens", what: "cost" },
  { kind: "unit", name: "Ice Guard", where: "Frost Wardens", what: "weapon reference" },
  { kind: "rule", name: "Shield Wall", where: "Demo Skirmish", what: "rule text" },
];
const file = "iron-wardens/units/squads.dkl";
const fullPath = `~/Datasets/demo-skirmish/${file}`;

export function EditorDialogs({ mode, initial = "switcher", interactive = true }: { mode: E1Mode; initial?: EditorDialog; interactive?: boolean }) {
  const [shown, setShown] = useState<EditorDialog | null>(initial);
  const [toast, setToast] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const userMoved = useRef(false);
  const done = (message: string) => { userMoved.current = true; setShown(null); setToast(message); };
  const go = (next: EditorDialog) => { userMoved.current = true; setToast(null); setShown(next); };
  useEffect(() => {
    if (!userMoved.current) return;
    root.current?.querySelector<HTMLElement>(shown ? ".cg-dialog .d-btn.primary, .cg-menu .cg-menu-item" : ".e1s-toast button")?.focus();
  }, [shown]);

  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || !shown) return;
    event.preventDefault();
    if (shown === "switcher") done("Switcher closed");
    else if (shown === "unsaved") done("Cancelled: Demo Skirmish stays open with its 4 unsaved entries");
    else if (shown === "save-failed") done("Not saved: your edits stay in the editor");
    else done(`Kept your version of ${file}; saving will ask before it overwrites the other change`);
  };

  let overlay: ReactNode = null;
  if (shown === "switcher") {
    overlay = (
      <div className="e1s-anchor e1s-switcher" onClick={(event) => { if (event.target === event.currentTarget) done("Switcher closed"); }}>
        <div className="cg-menu wide" role="menu" aria-label="Datasets">
          <div className="cg-menu-head">
            <span className="d-ws-mark" aria-hidden>D</span><strong>Demo Skirmish</strong>
            <span className="mono" style={{ gridColumn: 2 }}>~/Datasets/demo-skirmish</span>
            <small>DKLPO 1.0 · 3 of 4 layers on · 5 modules</small>
          </div>
          <div className="cg-menu-sep" role="separator" />
          <p className="cg-menu-label section">Recent datasets</p>
          {[
            { title: "Ember Leagues", path: "~/Datasets/ember-leagues", icon: <Folder size={15} /> },
            { title: "Tidewater Skirmish", path: "~/Projects/tidewater/dataset", icon: <Folder size={15} /> },
            { title: "Lantern Watch", path: "~/Downloads/lantern-watch.zip", icon: <FileArchive size={15} />, tag: "Archive" },
          ].map((r) => (
            <button key={r.title} type="button" role="menuitem" className="cg-menu-item two" onClick={() => go("unsaved")} title={`Switch to ${r.title}`}>
              {r.icon}<span><span>{r.title}</span><span className="mono">{r.path}</span></span>{r.tag ? <span className="cg-tag">{r.tag}</span> : null}
            </button>
          ))}
          <button type="button" role="menuitem" className="cg-menu-item" onClick={() => go("unsaved")}><HardDrive size={15} />All recent datasets…<span className="cg-menu-key">⇧⌘O</span></button>
          <div className="cg-menu-sep" role="separator" />
          <button type="button" role="menuitem" className="cg-menu-item" onClick={() => go("unsaved")}><FolderOpen size={15} />Open folder…<span className="cg-menu-key">⌘O</span></button>
          <button type="button" role="menuitem" className="cg-menu-item" onClick={() => go("unsaved")}><FileInput size={15} />Open file…</button>
          <button type="button" role="menuitem" className="cg-menu-item" onClick={() => go("unsaved")}><ArrowRightLeft size={15} />Convert from XML data…</button>
          <div className="cg-menu-sep" role="separator" />
          <button type="button" role="menuitem" className="cg-menu-item" onClick={() => done("Shown ~/Datasets/demo-skirmish in Finder")}><Folder size={15} />Show in Finder<span className="cg-menu-key">⌥⌘R</span></button>
          <button type="button" role="menuitem" className="cg-menu-item" onClick={() => go("unsaved")}><SquareX size={15} />Close dataset<span className="cg-menu-key">⇧⌘W</span></button>
        </div>
      </div>
    );
  } else if (shown) {
    let dialog: ReactNode;
    if (shown === "unsaved") {
      dialog = (
        <Dialog platform="mac" tone="info" icon={<Save size={18} />} title="Save changes to Demo Skirmish before closing?" target="~/Datasets/demo-skirmish" width={480}
          actions={[
            { label: "Don’t save", left: true, kind: "danger", onClick: () => done("Closed without saving; the 4 edits are gone"), title: "Close and lose the 4 changed entries" },
            { label: "Cancel", cancel: true, onClick: () => done("Cancelled: Demo Skirmish stays open with its 4 unsaved entries"), title: "Keep the dataset open" },
            { label: "Save", kind: "primary", onClick: () => done("Saved 4 entries in 3 modules (fmt clean); the dataset closes"), title: "Save the changed files, then close" },
          ]}>
          <p>4 entries changed in 3 modules:</p>
          <ul className="cg-dialog-list" aria-label="Changed entries">
            {changed.map((c) => <li key={c.name}><KindIcon kind={c.kind} size={14} /><span>{c.name} <span className="d-muted">· {c.where} · {c.what}</span></span></li>)}
          </ul>
          <p className="d-muted">Format on save is on: <code>fmt</code> runs on the changed files.</p>
        </Dialog>
      );
    } else if (shown === "changed-on-disk") {
      dialog = (
        <Dialog platform="mac" tone="warn" icon={<FileWarning size={18} />} title="Another program changed squads.dkl" target={fullPath} width={480}
          actions={[
            { label: "Compare", left: true, onClick: () => done("Compare opens both versions side by side (drawn with the source view)"), title: "Show the open version and the one on disk side by side" },
            { label: "Keep mine", cancel: true, onClick: () => done(`Kept your version of ${file}; saving will ask before it overwrites the other change`), title: "Leave the open version; nothing changes now" },
            { label: "Reload", kind: "primary", onClick: () => done(`Reloaded ${file}: 3 lines changed, Warden Squad and Halberd updated`), title: "Read the new version from disk" },
          ]}>
          <p>It changed 2 minutes ago (3 lines, in Warden Squad and Halberd). You have no unsaved edits in this file, so reloading loses nothing.</p>
        </Dialog>
      );
    } else if (shown === "changed-on-disk-edits") {
      dialog = (
        <Dialog platform="mac" tone="warn" icon={<FileWarning size={18} />} title="squads.dkl changed on disk while you were editing it" target={fullPath} width={500}
          actions={[
            { label: "Reload and discard my edits", left: true, kind: "danger", onClick: () => done(`Reloaded ${file}; your 2 edits are gone`), title: "Read the new version and lose your 2 unsaved edits" },
            { label: "Keep mine", cancel: true, onClick: () => done(`Kept your version of ${file}; saving will ask before it overwrites the other change`), title: "Keep your edits; the next save asks before it overwrites" },
            { label: "Compare", kind: "primary", onClick: () => done("Compare opens both versions side by side to merge them (drawn with the source view)"), title: "See both versions side by side and merge them" },
          ]}>
          <p>Another program changed 3 lines 2 minutes ago. Your 2 unsaved edits in this file:</p>
          <ul className="cg-dialog-list" aria-label="Your unsaved edits">
            <li><KindIcon kind="unit" size={14} /><span>Warden Squad <span className="d-muted">· cost 18 → 16</span></span></li>
            <li><KindIcon kind="upgrade" size={14} /><span>Halberd <span className="d-muted">· cost 2 → 3</span></span></li>
          </ul>
          <p className="d-muted">Both versions changed Warden Squad. Compare shows them side by side so you can take either side per change.</p>
        </Dialog>
      );
    } else {
      dialog = (
        <Dialog platform="mac" tone="error" icon={<X size={18} />} title="Couldn’t save squads.dkl" target={fullPath} width={480}
          actions={[
            { label: "Save as…", left: true, onClick: () => done("Save as… asks for a folder on another disk"), title: "Save the dataset to another folder" },
            { label: "Cancel", cancel: true, onClick: () => done("Not saved: your edits stay in the editor"), title: "Keep editing; the edits stay unsaved" },
            { label: "Retry", kind: "primary", onClick: () => done(`Saved ${file}`), title: "Try to save again" },
          ]}>
          <p>The disk is full: saving needs 48 KB and 12 KB are free.</p>
          <p>Your edits are kept in the editor. Nothing was half-written: Field Cogitator writes to a temporary file and replaces the module only when that succeeds. 3 other changed files were saved.</p>
        </Dialog>
      );
    }
    overlay = <div className="cg-scrim">{dialog}</div>;
  }

  return (
    <div ref={root} className="e1s-over-host" onKeyDown={onKey}>
      <DirectionD mode={mode} interactive={false} />
      <div className={`fc-cg fc-d fc-spec e1s-over ${mode}`} style={{ pointerEvents: interactive ? undefined : "none" }}>
        {overlay}
        {toast ? (
          <div className="e1s-toast" role="status">
            <span>{toast}</span>
            <button type="button" onClick={() => go(initial)}>Show the {initial === "switcher" ? "switcher" : "dialog"} again</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
