import type { DiagKind } from "../../sample";
import { ironWardens, lineOf } from "../editor/data";

/**
 * E1 tool screens (part 2, worker A): what the check, convert, export, roundtrip and move commands report for the
 * synthetic Demo Skirmish sample (DEC-001: invented names, neutral XML element names, no third-party vocabulary).
 * Every number and code here is one the command line prints (`augur dklpo check|convert|export|roundtrip|move`).
 */

/* ---------- Check run (Run checks, ⌘⇧C) ---------- */

export type CheckState = "running" | "passed" | "failed" | "no-compile" | "stale";
export const checkStates: CheckState[] = ["running", "passed", "failed", "no-compile", "stale"];

/** The four steps of a check run in the editor: `check --with <layers>` (parse, compile, lower) and `export --dry-run --exact`. */
export const checkSteps = [
  { id: "parse", label: "Parse", of: 31, unit: "files" },
  { id: "compile", label: "Compile", of: 5, unit: "modules" },
  { id: "lower", label: "Lower", of: 2, unit: "lowerings" },
  { id: "export", label: "Export check", of: 5, unit: "documents" },
] as const;

export type ClassCount = { kind: DiagKind; n: number; codes: { code: string; n: number }[] };
export const checkResults: Record<"passed" | "failed", { counts: ClassCount[]; time: string; at: string; patch: string }> = {
  passed: {
    counts: [
      { kind: "error", n: 0, codes: [] },
      { kind: "preservation", n: 0, codes: [] },
      { kind: "suggestion", n: 4, codes: [{ code: "default-value", n: 3 }, { code: "label-default", n: 1 }] },
    ],
    time: "1.2 s", at: "14:22", patch: "2 applied",
  },
  failed: {
    counts: [
      { kind: "error", n: 2, codes: [{ code: "ref-unknown", n: 1 }, { code: "patch-path-missing", n: 1 }] },
      { kind: "preservation", n: 2, codes: [{ code: "order-changed", n: 1 }, { code: "ns-prefix", n: 1 }] },
      { kind: "suggestion", n: 6, codes: [{ code: "default-value", n: 3 }, { code: "unread-key", n: 1 }, { code: "no-text", n: 1 }, { code: "label-default", n: 1 }] },
    ],
    time: "1.4 s", at: "14:22", patch: "1 applied, 1 failed (path matches nothing)",
  },
};

/* ---------- Convert from XML data ---------- */

export type ConvertState = "options" | "converting" | "equal" | "differences" | "refused";
export const convertStates: ConvertState[] = ["options", "converting", "equal", "differences", "refused"];

export const convertInput = { mac: "~/Downloads/skirmish-xml", windows: "C:\\Users\\you\\Downloads\\skirmish-xml" };
export const convertOutput = { mac: "~/Datasets/skirmish-dklpo", windows: "C:\\Users\\you\\Datasets\\skirmish-dklpo" };

export type InputDoc = { file: string; kind: "Game system" | "Catalogue"; module: string; entities: number; size: string };
export const inputDocs: InputDoc[] = [
  { file: "demo-skirmish.gst", kind: "Game system", module: "demo-skirmish", entities: 48, size: "21.4 KB" },
  { file: "iron-wardens.cat", kind: "Catalogue", module: "iron-wardens", entities: 134, size: "64.0 KB" },
  { file: "frost-wardens.cat", kind: "Catalogue", module: "frost-wardens", entities: 88, size: "38.2 KB" },
  { file: "ember-guard.cat", kind: "Catalogue", module: "ember-guard", entities: 71, size: "30.9 KB" },
  { file: "common-armoury.cat", kind: "Catalogue", module: "common-armoury", entities: 71, size: "27.5 KB" },
];
export const ignoredFiles = ["README.md", "LICENSE"];

