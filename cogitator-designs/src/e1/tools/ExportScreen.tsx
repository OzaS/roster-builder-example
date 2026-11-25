import { Check, FileOutput, FolderOpen, X } from "lucide-react";
import { useRef, useState } from "react";
import { DiagIcon } from "../../glyphs";
import { useWindowKeys, type Mode } from "../editor/shell";
import { Radios, Select, Toggle } from "../start/parts";
import { exportDest, exportFiles, exportReasons, type ExportState } from "./data";
import { EditorBehind, Sheet, sheetWidth, type SheetAction } from "./common";

/**
 * Screen 3: Export (File › Export…, ⇧⌘E) as a sheet over the editor. Format, destination and text language, then the
 * exactness the export would have, computed as the sheet opens (`export --dry-run`): exact (every envelope entry current;
 * the original files can come back byte for byte) or not exact with each reason (`preserve/stale`, `preserve/unbound`,
 * `preserve/conflict`, `preserve/original-outdated`), and that a non-exact export still writes. Require exact (`--exact`)
 * and Write the original files (`--original`) are the command's flags. A Level 1 construct refuses the export by name.
 */

type Phase = "exact" | "non-exact" | "written" | "failed" | "write-failed";

/**
 * E1-5 as built (approved by the user 2026-11-25): A12, a dataset without an envelope reads "Not exact: no envelope
 * (bsdata.compat.json)" with Require an exact export off; A13, a write that fails shows the reason, the files written
 * before it stopped and Try again; A14 (changed by the user), the written sizes are B, KB or MB as Convert writes them.
 */
const AS_BUILT = ["written-sizes", "no-envelope", "write-failed"] as const;
type AsBuilt = (typeof AS_BUILT)[number];

