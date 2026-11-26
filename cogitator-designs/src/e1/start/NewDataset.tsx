import { CircleAlert, File, FolderPlus, TriangleAlert } from "lucide-react";
import { useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import type { E1Platform } from "../types";
import { keyFor } from "./parts";
import "./new-dataset.css";

/**
 * X3 (approved by the user 2026-11-26, Proposals N1–N5 on the review page `battle-augur-captures/x3/review`): the New
 * dataset sheet over the start window (and over an editor window). Template (Blank / Starter, one line each), Name
 * (focused; the manifest's title) and Key (follows the name until edited; the dataset key and the folder), Location (the
 * last folder, ~/Datasets the first time, Choose…), "Creates <location>/<key>/ with N files" and the generator's file
 * list (Hide files), Create ↵ (disabled until the name and the key are valid) and Cancel Esc. A folder that already
 * holds files turns Key red with a line under Location and keeps Create disabled; a failed write shows its own sheet
 * (Retry, Cancel). The files listed are the generator's (`datasetTemplate` in cogitator-core), not the review page's.
 */
export type TemplateId = "blank" | "starter";
export type NewDatasetInit = { template: TemplateId; name: string; key?: string; exists?: boolean; hidden?: boolean };

/** The key a name gives, as the generator's `datasetKeyFrom` does for these names (lower-case words joined by hyphens). */
export function keyFrom(name: string): string {
  const key = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 42).replace(/-+$/, "");
  return /[a-z]/.test(key) ? key : key ? `dataset-${key}` : "";
}

/** Why a key can't name a dataset (the generator's `datasetKeyProblem`, the cases the sheet shows). */
export function keyProblem(key: string): string | undefined {
  if (key === "") return "Give the dataset a key.";
  if (key.startsWith("x-")) return "A key can’t start with “x-” (kept for extensions).";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key) || !/[a-z]/.test(key)) return "A key uses lower-case letters, digits and single hyphens, has a letter, and doesn’t start or end with a hyphen.";
  return undefined;
}

/** The generator's files for a template and key, each with what it is. */
export function templateFiles(template: TemplateId, key: string): [string, string][] {
  const k = key || "dataset";
  return template === "starter" ? [
    ["dataset.dkl", "manifest"],
    [`${k}/module.dkl`, "system: costs, categories, 2 force types"],
    [`${k}/text/en.dkl`, "names and rules text"],
    [`${k}-units/module.dkl`, "catalogue: 3 units"],
    [`${k}-units/text/en.dkl`, "names"],
    ["test/starter.yaml", "a passing test scenario"],
  ] : [
    ["dataset.dkl", "manifest"],
    [`${k}/module.dkl`, "system: the cost type pts"],
    [`${k}/text/en.dkl`, "names"],
    [`${k}-units/module.dkl`, "catalogue, empty"],
    [`${k}-units/text/en.dkl`, "names"],
    ["test/README.md", "what goes in test/"],
  ];
}

const TEMPLATES: { id: TemplateId; label: string; note: ReactNode }[] = [
  { id: "blank", label: "Blank dataset", note: <>A manifest, a system module, one catalogue, an empty text pack and <code>test/</code>. For writing a dataset from scratch.</> },
  { id: "starter", label: "Starter dataset", note: "The same, with two force types, a few entries with costs and constraints, rules text in the pack and one passing test scenario: Run shows a roster at once." },
];