/** One difference in a source-tree comparison (`source-diff`, C1): class, XPath-like path, the two values. */
export type TreeDiff = { cls: "missing" | "added" | "changed" | "moved"; path: string; a?: string; b?: string };
export const c1Differences: Record<string, TreeDiff[]> = {
  "iron-wardens.cat": [
    { cls: "changed", path: "/catalogue/entries/entry[@id=\"1f0a-5e1e-0000-0004\"]/@sort", a: "05", b: "5" },
    { cls: "moved", path: "/catalogue/entries/entry[@id=\"1f0a-5e1e-0000-0001\"]/comment()[1]", a: "before <entry>", b: "first child of <entry>" },
  ],
  "demo-skirmish.gst": [
    { cls: "changed", path: "/system/ex:editorState/namespace::ex", a: "prefix declared on <system>", b: "declared on the element" },
  ],
};

/** The conversion's numbers (the `conversion` part of `convert --json`). */
export const conversionFacts = {
  documents: 5, entities: 412, files: 13, originals: 5, mapLines: 412,
  envelope: [{ type: "comment", n: 12 }, { type: "order", n: 9 }, { type: "lexical", n: 6 }, { type: "unknown", n: 4 }],
};

/* ---------- Export ---------- */

export type ExportState = "exact" | "non-exact" | "written" | "failed";
export const exportStates: ExportState[] = ["exact", "non-exact", "written", "failed"];
export const exportDest = "~/Exports/demo-skirmish";
export const exportFiles = [
  { path: "demo-skirmish.gst", bytes: "21 914" },
  { path: "iron-wardens.cat", bytes: "65 538" },
  { path: "frost-wardens.cat", bytes: "39 102" },
  { path: "ember-guard.cat", bytes: "31 640" },
  { path: "common-armoury.cat", bytes: "28 151" },
];
/** Envelope entries that won't apply (edit reconciliation E3, E4) and why. */
export const exportReasons = [
  { code: "preserve/stale", entry: "Warden Squad", where: "iron-wardens:warden-squad", what: "Its cost was edited (20 → 18): the recorded attribute order isn't applied; the entry is written in canonical order." },
  { code: "preserve/stale", entry: "Halberd", where: "iron-wardens:halberd", what: "Its cost was edited (2 → 3): the recorded number form “02” isn't applied; 3 is written." },
  { code: "preserve/unbound", entry: "Torch", where: "iron-wardens:torch", what: "Torch was removed (no move record): its comment has nothing to attach to and isn't written." },
];

/* ---------- Roundtrip ---------- */

export type RoundtripState = "equal" | "differences" | "reverse" | "refused";
export const roundtripStates: RoundtripState[] = ["equal", "differences", "reverse", "refused"];
export const c2Differences = [
  { path: "iron-wardens:warden-captain › constraints[0] (max 1 in force)", a: "present", b: "missing" },
];

/* ---------- Rename / move (augur dklpo move) ---------- */

export type RenameState = "rename" | "structural" | "conflict";
export const renameStates: RenameState[] = ["rename", "structural", "conflict"];

export type Edit = { line: number; before?: string; after?: string };
export type FileEdit = { path: string; change: "edited" | "created"; what: string; edits: Edit[] };

const L = (match: string, after?: string) => lineOf(ironWardens, match, after);

