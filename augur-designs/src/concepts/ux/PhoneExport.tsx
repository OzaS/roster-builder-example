import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Circle, CircleCheck, Copy, Download, Upload, X } from "lucide-react";
import { NEEDS_GAME_DATA, PAPERS, PaperPreview, needsGameData, pdfPages, rosterText, sizeLabel, type ExportFormat, type ExportRoster, type Paper } from "../desktop/DesktopEditorFlows";
import "./phone-export.css";

// F3 phone export (approved 2026-11-06, v1 → v3): radio rows for the four formats, Include and Paper for the print document, the file
// name and size, Preview on its own row (it pushes a page with the whole document), then [Copy] Save file… Share. Synthetic data (DEC-001).

const FORMATS: Array<{ id: ExportFormat; title: string; body: string; ext: string }> = [
  { id: "text", title: "Text", body: "Plain text to paste into a message, forum or notes.", ext: "txt" },
  { id: "json", title: "New Recruit JSON", body: "The whole roster as a .json file.", ext: "json" },
  { id: "html", title: "Print view", body: "A formatted page to print or save as PDF (.html)", ext: "html" },
  { id: "pdf", title: "PDF", body: "A document to print or send (.pdf)", ext: "pdf" },
];

const units = [
  { id: 1, name: "Force Commander", role: "Command", models: 1, points: 90, weapon: "Command blade", upgrade: false, forceId: "f1" },
  { id: 2, name: "Line Infantry", role: "Core", models: 10, points: 120, weapon: "Service rifle", upgrade: true, forceId: "f1" },
  { id: 3, name: "Line Infantry", role: "Core", models: 10, points: 120, weapon: "Service rifle", upgrade: false, forceId: "f1" },
  { id: 4, name: "Recon Team", role: "Core", models: 5, points: 85, weapon: "Scout carbine", upgrade: false, forceId: "f1" },
  { id: 5, name: "Veteran Guard", role: "Specialist", models: 5, points: 165, weapon: "Heavy carbine", upgrade: false, forceId: "f1" },
  { id: 6, name: "Support Battery", role: "Support", models: 3, points: 180, weapon: "Field cannon", upgrade: false, forceId: "f1" },
  { id: 7, name: "Patrol Walker", role: "Support", models: 1, points: 115, weapon: "Twin autocannon", upgrade: false, forceId: "f1" },
];
/** The phone gallery roster as the export sees it (its name, faction, system and points; sample units that add up to 885 pts). */
export function phoneExportRoster(r: { name: string; faction: string; system: string; pointsUsed: number; pointsLimit: number }): ExportRoster {
  return { name: r.name, limit: r.pointsLimit, total: r.pointsUsed, system: r.system, faction: r.faction,
    forces: [{ id: "f1", name: r.faction, type: "Detachment", faction: r.faction, points: r.pointsUsed, units }],
    file: { name: r.name, limit: r.pointsLimit, forces: [{ id: "f1", name: r.name }], units } };
}
export const PHONE_EXPORT_ROSTER = phoneExportRoster({ name: "Frontier Primary Detachment", faction: "Free Cities", system: "Open Field", pointsUsed: 885, pointsLimit: 1000 });

/** File name and size line under the options; PDF shows its page count too. */
function fileFacts(roster: ExportRoster, format: ExportFormat, rules: boolean, paper: Paper) {
  const meta = FORMATS.find((f) => f.id === format)!;
  const name = `${roster.name}.${meta.ext}`;
  const count = roster.forces.reduce((n, f) => n + f.units.length, 0);
  const bytes = format === "json" ? 12_300 : format === "text" ? new Blob([rosterText(roster, false, false)]).size : format === "html" ? 18_000 + count * 500 + (rules ? 2_000 : 0) : 60_000 + count * 3_000 + (rules ? 6_000 : 0);
  return { name, size: format === "pdf" ? `${pdfPages(roster, rules, paper)} pages · ${sizeLabel(bytes)}` : sizeLabel(bytes) };
}