export function NewDatasetSheet({ platform, init, onCancel, onCreate }: { platform: E1Platform; init: NewDatasetInit; onCancel: () => void; onCreate: (key: string) => void }) {
  const [template, setTemplate] = useState<TemplateId>(init.template);
  const [name, setName] = useState(init.name);
  const [key, setKey] = useState(init.key ?? keyFrom(init.name));
  const [follows, setFollows] = useState(init.key === undefined);
  const [hidden, setHidden] = useState(init.hidden ?? false);
  const [exists, setExists] = useState(init.exists ?? false);
  const home = platform === "mac" ? "~/Datasets" : "C:\\Users\\you\\Datasets";
  const sep = platform === "mac" ? "/" : "\\";
  const where = `${home}${sep}${key}${sep}`;
  const files = templateFiles(template, key);
  const problem = name.trim() === "" ? "Give the dataset a name." : keyProblem(key);
  const canCreate = problem === undefined && !exists;
  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onCancel(); }
    else if (event.key === "Enter" && (event.target as HTMLElement).tagName === "INPUT") { event.preventDefault(); event.stopPropagation(); if (canCreate) onCreate(key); }
  };
  const create = <button key="create" type="button" className="d-btn primary" disabled={!canCreate} title={canCreate ? `Write the ${files.length} files and open the dataset` : exists ? "The folder already holds files" : problem} onClick={() => onCreate(key)}>Create<kbd>{keyFor(platform, "↵", "Enter")}</kbd></button>;
  const cancel = <button key="cancel" type="button" className="d-btn" onClick={onCancel} title="Close without writing anything">Cancel<kbd>Esc</kbd></button>;
  return (
    <div className={`cg-dialog e1s-new${platform === "mac" ? " sheet" : ""}`} role="dialog" aria-modal="true" aria-label="New dataset" onKeyDown={onKey}>
      <div className="cg-dialog-main">
        <span className="cg-dialog-icon info" aria-hidden><FolderPlus size={18} /></span>
        <div>
          <h2>New dataset</h2>
          <div className="cg-dialog-body">
            <section className="e1s-new-sec">
              <span className="e1s-new-h">Template</span>
              <span className="cg-radios" role="radiogroup" aria-label="Template">
                {TEMPLATES.map((t) => (
                  <button key={t.id} type="button" role="radio" aria-checked={template === t.id} className="cg-radio" onClick={() => setTemplate(t.id)}><i /><span>{t.label}</span><small>{t.note}</small></button>
                ))}
              </span>
            </section>
            <section className="e1s-new-sec">
              <div className="e1s-new-grid">
                <label><span>Name</span><span className="cg-tl-field focus"><input value={name} aria-label="Name" onChange={(event) => { setName(event.target.value); if (follows) setKey(keyFrom(event.target.value)); setExists(false); }} /></span></label>
                <label><span>Key</span><span className={`cg-tl-field mono${exists || (key !== "" && keyProblem(key)) ? " bad" : ""}`}><input value={key} aria-label="Key" spellCheck={false} onChange={(event) => { setKey(event.target.value); setFollows(false); setExists(false); }} /></span></label>
              </div>
              {key !== "" && keyProblem(key) ? <p className="e1s-new-bad"><CircleAlert size={13} /><span>{keyProblem(key)}</span></p> : null}
            </section>
            <section className="e1s-new-sec">
              <span className="e1s-new-lbl">Location</span>
              <span className="e1s-new-path"><span className="cg-tl-field mono">{home}</span><button type="button" className="d-btn" title="Choose the folder the dataset's folder goes in">Choose…</button></span>
              {exists ? (
                <p className="e1s-new-bad"><CircleAlert size={13} /><span><span className="mono">{where}</span> already holds files. Choose another key or location; nothing is written over.</span></p>
              ) : (
                <>
                  <p className="e1s-new-sum">Creates <span className="mono">{where}</span> with {files.length} files<button type="button" className="e1s-new-link" aria-expanded={!hidden} onClick={() => setHidden(!hidden)}>{hidden ? "Show files" : "Hide files"}</button></p>
                  {hidden ? null : (
                    <ul className="cg-dialog-list e1s-new-files" aria-label="Files the template writes">
                      {files.map(([path, note]) => <li key={path}><File size={13} /><span>{path}</span><small>{note}</small></li>)}
                    </ul>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
      <footer className="cg-dialog-actions">{platform === "mac" ? [cancel, create] : [create, cancel]}</footer>
    </div>
  );
}

/** N3: a write that failed. Nothing was put in place (the files go to a temporary folder first); Retry writes again. */
export function NewDatasetFailed({ platform, keyName, onRetry, onCancel }: { platform: E1Platform; keyName: string; onRetry: () => void; onCancel: () => void }) {
  const home = platform === "mac" ? "~/Datasets" : "C:\\Users\\you\\Datasets";
  const sep = platform === "mac" ? "/" : "\\";
  const retry = <button key="retry" type="button" className="d-btn primary" onClick={onRetry} title="Write the files again">Retry<kbd>{keyFor(platform, "↵", "Enter")}</kbd></button>;
  const cancel = <button key="cancel" type="button" className="d-btn" onClick={onCancel} title="Back to the New dataset sheet, as you left it">Cancel<kbd>Esc</kbd></button>;
  return (
    <div className={`cg-dialog${platform === "mac" ? " sheet" : ""}`} role="alertdialog" aria-modal="true" aria-label={`Couldn’t create ${keyName}`} style={{ width: 480 }}
      onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onCancel(); } }}>
      <div className="cg-dialog-main">
        <span className="cg-dialog-icon error" aria-hidden><TriangleAlert size={18} /></span>
        <div>
          <h2>Couldn’t create {keyName}</h2>
          <p className="cg-dialog-target">{home}{sep}{keyName}{sep}</p>
          <div className="cg-dialog-body">
            <p>Writing <span className="mono">test/starter.yaml</span> failed: the disk is full.</p>
            <p>Nothing was put in place: the files were written to a temporary folder, which was removed. Free some space and retry, or go back and choose another location.</p>
          </div>
        </div>
      </div>
      <footer className="cg-dialog-actions">{platform === "mac" ? [cancel, retry] : [retry, cancel]}</footer>
    </div>
  );
}