/** Convert's sizeText: bytes as B, KB or MB (one decimal above a kilobyte). */
export function sizeText(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
const bytesOf = (text: string) => Number(text.replace(/\D/g, ""));

export function ExportScreen({ mode, state = "exact", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const built = (AS_BUILT as readonly string[]).includes(state) ? (state as AsBuilt) : null;
  const noEnvelope = built === "no-envelope";
  const s = (built === "written-sizes" ? "written" : built ? "non-exact" : ["exact", "non-exact", "written", "failed"].includes(state) ? state : "exact") as ExportState;
  const exact = s === "exact";
  const [phase, setPhase] = useState<Phase>(built === "write-failed" ? "write-failed" : s);
  const [format, setFormat] = useState<"xml" | "json">("xml");
  const [locale, setLocale] = useState("en");
  const [requireExact, setRequireExact] = useState(exact);
  const [original, setOriginal] = useState(false);
  const [open, setOpen] = useState(true);
  const keys = useRef({ esc: () => undefined as void });
  keys.current = { esc: () => setOpen(false) };
  const claim = useWindowKeys(interactive, (event) => { if (event.key === "Escape") keys.current.esc(); });

  const refusedExact = !exact && requireExact;
  const reasonsNote = noEnvelope ? "no envelope" : "2 stale, 1 unbound";
  let sheet;
  if (phase === "write-failed") {
    const done = exportFiles.slice(0, 2);
    sheet = (
      <Sheet label="Can't export" tone="error" icon={<X size={18} />} title={`Can’t export Demo Skirmish to ${exportDest}`} target="~/Datasets/demo-skirmish" width={sheetWidth}
        note={`${done.length} files were written before it stopped.`}
        actions={[
          { label: "Cancel", cancel: true, onClick: () => setOpen(false) },
          { label: "Try again", kind: "primary", onClick: () => setPhase("non-exact"), title: "Back to the sheet: the dry run runs again" },
        ]}>
        <p>No space left on the disk while writing <span className="mono">frost-wardens.cat</span> (ENOSPC).</p>
        <div className="cg-tl-files" role="list" aria-label="Written before it stopped">
          {done.map((f) => <p key={f.path} role="listitem"><Check size={14} /><span className="mono">{f.path}</span><span className="num">{sizeText(bytesOf(f.bytes))}</span></p>)}
        </div>
        <p className="d-muted">Each file is written beside its name and then put in its place, so no file is left half written.</p>
      </Sheet>
    );
  } else if (phase === "failed") {
    sheet = (
      <Sheet label="Can't export" tone="error" icon={<X size={18} />} title="Can’t export Demo Skirmish as XML data files" target="~/Datasets/demo-skirmish" width={sheetWidth}
        note="Nothing was written. Exact or not, a construct without an XML form stops the export."
        actions={[
          { label: "Cancel", cancel: true, onClick: () => setOpen(false) },
          { label: "Open Warden Captain", kind: "primary", onClick: () => setOpen(false), title: "Open the entry with the computed cost" },
        ]}>
        <p>XML data files have no form for a Level 1 construct, and Demo Skirmish has one:</p>
        <div className="cg-tl-reasons">
          <div className="cg-tl-reason error">
            <p><DiagIcon kind="error" size={13} /><strong>Warden Captain › Cost</strong><span className="mono">export/level1</span></p>
            <p>A computed cost (it depends on how many models are taken): XML data files store a fixed cost per entry.</p>
          </div>
        </div>
        <p className="d-muted">Make the cost a fixed number to export, or keep the dataset in DKLPO only. Other formats can export it later.</p>
      </Sheet>
    );
  } else if (phase === "written") {
    sheet = (
      <Sheet label="Exported" tone="info" icon={<Check size={18} />} title="Exported 5 documents" target={exportDest} width={sheetWidth}
        note={<span className="cg-tl-sheet-note warn">Not exact: 3 envelope entries weren’t applied ({reasonsNote}). They stay listed in the inbox.</span>}
        actions={[{ label: "Done", cancel: true, onClick: () => setOpen(false) }, { label: "Show in Finder", kind: "primary", onClick: () => setOpen(false) }]}>
        <div className="cg-tl-files" role="list" aria-label="Written files">
          {exportFiles.map((f) => <p key={f.path} role="listitem"><Check size={14} /><span className="mono">{f.path}</span><span className="num">{built ? sizeText(bytesOf(f.bytes)) : `${f.bytes} bytes`}</span></p>)}
        </div>
        <p className="d-muted">Edited values are written in canonical form; every other recorded comment, order and number form came back.</p>
      </Sheet>
    );
  } else {
    const actions: SheetAction[] = [
      { label: "Cancel", cancel: true, onClick: () => setOpen(false) },
      { label: refusedExact ? "Export refused" : exact || noEnvelope ? "Export" : "Export anyway", kind: "primary", disabled: refusedExact,
        title: refusedExact ? `An exact export stops: ${reasonsNote}. Turn off Require an exact export to write anyway.` : "Write the documents", onClick: () => setPhase("written") },
    ];
    sheet = (
      <Sheet label="Export" icon={<FileOutput size={18} />} title="Export Demo Skirmish as XML data files" target="~/Datasets/demo-skirmish · 5 modules" width={sheetWidth}
        note={refusedExact ? <span className="cg-tl-sheet-note warn">An exact export stops here ({reasonsNote}) and writes nothing. Turn off Require an exact export to write anyway.</span> : undefined}
        actions={actions}>
        <div className="cg-tl-rows">
          <div className="cg-tl-row"><span>Format</span><div>
            <Radios label="Format" value={format} onChange={setFormat} options={[
              { id: "xml", label: "XML data files (.gst, .cat)" },
              { id: "json", label: "JSON data files (.json)" },
            ]} />
            <p className="cg-tl-help">Each document keeps the format it was converted from; this one is for documents added since.</p>
          </div></div>
          <div className="cg-tl-row"><span>Destination</span><div><span className="cg-tl-pathrow"><span className="cg-tl-field mono">{exportDest}</span><button type="button" className="d-btn"><FolderOpen size={13} />Choose…</button></span></div></div>
          <div className="cg-tl-row"><span>Text language</span><div><span><Select platform="mac" value={locale} options={["en", "de"]} onChange={setLocale} label="Text language" /></span></div></div>
        </div>
        <section className="cg-tl-exact" aria-label="Exactness">
          {exact ? (
            <>
              <p className="cg-tl-exact-head ok"><Check size={15} />Exact: every document comes back as it was read<span className="d-muted">dry run, just now</span></p>
              <p className="cg-tl-counts"><span><strong>31</strong> envelope entries current</span><span><strong>0</strong> stale</span><span><strong>0</strong> unbound</span><span><strong>0</strong> conflicts</span></p>
            </>
          ) : noEnvelope ? (
            <p className="cg-tl-exact-head warn"><DiagIcon kind="preservation" size={15} />Not exact: no envelope (bsdata.compat.json), so documents are written in canonical form<span className="d-muted">dry run, just now</span></p>
          ) : (
            <>
              <p className="cg-tl-exact-head warn"><DiagIcon kind="preservation" size={15} />Not exact: 3 envelope entries won’t apply<span className="d-muted">dry run, just now</span></p>
              <p className="cg-tl-counts"><span><strong>28</strong> current</span><span className="warn"><strong>2</strong> stale</span><span className="warn"><strong>1</strong> unbound</span><span><strong>0</strong> conflicts</span></p>
              <div className="cg-tl-reasons">
                {exportReasons.map((r) => (
                  <div key={r.where} className="cg-tl-reason">
                    <p><DiagIcon kind="preservation" size={13} /><strong>{r.entry}</strong><span className="mono">{r.code}</span></p>
                    {r.code === "preserve/unbound" ? <span className="d-muted">removed</span> : <button type="button" className="cg-linkbtn">Open</button>}
                    <p>{r.what}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="cg-tl-opt">
            <Toggle platform="mac" on={requireExact} text="Require an exact export" onChange={setRequireExact} />
            <p className="cg-tl-help">{exact ? "Stops and writes nothing if any entry is stale, unbound or conflicting." : noEnvelope ? "Off: the export writes all 5 documents in canonical form; on, it stops: without an envelope no export is exact." : "Off: the export writes all 5 documents, edited values in canonical form, and lists the 3 entries as warnings."}</p>
          </div>
          <div className={`cg-tl-opt${exact ? "" : " off"}`}>
            <Toggle platform="mac" on={exact && original} text="Write the original files" onChange={exact ? setOriginal : undefined} disabled={!exact}
              title={exact ? "Return the 5 original files byte for byte" : noEnvelope ? "Unavailable: no original files were kept at conversion" : "Unavailable: the dataset changed since the conversion"} />
            <p className="cg-tl-help">{exact
              ? "Available: nothing changed since the conversion, so the 5 kept files come back byte for byte (C3)."
              : noEnvelope ? <>Unavailable: no original files were kept at conversion (<code>preserve/no-original</code>).</>
              : <>Unavailable: the dataset changed since the conversion (<code>preserve/original-outdated</code>).</>}</p>
          </div>
        </section>
      </Sheet>
    );
  }

  return (
    <EditorBehind mode={mode} interactive={interactive} onClaim={claim} modal={open} updates={exact ? 6 : 10}
      overlay={open ? <div className="cg-scrim cg-tl-scrim">{sheet}</div> : (
        <div className="e1s-toast cg-tl-toast" role="status"><span>{phase === "written" ? `Exported 5 documents to ${exportDest}` : "Export cancelled: nothing was written"}</span><button type="button" onClick={() => setOpen(true)}>Show the sheet again</button></div>
      )} />
  );
}

