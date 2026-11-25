import { ArrowRightLeft, Check, CornerDownLeft, FileCode2, FileX, FolderOpen } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { TrafficLights, WinCaption } from "../../frames";
import { DiagIcon } from "../../glyphs";
import { layout } from "../../language/layout";
import { useWindowKeys } from "../editor/shell";
import { E1Window, ProgressRow, Select, Toggle, keyFor, type StepStatus } from "../start/parts";
import type { E1Mode, E1Platform } from "../types";
import { c1Differences, conversionFacts, convertInput, convertOutput, ignoredFiles, inputDocs, type ConvertState } from "./data";
import { CommandLine, ContractRow, Facts, Head, VerdictMark } from "./common";

/**
 * Screen 2: Convert from XML data (the start window's "Convert from XML data…", File › Convert…). Its own window: the
 * options stay in the left column (input, output, dataset, preservation, verify), the right pane shows the input's
 * documents, then the steps with counts, then the report: the contracts (C2 semantic equivalence, C1 source information,
 * C3 kept bytes), the numbers `convert --json` reports, each document with its differences, the preservation diagnostics,
 * and Open the converted dataset. The run is `augur dklpo convert … --full-map` followed by `augur dklpo roundtrip`.
 */

const STEPS = [
  { label: "Read the documents", of: 5, unit: "documents", len: 3 },
  { label: "Import", of: 412, unit: "entities", len: 3 },
  { label: "Convert to DKLPO", of: 5, unit: "modules", len: 4 },
  { label: "Check the output compiles", of: 5, unit: "modules", len: 2 },
  { label: "Write the dataset", of: 18, unit: "files", len: 2 },
  { label: "Verify: C2 semantic equivalence", of: 412, unit: "entities", len: 3 },
  { label: "Verify: C1 source information", of: 5, unit: "documents", len: 3 },
];
const END = STEPS.reduce((n, s) => n + s.len, 0);

function steps(tick: number, verify: boolean) {
  let at = 0;
  return STEPS.filter((s) => verify || !s.label.startsWith("Verify")).map((s) => {
    const start = at; at += s.len;
    const p = tick >= start + s.len ? 1 : tick <= start ? 0 : (tick - start) / s.len;
    const status: StepStatus = p >= 1 ? "done" : tick >= start ? "running" : "waiting";
    return { label: s.label, status, value: p, count: status === "waiting" ? "" : `${Math.round(p * s.of)} of ${s.of} ${s.unit}` };
  });
}

type Phase = "options" | "converting" | "equal" | "differences" | "refused";

/**
 * E1-5 as built (approved by the user 2026-11-25): B2, the window is 1120 × 760 (at least 960 × 600), its own window
 * beside the editor; B10, the key and version fields show the converter's defaults as their values, and an invalid
 * version marks the field and keeps Convert unavailable with the reason; B9, the commands to copy write the home as `~`
 * outside the quotes, quote paths with spaces, and name --dataset-key / --version only when changed from the defaults,
 * --locale / --text-columns only when not en / auto; convert and roundtrip are two commands, each with its Copy.
 */
const AS_BUILT_WINDOW = { width: 1120, height: 760 };
const AS_BUILT_INPUT = "~/Downloads/'Skirmish XML'";
const AS_BUILT_INPUT_SHOWN = "~/Downloads/Skirmish XML";
const AS_BUILT_OUTPUT = "~/Datasets/demo-skirmish";