/** The plan `move iron-wardens:spear iron-wardens:<key>` prints, for a new key. */
export function renamePlan(key: string): { files: FileEdit[]; records: string[]; counts: { label: string; n: number }[] } {
  const k = key || "spear";
  return {
    files: [
      {
        path: "iron-wardens/module.dkl", change: "edited", what: "declaration, 2 uses named after it, 1 reference",
        edits: [
          { line: L("group weapon 1 default spear"), before: "    group weapon 1 default spear", after: `    group weapon 1 default ${k}` },
          { line: L("use spear", "group weapon 1 default spear"), before: "      use spear", after: `      use ${k}` },
          { line: L("use spear", "unit warden-captain"), before: "      use spear", after: `      use ${k}` },
          { line: L("upgrade spear"), before: "upgrade spear", after: `upgrade ${k}` },
        ],
      },
      {
        path: "iron-wardens/text/en.dkl", change: "edited", what: "2 text keys",
        edits: [
          { line: 9, before: "spear: Spear", after: `${k}: Spear` },
          { line: 10, before: "spear/spear: Spear", after: `${k}/spear: Spear` },
        ],
      },
      {
        path: "bsdata.map", change: "edited", what: "2 map paths (the XML ids stay)",
        edits: [
          { line: 31, before: "iron-wardens:spear 1f0a-5e1e-0000-0005", after: `iron-wardens:${k} 1f0a-5e1e-0000-0005` },
          { line: 32, before: "iron-wardens:spear/spear 1f0a-5e1e-0000-0006", after: `iron-wardens:${k}/spear 1f0a-5e1e-0000-0006` },
        ],
      },
    ],
    records: [
      `3.2.0 iron-wardens:spear -> iron-wardens:${k}`,
      `3.2.0 iron-wardens:warden-captain/captain/weapon/spear -> iron-wardens:warden-captain/captain/weapon/${k}`,
      `3.2.0 iron-wardens:warden-squad/warden/weapon/spear -> iron-wardens:warden-squad/warden/weapon/${k}`,
    ],
    counts: [
      { label: "declaration", n: 1 }, { label: "uses moved with it", n: 2 }, { label: "references", n: 3 },
      { label: "text keys", n: 2 }, { label: "map lines", n: 2 }, { label: "records", n: 3 },
    ],
  };
}

/** The structural move (drawn ahead of the command: moving under another parent is `move/relocate`, not built yet). */
export const structuralPlan: { files: FileEdit[]; records: string[]; counts: { label: string; n: number }[] } = {
  files: [
    {
      path: "iron-wardens/module.dkl", change: "edited", what: "the block moves from the model to the unit",
      edits: [
        { line: L("cost pts 20"), after: "  upgrade banner ..1" },
        { line: L("cost pts 20"), after: "    hide when no(warden-captain in force, deep)" },
        { line: L("cost pts 20"), after: "    cost pts 10" },
        { line: L("upgrade banner ..1"), before: "    upgrade banner ..1" },
        { line: L("upgrade banner ..1") + 1, before: "      hide when no(warden-captain in force, deep)" },
        { line: L("upgrade banner ..1") + 2, before: "      cost pts 10" },
      ],
    },
    { path: "dataset.dkl", change: "edited", what: "version raised (--bump-major)", edits: [{ line: 3, before: "version: 3.2.0", after: "version: 4.0.0" }] },
    { path: "iron-wardens/text/en.dkl", change: "edited", what: "1 text key", edits: [{ line: 14, before: "warden-squad/warden/banner: Banner", after: "warden-squad/banner: Banner" }] },
    { path: "bsdata.map", change: "edited", what: "1 map path", edits: [{ line: 12, before: "iron-wardens:warden-squad/warden/banner 1f0a-5e1e-0000-0009", after: "iron-wardens:warden-squad/banner 1f0a-5e1e-0000-0009" }] },
  ],
  records: ["4.0.0 iron-wardens:warden-squad/warden/banner -> iron-wardens:warden-squad/banner"],
  counts: [{ label: "declaration", n: 1 }, { label: "references", n: 0 }, { label: "text keys", n: 1 }, { label: "map lines", n: 1 }, { label: "records", n: 1 }],
};

/** Keys that exist in Iron Wardens (a new key equal to one is `move/new-exists`). */
export const takenKeys: Record<string, number> = {
  halberd: L("upgrade halberd"), longbow: L("upgrade longbow"), "warden-squad": L("unit warden-squad"),
  "warden-captain": L("unit warden-captain"), "warden-archers": L("unit warden-archers"),
};
export const keyRule = /^[a-z0-9]+(-[a-z0-9]+)*$/;