/** The live export sheet with its Preview page. `previewOpen` starts on the pushed page (gallery screen export-preview). */
export function PhoneExportFlow({ roster = PHONE_EXPORT_ROSTER, initialFormat = "text", previewOpen = false, inline = false, onClose }: { roster?: ExportRoster; initialFormat?: ExportFormat; previewOpen?: boolean; inline?: boolean; onClose?: () => void }) {
  const [format, setFormat] = useState<ExportFormat>(initialFormat);
  const [rules, setRules] = useState(true);
  const [profiles, setProfiles] = useState(true);
  const [paper, setPaper] = useState<Paper>("A4");
  const [preview, setPreview] = useState(previewOpen);
  const facts = fileFacts(roster, format, rules, paper);
  const printable = needsGameData(format);
  const sheet = (
    <section className={`ux-job-sheet ux-xp-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label="Export roster">
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head"><span><strong>Export roster</strong><small>{roster.name} · {roster.total.toLocaleString()} pts</small></span><button type="button" className="ux-icon-btn" aria-label="Close" onClick={onClose}><X size={17} /></button></header>
      <div className="ux-fp-list ux-ro-formats" role="radiogroup" aria-label="Format">
        {FORMATS.map((f) => (
          <button key={f.id} type="button" role="radio" aria-checked={format === f.id} className={`ux-fp-row ${format === f.id ? "selected" : ""}`} onClick={() => setFormat(f.id)}>
            <span className={`ux-ro-radio ${format === f.id ? "on" : ""}`} aria-hidden>{format === f.id ? <CircleCheck size={20} /> : <Circle size={20} />}</span>
            <span><strong>{f.title}</strong><small>{f.body}</small></span>
          </button>
        ))}
      </div>
      {printable ? <ExportIncludeBlock rules={rules} profiles={profiles} paper={format === "pdf" ? paper : null} onRules={() => setRules(!rules)} onProfiles={() => setProfiles(!profiles)} onPaper={setPaper} /> : null}
      <div className="ux-xp-file"><strong>{facts.name}</strong><span>{facts.size}</span></div>
      {format === "json" ? <small className="ux-xp-note">Open it in New Recruit or import it on another device.</small> : null}
      {format !== "json" ? <button type="button" className="ux-job-btn ux-xp-preview-row" onClick={() => setPreview(true)}>Preview<ChevronRight size={16} /></button> : null}
      <ExportActions copy={!printable} />
    </section>
  );
  return (
    <>
      {inline ? sheet : <div className="ux-job-scrim">{sheet}</div>}
      {preview && !inline ? <PhoneExportPreview roster={roster} format={format} rules={rules} profiles={profiles} paper={paper} onBack={() => setPreview(false)} /> : null}
    </>
  );
}

/** Include (Rules, Profiles) for Print view and PDF, and Paper (A4 | Letter) for PDF only. */
export function ExportIncludeBlock({ rules, profiles, paper, onRules, onProfiles, onPaper }: { rules: boolean; profiles: boolean; paper: Paper | null; onRules?: () => void; onProfiles?: () => void; onPaper?: (p: Paper) => void }) {
  return (
    <div className="ux-xp-include">
      <small className="ux-xp-label">Include</small>
      <div className="ux-xp-card ux-setting-plain" role="group" aria-label="Include">
        <button type="button" className={`ux-setting-row ${rules ? "on" : ""}`} role="switch" aria-checked={rules} onClick={onRules}><span className="ux-setting-text"><strong>Rules</strong><small>Rule names on units, their text at the end</small></span><span className="ux-switch" aria-hidden /></button>
        <button type="button" className={`ux-setting-row ${profiles ? "on" : ""}`} role="switch" aria-checked={profiles} onClick={onProfiles}><span className="ux-setting-text"><strong>Profiles</strong><small>Each unit's characteristics</small></span><span className="ux-switch" aria-hidden /></button>
        {paper ? (
          <div className="ux-xp-paper-row"><strong>Paper</strong>
            <div className="ux-segmented" role="radiogroup" aria-label="Paper">{PAPERS.map((p) => <button key={p} type="button" role="radio" aria-checked={paper === p} className={paper === p ? "on" : ""} onClick={() => onPaper?.(p)}>{p}</button>)}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** [Copy (Text and JSON only)] Save file… Share. Save file… opens the system save picker (iOS Save to Files, Android "save as"). */
export function ExportActions({ copy }: { copy: boolean }) {
  return (
    <footer className={`ux-job-footer ux-xp-actions ${copy ? "three" : ""}`}>
      {copy ? <button type="button" className="ux-job-btn"><Copy size={15} />Copy</button> : null}
      <button type="button" className="ux-job-btn"><Download size={15} />Save file…</button>
      <button type="button" className="ux-job-btn primary"><Upload size={15} />Share</button>
    </footer>
  );
}

/** The pushed Preview page: Back to the sheet, Share in the header, the whole document (Text in monospace). */
export function PhoneExportPreview({ roster = PHONE_EXPORT_ROSTER, format, rules = true, profiles = true, paper = "A4", onBack }: { roster?: ExportRoster; format: ExportFormat; rules?: boolean; profiles?: boolean; paper?: Paper; onBack?: () => void }) {
  const facts = fileFacts(roster, format, rules, paper);
  const text = useMemo(() => rosterText(roster, false, false), [roster]);
  return (
    <section className="ux-xp-page" role="dialog" aria-label="Preview">
      <header className="ux-xp-page-head">
        <button type="button" className="ux-xp-back" onClick={onBack}><ChevronLeft size={18} />Export</button>
        <div className="ux-wb-title"><strong>Preview</strong><small>{format === "pdf" ? `${facts.name} · ${pdfPages(roster, rules, paper)} pages` : facts.name}</small></div>
        <button type="button" className="ux-job-btn primary ux-xp-share"><Upload size={15} />Share</button>
      </header>
      <div className="ux-xp-page-body">
        {needsGameData(format) ? <PaperPreview roster={roster} rules={rules} profiles={profiles} label={format === "pdf" ? "PDF preview" : "Print view preview"} className="ux-xp-paper" />
          : <pre className="ux-xp-text" tabIndex={0} aria-label="Text preview">{text}</pre>}
      </div>
    </section>
  );
}

/** Stored mode rows of Print view and PDF: a stored roster has no game data. */
export const STORED_PRINT_ROWS = FORMATS.filter((f) => needsGameData(f.id)).map((f) => ({ id: f.id, title: f.title, body: NEEDS_GAME_DATA, ok: false }));