export function ConvertScreen({ mode, platform, state = "options", interactive }: { mode: E1Mode; platform: E1Platform; state?: string; interactive: boolean }) {
  const asBuilt = state === "window" || state === "commands";
  const badVersion = state === "window";
  const commands = state === "commands";
  const s = (asBuilt ? (commands ? "equal" : "options") : ["options", "converting", "equal", "differences", "refused"].includes(state) ? state : "options") as ConvertState;
  const [phase, setPhase] = useState<Phase>(s);
  const [tick, setTick] = useState(s === "converting" ? 9 : 0);
  const [kind, setKind] = useState<"folder" | "archive" | "files">("folder");
  const [envelope, setEnvelope] = useState(true);
  const [original, setOriginal] = useState(true);
  const [update, setUpdate] = useState(false);
  const [verify, setVerify] = useState(true);
  const [locale, setLocale] = useState(commands ? "de" : "en");
  const [columns, setColumns] = useState("Auto");
  const [dry, setDry] = useState(false);
  const result = useRef<Phase>(s === "differences" ? "differences" : "equal");
  const timer = useRef<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);
  /* The commands state shows the end of the report, where the commands to copy stand (the pane scrolls, not the page). */
  useEffect(() => { if (commands && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [commands]);

  const convert = (dryRun: boolean) => {
    if (!interactive || phase === "refused") return;
    setDry(dryRun); setPhase("converting"); setTick(0);
    if (timer.current) window.clearInterval(timer.current);
    const last = verify ? END : END - 6;
    timer.current = window.setInterval(() => setTick((t) => {
      if (t + 1 >= last) { if (timer.current) window.clearInterval(timer.current); timer.current = null; setPhase(result.current); return last; }
      return t + 1;
    }), 140);
  };
  const cancel = () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; setPhase("options"); };
  const keys = useRef({ convert, cancel, phase });
  keys.current = { convert, cancel, phase };
  const claim = useWindowKeys(interactive, (event) => {
    if (event.metaKey && event.key === "Enter" && keys.current.phase === "options") { event.preventDefault(); keys.current.convert(false); }
    if (event.key === "Escape" && keys.current.phase === "converting") keys.current.cancel();
  });

  const mac = platform === "mac";
  const busy = phase === "converting";
  const written = (phase === "equal" || phase === "differences") && !dry && !update;
  const opt = (text: string, on: boolean, set: (v: boolean) => void, help: ReactNode, disabled?: boolean, title?: string) => (
    <div className={`cg-tl-opt${disabled ? " off" : ""}`}>
      {mac ? <Toggle platform={platform} on={on} text={text} onChange={disabled || busy ? undefined : set} disabled={disabled} title={title} />
        : <span className="cg-tl-opt-row"><span>{text}</span><Toggle platform={platform} on={on} text={text} onChange={disabled || busy ? undefined : set} disabled={disabled} title={title} /></span>}
      <p className="cg-tl-help">{help}</p>
    </div>
  );

  /* ---------- Left: the options (the command's flags, in words) ---------- */
  const options = (
    <aside className="cg-tl-cv-side" style={{ width: layout.pageMin }} aria-label="Conversion options">
      <div className="cg-tl-cv-title">
        {mac ? <TrafficLights /> : null}
        <span className="cg-tl-cv-name"><ArrowRightLeft size={16} /><strong>Convert from XML data</strong></span>
      </div>
      <div className="cg-tl-form" inert={busy ? true : undefined}>
        <section>
          <Head>Input</Head>
          <span className="cg-seg cg-tl-seg" role="radiogroup" aria-label="Input is">
            {([["folder", "Folder"], ["archive", "Archive"], ["files", "Files"]] as const).map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={kind === id} className={kind === id ? "active" : ""} onClick={() => setKind(id)}
                title={id === "folder" ? "A folder of XML data files (every file below it)" : id === "archive" ? "A .zip, or one compressed .gstz / .catz" : "Some .gst / .cat files"}>{label}</button>
            ))}
          </span>
          <span className="cg-tl-pathrow"><span className="cg-tl-field mono" title={commands ? AS_BUILT_INPUT_SHOWN : convertInput[platform]}>{commands ? AS_BUILT_INPUT_SHOWN : kind === "archive" ? `${convertInput[platform]}.zip` : convertInput[platform]}</span><button type="button" className="d-btn">Choose…</button></span>
          <p className="cg-tl-help">{phase === "refused" ? <span className="cg-err">ember-guard.cat isn’t readable: see the report.</span> : <>5 documents: 1 game system, 4 catalogues; {ignoredFiles.length} other files ignored.</>}</p>
        </section>
        <section>
          <Head>Output</Head>
          <span className="cg-tl-pathrow"><span className="cg-tl-field mono" title={commands ? AS_BUILT_OUTPUT : convertOutput[platform]}>{commands ? AS_BUILT_OUTPUT : convertOutput[platform]}</span><button type="button" className="d-btn">Choose…</button></span>
          {opt("Update a dataset converted before", update, setUpdate, <>Otherwise the folder must be new or empty. Update rewrites it in place; key changes become move records.</>)}
        </section>
        <section>
          <Head>Dataset</Head>
          <div className="cg-tl-grid2">
            <label style={badVersion ? { alignSelf: "start" } : undefined}><span>Key</span><span className="cg-tl-field mono" title={asBuilt ? "The converter's default is shown as the value; changing it adds --dataset-key" : undefined}>{commands ? "demo-skirmish" : "skirmish-xml"}</span></label>
            <label><span>Version</span><span className={`cg-tl-field mono${badVersion ? " invalid" : ""}`} aria-invalid={badVersion || undefined}>{badVersion ? "1.0" : "1.0.0"}</span>{badVersion ? <span className="cg-tl-fielderr">Three numbers, like 1.0.0</span> : null}</label>
            <span><span>Text language</span><Select platform={platform} value={locale} options={["en", "de", "fr"]} onChange={setLocale} label="Text language" /></span>
            <span><span>Text columns</span><Select platform={platform} value={columns} options={["Auto", "None", "All"]} onChange={setColumns} label="Profile columns marked as text" /></span>
          </div>
        </section>
        <section>
          <Head>Preservation</Head>
          {opt("Compatibility envelope", envelope, (v) => { setEnvelope(v); if (!v) setOriginal(false); },
            <>Comments, order, number forms and unknown data come back on export (C1). Off: it behaves the same (C2), but no export is exact.</>)}
          {opt("Keep the original files", original, setOriginal, <>Stores the files’ bytes in <code>compat/original/</code>: an unedited export can return them (C3).</>, !envelope, envelope ? undefined : "Needs the compatibility envelope")}
          <p className="cg-tl-help cg-tl-fixed"><Check size={12} />Every XML id is kept in the id map (full map).</p>
        </section>
        <section>
          <Head>Verify</Head>
          {opt("Run a roundtrip after converting", verify, setVerify, <>C2 and C1 on the input, as <code>roundtrip</code> does.</>)}
        </section>
      </div>
      <footer className="cg-tl-cv-actions">
        {written ? <span className="cg-tl-help cg-tl-why">Converted. To convert again, turn on Update or choose another output folder.</span> : null}
        {badVersion ? <span className="cg-tl-help cg-tl-why">Convert is unavailable: the version 1.0 isn’t three numbers (like 1.0.0).</span> : null}
        {written || (dry && (phase === "equal" || phase === "differences"))
          ? <button type="button" className="d-btn" onClick={() => setPhase("options")} title="Back to the options and the input's documents">Convert another</button>
          : <button type="button" className="d-btn" onClick={() => convert(true)} disabled={busy || phase === "refused" || badVersion} title={badVersion ? "The version isn’t valid: three numbers, like 1.0.0" : "Convert and report; write nothing"}>Dry run</button>}
        <button type="button" className="d-btn primary" onClick={() => convert(false)} disabled={busy || phase === "refused" || written || badVersion}
          title={badVersion ? "The version isn’t valid: three numbers, like 1.0.0" : phase === "refused" ? "The input can’t be read: choose another" : written ? "The output folder isn’t empty now: turn on Update, or choose another folder" : "Convert and write the dataset"}>Convert<kbd>{keyFor(platform, "⌘↵", "Ctrl+Enter")}</kbd></button>
      </footer>
    </aside>
  );

  /* ---------- Right: input, progress, report ---------- */
  const cmd = `augur dklpo convert ${convertInput.mac} --out ${convertOutput.mac} --full-map${original ? " --keep-original" : ""}${envelope ? "" : " --no-compat"}`;
  let title: ReactNode;
  let body: ReactNode;
  if (phase === "options") {
    title = <><strong>skirmish-xml</strong><span className="d-muted">5 documents · 182 KB</span></>;
    body = (
      <>
        <div className="cg-tl-docs" role="table" aria-label="Documents in the input">
          <div className="cg-tl-doc head" role="row"><span role="columnheader">File</span><span role="columnheader">Kind</span><span role="columnheader">Becomes module</span><span role="columnheader" className="num">Entities</span><span role="columnheader" className="num">Size</span></div>
          {inputDocs.map((d) => (
            <div key={d.file} className="cg-tl-doc" role="row">
              <span role="cell" className="mono"><FileCode2 size={14} />{d.file}</span><span role="cell">{d.kind}</span><span role="cell" className="mono">{d.module}</span><span role="cell" className="num">{d.entities}</span><span role="cell" className="num">{d.size}</span>
            </div>
          ))}
        </div>
        <p className="cg-tl-note">Ignored: {ignoredFiles.map((f) => <code key={f}>{f}</code>).reduce<ReactNode[]>((a, c, i) => (i ? [...a, ", ", c] : [c]), [])} (not data documents).</p>
        <Head note={`in ${convertOutput[platform]}`}>What Convert writes</Head>
        <Facts rows={[
          { label: "Manifest", value: <><code>dataset.dkl</code><span className="d-muted">key skirmish-xml, version 1.0.0, checking: lenient</span></> },
          { label: "Modules", value: <>5 folders, each <code>module.dkl</code> and <code>text/{locale}.dkl</code></> },
          { label: "Id map", value: <>412 lines<span className="d-muted">every XML id against its DKLPO path</span></> },
          { label: "Envelope", value: envelope ? <>The compatibility envelope<span className="d-muted">what DKLPO itself doesn’t hold</span></> : <span className="d-muted">None (C2 only)</span> },
          { label: "Originals", value: original ? <>5 files under <code>compat/original/</code><span className="d-muted">with their SHA-256</span></> : <span className="d-muted">Not kept</span> },
        ]} />
        <p className="cg-tl-note">Nothing is written until Convert. Dry run converts and reports without writing.</p>
      </>
    );
  } else if (phase === "converting") {
    title = <><strong>{dry ? "Dry run: converting skirmish-xml" : "Converting skirmish-xml"}</strong><span className="d-muted">to {convertOutput[platform]}</span></>;
    body = (
      <section aria-live="polite">
        <div className="cg-tl-steps cg-tl-steps-wide">{steps(tick, verify).map((x) => <ProgressRow key={x.label} status={x.status} label={x.label} count={x.count} value={x.status === "running" ? x.value : undefined} />)}</div>
        <p className="cg-tl-note">The XML data files aren’t changed. Nothing is written before the output compiles complete; Cancel removes a half-written dataset.</p>
        <p className="cg-tl-actions"><button type="button" className="d-btn" onClick={cancel}>Cancel converting<kbd>Esc</kbd></button></p>
      </section>
    );
  } else if (phase === "refused") {
    title = <><FileX size={16} className="cg-err" /><strong>Couldn’t read the input</strong><span className="d-muted">nothing was written</span></>;
    body = (
      <>
        <div className="cg-tl-errline cg-tl-refused">
          <p><DiagIcon kind="error" size={13} /><span className="mono">ember-guard.cat</span><span className="mono d-muted">dklpo/encoding</span></p>
          <p>Not valid UTF-8 at byte 18 422. A data document has to be UTF-8; the conversion stops before anything is written.</p>
          <p className="cg-tl-actions">
            <button type="button" className="d-btn sm primary"><FolderOpen size={12} />Choose another input…</button>
            <button type="button" className="d-btn sm">{mac ? "Show in Finder" : "Show in Explorer"}</button>
          </p>
        </div>
        <Head note="not converted">The other documents</Head>
        <div className="cg-tl-docs">
          {inputDocs.filter((d) => d.file !== "ember-guard.cat").map((d) => <div key={d.file} className="cg-tl-doc" role="row"><span className="mono"><FileCode2 size={14} />{d.file}</span><span>{d.kind}</span><span className="d-muted">read, waiting</span><span className="num">{d.entities}</span><span className="num">{d.size}</span></div>)}
        </div>
        <p className="cg-tl-note">The command line stops the same way: <code>convert</code> exits with 3 (input can’t be read) before writing.</p>
        <CommandLine command={cmd} />
      </>
    );
  } else {
    const diff = phase === "differences";
    title = (
      <>
        <strong>{dry ? "Dry run: skirmish-xml converts" : commands ? "Converted Skirmish XML" : "Converted skirmish-xml"}</strong>
        <VerdictMark v={diff ? "different" : "equal"}>{diff ? "2 documents differ" : "Equal"}</VerdictMark>
        <span className="d-muted">3.8 s</span>
        <span className="d-spacer" />
        <button type="button" className="d-btn">{mac ? "Show in Finder" : "Show in Explorer"}</button>
        <button type="button" className="d-btn primary" disabled={dry} title={dry ? "A dry run wrote nothing: Convert first" : "Open the new dataset in an editor window"}><CornerDownLeft size={13} />{dry ? "Nothing to open: dry run" : "Open the converted dataset"}{dry ? null : <kbd>{keyFor(platform, "↵", "Enter")}</kbd>}</button>
      </>
    );
    body = (
      <>
        <div className="cg-tl-contracts">
          <ContractRow tag="C2" title="Semantic equivalence" what="The engine reads the same data: norm of the import and of the converted dataset" v="equal" detail="412 entities, 0 differences" />
          <ContractRow tag="C1" title="Source information" what="Every document comes back from the dataset and its envelope: nothing lost, nothing added" v={diff ? "different" : "equal"}
            detail={diff ? "3 of 5 documents equal · 3 differences in 2 documents" : "5 of 5 documents equal"} />
          <ContractRow tag="C3" title="Identical bytes" what="The original files are kept, so an unedited export can return them" v={original ? "equal" : "not-run"} detail={original ? "5 files kept, SHA-256 recorded" : "Originals not kept"} />
        </div>
        <Head note={dry ? "a dry run: nothing was written" : `in ${commands ? AS_BUILT_OUTPUT : convertOutput[platform]}`}>Written</Head>
        <Facts rows={[
          { label: "Documents", value: <>{conversionFacts.documents}<span className="d-muted">1 game system, 4 catalogues</span></> },
          { label: "Entities", value: <>{conversionFacts.entities}</> },
          { label: "Files", value: <>{conversionFacts.files}<span className="d-muted">+ {conversionFacts.originals} originals under compat/original/</span></> },
          { label: "Envelope", value: <>31 entries<span className="d-muted">{conversionFacts.envelope.map((e) => `${e.type} ${e.n}`).join(" · ")}</span></> },
          { label: "Id map", value: <>{conversionFacts.mapLines} lines</> },
        ]} />
        <Head note="C1 per document">Documents</Head>
        <div className="cg-tl-doclist">
          {inputDocs.map((d) => {
            const list = diff ? c1Differences[d.file] ?? [] : [];
            return (
              <div key={d.file} className={`cg-tl-docres${list.length ? " edge-preservation" : ""}`}>
                <p className="cg-tl-docres-line"><span className="mono">{d.file}</span><span className="d-muted">→ {d.module}/</span><span className="d-spacer" /><VerdictMark v={list.length ? "different" : "equal"}>{list.length ? `${list.length} difference${list.length === 1 ? "" : "s"}` : "Equal"}</VerdictMark></p>
                {list.map((x) => (
                  <p key={x.path} className="cg-tl-tdiff"><span className={`cg-tl-cls ${x.cls}`}>{x.cls}</span><span className="mono">{x.path}</span><span className="cg-tl-ab">{x.a}<span>→</span>{x.b}</span></p>
                ))}
              </div>
            );
          })}
        </div>
        <Head note={diff ? "listed in the dataset’s inbox" : undefined}>Diagnostics</Head>
        {diff ? (
          <ul className="cg-tl-diaglist">
            <li><DiagIcon kind="preservation" size={13} /><span className="mono">preserve/c1-diff</span><span>iron-wardens.cat: a number form (05) and a comment’s place don’t come back</span></li>
            <li><DiagIcon kind="preservation" size={13} /><span className="mono">preserve/c1-diff</span><span>demo-skirmish.gst: a namespace is declared on the element, not on the root</span></li>
            <li><DiagIcon kind="preservation" size={13} /><span className="mono">preserve/unclassified</span><span>frost-wardens.cat: a processing instruction is kept as an unclassified node</span></li>
          </ul>
        ) : <p className="cg-tl-note cg-tl-okline"><Check size={13} />No errors and no preservation failures. 2 authoring suggestions, listed in the dataset.</p>}
        {diff ? <p className="cg-tl-note">The dataset is written and behaves the same (C2 equal). An export won’t give these 2 documents back byte for byte; until then the differences stay in the inbox as preservation failures.</p> : null}
        {commands ? (
          <>
            <CommandLine command={`augur dklpo convert ${AS_BUILT_INPUT} --out ${AS_BUILT_OUTPUT} --full-map${envelope ? "" : " --no-compat"}${envelope && original ? " --keep-original" : ""}${locale !== "en" ? ` --locale ${locale}` : ""} --dataset-key demo-skirmish`} />
            {verify ? <CommandLine command={`augur dklpo roundtrip ${AS_BUILT_INPUT}${locale !== "en" ? ` --locale ${locale}` : ""}`} /> : null}
          </>
        ) : <CommandLine command={`${cmd}${verify ? ` && augur dklpo roundtrip ${convertInput.mac}` : ""}`} />}
      </>
    );
  }

  return (
    <E1Window mode={mode} platform={platform} label="Convert from XML data" className={interactive ? "" : "static"} {...(badVersion ? AS_BUILT_WINDOW : {})}>
      <div className="e1s-grid cg-tl-cv" style={{ gridTemplateColumns: `${layout.pageMin}px minmax(0, 1fr)` }} onPointerDownCapture={claim} onFocusCapture={claim}>
        {options}
        <main className="cg-tl-cv-main" aria-label="Conversion">
          <header className="cg-tl-cv-top"><span className="cg-tl-cv-head">{title}</span>{mac ? null : <WinCaption />}</header>
          <div className="cg-tl-cv-body" ref={bodyRef}><div style={{ maxWidth: layout.pageMax }}>{body}</div></div>
        </main>
      </div>
    </E1Window>
  );
}
