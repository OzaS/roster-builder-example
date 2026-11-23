import { FileCode2, FolderOpen, Play, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { BackForward, EditorGrid, Sidebar, Win, useWindowKeys, type Mode } from "../editor/shell";
import { c1Differences, c2Differences, convertInput, inputDocs, type RoundtripState } from "./data";
import { CommandLine, ContractRow, Facts, Head, Hunk, VerdictMark, type Verdict } from "./common";

/**
 * Screen 4: Roundtrip as a tool view (palette › Roundtrip, Tools menu), in place of the list and the page like the
 * diagnostics inbox. Two routes, as `augur dklpo roundtrip` has them: from the XML data the dataset was converted from
 * (C2: norm of the import against norm of the converted dataset; C1: every document's source tree against its original),
 * or from this dataset (the reverse route: write the XML twice and compare the bytes, import and compare norm, and with
 * reconvert convert back and compare ids and files). The left column lists the contracts and the documents with their
 * verdicts; the right shows what the selected row compared and every difference.
 */

type Route = "xml" | "dataset";
type Sel = string;

const xmlRows = (diff: boolean, refused: boolean): { id: Sel; tag: string; title: string; what: string; v: Verdict; detail: string }[] => [
  { id: "c2", tag: "C2", title: "Semantic equivalence", what: "norm of the import (IR₁) against norm of the converted dataset (IR₂)", v: refused ? "not-run" : diff ? "different" : "equal", detail: refused ? "Not run: the import stopped" : diff ? "412 entities · 1 difference" : "412 entities · 0 differences" },
  { id: "c1", tag: "C1", title: "Source information", what: "each regenerated document’s source tree against its original, both ways", v: refused ? "not-run" : diff ? "different" : "equal", detail: refused ? "Not run" : diff ? "3 of 5 documents equal · 3 differences" : "5 of 5 documents equal" },
];
const reverseRows: { id: Sel; tag: string; title: string; what: string; v: Verdict; word: string; detail: string }[] = [
  { id: "write", tag: "W", title: "Deterministic writing", what: "the dataset written as XML data twice, without the envelope", v: "equal", word: "Identical", detail: "5 documents · the two writings are byte-identical" },
  { id: "import", tag: "C2", title: "Import and compare", what: "norm of the written documents’ import against the dataset’s own lowering", v: "equal", word: "Equal", detail: "412 entities · 0 differences" },
  { id: "reconvert", tag: "RC", title: "Reconvert", what: "the written XML converted back to DKLPO: norm, identities and files", v: "equal", word: "Equal", detail: "412 ids stable · 12 files the same, 1 changed (listed)" },
];

export function RoundtripScreen({ mode, state = "equal", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["equal", "differences", "reverse", "refused"].includes(state) ? state : "equal") as RoundtripState;
  const [route, setRoute] = useState<Route>(s === "reverse" ? "dataset" : "xml");
  const [sel, setSel] = useState<Sel>(s === "differences" ? "iron-wardens.cat" : s === "reverse" ? "reconvert" : s === "refused" ? "" : "c2");
  const [busy, setBusy] = useState(false);
  const [ran, setRan] = useState<string>(s === "reverse" ? "14:31" : "14:24");
  const run = () => { if (busy || !interactive) return; setBusy(true); window.setTimeout(() => { setBusy(false); setRan("14:33"); }, 900); };
  const claim = useWindowKeys(interactive, () => undefined);

  const diff = s === "differences";
  const refused = s === "refused";
  const reverse = route === "dataset";

  /* ---------- Left: route, contracts, documents ---------- */
  const left = reverse ? (
    <>
      <p className="cg-tl-route"><strong>DKLPO → XML data → the engine, and back to DKLPO</strong><span className="d-muted">this dataset, <span className="mono">~/Datasets/demo-skirmish</span> · ids from the id map</span></p>
      <div className="cg-tl-contracts">
        {reverseRows.map((r) => <ContractRow key={r.id} tag={r.tag} title={r.title} what={r.what} v={r.v} word={r.word} detail={r.detail} selected={sel === r.id} onClick={() => setSel(r.id)} />)}
      </div>
    </>
  ) : (
    <>
      <p className="cg-tl-route"><strong>XML data → DKLPO → XML data, and → the engine</strong><span className="d-muted"><span className="mono">{convertInput.mac}</span> · the input this dataset was converted from</span></p>
      <div className="cg-tl-contracts">
        {xmlRows(diff, refused).map((r) => <ContractRow key={r.id} tag={r.tag} title={r.title} what={r.what} v={r.v} detail={r.detail} selected={sel === r.id} onClick={() => setSel(r.id)} />)}
      </div>
      <Head note="C1 per document">Documents</Head>
      <div className="cg-tl-doclist" role="listbox" aria-label="Documents">
        {inputDocs.map((d) => {
          const n = diff ? c1Differences[d.file]?.length ?? 0 : 0;
          const v: Verdict = refused ? "not-run" : n ? "different" : "equal";
          return (
            <button key={d.file} type="button" role="option" aria-selected={sel === d.file} className={`cg-tl-docrow${n ? " edge-preservation" : ""}${sel === d.file ? " selected" : ""}`} onClick={() => setSel(d.file)}>
              <FileCode2 size={14} /><span className="mono">{d.file}</span><span className="d-muted">{d.entities} entities</span><span className="d-spacer" /><VerdictMark v={v}>{refused ? "Not run" : n ? `${n} difference${n === 1 ? "" : "s"}` : "Equal"}</VerdictMark>
            </button>
          );
        })}
      </div>
    </>
  );

  /* ---------- Right: what the selected row compared ---------- */
  let detail: ReactNode;
  if (refused) {
    detail = (
      <>
        <p className="cg-tl-kicker"><DiagIcon kind="error" size={14} />Stopped before C2</p>
        <h2 className="cg-tl-dh">The input was only partly imported</h2>
        <div className="cg-tl-errline">
          <p><DiagIcon kind="error" size={13} /><span className="mono">extra/harbour-league.cat</span><span className="mono d-muted">convert/import-incomplete</span></p>
          <p>A catalogue of another game system (harbour-league): it can’t be imported with demo-skirmish.gst, so nothing was compared.</p>
          <p className="cg-tl-actions"><button type="button" className="d-btn sm primary"><FolderOpen size={12} />Choose another input…</button><button type="button" className="d-btn sm">Show in Finder</button></p>
        </div>
        <p className="cg-tl-note">The folder has changed since the conversion: this file wasn’t there then. Remove it from the folder, or pick the files to compare, and run again. The command line stops the same way (exit 1).</p>
        <CommandLine command={`augur dklpo roundtrip ${convertInput.mac}`} />
      </>
    );
  } else if (reverse) {
    detail = sel === "write" ? (
      <>
        <p className="cg-tl-kicker">Deterministic writing</p>
        <h2 className="cg-tl-dh">The two writings are byte-identical</h2>
        <Facts rows={exportRows()} />
        <p className="cg-tl-note">The dataset is written twice without its envelope; any byte that differs would be <code>export/nondeterministic</code>.</p>
      </>
    ) : sel === "import" ? (
      <>
        <p className="cg-tl-kicker">C2 · import and compare</p>
        <h2 className="cg-tl-dh">The engine reads the same data</h2>
        <Facts rows={[{ label: "Compared", value: <>norm of the import against the dataset’s lowering</> }, { label: "Entities", value: <>412<span className="d-muted">0 differences</span></> }, { label: "Ids", value: <>From the id map<span className="d-muted">no generated ids needed</span></> }]} />
      </>
    ) : (
      <>
        <p className="cg-tl-kicker">Reconvert</p>
        <h2 className="cg-tl-dh">Converted back, the dataset is the same</h2>
        <Facts rows={[
          { label: "norm", value: <>Equal<span className="d-muted">412 entities, 0 differences</span></> },
          { label: "Ids", value: <>412 stable<span className="d-muted">0 added · 0 removed · 0 moved · every declaration path kept</span></> },
          { label: "Files", value: <>12 the same, 1 changed<span className="d-muted">listed, not a failure; the envelope isn’t compared</span></> },
        ]} />
        <Head note="regenerated text against the dataset’s">Changed file</Head>
        <Hunk title={<span className="mono">iron-wardens/module.dkl</span>} note="2 statements in another order" edits={[
          { line: 26, before: "    profile warden: fighter | 5\" | 3 | 1" },
          { line: 26, after: "    upgrade banner ..1" },
          { line: 27, before: "    upgrade banner ..1" },
          { line: 27, after: "    profile warden: fighter | 5\" | 3 | 1" },
        ]} />
        <p className="cg-tl-note">The converter writes a model’s profile after its upgrades; the meaning is the same. Run fmt on the file to keep the converter’s order, or leave it.</p>
      </>
    );
  } else if (sel === "c2" || sel === "c1") {
    detail = (
      <>
        <p className="cg-tl-kicker">{sel === "c2" ? "C2 · semantic equivalence" : "C1 · source information"}</p>
        <h2 className="cg-tl-dh">{sel === "c2" ? (diff ? "1 difference in what the engine reads" : "The engine reads the same data") : diff ? "2 documents don’t come back exactly" : "Every document comes back"}</h2>
        {sel === "c2" && diff ? (
          <>
            <div className="cg-diff cg-tl-hunk">
              <p className="cg-diff-head"><span className="mono">norm(IR₁) → norm(IR₂)</span><span className="d-spacer" /><span className="mono">convert/roundtrip-diff</span></p>
              {c2Differences.map((x) => <div key={x.path}><p className="cg-diff-line"><span className="cg-diff-sign" /><span>{x.path}</span></p><p className="cg-diff-line del"><span className="cg-diff-sign">-</span><span>{x.a}</span></p><p className="cg-diff-line add"><span className="cg-diff-sign">+</span><span>{x.b}</span></p></div>)}
            </div>
            <p className="cg-tl-note">A difference in what the engine reads is a converter fault, not something to edit: report it with the input. The dataset still opens; this run is kept.</p>
          </>
        ) : (
          <Facts rows={sel === "c2"
            ? [{ label: "Compared", value: <>norm of the import against norm of the converted dataset</> }, { label: "Entities", value: <>412<span className="d-muted">{diff ? "1 difference" : "0 differences"}</span></> }, { label: "Ids", value: <>XML ids through the converter’s map</> }]
            : [{ label: "Compared", value: <>regenerated documents against the originals, both ways</> }, { label: "Documents", value: <>{diff ? "3 of 5 equal" : "5 of 5 equal"}</> }, { label: "Envelope", value: <>31 entries, computed through the converter’s map and read back</> }, { label: "Archives", value: <span className="d-muted">None in this input</span> }]} />
        )}
        <CommandLine command={`augur dklpo roundtrip ${convertInput.mac}`} />
      </>
    );
  } else {
    const list = diff ? c1Differences[sel] ?? [] : [];
    const doc = inputDocs.find((d) => d.file === sel);
    detail = (
      <>
        <p className="cg-tl-kicker">C1 · {doc?.kind}</p>
        <h2 className="cg-tl-dh"><span className="mono">{sel}</span>{list.length ? ` · ${list.length} difference${list.length === 1 ? "" : "s"}` : " comes back exactly"}</h2>
        <Facts rows={[{ label: "Module", value: <span className="mono">{doc?.module}/module.dkl</span> }, { label: "Entities", value: <>{doc?.entities}</> }, { label: "Size", value: <>{doc?.size}</> }]} />
        {list.length ? (
          <>
            <Head note="source tree of the original → the regenerated document">Differences</Head>
            {list.map((x) => (
              <div key={x.path} className="cg-diff cg-tl-hunk">
                <p className="cg-diff-head"><span className={`cg-tl-cls ${x.cls}`}>{x.cls}</span><span className="mono">{x.path}</span></p>
                <p className="cg-diff-line del"><span className="cg-diff-sign">-</span><span>{x.a}</span></p>
                <p className="cg-diff-line add"><span className="cg-diff-sign">+</span><span>{x.b}</span></p>
              </div>
            ))}
            <p className="cg-tl-note">Listed in the inbox as <code>preserve/c1-diff</code> (a preservation failure). The dataset behaves the same; an export won’t give this document back byte for byte.</p>
          </>
        ) : <p className="cg-tl-note">Nothing lost and nothing added: every element, attribute, comment and its place come back.</p>}
      </>
    );
  }

  const verdict: ReactNode = refused ? <VerdictMark v="refused">Refused</VerdictMark> : reverse ? <VerdictMark v="equal">Equal</VerdictMark> : diff ? <VerdictMark v="different">Differences</VerdictMark> : <VerdictMark v="equal">Equal</VerdictMark>;
  return (
    <Win mode={mode} interactive={interactive} onClaim={claim}>
      <EditorGrid side={<Sidebar updates={diff ? 13 : 10} entry={null} source={null} />}>
        <main className="d-main" aria-label="Roundtrip">
          <header className="d-top">
            <BackForward back="Warden Squad" />
            <span className="d-crumbs">Demo Skirmish<span>/</span>Roundtrip</span>
            {verdict}
            <span className="d-spacer" />
            <span className="cg-seg cg-tl-routeseg" role="radiogroup" aria-label="Route">
              <button type="button" role="radio" aria-checked={!reverse} className={reverse ? "" : "active"} onClick={() => { setRoute("xml"); setSel("c2"); }} title="Roundtrip the XML data this dataset was converted from (C2 and C1)">From the XML data</button>
              <button type="button" role="radio" aria-checked={reverse} className={reverse ? "active" : ""} onClick={() => { setRoute("dataset"); setSel("reconvert"); }} title="The reverse route: write this dataset as XML data and read it back">From this dataset</button>
            </span>
            <span className="d-muted">{busy ? "Running…" : refused ? `Ran ${ran} · stopped` : `Ran ${ran} · ${reverse ? "4.1 s" : "3.2 s"}`}</span>
            <button type="button" className="d-btn" onClick={run} disabled={busy}>{busy ? <RefreshCw size={14} className="cg-spin" /> : <Play size={14} />}{busy ? "Running…" : "Run roundtrip"}</button>
          </header>
          <div className="cg-tl-rt">
            <div className="cg-tl-rt-list">{left}</div>
            <section className="cg-tl-rt-detail" aria-label="Detail">{detail}</section>
          </div>
        </main>
      </EditorGrid>
    </Win>
  );
}

const exportRows = () => [
  { label: "Documents", value: <>5<span className="d-muted">1 game system, 4 catalogues</span></> },
  { label: "Bytes", value: <>186 345 each time<span className="d-muted">SHA-256 equal</span></> },
  { label: "Ids", value: <>From the id map</> },
];
